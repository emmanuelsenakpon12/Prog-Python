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

    if (!empty($data->user_id) && !empty($data->offer_id)) {
        // Check if user is the owner of the offer
        $ownerStmt = $pdo->prepare("
            SELECT o.partner_id 
            FROM offers o 
            JOIN partners p ON o.partner_id = p.id 
            WHERE o.id = ? AND p.user_id = ?
        ");
        $ownerStmt->execute([$data->offer_id, $data->user_id]);
        if ($ownerStmt->fetch()) {
            http_response_code(403);
            echo json_encode(["message" => "Un partenaire ne peut pas mettre en favori ses propres offres."]);
            exit;
        }

        // Check if already exists
        $stmt = $pdo->prepare("SELECT id FROM favorites WHERE user_id = ? AND offer_id = ?");
        $stmt->execute([$data->user_id, $data->offer_id]);
        $favorite = $stmt->fetch();

        if ($favorite) {
            // Remove from favorites
            // Get offer title first
            $offerStmt = $pdo->prepare("SELECT title FROM offers WHERE id = ?");
            $offerStmt->execute([$data->offer_id]);
            $offer = $offerStmt->fetch();
            $offerTitle = $offer ? $offer['title'] : 'une offre';

            $stmt = $pdo->prepare("DELETE FROM favorites WHERE user_id = ? AND offer_id = ?");
            $stmt->execute([$data->user_id, $data->offer_id]);

            // Notification
            $notifStmt = $pdo->prepare("INSERT INTO notifications (user_id, type, title, content, link) VALUES (?, 'favorite', ?, ?, '/profile?tab=wishlist')");
            $notifStmt->execute([
                $data->user_id,
                "Retiré des favoris 💔",
                "\"$offerTitle\" a été retiré de vos favoris."
            ]);

            echo json_encode(["message" => "Retiré des favoris.", "is_favorite" => false]);
        } else {
            // Add to favorites
            $stmt = $pdo->prepare("INSERT INTO favorites (user_id, offer_id) VALUES (?, ?)");
            $stmt->execute([$data->user_id, $data->offer_id]);

            // Create notification
            $offerStmt = $pdo->prepare("SELECT title FROM offers WHERE id = ?");
            $offerStmt->execute([$data->offer_id]);
            $offer = $offerStmt->fetch();
            $offerTitle = $offer ? $offer['title'] : 'une offre';

            $notifStmt = $pdo->prepare("INSERT INTO notifications (user_id, type, title, content, link) VALUES (?, 'favorite', ?, ?, '/profile?tab=wishlist')");
            $notifStmt->execute([
                $data->user_id,
                "Ajouté aux favoris ❤️",
                "Vous avez ajouté \"$offerTitle\" à vos favoris."
            ]);

            echo json_encode(["message" => "Ajouté aux favoris.", "is_favorite" => true]);
        }
    } else {
        http_response_code(400);
        echo json_encode(["message" => "Données incomplètes."]);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["message" => "Erreur serveur : " . $e->getMessage()]);
}
?>