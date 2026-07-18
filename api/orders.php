<?php
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/jwt.php';

require_auth();

$method = $_SERVER['REQUEST_METHOD'];
$id     = isset($_GET['id']) ? (int) $_GET['id'] : null;
$db     = get_db();

$JSON_COLS = ['shipping_address', 'items'];

function decode_order(array $row): array {
    foreach (['shipping_address', 'items'] as $col) {
        if (isset($row[$col]) && is_string($row[$col])) {
            $row[$col] = json_decode($row[$col], true) ?? [];
        }
    }
    return $row;
}

// ─── GET ─────────────────────────────────────────────────
if ($method === 'GET') {
    if ($id) {
        $stmt = $db->prepare('SELECT * FROM orders WHERE id = ?');
        $stmt->execute([$id]);
        $row = $stmt->fetch();
        if (!$row) json_error('Order not found', 404);
        json_success(decode_order($row));
    }

    $page   = (int) ($_GET['page']     ?? 1);
    $per    = (int) ($_GET['per_page'] ?? 50);
    $search = $_GET['search'] ?? '';
    $status = $_GET['status'] ?? '';

    $conds = [];
    $vals  = [];

    if ($search !== '') {
        $conds[] = '(order_number LIKE ? OR customer_name LIKE ? OR customer_email LIKE ?)';
        $vals = array_merge($vals, ["%$search%", "%$search%", "%$search%"]);
    }
    if ($status !== '' && $status !== 'all') {
        $conds[] = 'status = ?';
        $vals[]  = $status;
    }

    $where  = $conds ? 'WHERE ' . implode(' AND ', $conds) : '';
    $offset = ($page - 1) * $per;

    $count = $db->prepare("SELECT COUNT(*) FROM orders $where");
    $count->execute($vals);
    $total = (int) $count->fetchColumn();

    $stmt = $db->prepare("SELECT * FROM orders $where ORDER BY created_at DESC LIMIT $per OFFSET $offset");
    $stmt->execute($vals);
    $rows = array_map('decode_order', $stmt->fetchAll());

    json_success(['items' => $rows, 'total' => $total, 'page' => $page, 'per_page' => $per, 'total_pages' => (int)ceil($total/$per)]);
}

// ─── POST (create) ────────────────────────────────────────
if ($method === 'POST') {
    $body = get_body();

    // Auto-generate order number
    $orderNum = 'DI-' . date('Ymd') . '-' . str_pad(rand(1000,9999), 4, '0', STR_PAD_LEFT);

    $stmt = $db->prepare('
        INSERT INTO orders
          (order_number,customer_id,customer_name,customer_email,customer_phone,
           shipping_address,items,subtotal,shipping_cost,discount,total,currency,
           status,payment_status,payment_method,notes)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
    ');
    $stmt->execute([
        $body['order_number']   ?? $orderNum,
        $body['customer_id']    ?? null,
        $body['customer_name']  ?? '',
        $body['customer_email'] ?? '',
        $body['customer_phone'] ?? null,
        json_encode($body['shipping_address'] ?? []),
        json_encode($body['items']            ?? []),
        (float) ($body['subtotal']     ?? 0),
        (float) ($body['shipping_cost'] ?? 0),
        (float) ($body['discount']      ?? 0),
        (float) ($body['total']         ?? 0),
        $body['currency']       ?? 'INR',
        $body['status']         ?? 'pending',
        $body['payment_status'] ?? 'pending',
        $body['payment_method'] ?? null,
        $body['notes']          ?? null,
    ]);

    $newId = (int) $db->lastInsertId();
    $stmt  = $db->prepare('SELECT * FROM orders WHERE id = ?');
    $stmt->execute([$newId]);
    json_success(decode_order($stmt->fetch()), 201);
}

// ─── PUT (update) ─────────────────────────────────────────
if ($method === 'PUT' && $id) {
    $body   = get_body();
    $fields = [];
    $vals   = [];

    $allowed = ['status','payment_status','payment_method','notes',
                'customer_name','customer_email','customer_phone',
                'subtotal','shipping_cost','discount','total'];

    foreach ($allowed as $f) {
        if (array_key_exists($f, $body)) {
            $fields[] = "`$f` = ?";
            $vals[]   = $body[$f];
        }
    }
    foreach (['shipping_address','items'] as $j) {
        if (array_key_exists($j, $body)) {
            $fields[] = "`$j` = ?";
            $vals[]   = json_encode($body[$j]);
        }
    }

    if (!$fields) json_error('Nothing to update');
    $vals[] = $id;
    $db->prepare('UPDATE orders SET ' . implode(', ', $fields) . ' WHERE id = ?')->execute($vals);

    $stmt = $db->prepare('SELECT * FROM orders WHERE id = ?');
    $stmt->execute([$id]);
    json_success(decode_order($stmt->fetch()));
}

// ─── DELETE ───────────────────────────────────────────────
if ($method === 'DELETE' && $id) {
    $db->prepare('DELETE FROM orders WHERE id = ?')->execute([$id]);
    json_success(['deleted' => true]);
}

json_error('Method not allowed', 405);
