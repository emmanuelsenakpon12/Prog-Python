<?php
// backend/ai/save_models.php
$ai_config = require_once __DIR__ . '/../config/ai_config.php';
$apiKey = $ai_config['api_key'];
$url = "https://generativelanguage.googleapis.com/v1beta/models?key=$apiKey";
$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$response = curl_exec($ch);
curl_close($ch);
file_put_contents(__DIR__ . '/models.json', $response);
?>