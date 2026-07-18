<?php
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/jwt.php';

$method = $_SERVER['REQUEST_METHOD'];
$action = trim($_GET['action'] ?? '');

// ─── POST login ───────────────────────────────────────────
if ($method === 'POST' && $action === 'login') {
    $body     = get_body();
    $email    = trim($body['email']    ?? '');
    $password =      $body['password'] ?? '';

    if (!$email || !$password) {
        json_error('Email and password are required');
    }

    $db   = get_db();
    $stmt = $db->prepare('SELECT * FROM admin_users WHERE email = ? AND is_active = 1 LIMIT 1');
    $stmt->execute([$email]);
    $user = $stmt->fetch();

    if (!$user || !password_verify($password, $user['password'])) {
        json_error('Invalid email or password', 401);
    }

    // Update last_login
    $db->prepare('UPDATE admin_users SET last_login = NOW() WHERE id = ?')
       ->execute([$user['id']]);

    $token = jwt_encode([
        'sub'   => $user['id'],
        'email' => $user['email'],
        'role'  => $user['role'],
        'name'  => $user['name'],
    ]);

    unset($user['password']);
    json_success(['token' => $token, 'user' => $user]);
}

// ─── GET me ───────────────────────────────────────────────
if ($method === 'GET' && $action === 'me') {
    $payload = require_auth();
    $db      = get_db();
    $stmt    = $db->prepare(
        'SELECT id,name,email,role,avatar,is_active,last_login,created_at FROM admin_users WHERE id = ?'
    );
    $stmt->execute([$payload['sub']]);
    $user = $stmt->fetch();
    if (!$user) json_error('User not found', 404);
    json_success($user);
}

// ─── POST logout (JWT is stateless — client drops token) ──
if ($method === 'POST' && $action === 'logout') {
    json_success(['message' => 'Logged out']);
}

// ─── POST change-password ─────────────────────────────────
if ($method === 'POST' && $action === 'change-password') {
    $payload     = require_auth();
    $body        = get_body();
    $current     = $body['current_password'] ?? '';
    $newPassword = $body['new_password']     ?? '';

    if (strlen($newPassword) < 8) {
        json_error('New password must be at least 8 characters');
    }

    $db   = get_db();
    $stmt = $db->prepare('SELECT password FROM admin_users WHERE id = ?');
    $stmt->execute([$payload['sub']]);
    $row  = $stmt->fetch();

    if (!$row || !password_verify($current, $row['password'])) {
        json_error('Current password is incorrect', 401);
    }

    $hash = password_hash($newPassword, PASSWORD_BCRYPT, ['cost' => 12]);
    $db->prepare('UPDATE admin_users SET password = ? WHERE id = ?')
       ->execute([$hash, $payload['sub']]);

    json_success(['message' => 'Password changed successfully']);
}

// ─── Fallback — always JSON, never HTML ───────────────────
json_error('Unknown action. Use ?action=login|logout|me|change-password', 404);
