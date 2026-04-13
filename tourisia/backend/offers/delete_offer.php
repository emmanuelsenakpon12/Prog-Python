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

    $data = json_decode(file_get_contents("php://input"), true);

    if (!$data || !isset($data['offer_id']) || !isset($data['partner_id'])) {
        http_response_code(400);
        echo json_encode(["message" => "Données incomplètes."]);
        exit();
    }

    $stmt = $pdo->prepare("DELETE FROM offers WHERE id = :id AND partner_id = :partner_id");
    $stmt->execute([
        ':id' => $data['offer_id'],
        ':partner_id' => $data['partner_id']
    ]);

    if ($stmt->rowCount() > 0) {
        // Get offer title for notification
        // (already deleted, so we notify with generic text)
        $userStmt = $pdo->prepare("SELECT user_id FROM partners WHERE id = ?");
        $userStmt->execute([$data['partner_id']]);
        $partnerUser = $userStmt->fetch();
        if ($partnerUser) {
            $notifStmt = $pdo->prepare("INSERT INTO notifications (user_id, type, title, content, link) VALUES (?, 'system', 'Publication supprimée 🗑️', 'Une de vos offres a été supprimée.', '/espace_partenaire')");
            $notifStmt->execute([$partnerUser['user_id']]);
        }

        echo json_encode([
            "success" => true,
            "message" => "Offre supprimée avec succès !"
        ]);
    } else {
        http_response_code(404);
        echo json_encode(["message" => "Offre non trouvée ou non autorisée."]);
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["message" => "Erreur serveur : " . $e->getMessage()]);
}
?>