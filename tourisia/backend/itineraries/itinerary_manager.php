<?php
// backend/itineraries/itinerary_manager.php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS");
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

    if ($method === 'GET') {
        // List itineraries for a user
        $userId = $_GET['user_id'] ?? null;
        if (!$userId) {
            http_response_code(400);
            echo json_encode(["message" => "user_id manquant."]);
            exit();
        }

        $stmt = $pdo->prepare("
            SELECT i.*, 
            (SELECT COUNT(*) FROM itinerary_items WHERE itinerary_id = i.id) as items_count 
            FROM itineraries i 
            WHERE i.user_id = ? 
            ORDER BY i.created_at DESC
        ");
        $stmt->execute([$userId]);
        $itineraries = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($itineraries);

    } elseif ($method === 'POST') {
        // Create a new itinerary
        $data = json_decode(file_get_contents("php://input"), true);
        if (empty($data['user_id']) || empty($data['title'])) {
            http_response_code(400);
            echo json_encode(["message" => "Données incomplètes."]);
            exit();
        }

        $stmt = $pdo->prepare("INSERT INTO itineraries (user_id, title, description) VALUES (?, ?, ?)");
        $stmt->execute([$data['user_id'], $data['title'], $data['description'] ?? '']);

        echo json_encode(["success" => true, "id" => $pdo->lastInsertId(), "message" => "Carnet créé avec succès."]);

    } elseif ($method === 'DELETE') {
        // Delete an itinerary
        $data = json_decode(file_get_contents("php://input"), true);
        $id = $data['id'] ?? null;
        if (!$id) {
            http_response_code(400);
            echo json_encode(["message" => "id manquant."]);
            exit();
        }

        // Get itinerary info before deleting
        $infoStmt = $pdo->prepare("SELECT user_id, title FROM itineraries WHERE id = ?");
        $infoStmt->execute([$id]);
        $itinInfo = $infoStmt->fetch();

        $stmt = $pdo->prepare("DELETE FROM itineraries WHERE id = ?");
        $stmt->execute([$id]);

        // Notification
        if ($itinInfo) {
            $notifStmt = $pdo->prepare("INSERT INTO notifications (user_id, type, title, content, link) VALUES (?, 'itinerary', 'Carnet supprimé 🗑️', ?, '/profile?tab=itineraries')");
            $notifStmt->execute([
                $itinInfo['user_id'],
                "Le carnet \"{$itinInfo['title']}\" a été supprimé."
            ]);
        }

        echo json_encode(["success" => true, "message" => "Carnet supprimé."]);
    }

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["message" => "Erreur : " . $e->getMessage()]);
}
?>