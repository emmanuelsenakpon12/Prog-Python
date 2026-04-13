<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

require_once '../config/database.php';
$pdo->exec("USE tourisia");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

$data = json_decode(file_get_contents("php://input"));

if (!isset($data->user_id) || !isset($data->reservation_id)) {
    http_response_code(400);
    echo json_encode(["message" => "Données incomplètes."]);
    exit;
}

try {
    // Delete the reservation only if it belongs to the user
    $stmt = $pdo->prepare("DELETE FROM reservations WHERE id = ? AND user_id = ?");
    if ($stmt->execute([$data->reservation_id, $data->user_id])) {
        if ($stmt->rowCount() > 0) {
            echo json_encode(["message" => "Réservation supprimée avec succès."]);
        } else {
            http_response_code(404);
            echo json_encode(["message" => "Réservation non trouvée ou ne vous appartient pas."]);
        }
    } else {
        http_response_code(500);
        echo json_encode(["message" => "Erreur lors de la suppression de la réservation."]);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["message" => "Erreur : " . $e->getMessage()]);
}
?>