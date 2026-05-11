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

    $required = ['compagnie','depart_iata','depart_ville','arrivee_iata','arrivee_ville',
                 'date_depart','date_arrivee','heure_depart','heure_arrivee','duree',
                 'classe','prix','places_total','partenaire_id'];

    foreach ($required as $field) {
        if (empty($data[$field]) && $data[$field] !== 0) {
            http_response_code(400);
            echo json_encode(["message" => "Champ manquant : $field"]);
            exit();
        }
    }

    $stmt = $pdo->prepare("
        INSERT INTO flights
          (compagnie, logo, depart_iata, depart_ville, arrivee_iata, arrivee_ville,
           date_depart, date_arrivee, heure_depart, heure_arrivee, duree,
           escales, classe, prix, devise, places_total, places_disponibles, partenaire_id)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
    ");
    $stmt->execute([
        $data['compagnie'],
        $data['logo']         ?? null,
        strtoupper($data['depart_iata']),
        $data['depart_ville'],
        strtoupper($data['arrivee_iata']),
        $data['arrivee_ville'],
        $data['date_depart'],
        $data['date_arrivee'],
        $data['heure_depart'],
        $data['heure_arrivee'],
        $data['duree'],
        intval($data['escales']      ?? 0),
        $data['classe'],
        floatval($data['prix']),
        $data['devise']       ?? 'CFA',
        intval($data['places_total']),
        intval($data['places_total']),  // disponibles = total à la création
        intval($data['partenaire_id']),
    ]);

    $flightId = $pdo->lastInsertId();

    // Notif partenaire
    $notif = $pdo->prepare("
        INSERT INTO notifications (user_id, type, title, content, link)
        SELECT user_id, 'system', 'Vol ajouté ✈️', ?, '/espace_partenaire?tab=vols'
        FROM partners WHERE id = ?
    ");
    $notif->execute(["Votre vol {$data['depart_iata']}→{$data['arrivee_iata']} a été ajouté.", intval($data['partenaire_id'])]);

    echo json_encode(["success" => true, "flight_id" => $flightId, "message" => "Vol ajouté avec succès."]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["message" => "Erreur serveur : " . $e->getMessage()]);
}
?>
