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

    if (!$userId) {
        http_response_code(400);
        echo json_encode(["message" => "ID de l'utilisateur manquant."]);
        exit();
    }

    // Sécurité: ne pas supprimer l'admin courant si possible (vérification simplifiée ici)
    $stmt = $pdo->prepare("DELETE FROM users WHERE id = ? AND role != 'admin'");
    $stmt->execute([$userId]);

    if ($stmt->rowCount() > 0) {
        echo json_encode(["message" => "Utilisateur supprimé avec succès."]);
    } else {
        http_response_code(403);
        echo json_encode(["message" => "Impossible de supprimer cet utilisateur (ou rôle admin)."]);
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["message" => "Erreur serveur : " . $e->getMessage()]);
}
?>