<?php
// backend/ai/test_models.php
header("Content-Type: text/plain; charset=UTF-8");

$ai_config = require_once __DIR__ . '/../config/ai_config.php';
$apiKey = $ai_config['api_key'];

$url = "https://generativelanguage.googleapis.com/v1beta/models?key=$apiKey";

$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$response = curl_exec($ch);
curl_close($ch);

$data = json_decode($response, true);

if (isset($data['models'])) {
    foreach ($data['models'] as $model) {
        if (strpos($model['name'], 'gemini') !== false) {
            echo $model['name'] . "\n";
        }
    }
} else {
    echo "Erreur ou aucun modèle trouvé : \n";
    print_r($data);
}
?>