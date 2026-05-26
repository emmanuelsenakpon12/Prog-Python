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

    /* ── Ajouter les colonnes de réservation si elles n'existent pas ── */
    $pdo->exec("ALTER TABLE reservations
        ADD COLUMN IF NOT EXISTS date_arrivee DATE NULL,
        ADD COLUMN IF NOT EXISTS date_depart DATE NULL,
        ADD COLUMN IF NOT EXISTS nombre_nuits INT DEFAULT 0,
        ADD COLUMN IF NOT EXISTS nombre_adultes INT DEFAULT 1,
        ADD COLUMN IF NOT EXISTS nombre_enfants INT DEFAULT 0,
        ADD COLUMN IF NOT EXISTS prix_total DECIMAL(10,2) DEFAULT 0,
        ADD COLUMN IF NOT EXISTS devise VARCHAR(10) DEFAULT 'CFA'
    ");

    $data = json_decode(file_get_contents("php://input"));

    if (!isset($data->user_id) || !isset($data->offer_id)) {
        http_response_code(400);
        echo json_encode(["message" => "Données incomplètes."]);
        exit;
    }

    /* ── Vérifier que l'utilisateur ne réserve pas sa propre offre ── */
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

    /* ── Vérifier une réservation active existante ── */
    $checkStmt = $pdo->prepare("
        SELECT id FROM reservations
        WHERE user_id = ? AND offer_id = ? AND status != 'cancelled'
    ");
    $checkStmt->execute([$data->user_id, $data->offer_id]);
    if ($checkStmt->fetch()) {
        http_response_code(400);
        echo json_encode(["message" => "Vous avez déjà une réservation en cours pour cette offre."]);
        exit;
    }

    $stmt = $pdo->prepare("
        INSERT INTO reservations
            (user_id, offer_id, date_arrivee, date_depart, nombre_nuits,
             nombre_adultes, nombre_enfants, prix_total, devise, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')
    ");

    $ok = $stmt->execute([
        $data->user_id,
        $data->offer_id,
        $data->date_arrivee   ?? null,
        $data->date_depart    ?? null,
        $data->nombre_nuits   ?? 0,
        $data->nombre_adultes ?? 1,
        $data->nombre_enfants ?? 0,
        $data->prix_total     ?? 0,
        $data->devise         ?? 'CFA',
    ]);

    if ($ok) {
        echo json_encode([
            "message"        => "Réservation effectuée avec succès !",
            "reservation_id" => $pdo->lastInsertId(),
        ]);
    } else {
        http_response_code(500);
        echo json_encode(["message" => "Erreur lors de la réservation."]);
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["message" => "Erreur serveur : " . $e->getMessage()]);
}
?>
