<?php
// backend/ai/assistant.php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

try {
    require_once '../config/database.php';
    $ai_config = require_once '../config/ai_config.php';

    $pdo->exec("USE tourisia");

    $data = json_decode(file_get_contents("php://input"), true);
    $userMessage = $data['message'] ?? '';

    if (empty($userMessage)) {
        http_response_code(400);
        echo json_encode(["message" => "Message manquant."]);
        exit();
    }

    // 1. Récupérer toutes les offres pour le contexte
    $stmt = $pdo->query("SELECT title, type, location, price, currency, description FROM offers");
    $offers = $stmt->fetchAll(PDO::FETCH_ASSOC);
    $offersContext = json_encode($offers, JSON_UNESCAPED_UNICODE);

    // 2. Préparer le prompt pour Gemini
    $apiKey = $ai_config['api_key'];
    $model = $ai_config['model'];
    $systemPrompt = $ai_config['system_prompt'];

    $url = "https://generativelanguage.googleapis.com/v1beta/models/$model:generateContent?key=$apiKey";

    $payload = [
        "contents" => [
            [
                "role" => "user",
                "parts" => [
                    ["text" => "Instructions Système: $systemPrompt\n\nVoici les offres disponibles sur Tourisia: $offersContext\n\nQuestion de l'utilisateur: $userMessage"]
                ]
            ]
        ]
    ];

    // 3. Appel à l'API Gemini via cURL
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);

    $response = curl_exec($ch);
    $curlError = curl_error($ch);
    curl_close($ch);

    if ($curlError) {
        throw new Exception("Erreur cURL : " . $curlError);
    }

    $result = json_decode($response, true);

    if (isset($result['candidates'][0]['content']['parts'][0]['text'])) {
        $aiResponse = $result['candidates'][0]['content']['parts'][0]['text'];
        echo json_encode([
            "success" => true,
            "response" => $aiResponse
        ]);
    } else {
        // En cas d'erreur de l'API (ex: clé invalide)
        $errorMessage = $result['error']['message'] ?? "Erreur inconnue de l'API Gemini.";
        echo json_encode([
            "success" => false,
            "response" => "Désolé, je rencontre une difficulté technique : " . $errorMessage,
            "debug" => $result
        ]);
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Erreur : " . $e->getMessage()]);
}
?>