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

if (!isset($data->user_id) || !isset($data->offer_id)) {
    http_response_code(400);
    echo json_encode(["message" => "Données incomplètes."]);
    exit;
}

try {
    // Check if user is the owner of the offer
    $ownerStmt = $pdo->prepare("
        SELECT o.partner_id 
        FROM offers o 
        JOIN partners p ON o.partner_id = p.id 
        WHERE o.id = ? AND p.user_id = ?
    ");
    $ownerStmt->execute([$data->offer_id, $data->user_id]);
    if ($ownerStmt->fetch()) {
        http_response_code(403);
        echo json_encode(["message" => "Un partenaire ne peut pas réserver ses propres offres."]);
        exit;
    }

    // Check for existing reservation
    $checkStmt = $pdo->prepare("SELECT id FROM reservations WHERE user_id = ? AND offer_id = ? AND status != 'cancelled'");
    $checkStmt->execute([$data->user_id, $data->offer_id]);
    if ($checkStmt->fetch()) {
        http_response_code(400);
        echo json_encode(["message" => "Vous avez déjà une réservation en cours pour cette offre."]);
        exit;
    }

    $stmt = $pdo->prepare("INSERT INTO reservations (user_id, offer_id, status) VALUES (?, ?, 'pending')");
    if ($stmt->execute([$data->user_id, $data->offer_id])) {
        echo json_encode(["message" => "Réservation effectuée avec succès !"]);
    } else {
        http_response_code(500);
        echo json_encode(["message" => "Erreur lors de la réservation."]);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["message" => "Erreur : " . $e->getMessage()]);
}
?>