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

    if (!$data || !isset($data['id']) || !isset($data['title'])) {
        http_response_code(400);
        echo json_encode(["message" => "Données incomplètes."]);
        exit();
    }

    $sql = "UPDATE offers SET 
                type = :type, 
                title = :title, 
                description = :description, 
                details = :details, 
                location = :location, 
                price = :price, 
                currency = :currency, 
                images = :images, 
                video = :video
            WHERE id = :id AND partner_id = :partner_id";

    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        ':id' => $data['id'],
        ':partner_id' => $data['partner_id'],
        ':type' => $data['type'],
        ':title' => $data['title'],
        ':description' => $data['description'],
        ':details' => isset($data['details']) ? json_encode($data['details']) : null,
        ':location' => $data['location'],
        ':price' => $data['price'],
        ':currency' => $data['currency'] ?? 'CFA',
        ':images' => isset($data['images']) ? json_encode($data['images']) : null,
        ':video' => $data['video'] ?? null
    ]);

    // Notification
    $userStmt = $pdo->prepare("SELECT user_id FROM partners WHERE id = ?");
    $userStmt->execute([$data['partner_id']]);
    $partnerUser = $userStmt->fetch();
    if ($partnerUser) {
        $notifStmt = $pdo->prepare("INSERT INTO notifications (user_id, type, title, content, link) VALUES (?, 'system', 'Publication modifiée ✏️', ?, '/espace_partenaire')");
        $notifStmt->execute([
            $partnerUser['user_id'],
            "Votre offre \"{$data['title']}\" a été mise à jour."
        ]);
    }

    echo json_encode([
        "success" => true,
        "message" => "Offre mise à jour avec succès !"
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["message" => "Erreur serveur : " . $e->getMessage()]);
}
?>