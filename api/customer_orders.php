<?php
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/customer_auth.php';  // re-uses require_customer_auth

$payload = require_customer_auth();
$method  = $_SERVER['REQUEST_METHOD'];
$id      = isset($_GET['id']) ? (int)$_GET['id'] : null;
$db      = get_db();
$custId  = (int)$payload['sub'];

function decode_order_row(array $row): array {
    foreach (['shipping_address','items'] as $col) {
        if (isset($row[$col]) && is_string($row[$col]))
            $row[$col] = json_decode($row[$col], true) ?? [];
    }
    return $row;
}

if ($method === 'GET') {
    if ($id) {
        $stmt = $db->prepare('SELECT * FROM orders WHERE id = ? AND customer_id = ?');
        $stmt->execute([$id, $custId]);
        $row = $stmt->fetch();
        if (!$row) json_error('Order not found', 404);
        json_success(decode_order_row($row));
    }

    $page   = max(1, (int)($_GET['page'] ?? 1));
    $per    = 20;
    $offset = ($page - 1) * $per;

    $count = $db->prepare('SELECT COUNT(*) FROM orders WHERE customer_id = ?');
    $count->execute([$custId]);
    $total = (int)$count->fetchColumn();

    $stmt = $db->prepare('SELECT * FROM orders WHERE customer_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?');
    $stmt->execute([$custId, $per, $offset]);
    $rows = array_map('decode_order_row', $stmt->fetchAll());

    json_success(['items' => $rows, 'total' => $total, 'page' => $page,
                  'per_page' => $per, 'total_pages' => (int)ceil($total/$per)]);
}

json_error('Method not allowed', 405);
