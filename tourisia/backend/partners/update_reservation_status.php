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

    $data = json_decode(file_get_contents("php://input"));

    if (!isset($data->reservation_id) || !isset($data->status) || !isset($data->partner_id)) {
        http_response_code(400);
        echo json_encode(["message" => "Données incomplètes."]);
        exit;
    }

    $allowed = ['confirmed', 'cancelled'];
    if (!in_array($data->status, $allowed)) {
        http_response_code(400);
        echo json_encode(["message" => "Statut invalide."]);
        exit;
    }

    /* Vérifier que la réservation appartient bien à une offre de ce partenaire */
    $checkStmt = $pdo->prepare("
        SELECT r.id
        FROM reservations r
        JOIN offers o ON r.offer_id = o.id
        WHERE r.id = ? AND o.partner_id = ?
    ");
    $checkStmt->execute([$data->reservation_id, $data->partner_id]);
    if (!$checkStmt->fetch()) {
        http_response_code(403);
        echo json_encode(["message" => "Réservation introuvable ou accès non autorisé."]);
        exit;
    }

    $stmt = $pdo->prepare("UPDATE reservations SET status = ? WHERE id = ?");
    $stmt->execute([$data->status, $data->reservation_id]);

    echo json_encode(["message" => "Statut mis à jour.", "status" => $data->status]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["message" => "Erreur serveur : " . $e->getMessage()]);
}
?>
