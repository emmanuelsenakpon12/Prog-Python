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

    $data = json_decode(file_get_contents("php://input"), true);
    $user_id          = $data['user_id'] ?? null;
    $offer_id         = $data['offer_id'] ?? null;
    $date_arrivee     = $data['date_arrivee'] ?? null;
    $date_depart      = $data['date_depart'] ?? null;
    $nombre_nuits     = (int)($data['nombre_nuits'] ?? 1);
    $nombre_adultes   = (int)($data['nombre_adultes'] ?? 1);
    $nombre_enfants   = (int)($data['nombre_enfants'] ?? 0);
    $nombre_personnes = $nombre_adultes + $nombre_enfants;
    $prix_total       = (float)($data['prix_total'] ?? 0);

    if (!$user_id || !$offer_id || !$date_arrivee || !$date_depart || $nombre_nuits < 1) {
        http_response_code(400);
        echo json_encode(["message" => "Données incomplètes."]);
        exit();
    }

    // Vérifier que l'utilisateur n'est pas le propriétaire de l'offre
    $ownerCheck = $pdo->prepare("SELECT o.partner_id FROM offers o JOIN partners p ON o.partner_id = p.id WHERE o.id = ? AND p.user_id = ?");
    $ownerCheck->execute([$offer_id, $user_id]);
    if ($ownerCheck->fetch()) {
        http_response_code(403);
        echo json_encode(["message" => "Un partenaire ne peut pas réserver ses propres offres."]);
        exit();
    }

    // Vérifier les chevauchements de dates
    $overlap = $pdo->prepare("
        SELECT id FROM reservations
        WHERE offer_id = ? AND status != 'cancelled'
          AND date_arrivee IS NOT NULL
          AND date_arrivee < ? AND date_depart > ?
    ");
    $overlap->execute([$offer_id, $date_depart, $date_arrivee]);
    if ($overlap->fetch()) {
        http_response_code(409);
        echo json_encode(["message" => "Ces dates sont déjà réservées. Veuillez choisir d'autres dates."]);
        exit();
    }

    // Vérifier doublon pour cet utilisateur
    $dup = $pdo->prepare("SELECT id FROM reservations WHERE user_id = ? AND offer_id = ? AND status != 'cancelled'");
    $dup->execute([$user_id, $offer_id]);
    if ($dup->fetch()) {
        http_response_code(400);
        echo json_encode(["message" => "Vous avez déjà une réservation en cours pour cette offre."]);
        exit();
    }

    $stmt = $pdo->prepare("
        INSERT INTO reservations
          (user_id, offer_id, date_arrivee, date_depart, nombre_nuits,
           nombre_personnes, nombre_adultes, nombre_enfants, prix_total, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')
    ");
    $stmt->execute([$user_id, $offer_id, $date_arrivee, $date_depart,
                    $nombre_nuits, $nombre_personnes, $nombre_adultes, $nombre_enfants, $prix_total]);

    // Notifier le partenaire
    $partnerRow = $pdo->prepare("SELECT p.user_id, o.title FROM offers o JOIN partners p ON o.partner_id = p.id WHERE o.id = ?");
    $partnerRow->execute([$offer_id]);
    $row = $partnerRow->fetch(PDO::FETCH_ASSOC);
    if ($row) {
        $notif = $pdo->prepare("INSERT INTO notifications (user_id, type, title, content, link) VALUES (?, 'system', 'Nouvelle réservation 📅', ?, '/espace_partenaire?tab=reservations')");
        $notif->execute([$row['user_id'], "Une réservation pour \"{$row['title']}\" du $date_arrivee au $date_depart vient d'être effectuée."]);
    }

    http_response_code(201);
    echo json_encode(["success" => true, "message" => "Réservation effectuée ! En attente de confirmation du partenaire."]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["message" => "Erreur serveur : " . $e->getMessage()]);
}
?>
