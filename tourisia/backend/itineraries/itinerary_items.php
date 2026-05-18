<?php
// backend/itineraries/itinerary_items.php
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
        // List items in an itinerary
        $itineraryId = $_GET['itinerary_id'] ?? null;
        if (!$itineraryId) {
            http_response_code(400);
            echo json_encode(["message" => "itinerary_id manquant."]);
            exit();
        }

        $stmt = $pdo->prepare("
            SELECT ii.*, o.title, o.type, o.location, o.price, o.currency, o.images 
            FROM itinerary_items ii 
            JOIN offers o ON ii.offer_id = o.id 
            WHERE ii.itinerary_id = ? 
            ORDER BY ii.item_order ASC
        ");
        $stmt->execute([$itineraryId]);
        $items = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Process images to provide a single image_url for the frontend
        foreach ($items as &$item) {
            $images = json_decode($item['images'] ?? '[]', true);
            $item['image_url'] = '';
            if (!empty($images) && is_array($images)) {
                $item['image_url'] = $images[0];
            }
            unset($item['images']);
        }

        echo json_encode($items);

    } elseif ($method === 'POST') {
        // Add item to itinerary
        $data = json_decode(file_get_contents("php://input"), true);
        if (empty($data['itinerary_id']) || empty($data['offer_id'])) {
            http_response_code(400);
            echo json_encode(["message" => "Données incomplètes."]);
            exit();
        }

        // Get max order
        $stmtOrder = $pdo->prepare("SELECT MAX(item_order) FROM itinerary_items WHERE itinerary_id = ?");
        $stmtOrder->execute([$data['itinerary_id']]);
        $maxOrder = $stmtOrder->fetchColumn() ?: 0;

        $stmt = $pdo->prepare("INSERT INTO itinerary_items (itinerary_id, offer_id, item_order) VALUES (?, ?, ?)");
        $stmt->execute([$data['itinerary_id'], $data['offer_id'], $maxOrder + 1]);

        // Create notification
        $offerStmt = $pdo->prepare("SELECT title FROM offers WHERE id = ?");
        $offerStmt->execute([$data['offer_id']]);
        $offer = $offerStmt->fetch();
        $offerTitle = $offer ? $offer['title'] : 'une offre';

        $itinStmt = $pdo->prepare("SELECT user_id, title FROM itineraries WHERE id = ?");
        $itinStmt->execute([$data['itinerary_id']]);
        $itin = $itinStmt->fetch();
        if ($itin) {
            $notifStmt = $pdo->prepare("INSERT INTO notifications (user_id, type, title, content, link) VALUES (?, 'itinerary', ?, ?, '/profile?tab=itineraries')");
            $notifStmt->execute([
                $itin['user_id'],
                "Carnet mis à jour 🗓️",
                "\"$offerTitle\" a été ajouté à votre carnet \"{$itin['title']}\"."
            ]);
        }

        echo json_encode(["success" => true, "message" => "Offre ajoutée au carnet."]);

    } elseif ($method === 'DELETE') {
        // Remove item from itinerary
        $data = json_decode(file_get_contents("php://input"), true);
        $id = $data['id'] ?? null;
        if (!$id) {
            http_response_code(400);
            echo json_encode(["message" => "id manquant."]);
            exit();
        }

        // Get item info before deleting
        $infoStmt = $pdo->prepare("
            SELECT ii.itinerary_id, o.title as offer_title, i.user_id, i.title as itin_title 
            FROM itinerary_items ii 
            JOIN offers o ON ii.offer_id = o.id 
            JOIN itineraries i ON ii.itinerary_id = i.id 
            WHERE ii.id = ?
        ");
        $infoStmt->execute([$id]);
        $info = $infoStmt->fetch();

        $stmt = $pdo->prepare("DELETE FROM itinerary_items WHERE id = ?");
        $stmt->execute([$id]);

        // Notification
        if ($info) {
            $notifStmt = $pdo->prepare("INSERT INTO notifications (user_id, type, title, content, link) VALUES (?, 'itinerary', 'Offre retirée du carnet 🗑️', ?, '/profile?tab=itineraries')");
            $notifStmt->execute([
                $info['user_id'],
                "\"{$info['offer_title']}\" a été retiré de votre carnet \"{$info['itin_title']}\"."
            ]);
        }

        echo json_encode(["success" => true, "message" => "Offre retirée du carnet."]);
    }

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["message" => "Erreur : " . $e->getMessage()]);
}
?>