<?php
// ============================================================
// Divine Interior — Mail helpers
// Uses PHP mail() by default. Set USE_SMTP=true in config.php
// and install PHPMailer for SMTP in production.
// ============================================================

function di_mail(string $to, string $toName, string $subject, string $htmlBody): bool {
    $from     = MAIL_FROM;
    $fromName = MAIL_FROM_NAME;

    $headers  = "MIME-Version: 1.0\r\n";
    $headers .= "Content-Type: text/html; charset=UTF-8\r\n";
    $headers .= "From: =?UTF-8?B?" . base64_encode($fromName) . "?= <$from>\r\n";
    $headers .= "Reply-To: $from\r\n";
    $headers .= "X-Mailer: PHP/" . PHP_VERSION . "\r\n";

    $toHeader = "=?UTF-8?B?" . base64_encode($toName) . "?= <$to>";

    return @mail($toHeader, "=?UTF-8?B?" . base64_encode($subject) . "?=", $htmlBody, $headers);
}

// ─── OTP email ────────────────────────────────────────────
function send_otp_email(string $email, string $name, string $otp, string $type): void {
    $actionMap = ['verify' => 'verify your email', 'login' => 'sign in', 'reset' => 'reset your password'];
    $action    = $actionMap[$type] ?? 'continue';

    $html = email_wrapper("Your OTP Code", "
        <h2 style='font-family:Georgia,serif;font-weight:400;color:#5a4a3a;margin:0 0 16px'>Hello, {$name}</h2>
        <p style='color:#666;margin:0 0 24px'>Use the code below to {$action}. It expires in <strong>15 minutes</strong>.</p>
        <div style='background:#f8f5f0;border:1px solid #e8e0d5;border-radius:8px;padding:28px;text-align:center;margin:0 0 24px'>
            <span style='font-size:42px;font-weight:700;letter-spacing:12px;color:#7a6552;font-family:monospace'>{$otp}</span>
        </div>
        <p style='color:#999;font-size:12px;margin:0'>If you did not request this, please ignore this email.</p>
    ");
    di_mail($email, $name, 'Your Divine Interior OTP Code', $html);
}

// ─── Order confirmation email to customer ─────────────────
function send_customer_order_email(array $order): void {
    $itemsHtml = '';
    foreach (($order['items'] ?? []) as $item) {
        $price = '₹' . number_format((float)$item['total'], 0, '.', ',');
        $itemsHtml .= "
        <tr>
            <td style='padding:12px 8px;border-bottom:1px solid #f0ebe4;color:#444'>{$item['product_title']} <span style='color:#999;font-size:12px'>× {$item['quantity']}</span></td>
            <td style='padding:12px 8px;border-bottom:1px solid #f0ebe4;text-align:right;color:#5a4a3a;font-weight:600'>{$price}</td>
        </tr>";
    }
    $total    = '₹' . number_format((float)$order['total'], 0, '.', ',');
    $shipping = '₹' . number_format((float)$order['shipping_cost'], 0, '.', ',');
    $addr     = $order['shipping_address'] ?? [];
    $addrStr  = htmlspecialchars(implode(', ', array_filter([
        $addr['line1'] ?? '', $addr['line2'] ?? '', $addr['city'] ?? '',
        $addr['state'] ?? '', $addr['postal_code'] ?? '', $addr['country'] ?? ''
    ])));

    $html = email_wrapper("Order Confirmed 🎉", "
        <h2 style='font-family:Georgia,serif;font-weight:400;color:#5a4a3a;margin:0 0 8px'>Thank you for your order!</h2>
        <p style='color:#888;margin:0 0 24px;font-size:13px'>Order <strong>{$order['order_number']}</strong> has been placed successfully.</p>

        <table width='100%' cellpadding='0' cellspacing='0' style='border-collapse:collapse;margin-bottom:20px'>
            <thead><tr>
                <th style='padding:10px 8px;background:#f8f5f0;text-align:left;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#999'>Item</th>
                <th style='padding:10px 8px;background:#f8f5f0;text-align:right;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#999'>Amount</th>
            </tr></thead>
            <tbody>{$itemsHtml}</tbody>
            <tfoot>
                <tr><td style='padding:10px 8px;color:#888'>Shipping</td><td style='padding:10px 8px;text-align:right;color:#888'>{$shipping}</td></tr>
                <tr><td style='padding:12px 8px;font-weight:700;color:#5a4a3a;font-size:16px;border-top:2px solid #e8e0d5'>Total</td>
                    <td style='padding:12px 8px;text-align:right;font-weight:700;color:#5a4a3a;font-size:16px;border-top:2px solid #e8e0d5'>{$total}</td></tr>
            </tfoot>
        </table>

        <div style='background:#f8f5f0;border-radius:8px;padding:16px;margin-bottom:20px'>
            <p style='margin:0 0 6px;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#999'>Shipping To</p>
            <p style='margin:0;color:#444;font-size:14px'>{$addrStr}</p>
        </div>

        <div style='background:#fff8f0;border-left:3px solid #c4a882;padding:14px 16px;border-radius:0 6px 6px 0'>
            <p style='margin:0;color:#7a6552;font-size:13px'><strong>Payment Method:</strong> Cash on Delivery (COD)</p>
            <p style='margin:6px 0 0;color:#888;font-size:12px'>Please keep the exact amount ready at the time of delivery.</p>
        </div>
    ");

    di_mail($order['customer_email'], $order['customer_name'],
            "Order Confirmed: {$order['order_number']} — Divine Interior", $html);
}

// ─── Order alert email to admin ───────────────────────────
function send_admin_order_email(array $order): void {
    $itemsHtml = '';
    foreach (($order['items'] ?? []) as $item) {
        $price = '₹' . number_format((float)$item['total'], 0, '.', ',');
        $itemsHtml .= "<tr>
            <td style='padding:10px 8px;border-bottom:1px solid #eee;color:#444'>{$item['product_title']} × {$item['quantity']}</td>
            <td style='padding:10px 8px;border-bottom:1px solid #eee;text-align:right;font-weight:600'>{$price}</td>
        </tr>";
    }
    $total = '₹' . number_format((float)$order['total'], 0, '.', ',');

    $html = email_wrapper("New Order Received", "
        <h2 style='font-family:Georgia,serif;font-weight:400;color:#5a4a3a;margin:0 0 8px'>New COD Order!</h2>
        <p style='color:#888;margin:0 0 20px'>Order <strong>{$order['order_number']}</strong> placed by <strong>{$order['customer_name']}</strong> ({$order['customer_email']})</p>

        <table width='100%' cellpadding='0' cellspacing='0' style='border-collapse:collapse;margin-bottom:20px'>
            <thead><tr>
                <th style='padding:10px 8px;background:#f5f5f5;text-align:left;font-size:11px;text-transform:uppercase;color:#999'>Item</th>
                <th style='padding:10px 8px;background:#f5f5f5;text-align:right;font-size:11px;text-transform:uppercase;color:#999'>Amount</th>
            </tr></thead>
            <tbody>{$itemsHtml}</tbody>
            <tfoot>
                <tr><td colspan='2' style='padding:10px 8px;text-align:right;font-weight:700;color:#333;font-size:16px;border-top:2px solid #eee'>Total: {$total}</td></tr>
            </tfoot>
        </table>

        <p style='color:#555;font-size:13px'>Phone: " . htmlspecialchars($order['customer_phone'] ?? 'Not provided') . "</p>
        <p style='color:#555;font-size:13px'>Payment: <strong>Cash on Delivery</strong></p>
    ");

    di_mail(ADMIN_EMAIL, 'Divine Interior Admin',
            "New Order {$order['order_number']} — ₹" . number_format((float)$order['total'], 0), $html);
}

// ─── Base email template ──────────────────────────────────
function email_wrapper(string $title, string $content): string {
    return "<!DOCTYPE html>
<html>
<head><meta charset='UTF-8'><meta name='viewport' content='width=device-width,initial-scale=1'></head>
<body style='margin:0;padding:0;background:#f4f1ec;font-family:Helvetica,Arial,sans-serif'>
<table width='100%' cellpadding='0' cellspacing='0'>
<tr><td align='center' style='padding:40px 20px'>
<table width='100%' cellpadding='0' cellspacing='0' style='max-width:560px'>

  <!-- Header -->
  <tr><td style='background:#5a4a3a;padding:28px 32px;text-align:center;border-radius:8px 8px 0 0'>
    <h1 style='margin:0;color:#f5ede0;font-family:Georgia,serif;font-weight:400;font-size:24px;letter-spacing:3px'>DI</h1>
    <p style='margin:4px 0 0;color:#c4a882;font-size:10px;letter-spacing:4px;text-transform:uppercase'>Divine Interior</p>
  </td></tr>

  <!-- Body -->
  <tr><td style='background:#ffffff;padding:36px 32px;border-radius:0 0 8px 8px'>
    {$content}
    <hr style='border:none;border-top:1px solid #f0ebe4;margin:28px 0'>
    <p style='margin:0;color:#bbb;font-size:11px;text-align:center'>© " . date('Y') . " Divine Interior. All rights reserved.</p>
  </td></tr>

</table>
</td></tr>
</table>
</body></html>";
}
