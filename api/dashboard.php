<?php
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/jwt.php';

require_auth();

$db = get_db();

// Stats
$revenue   = (float)  $db->query('SELECT COALESCE(SUM(total),0) FROM orders WHERE payment_status="paid"')->fetchColumn();
$orders    = (int)    $db->query('SELECT COUNT(*) FROM orders')->fetchColumn();
$customers = (int)    $db->query('SELECT COUNT(*) FROM customers')->fetchColumn();
$products  = (int)    $db->query('SELECT COUNT(*) FROM products WHERE is_active=1')->fetchColumn();

// Last 7 months revenue
$months = [];
for ($i = 6; $i >= 0; $i--) {
    $month   = date('Y-m', strtotime("-$i months"));
    $label   = date('M', strtotime("-$i months"));
    $stmt    = $db->prepare("SELECT COALESCE(SUM(total),0) as rev, COUNT(*) as cnt FROM orders WHERE DATE_FORMAT(created_at,'%Y-%m')=? AND payment_status='paid'");
    $stmt->execute([$month]);
    $row     = $stmt->fetch();
    $months[] = ['month' => $label, 'revenue' => (float)$row['rev'], 'orders' => (int)$row['cnt']];
}

// Recent orders
$stmt = $db->query('SELECT id,order_number,customer_name,customer_email,total,status,created_at FROM orders ORDER BY created_at DESC LIMIT 8');
$recentOrders = $stmt->fetchAll();

json_success([
    'stats' => [
        'total_revenue'    => $revenue,
        'total_orders'     => $orders,
        'total_customers'  => $customers,
        'total_products'   => $products,
    ],
    'revenue_chart'   => $months,
    'recent_orders'   => $recentOrders,
]);
