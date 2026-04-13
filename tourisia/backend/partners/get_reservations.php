<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$partner_id = $_GET['partner_id'] ?? null;

if (!$partner_id) {
    http_response_code(400);
    echo json_encode(["error" => "partner_id is required."]);
    exit();
}

try {
    require_once '../config/database.php';
    $pdo->exec("USE tourisia");

    $stmt = $pdo->prepare(
        "SELECT 
            r.id,
            r.status,
            r.created_at,
            o.title as offer_title,
            o.price,
            o.currency,
            u.fullname as client_name,
            u.email as client_email,
            u.phone as client_phone
         FROM reservations r
         JOIN offers o ON r.offer_id = o.id
         JOIN users u ON r.user_id = u.id
         WHERE o.partner_id = ?
         ORDER BY r.created_at DESC"
    );
    $stmt->execute([$partner_id]);
    $reservations = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode($reservations);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
}
?>