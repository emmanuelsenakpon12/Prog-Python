<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/../config/database.php';

try {
    $pdo->exec("USE tourisia");
    $method = $_SERVER['REQUEST_METHOD'];

    // ── GET: List notifications or unread count ──
    if ($method === 'GET') {
        $userId = $_GET['user_id'] ?? null;
        if (!$userId) {
            http_response_code(400);
            echo json_encode(["error" => "user_id manquant."]);
            exit();
        }

        // Return just the unread count
        if (isset($_GET['unread_count'])) {
            $stmt = $pdo->prepare("SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0");
            $stmt->execute([$userId]);
            echo json_encode($stmt->fetch());
            exit();
        }

        // Return full list (last 50)
        $stmt = $pdo->prepare("
            SELECT * FROM notifications 
            WHERE user_id = ? 
            ORDER BY created_at DESC 
            LIMIT 50
        ");
        $stmt->execute([$userId]);
        echo json_encode($stmt->fetchAll());
    }

    // ── POST: Create a notification ──
    elseif ($method === 'POST') {
        $data = json_decode(file_get_contents("php://input"), true);
        $userId = $data['user_id'] ?? null;
        $type = $data['type'] ?? 'system';
        $title = $data['title'] ?? '';
        $content = $data['content'] ?? '';
        $link = $data['link'] ?? null;

        if (!$userId || !$title) {
            http_response_code(400);
            echo json_encode(["error" => "user_id et title requis."]);
            exit();
        }

        $stmt = $pdo->prepare("INSERT INTO notifications (user_id, type, title, content, link) VALUES (?, ?, ?, ?, ?)");
        $stmt->execute([$userId, $type, $title, $content, $link]);
        echo json_encode(["success" => true, "id" => $pdo->lastInsertId()]);
    }

    // ── PUT: Mark as read (single or all) ──
    elseif ($method === 'PUT') {
        $data = json_decode(file_get_contents("php://input"), true);

        // Mark all as read
        if (!empty($data['user_id']) && !empty($data['mark_all'])) {
            $stmt = $pdo->prepare("UPDATE notifications SET is_read = 1 WHERE user_id = ? AND is_read = 0");
            $stmt->execute([$data['user_id']]);
            echo json_encode(["success" => true, "updated" => $stmt->rowCount()]);
        }
        // Mark single as read
        elseif (!empty($data['id'])) {
            $stmt = $pdo->prepare("UPDATE notifications SET is_read = 1 WHERE id = ?");
            $stmt->execute([$data['id']]);
            echo json_encode(["success" => true]);
        } else {
            http_response_code(400);
            echo json_encode(["error" => "id ou (user_id + mark_all) requis."]);
        }
    }

    // ── DELETE: Remove notification(s) ──
    elseif ($method === 'DELETE') {
        $data = json_decode(file_get_contents("php://input"), true);

        // Delete all for a user
        if (!empty($data['user_id']) && !empty($data['delete_all'])) {
            $stmt = $pdo->prepare("DELETE FROM notifications WHERE user_id = ?");
            $stmt->execute([$data['user_id']]);
            echo json_encode(["success" => true, "deleted" => $stmt->rowCount()]);
        }
        // Delete single
        elseif (!empty($data['id'])) {
            $stmt = $pdo->prepare("DELETE FROM notifications WHERE id = ?");
            $stmt->execute([$data['id']]);
            echo json_encode(["success" => true]);
        } else {
            http_response_code(400);
            echo json_encode(["error" => "id ou (user_id + delete_all) requis."]);
        }
    }

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => "Erreur : " . $e->getMessage()]);
}
?>