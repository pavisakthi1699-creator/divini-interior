<?php
require_once __DIR__ . '/config.php';
json_success(['message' => 'Divine Interior API', 'version' => '1.0', 'status' => 'ok']);

function json_success($data, int $code = 200): void {
    http_response_code($code);
    echo json_encode(['success' => true, 'data' => $data]);
    exit;
}
