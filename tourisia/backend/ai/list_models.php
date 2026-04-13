<?php
// backend/ai/list_models.php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

try {
    $ai_config = require_once __DIR__ . '/../config/ai_config.php';
    $apiKey = $ai_config['api_key'];

    $url = "https://generativelanguage.googleapis.com/v1beta/models?key=$apiKey";

    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

    $response = curl_exec($ch);
    curl_close($ch);

    echo $response;

} catch (Exception $e) {
    echo json_encode(["error" => $e->getMessage()]);
}
?>