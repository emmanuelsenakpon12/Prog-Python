<?php
// Simple Flutterwave payment creation endpoint (server-side)
// Expects POST params: amount, currency, tx_ref (optional), redirect_url, customer_name, customer_email, customer_phone
header('Content-Type: application/json');
require_once __DIR__ . '/vendor/autoload.php';

$secret = getenv('FLW_SECRET_KEY');
if (empty($secret)) {
    http_response_code(500);
    echo json_encode(['error' => 'FLW_SECRET_KEY not set in environment']);
    exit;
}

$amount = $_POST['amount'] ?? null;
$currency = $_POST['currency'] ?? 'USD';
$tx_ref = $_POST['tx_ref'] ?? 'tx_' . time();
$redirect_url = $_POST['redirect_url'] ?? null;

if (empty($amount) || empty($redirect_url)) {
    http_response_code(400);
    echo json_encode(['error' => 'amount and redirect_url are required']);
    exit;
}

$payload = [
    'tx_ref' => $tx_ref,
    'amount' => (string)$amount,
    'currency' => $currency,
    'redirect_url' => $redirect_url,
    'payment_options' => 'card,mobilemoney',
    'customer' => [
        'email' => $_POST['customer_email'] ?? 'customer@example.com',
        'phonenumber' => $_POST['customer_phone'] ?? '',
        'name' => $_POST['customer_name'] ?? 'Customer'
    ]
];

$ch = curl_init('https://api.flutterwave.com/v3/payments');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Authorization: Bearer ' . $secret,
    'Content-Type: application/json'
]);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));

$resp = curl_exec($ch);
if ($resp === false) {
    http_response_code(500);
    echo json_encode(['error' => curl_error($ch)]);
    curl_close($ch);
    exit;
}
curl_close($ch);

echo $resp;
