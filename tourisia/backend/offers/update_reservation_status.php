<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

require_once '../config/database.php';
$pdo->exec("USE tourisia");

$data = json_decode(file_get_contents("php://input"), true);

$reservation_id = $data['reservation_id'] ?? null;
$partner_id     = $data['partner_id'] ?? null;
$status         = $data['status'] ?? null;

if (!$reservation_id || !$partner_id || !in_array($status, ['confirmed', 'cancelled'])) {
    http_response_code(400);
    echo json_encode(["message" => "Données invalides."]);
    exit();
}

try {
    // Vérifie que la réservation concerne bien une offre de ce partenaire
    $check = $pdo->prepare("
        SELECT r.id FROM reservations r
        JOIN offers o ON r.offer_id = o.id
        WHERE r.id = ? AND o.partner_id = ?
    ");
    $check->execute([$reservation_id, $partner_id]);
    if (!$check->fetch()) {
        http_response_code(403);
        echo json_encode(["message" => "Accès refusé."]);
        exit();
    }

    $stmt = $pdo->prepare("UPDATE reservations SET status = ? WHERE id = ?");
    $stmt->execute([$status, $reservation_id]);

    // Notifier l'utilisateur
    $info = $pdo->prepare("
        SELECT r.user_id, o.title FROM reservations r
        JOIN offers o ON r.offer_id = o.id
        WHERE r.id = ?
    ");
    $info->execute([$reservation_id]);
    $row = $info->fetch(PDO::FETCH_ASSOC);
    if ($row) {
        $msg = $status === 'confirmed'
            ? "Votre réservation pour \"{$row['title']}\" a été confirmée ✅"
            : "Votre réservation pour \"{$row['title']}\" a été annulée ❌";
        $notif = $pdo->prepare("INSERT INTO notifications (user_id, type, title, content, link) VALUES (?, 'system', ?, ?, '/profile?tab=reservations')");
        $notif->execute([$row['user_id'], $status === 'confirmed' ? 'Réservation confirmée' : 'Réservation annulée', $msg]);
    }

    echo json_encode(["success" => true, "message" => "Statut mis à jour."]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["message" => "Erreur : " . $e->getMessage()]);
}
?>
