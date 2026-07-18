<?php
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/jwt.php';

require_auth();

$method = $_SERVER['REQUEST_METHOD'];
$id     = isset($_GET['id']) ? (int) $_GET['id'] : null;
$db     = get_db();

function decode_customer(array $row): array {
    foreach (['addresses','tags'] as $col) {
        if (isset($row[$col]) && is_string($row[$col])) {
            $row[$col] = json_decode($row[$col], true) ?? [];
        }
    }
    return $row;
}

// ─── GET ─────────────────────────────────────────────────
if ($method === 'GET') {
    if ($id) {
        $stmt = $db->prepare('SELECT * FROM customers WHERE id = ?');
        $stmt->execute([$id]);
        $row = $stmt->fetch();
        if (!$row) json_error('Customer not found', 404);
        json_success(decode_customer($row));
    }

    $page   = (int) ($_GET['page']     ?? 1);
    $per    = (int) ($_GET['per_page'] ?? 50);
    $search = $_GET['search'] ?? '';

    $conds = [];
    $vals  = [];
    if ($search !== '') {
        $conds[] = '(name LIKE ? OR email LIKE ? OR phone LIKE ?)';
        $vals    = ["%$search%", "%$search%", "%$search%"];
    }

    $where  = $conds ? 'WHERE ' . implode(' AND ', $conds) : '';
    $offset = ($page - 1) * $per;

    $count = $db->prepare("SELECT COUNT(*) FROM customers $where");
    $count->execute($vals);
    $total = (int) $count->fetchColumn();

    $stmt = $db->prepare("SELECT * FROM customers $where ORDER BY created_at DESC LIMIT $per OFFSET $offset");
    $stmt->execute($vals);
    $rows = array_map('decode_customer', $stmt->fetchAll());

    json_success(['items' => $rows, 'total' => $total, 'page' => $page, 'per_page' => $per, 'total_pages' => (int)ceil($total/$per)]);
}

// ─── POST (create) ────────────────────────────────────────
if ($method === 'POST') {
    $body = get_body();
    if (empty($body['name']) || empty($body['email'])) json_error('Name and email are required');

    $chk = $db->prepare('SELECT id FROM customers WHERE email = ?');
    $chk->execute([$body['email']]);
    if ($chk->fetch()) json_error('Email already exists');

    $stmt = $db->prepare('
        INSERT INTO customers (name,email,phone,avatar,addresses,notes,tags,is_active)
        VALUES (?,?,?,?,?,?,?,?)
    ');
    $stmt->execute([
        $body['name'],
        $body['email'],
        $body['phone']   ?? null,
        $body['avatar']  ?? null,
        json_encode($body['addresses'] ?? []),
        $body['notes']   ?? null,
        json_encode($body['tags']      ?? []),
        (int) ($body['is_active'] ?? 1),
    ]);

    $newId = (int) $db->lastInsertId();
    $stmt  = $db->prepare('SELECT * FROM customers WHERE id = ?');
    $stmt->execute([$newId]);
    json_success(decode_customer($stmt->fetch()), 201);
}

// ─── PUT (update) ─────────────────────────────────────────
if ($method === 'PUT' && $id) {
    $body   = get_body();
    $fields = [];
    $vals   = [];

    // Check email unique if changing
    if (!empty($body['email'])) {
        $chk = $db->prepare('SELECT id FROM customers WHERE email = ? AND id != ?');
        $chk->execute([$body['email'], $id]);
        if ($chk->fetch()) json_error('Email already taken');
    }

    $scalar = ['name','email','phone','avatar','notes','is_active'];
    foreach ($scalar as $f) {
        if (array_key_exists($f, $body)) {
            $fields[] = "`$f` = ?";
            $vals[]   = $f === 'is_active' ? (int)$body[$f] : $body[$f];
        }
    }
    foreach (['addresses','tags'] as $j) {
        if (array_key_exists($j, $body)) {
            $fields[] = "`$j` = ?";
            $vals[]   = json_encode($body[$j]);
        }
    }

    if (!$fields) json_error('Nothing to update');
    $vals[] = $id;
    $db->prepare('UPDATE customers SET ' . implode(', ', $fields) . ' WHERE id = ?')->execute($vals);

    $stmt = $db->prepare('SELECT * FROM customers WHERE id = ?');
    $stmt->execute([$id]);
    json_success(decode_customer($stmt->fetch()));
}

// ─── DELETE ───────────────────────────────────────────────
if ($method === 'DELETE' && $id) {
    $db->prepare('DELETE FROM customers WHERE id = ?')->execute([$id]);
    json_success(['deleted' => true]);
}

json_error('Method not allowed', 405);
