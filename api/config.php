<?php
// ============================================================
// Divine Interior — API Config
// Place the entire /api folder inside htdocs/divineinterior/
// on XAMPP. Accessible at: http://localhost/divineinterior/api/
// ============================================================

// ─── Database ─────────────────────────────────────────────
define('DB_HOST', 'localhost');
define('DB_NAME', 'divine_interior');
define('DB_USER', 'root');
define('DB_PASS', '');          // XAMPP default: empty. Change for live server.
define('DB_PORT', 3307);

// ─── JWT ──────────────────────────────────────────────────
define('JWT_SECRET',          'divine-interior-secret-key-change-in-production-2024');
define('JWT_EXPIRY',          86400);   // 24 hours (admin)
define('CUSTOMER_JWT_SECRET', 'divine-customer-secret-key-change-in-production-2024');
define('CUSTOMER_JWT_EXPIRY', 604800);  // 7 days (customer)

// ─── Email / SMTP ─────────────────────────────────────────
// Uses PHP mail() by default (works on XAMPP with sendmail/hMailServer).
// For production, set USE_SMTP=true and fill SMTP credentials.
define('USE_SMTP',       false);
define('SMTP_HOST',      'smtp.gmail.com');
define('SMTP_PORT',      587);
define('SMTP_USER',      'your@gmail.com');       // ← change this
define('SMTP_PASS',      'your-app-password');    // ← change this (App Password)
define('SMTP_SECURE',    'tls');                  // tls or ssl

define('MAIL_FROM',      'noreply@divineinterior.com');
define('MAIL_FROM_NAME', 'Divine Interior');
define('ADMIN_EMAIL',    'admin@divine.com');     // ← order alert goes here

// ─── CORS — allow Vite dev server & same origin ───────────
$allowed_origins = [
    'http://localhost:5173',    // Vite default
    'http://localhost:8080',    // Vite on port 8080 (this project)
    'http://localhost:3000',
    'http://localhost',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:8080',
];

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($origin, $allowed_origins)) {
    header("Access-Control-Allow-Origin: $origin");
} else {
    header('Access-Control-Allow-Origin: http://localhost:5173');
}
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Access-Control-Allow-Credentials: true');
header('Content-Type: application/json; charset=utf-8');

// Handle CORS preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}
