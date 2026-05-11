<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

require_once '../config/database.php';
$pdo->exec("USE tourisia");

$partner_id = $_GET['partner_id'] ?? null;
if (!$partner_id) {
    http_response_code(400);
    echo json_encode(["message" => "partner_id manquant."]);
    exit();
}

try {
    $stmt = $pdo->prepare("
        SELECT r.id, r.status, r.created_at,
               r.date_arrivee, r.date_depart, r.nombre_nuits,
               r.nombre_personnes, r.nombre_adultes, r.nombre_enfants, r.prix_total,
               u.fullname AS user_name, u.email AS user_email, u.phone AS user_phone,
               o.id AS offer_id, o.title AS offer_title, o.price, o.currency,
               o.location, o.type, o.images
        FROM reservations r
        JOIN offers o ON r.offer_id = o.id
        JOIN users u ON r.user_id = u.id
        WHERE o.partner_id = ?
        ORDER BY FIELD(r.status, 'pending', 'confirmed', 'cancelled'), r.created_at DESC
    ");
    $stmt->execute([$partner_id]);
    $reservations = $stmt->fetchAll(PDO::FETCH_ASSOC);

    foreach ($reservations as &$r) {
        $r['images'] = json_decode($r['images'] ?? '[]');
    }

    echo json_encode($reservations);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["message" => "Erreur : " . $e->getMessage()]);
}
?>
