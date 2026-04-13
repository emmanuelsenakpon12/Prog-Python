<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

require_once '../config/database.php';
$pdo->exec("USE tourisia");

$user_id = $_GET['user_id'] ?? null;

if (!$user_id) {
    http_response_code(400);
    echo json_encode(["message" => "ID utilisateur manquant."]);
    exit;
}

try {
    $stmt = $pdo->prepare("
        SELECT r.*, o.title, o.location, o.price, o.currency, o.images, o.type
        FROM reservations r
        JOIN offers o ON r.offer_id = o.id
        WHERE r.user_id = ?
        ORDER BY r.created_at DESC
    ");
    $stmt->execute([$user_id]);
    $reservations = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Decode images for each reservation
    foreach ($reservations as &$res) {
        $res['images'] = json_decode($res['images']);
    }

    echo json_encode($reservations);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["message" => "Erreur : " . $e->getMessage()]);
}
?>