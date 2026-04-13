<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Returns all messages between a user and a partner.
// Query params: user_id, partner_id
$user_id = $_GET['user_id'] ?? null;
$partner_id = $_GET['partner_id'] ?? null;

if (!$user_id || !$partner_id) {
    http_response_code(400);
    echo json_encode(["error" => "user_id and partner_id are required."]);
    exit();
}

try {
    require_once '../config/database.php';
    $pdo->exec("USE tourisia");
    require_once 'cleanup.php';

    // Mark messages as read
    if (isset($_GET['mark_read']) && $_GET['mark_read'] === '1') {
        $viewer_type = $_GET['viewer_type'] ?? null;
        if ($viewer_type === 'user') {
            // User is reading messages FROM partner
            $markStmt = $pdo->prepare(
                "UPDATE messages SET is_read = 1 
                 WHERE sender_id = ? AND receiver_id = ? AND sender_type = 'partner' AND is_read = 0"
            );
            $markStmt->execute([$partner_id, $user_id]);
        } elseif ($viewer_type === 'partner') {
            // Partner is reading messages FROM user
            $markStmt = $pdo->prepare(
                "UPDATE messages SET is_read = 1 
                 WHERE sender_id = ? AND receiver_id = ? AND sender_type = 'user' AND is_read = 0"
            );
            $markStmt->execute([$user_id, $partner_id]);
        }
    }

    $stmt = $pdo->prepare(
        "SELECT m.*, u.fullname as user_name, u.email as user_email
         FROM messages m
         LEFT JOIN users u ON (m.sender_type = 'user' AND m.sender_id = u.id)
         WHERE (m.sender_id = ? AND m.receiver_id = ? AND m.sender_type = 'user')
            OR (m.sender_id = ? AND m.receiver_id = ? AND m.sender_type = 'partner')
         ORDER BY m.created_at ASC"
    );
    $stmt->execute([$user_id, $partner_id, $partner_id, $user_id]);
    $messages = $stmt->fetchAll();

    echo json_encode($messages);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
}
?>