<?php
// Public endpoint — customer does NOT need to be logged in to checkout
// (but if they are, we link the order to their account)
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/mail.php';
require_once __DIR__ . '/customer_auth.php';

$method = $_SERVER['REQUEST_METHOD'];
if ($method !== 'POST') json_error('Method not allowed', 405);

$body = get_body();

// ─── Validate required fields ─────────────────────────────
$required = ['customer_name','customer_email','items','total'];
foreach ($required as $f) {
    if (empty($body[$f])) json_error("Field '$f' is required");
}
if (empty($body['shipping_address']['line1'])) json_error('Shipping address is required');
if (!filter_var($body['customer_email'], FILTER_VALIDATE_EMAIL)) json_error('Invalid email address');
if (empty($body['items']) || !is_array($body['items'])) json_error('Cart is empty');

// ─── Detect logged-in customer (optional) ─────────────────
$customerId = null;
$authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
if (preg_match('/Bearer\s+(.+)/i', $authHeader, $m)) {
    $payload = verify_customer_jwt(trim($m[1]));
    if ($payload) $customerId = (int)$payload['sub'];
}

$db = get_db();

// ─── Build order number ───────────────────────────────────
$orderNum = 'DI-' . date('Ymd') . '-' . str_pad(rand(1000,9999), 4, '0', STR_PAD_LEFT);

// ─── Calculate totals ─────────────────────────────────────
$subtotal     = 0;
$items        = [];
foreach ($body['items'] as $item) {
    $price    = (float)($item['price'] ?? 0);
    $qty      = (int)($item['quantity'] ?? 1);
    $lineTotal = $price * $qty;
    $subtotal += $lineTotal;
    $items[]  = [
        'id'            => uniqid('item_'),
        'product_id'    => $item['product_id']    ?? null,
        'product_title' => $item['product_title'] ?? '',
        'variant_title' => $item['variant_title'] ?? '',
        'price'         => $price,
        'quantity'      => $qty,
        'total'         => $lineTotal,
        'image'         => $item['image']         ?? null,
    ];
}
$shippingCost = $subtotal >= 50000 ? 0 : 500;   // free shipping above ₹50k
$discount     = (float)($body['discount'] ?? 0);
$total        = $subtotal + $shippingCost - $discount;

// ─── Insert order ─────────────────────────────────────────
$stmt = $db->prepare('
    INSERT INTO orders
      (order_number,customer_id,customer_name,customer_email,customer_phone,
       shipping_address,items,subtotal,shipping_cost,discount,total,currency,
       status,payment_status,payment_method,notes)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
');
$stmt->execute([
    $orderNum,
    $customerId,
    trim($body['customer_name']),
    trim($body['customer_email']),
    $body['customer_phone'] ?? null,
    json_encode($body['shipping_address']),
    json_encode($items),
    $subtotal,
    $shippingCost,
    $discount,
    $total,
    'INR',
    'confirmed',          // COD orders go straight to confirmed
    'pending',            // payment collected on delivery
    'cod',
    $body['notes'] ?? null,
]);

$orderId = (int)$db->lastInsertId();

// ─── If customer is logged in — update their stats ────────
if ($customerId) {
    $db->prepare('UPDATE customers SET total_orders = total_orders + 1, total_spent = total_spent + ? WHERE id = ?')
       ->execute([$total, $customerId]);
}

// ─── If guest — auto-create/find customer record ──────────
if (!$customerId) {
    $chk = $db->prepare('SELECT id FROM customers WHERE email = ?');
    $chk->execute([trim($body['customer_email'])]);
    $existing = $chk->fetch();
    if ($existing) {
        $db->prepare('UPDATE customers SET total_orders = total_orders + 1, total_spent = total_spent + ? WHERE id = ?')
           ->execute([$total, $existing['id']]);
        $db->prepare('UPDATE orders SET customer_id = ? WHERE id = ?')->execute([$existing['id'], $orderId]);
    } else {
        $db->prepare("INSERT INTO customers (name,email,phone,auth_type,is_verified,is_active,tags,addresses,total_orders,total_spent) VALUES (?,?,?,'email',0,1,'[]','[]',1,?)")
           ->execute([trim($body['customer_name']), trim($body['customer_email']), $body['customer_phone'] ?? null, $total]);
        $newCustId = (int)$db->lastInsertId();
        $db->prepare('UPDATE orders SET customer_id = ? WHERE id = ?')->execute([$newCustId, $orderId]);
    }
}

// ─── Build order array for emails ─────────────────────────
$orderForEmail = [
    'order_number'     => $orderNum,
    'customer_name'    => trim($body['customer_name']),
    'customer_email'   => trim($body['customer_email']),
    'customer_phone'   => $body['customer_phone'] ?? null,
    'items'            => $items,
    'subtotal'         => $subtotal,
    'shipping_cost'    => $shippingCost,
    'discount'         => $discount,
    'total'            => $total,
    'shipping_address' => $body['shipping_address'],
];

// ─── Send emails ──────────────────────────────────────────
send_customer_order_email($orderForEmail);
send_admin_order_email($orderForEmail);

// ─── Return success ───────────────────────────────────────
json_success([
    'order_id'     => $orderId,
    'order_number' => $orderNum,
    'total'        => $total,
    'message'      => 'Order placed successfully! Confirmation email sent.',
]);
