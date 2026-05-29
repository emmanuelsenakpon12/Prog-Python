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
    echo json_encode(["new_reservations" => 0, "new_messages" => 0]);
    exit();
}

try {
    require_once '../config/database.php';
    $pdo->exec("USE tourisia");

    $pdo->exec("ALTER TABLE reservations ADD COLUMN IF NOT EXISTS vue_partenaire TINYINT DEFAULT 0");

    $stmt = $pdo->prepare("
        SELECT COUNT(*) FROM reservations r
        JOIN offers o ON r.offer_id = o.id
        WHERE o.partner_id = ? AND r.vue_partenaire = 0 AND r.status = 'pending'
    ");
    $stmt->execute([$partner_id]);
    $new_reservations = (int)$stmt->fetchColumn();

    $stmt2 = $pdo->prepare("
        SELECT COUNT(*) FROM messages
        WHERE receiver_id = ? AND sender_type = 'user' AND is_read = 0
    ");
    $stmt2->execute([$partner_id]);
    $new_messages = (int)$stmt2->fetchColumn();

    echo json_encode([
        "new_reservations" => $new_reservations,
        "new_messages"     => $new_messages,
    ]);

} catch (Exception $e) {
    echo json_encode(["new_reservations" => 0, "new_messages" => 0]);
}
?>
