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

    $data = json_decode(file_get_contents("php://input"));

    if (!isset($data->partner_id) || !isset($data->type)) {
        http_response_code(400);
        echo json_encode(["message" => "Données incomplètes."]);
        exit;
    }

    if ($data->type === "reservations") {
        $stmt = $pdo->prepare("
            UPDATE reservations r
            JOIN offers o ON r.offer_id = o.id
            SET r.vue_partenaire = 1
            WHERE o.partner_id = ? AND r.vue_partenaire = 0
        ");
        $stmt->execute([$data->partner_id]);
    } elseif ($data->type === "messages") {
        $stmt = $pdo->prepare("
            UPDATE messages SET is_read = 1
            WHERE receiver_id = ? AND sender_type = 'user' AND is_read = 0
        ");
        $stmt->execute([$data->partner_id]);
    } else {
        http_response_code(400);
        echo json_encode(["message" => "Type invalide."]);
        exit;
    }

    echo json_encode(["message" => "Marqué comme lu."]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["message" => "Erreur : " . $e->getMessage()]);
}
?>
