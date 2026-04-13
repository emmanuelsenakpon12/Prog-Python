<?php
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
    $pdo->exec("USE tourisia");

    $data = json_decode(file_get_contents("php://input"), true);
    $userId = isset($data['user_id']) ? $data['user_id'] : null;
    $isActive = isset($data['is_active']) ? (bool) $data['is_active'] : true;

    if (!$userId) {
        http_response_code(400);
        echo json_encode(["message" => "ID de l'utilisateur manquant."]);
        exit();
    }

    $stmt = $pdo->prepare("UPDATE users SET is_active = ? WHERE id = ?");
    $stmt->execute([$isActive ? 1 : 0, $userId]);

    echo json_encode(["message" => "Statut mis à jour avec succès."]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["message" => "Erreur serveur : " . $e->getMessage()]);
}
?>