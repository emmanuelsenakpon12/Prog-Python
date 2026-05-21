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
    // Annuler seulement si l'arrivée est à plus de 72h
    $stmt = $pdo->prepare(
        "UPDATE reservations SET status = 'cancelled'
         WHERE id = ? AND user_id = ? AND status != 'cancelled'
         AND TIMESTAMPDIFF(HOUR, NOW(), COALESCE(date_arrivee, check_in, created_at)) > 72"
    );
    if ($stmt->execute([$data->reservation_id, $data->user_id])) {
        if ($stmt->rowCount() > 0) {
            echo json_encode(["message" => "Réservation annulée avec succès."]);
        } else {
            $check = $pdo->prepare(
                "SELECT status, date_arrivee, check_in, created_at FROM reservations WHERE id = ? AND user_id = ?"
            );
            $check->execute([$data->reservation_id, $data->user_id]);
            $reservation = $check->fetch(PDO::FETCH_ASSOC);

            if ($reservation) {
                if ($reservation['status'] === 'cancelled') {
                    http_response_code(400);
                    echo json_encode(["message" => "Cette réservation a déjà été annulée."]);
                } else {
                    $dateRef = $reservation['date_arrivee'] ?? $reservation['check_in'] ?? null;
                    $h = $dateRef ? (strtotime($dateRef) - time()) / 3600 : -1;
                    if ($h < 72) {
                        http_response_code(403);
                        echo json_encode(["message" => "Annulation impossible : l'arrivée est dans moins de 72 heures."]);
                    } else {
                        http_response_code(400);
                        echo json_encode(["message" => "Impossible d'annuler cette réservation."]);
                    }
                }
            } else {
                http_response_code(404);
                echo json_encode(["message" => "Réservation non trouvée ou ne vous appartient pas."]);
            }
        }
    } else {
        http_response_code(500);
        echo json_encode(["message" => "Erreur lors de l'annulation de la réservation."]);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["message" => "Erreur : " . $e->getMessage()]);
}
?>