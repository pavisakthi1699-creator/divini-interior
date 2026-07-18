<?php
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/mail.php';

$method = $_SERVER['REQUEST_METHOD'];
$action = trim($_GET['action'] ?? '');

// ─── Helper: generate customer JWT ────────────────────────
function customer_jwt(array $payload): string {
    $header  = base64url_encode(json_encode(['alg' => 'HS256', 'typ' => 'JWT']));
    $payload['iat'] = time();
    $payload['exp'] = time() + CUSTOMER_JWT_EXPIRY;
    $body    = base64url_encode(json_encode($payload));
    $sig     = base64url_encode(hash_hmac('sha256', "$header.$body", CUSTOMER_JWT_SECRET, true));
    return "$header.$body.$sig";
}

function verify_customer_jwt(string $token): ?array {
    $parts = explode('.', $token);
    if (count($parts) !== 3) return null;
    [$header, $body, $sig] = $parts;
    $expected = base64url_encode(hash_hmac('sha256', "$header.$body", CUSTOMER_JWT_SECRET, true));
    if (!hash_equals($expected, $sig)) return null;
    $payload = json_decode(base64url_decode($body), true);
    if (!$payload || $payload['exp'] < time()) return null;
    return $payload;
}

function require_customer_auth(): array {
    $header = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
    if (!preg_match('/Bearer\s+(.+)/i', $header, $m)) json_error('Unauthorised', 401);
    $payload = verify_customer_jwt(trim($m[1]));
    if (!$payload) json_error('Invalid or expired token', 401);
    return $payload;
}

function generate_otp(): string {
    return str_pad((string) random_int(100000, 999999), 6, '0', STR_PAD_LEFT);
}

function base64url_encode(string $d): string {
    return rtrim(strtr(base64_encode($d), '+/', '-_'), '=');
}
function base64url_decode(string $d): string {
    return base64_decode(strtr($d, '-_', '+/') . str_repeat('=', (4 - strlen($d) % 4) % 4));
}

$db = get_db();

// ─── POST register ────────────────────────────────────────
if ($method === 'POST' && $action === 'register') {
    $body  = get_body();
    $name  = trim($body['name']  ?? '');
    $email = trim($body['email'] ?? '');
    $pass  = $body['password']   ?? '';

    if (!$name || !$email || !$pass) json_error('Name, email and password are required');
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) json_error('Invalid email address');
    if (strlen($pass) < 6) json_error('Password must be at least 6 characters');

    $chk = $db->prepare('SELECT id FROM customers WHERE email = ?');
    $chk->execute([$email]);
    if ($chk->fetch()) json_error('An account with this email already exists');

    $hash = password_hash($pass, PASSWORD_BCRYPT, ['cost' => 12]);
    $db->prepare("INSERT INTO customers (name,email,password,auth_type,is_verified,is_active,tags,addresses) VALUES (?,?,?,'email',0,1,'[]','[]')")
       ->execute([$name, $email, $hash]);
    $customerId = (int) $db->lastInsertId();

    // Send verification OTP
    $otp = generate_otp();
    $db->prepare("INSERT INTO customer_otps (email,otp,type,expires_at) VALUES (?,?,'verify', DATE_ADD(NOW(), INTERVAL 15 MINUTE))")
       ->execute([$email, $otp]);

    send_otp_email($email, $name, $otp, 'verify');

    json_success(['message' => 'Registration successful. Check your email for a verification code.', 'email' => $email]);
}

// ─── POST login ───────────────────────────────────────────
if ($method === 'POST' && $action === 'login') {
    $body  = get_body();
    $email = trim($body['email']    ?? '');
    $pass  = $body['password']      ?? '';

    if (!$email || !$pass) json_error('Email and password are required');

    $stmt = $db->prepare('SELECT * FROM customers WHERE email = ? AND is_active = 1 LIMIT 1');
    $stmt->execute([$email]);
    $user = $stmt->fetch();

    if (!$user || !$user['password'] || !password_verify($pass, $user['password'])) {
        json_error('Invalid email or password', 401);
    }

    $db->prepare('UPDATE customers SET last_login = NOW() WHERE id = ?')->execute([$user['id']]);

    $token = customer_jwt(['sub' => $user['id'], 'email' => $user['email'], 'name' => $user['name']]);
    unset($user['password'], $user['google_id']);
    $user['addresses'] = json_decode($user['addresses'] ?? '[]', true);
    $user['tags']      = json_decode($user['tags']      ?? '[]', true);

    json_success(['token' => $token, 'user' => $user]);
}

