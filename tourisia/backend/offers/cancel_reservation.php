<?php
ini_set('display_errors', 0);
error_reporting(0);
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

try {
    require_once '../config/database.php';
    $pdo->exec("USE tourisia");

    $data             = json_decode(file_get_contents("php://input"), true);
    $reservation_id   = $data['reservation_id'] ?? null;
    $user_id          = $data['user_id'] ?? null;
    $raison           = $data['raison_annulation'] ?? null;

    if (!$reservation_id || !$user_id) {
        http_response_code(400);
        echo json_encode(["message" => "Données manquantes."]);
        exit();
    }

    // Récupérer la réservation
    $get = $pdo->prepare("
        SELECT r.*, o.title, o.partner_id,
               p.user_id AS partner_user_id
        FROM reservations r
        JOIN offers o ON r.offer_id = o.id
        JOIN partners p ON o.partner_id = p.id
        WHERE r.id = ? AND r.user_id = ?
    ");
    $get->execute([$reservation_id, $user_id]);
    $res = $get->fetch(PDO::FETCH_ASSOC);

    if (!$res) {
        http_response_code(404);
        echo json_encode(["message" => "Réservation introuvable."]);
        exit();
    }

    if ($res['status'] === 'cancelled') {
        http_response_code(400);
        echo json_encode(["message" => "Cette réservation est déjà annulée."]);
        exit();
    }

    // Vérifier le délai d'annulation (72h avant l'arrivée)
    if ($res['date_arrivee']) {
        $arrivee = new DateTime($res['date_arrivee']);
        $now     = new DateTime();
        $diff    = $now->diff($arrivee);
        $heures  = ($diff->days * 24) + $diff->h;
        if (!$diff->invert && $heures < 72) {
            http_response_code(403);
            echo json_encode(["message" => "Annulation impossible : l'annulation n'est plus possible moins de 72h avant l'arrivée."]);
            exit();
        }
    }

    $upd = $pdo->prepare("UPDATE reservations SET status = 'cancelled', raison_annulation = ? WHERE id = ?");
    $upd->execute([$raison, $reservation_id]);

    // Notifier le partenaire
    $notif = $pdo->prepare("INSERT INTO notifications (user_id, type, title, content, link) VALUES (?, 'system', 'Réservation annulée ❌', ?, '/espace_partenaire?tab=reservations')");
    $notif->execute([$res['partner_user_id'], "La réservation pour \"{$res['title']}\" a été annulée par l'utilisateur."]);

    echo json_encode(["success" => true, "message" => "Réservation annulée avec succès."]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["message" => "Erreur serveur : " . $e->getMessage()]);
}
?>
