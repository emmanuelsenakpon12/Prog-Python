<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// For partners: returns list of distinct users who messaged them, with unread count.
// For users: returns list of distinct partners they have messaged.
// Query params: partner_id OR user_id
$partner_id = $_GET['partner_id'] ?? null;
$user_id = $_GET['user_id'] ?? null;

try {
    require_once '../config/database.php';
    $pdo->exec("USE tourisia");
    require_once 'cleanup.php';

    if ($partner_id) {
        // Get all users who sent at least 1 message to this partner
        $stmt = $pdo->prepare(
            "SELECT
                u.id AS user_id,
                u.fullname AS user_name,
                u.email AS user_email,
                (SELECT COUNT(*) FROM messages
                 WHERE sender_id = u.id AND receiver_id = ? AND sender_type = 'user' AND is_read = 0) AS unread_count,
                (SELECT message FROM messages
                 WHERE (sender_id = u.id AND receiver_id = ? AND sender_type = 'user')
                    OR (sender_id = ? AND receiver_id = u.id AND sender_type = 'partner')
                 ORDER BY created_at DESC LIMIT 1) AS last_message,
                (SELECT created_at FROM messages
                 WHERE (sender_id = u.id AND receiver_id = ? AND sender_type = 'user')
                    OR (sender_id = ? AND receiver_id = u.id AND sender_type = 'partner')
                 ORDER BY created_at DESC LIMIT 1) AS last_message_at
             FROM users u
             WHERE u.id IN (
                SELECT DISTINCT sender_id FROM messages
                WHERE receiver_id = ? AND sender_type = 'user'
             )
             ORDER BY last_message_at DESC"
        );
        $stmt->execute([$partner_id, $partner_id, $partner_id, $partner_id, $partner_id, $partner_id]);
        echo json_encode($stmt->fetchAll());

    } elseif ($user_id) {
        // Get all partners this user has messaged
        $stmt = $pdo->prepare(
            "SELECT
                p.id AS partner_id,
                p.business_name AS partner_name,
                p.business_email AS partner_email,
                (SELECT COUNT(*) FROM messages
                 WHERE sender_id = p.id AND receiver_id = ? AND sender_type = 'partner' AND is_read = 0) AS unread_count,
                (SELECT message FROM messages
                 WHERE (sender_id = ? AND receiver_id = p.id AND sender_type = 'user')
                    OR (sender_id = p.id AND receiver_id = ? AND sender_type = 'partner')
                 ORDER BY created_at DESC LIMIT 1) AS last_message,
                (SELECT created_at FROM messages
                 WHERE (sender_id = ? AND receiver_id = p.id AND sender_type = 'user')
                    OR (sender_id = p.id AND receiver_id = ? AND sender_type = 'partner')
                 ORDER BY created_at DESC LIMIT 1) AS last_message_at
             FROM partners p
             WHERE p.id IN (
                SELECT DISTINCT receiver_id FROM messages
                WHERE sender_id = ? AND sender_type = 'user'
             )
             ORDER BY last_message_at DESC"
        );
        $stmt->execute([$user_id, $user_id, $user_id, $user_id, $user_id, $user_id]);
        echo json_encode($stmt->fetchAll());

    } else {
        http_response_code(400);
        echo json_encode(["error" => "partner_id or user_id is required."]);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
}
?>