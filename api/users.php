<?php
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/jwt.php';

$payload = require_auth();
$method  = $_SERVER['REQUEST_METHOD'];
$id      = isset($_GET['id']) ? (int) $_GET['id'] : null;
$db      = get_db();

// ─── GET ─────────────────────────────────────────────────
if ($method === 'GET') {
    if ($id) {
        $stmt = $db->prepare('SELECT id,name,email,role,avatar,is_active,last_login,created_at FROM admin_users WHERE id = ?');
        $stmt->execute([$id]);
        $row = $stmt->fetch();
        if (!$row) json_error('User not found', 404);
        json_success($row);
    }
    $search = $_GET['search'] ?? '';
    $conds  = [];
    $vals   = [];
    if ($search !== '') {
        $conds[] = '(name LIKE ? OR email LIKE ?)';
        $vals    = ["%$search%", "%$search%"];
    }
    $where = $conds ? 'WHERE ' . implode(' AND ', $conds) : '';
    $stmt  = $db->prepare("SELECT id,name,email,role,avatar,is_active,last_login,created_at FROM admin_users $where ORDER BY created_at DESC");
    $stmt->execute($vals);
    json_success(['items' => $stmt->fetchAll()]);
}

// ─── POST (create) ────────────────────────────────────────
if ($method === 'POST') {
    $body = get_body();
    if (empty($body['name']) || empty($body['email']) || empty($body['password'])) {
        json_error('Name, email and password are required');
    }
    if (strlen($body['password']) < 8) json_error('Password must be at least 8 characters');

    $chk = $db->prepare('SELECT id FROM admin_users WHERE email = ?');
    $chk->execute([$body['email']]);
    if ($chk->fetch()) json_error('Email already exists');

    $hash = password_hash($body['password'], PASSWORD_BCRYPT, ['cost' => 12]);
    $stmt = $db->prepare('INSERT INTO admin_users (name,email,password,role,is_active) VALUES (?,?,?,?,?)');
    $stmt->execute([
        $body['name'],
        $body['email'],
        $hash,
        $body['role']      ?? 'editor',
        (int) ($body['is_active'] ?? 1),
    ]);
    $newId = (int) $db->lastInsertId();
    $stmt  = $db->prepare('SELECT id,name,email,role,avatar,is_active,last_login,created_at FROM admin_users WHERE id = ?');
    $stmt->execute([$newId]);
    json_success($stmt->fetch(), 201);
}

// ─── PUT (update) ─────────────────────────────────────────
if ($method === 'PUT' && $id) {
    $body   = get_body();
    $fields = [];
    $vals   = [];

    foreach (['name','role','avatar'] as $f) {
        if (array_key_exists($f, $body)) { $fields[] = "`$f` = ?"; $vals[] = $body[$f]; }
    }
    if (array_key_exists('is_active', $body)) {
        $fields[] = '`is_active` = ?'; $vals[] = (int) $body['is_active'];
    }
    if (!empty($body['password'])) {
        if (strlen($body['password']) < 8) json_error('Password must be at least 8 characters');
        $fields[] = '`password` = ?';
        $vals[]   = password_hash($body['password'], PASSWORD_BCRYPT, ['cost' => 12]);
    }
    if (!$fields) json_error('Nothing to update');

    $vals[] = $id;
    $db->prepare('UPDATE admin_users SET ' . implode(', ', $fields) . ' WHERE id = ?')->execute($vals);
    $stmt = $db->prepare('SELECT id,name,email,role,avatar,is_active,last_login,created_at FROM admin_users WHERE id = ?');
    $stmt->execute([$id]);
    json_success($stmt->fetch());
}

// ─── DELETE ───────────────────────────────────────────────
if ($method === 'DELETE' && $id) {
    if ((int) $payload['sub'] === $id) json_error('Cannot delete your own account', 400);
    $db->prepare('DELETE FROM admin_users WHERE id = ?')->execute([$id]);
    json_success(['deleted' => true]);
}

json_error('Method not allowed', 405);