// ─── POST send-otp ────────────────────────────────────────
if ($method === 'POST' && $action === 'send-otp') {
    $body  = get_body();
    $email = trim($body['email'] ?? '');
    $type  = in_array($body['type'] ?? '', ['verify','login','reset']) ? $body['type'] : 'login';

    if (!$email) json_error('Email is required');

    // Rate limit: max 3 OTPs per 10 minutes
    $rate = $db->prepare("SELECT COUNT(*) FROM customer_otps WHERE email = ? AND type = ? AND created_at > DATE_SUB(NOW(), INTERVAL 10 MINUTE)");
    $rate->execute([$email, $type]);
    if ((int)$rate->fetchColumn() >= 3) json_error('Too many OTP requests. Please wait 10 minutes.');

    // For login OTP — check customer exists
    if ($type === 'login') {
        $chk = $db->prepare('SELECT id, name FROM customers WHERE email = ? AND is_active = 1');
        $chk->execute([$email]);
        $cust = $chk->fetch();
        if (!$cust) json_error('No account found with this email');
    }

    $otp = generate_otp();
    $db->prepare("INSERT INTO customer_otps (email,otp,type,expires_at) VALUES (?,?,?, DATE_ADD(NOW(), INTERVAL 15 MINUTE))")
       ->execute([$email, $otp, $type]);

    $name = $cust['name'] ?? 'Customer';
    send_otp_email($email, $name, $otp, $type);

    json_success(['message' => 'OTP sent to your email address.']);
}

// ─── POST verify-otp ──────────────────────────────────────
if ($method === 'POST' && $action === 'verify-otp') {
    $body  = get_body();
    $email = trim($body['email'] ?? '');
    $otp   = trim($body['otp']   ?? '');
    $type  = $body['type'] ?? 'login';

    if (!$email || !$otp) json_error('Email and OTP are required');

    $stmt = $db->prepare("SELECT * FROM customer_otps WHERE email = ? AND otp = ? AND type = ? AND used = 0 AND expires_at > NOW() ORDER BY id DESC LIMIT 1");
    $stmt->execute([$email, $otp, $type]);
    $record = $stmt->fetch();

    if (!$record) json_error('Invalid or expired OTP', 401);

    // Mark used
    $db->prepare('UPDATE customer_otps SET used = 1 WHERE id = ?')->execute([$record['id']]);

    if ($type === 'verify') {
        $db->prepare('UPDATE customers SET is_verified = 1 WHERE email = ?')->execute([$email]);
        json_success(['message' => 'Email verified successfully.']);
    }

    if ($type === 'login') {
        $stmt = $db->prepare('SELECT * FROM customers WHERE email = ? AND is_active = 1 LIMIT 1');
        $stmt->execute([$email]);
        $user = $stmt->fetch();
        if (!$user) json_error('Account not found', 404);

        $db->prepare('UPDATE customers SET last_login = NOW(), is_verified = 1 WHERE id = ?')->execute([$user['id']]);
        $token = customer_jwt(['sub' => $user['id'], 'email' => $user['email'], 'name' => $user['name']]);

        unset($user['password'], $user['google_id']);
        $user['addresses'] = json_decode($user['addresses'] ?? '[]', true);
        $user['tags']      = json_decode($user['tags']      ?? '[]', true);

        json_success(['token' => $token, 'user' => $user]);
    }

    json_success(['message' => 'OTP verified.']);
}

// ─── GET me ───────────────────────────────────────────────
if ($method === 'GET' && $action === 'me') {
    $payload = require_customer_auth();
    $stmt = $db->prepare('SELECT id,name,email,phone,avatar,auth_type,is_verified,addresses,tags,total_orders,total_spent,created_at FROM customers WHERE id = ?');
    $stmt->execute([$payload['sub']]);
    $user = $stmt->fetch();
    if (!$user) json_error('User not found', 404);
    $user['addresses'] = json_decode($user['addresses'] ?? '[]', true);
    $user['tags']      = json_decode($user['tags']      ?? '[]', true);
    json_success($user);
}

// ─── PUT update profile ───────────────────────────────────
if ($method === 'PUT' && $action === 'profile') {
    $payload = require_customer_auth();
    $body    = get_body();
    $fields  = []; $vals = [];

    foreach (['name','phone','avatar'] as $f) {
        if (array_key_exists($f, $body)) { $fields[] = "`$f` = ?"; $vals[] = $body[$f]; }
    }
    if (!empty($body['password'])) {
        if (strlen($body['password']) < 6) json_error('Password must be at least 6 characters');
        $fields[] = '`password` = ?';
        $vals[]   = password_hash($body['password'], PASSWORD_BCRYPT, ['cost' => 12]);
    }
    if (array_key_exists('addresses', $body)) {
        $fields[] = '`addresses` = ?'; $vals[] = json_encode($body['addresses']);
    }
    if (!$fields) json_error('Nothing to update');

    $vals[] = $payload['sub'];
    $db->prepare('UPDATE customers SET ' . implode(', ', $fields) . ' WHERE id = ?')->execute($vals);

    $stmt = $db->prepare('SELECT id,name,email,phone,avatar,auth_type,is_verified,addresses,tags,total_orders,total_spent,created_at FROM customers WHERE id = ?');
    $stmt->execute([$payload['sub']]);
    $user = $stmt->fetch();
    $user['addresses'] = json_decode($user['addresses'] ?? '[]', true);
    $user['tags']      = json_decode($user['tags']      ?? '[]', true);
    json_success($user);
}

// ─── POST logout ──────────────────────────────────────────
if ($method === 'POST' && $action === 'logout') {
    json_success(['message' => 'Logged out']);
}

json_error('Unknown action', 404);
