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

    $flight_id  = intval($data['flight_id']  ?? 0);
    $user_id    = intval($data['user_id']    ?? 0);
    $passagers  = intval($data['nombre_passagers'] ?? 1);
    $classe     = $data['classe']     ?? 'Économique';
    $prix_total = floatval($data['prix_total'] ?? 0);

    if (!$flight_id || !$user_id) {
        http_response_code(400);
        echo json_encode(["message" => "Données manquantes."]);
        exit();
    }

    // Récupérer le vol
    $getFlight = $pdo->prepare("SELECT * FROM flights WHERE id = ?");
    $getFlight->execute([$flight_id]);
    $flight = $getFlight->fetch(PDO::FETCH_ASSOC);

    if (!$flight) {
        http_response_code(404);
        echo json_encode(["message" => "Vol introuvable."]);
        exit();
    }

    if ($flight['places_disponibles'] < $passagers) {
        http_response_code(409);
        echo json_encode(["message" => "Pas assez de places disponibles ({$flight['places_disponibles']} restante(s))."]);
        exit();
    }

    // Règle 72h avant départ
    if ($flight['date_depart']) {
        $depart = new DateTime($flight['date_depart']);
        $now    = new DateTime();
        $diff   = $now->diff($depart);
        $heures = ($diff->days * 24) + $diff->h;
        if ($diff->invert) {
            http_response_code(410);
            echo json_encode(["message" => "Ce vol est déjà parti."]);
            exit();
        }
    }

    $pdo->beginTransaction();

    // Insérer la réservation
    $insert = $pdo->prepare("
        INSERT INTO flight_reservations
          (flight_id, user_id, nombre_passagers, classe, prix_total, devise, statut)
        VALUES (?,?,?,?,?,?,?)
    ");
    $insert->execute([
        $flight_id, $user_id, $passagers, $classe,
        $prix_total ?: ($flight['prix'] * $passagers),
        $flight['devise'] ?? 'CFA',
        'confirmée',
    ]);

    // Décrémenter les places
    $decr = $pdo->prepare("UPDATE flights SET places_disponibles = places_disponibles - ? WHERE id = ?");
    $decr->execute([$passagers, $flight_id]);

    // Notification utilisateur
    $notif = $pdo->prepare("
        INSERT INTO notifications (user_id, type, title, content, link)
        VALUES (?, 'booking', '✈️ Vol réservé !', ?, '/profile?tab=reservations')
    ");
    $msg = "Votre vol {$flight['depart_iata']}→{$flight['arrivee_iata']} pour {$passagers} passager(s) est confirmé.";
    $notif->execute([$user_id, $msg]);

    // Notifier le partenaire
    if ($flight['partenaire_id']) {
        $notifPartner = $pdo->prepare("
            INSERT INTO notifications (user_id, type, title, content, link)
            SELECT p.user_id, 'booking', 'Nouvelle réservation vol ✈️', ?, '/espace_partenaire?tab=vols'
            FROM partners p WHERE p.id = ?
        ");
        $notifPartner->execute([$msg, $flight['partenaire_id']]);
    }

    $pdo->commit();

    echo json_encode([
        "success"  => true,
        "message"  => "Vol réservé avec succès !",
        "reservation_id" => $pdo->lastInsertId(),
    ]);

} catch (Exception $e) {
    if ($pdo->inTransaction()) $pdo->rollBack();
    http_response_code(500);
    echo json_encode(["message" => "Erreur serveur : " . $e->getMessage()]);
}
?>
