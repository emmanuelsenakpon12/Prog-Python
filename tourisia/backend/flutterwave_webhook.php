<?php
// Simple Flutterwave webhook receiver
// Configure your Flutterwave webhook URL to point to this file.

require_once __DIR__ . '/vendor/autoload.php';

$raw = file_get_contents('php://input');
$headers = function_exists('getallheaders') ? getallheaders() : [];
$sig = $headers['verif-hash'] ?? $headers['Verif-Hash'] ?? null;
$encryptionKey = getenv('FLW_ENCRYPTION_KEY');

$valid = false;
if ($sig && $encryptionKey) {
    $calculated = hash_hmac('sha256', $raw, $encryptionKey);
    if (hash_equals($calculated, $sig)) {
        $valid = true;
    }
}

if (! $valid) {
    http_response_code(400);
    file_put_contents(__DIR__ . '/flutterwave_webhook.log', date('c') . " - invalid signature: " . $raw . PHP_EOL, FILE_APPEND);
    echo 'invalid signature';
    exit;
}

$data = json_decode($raw, true);
// TODO: handle events (e.g., successful charge) and update your DB accordingly
file_put_contents(__DIR__ . '/flutterwave_webhook.log', date('c') . " - event: " . PHP_EOL . $raw . PHP_EOL, FILE_APPEND);

http_response_code(200);
echo 'ok';
