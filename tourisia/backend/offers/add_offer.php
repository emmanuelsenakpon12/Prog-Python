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

    if (!$data || !isset($data['partner_id']) || !isset($data['title'])) {
        http_response_code(400);
        echo json_encode(["message" => "Données incomplètes."]);
        exit();
    }

    // Check plan restrictions
    $stmt = $pdo->prepare("SELECT selected_plan FROM partners WHERE id = ?");
    $stmt->execute([$data['partner_id']]);
    $partner = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$partner) {
        http_response_code(404);
        echo json_encode(["message" => "Partenaire introuvable."]);
        exit();
    }

    if ($partner['selected_plan'] === 'Gratuit') {
        $stmtCount = $pdo->prepare("SELECT COUNT(*) FROM offers WHERE partner_id = ?");
        $stmtCount->execute([$data['partner_id']]);
        $offerCount = $stmtCount->fetchColumn();

        if ($offerCount >= 5) {
            http_response_code(403);
            echo json_encode([
                "success" => false,
                "message" => "Limite atteinte : Le pack gratuit permet de publier jusqu'à 5 annonces maximum. Veuillez passer au pack professionnel pour plus d'annonces."
            ]);
            exit();
        }
    }

    $sql = "INSERT INTO offers (partner_id, type, title, description, details, location, price, currency, images, video)
            VALUES (:partner_id, :type, :title, :description, :details, :location, :price, :currency, :images, :video)";

    $stmt = $pdo->prepare($sql);
    $stmt->execute([
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

    http_response_code(201);
    $newOfferId = $pdo->lastInsertId();

    // Notification for the partner's user account
    $userStmt = $pdo->prepare("SELECT user_id FROM partners WHERE id = ?");
    $userStmt->execute([$data['partner_id']]);
    $partnerUser = $userStmt->fetch();
    if ($partnerUser) {
        $notifStmt = $pdo->prepare("INSERT INTO notifications (user_id, type, title, content, link) VALUES (?, 'system', 'Nouvelle publication 📢', ?, '/espace_partenaire')");
        $notifStmt->execute([
            $partnerUser['user_id'],
            "Votre offre \"{$data['title']}\" a été publiée avec succès."
        ]);
    }

    echo json_encode([
        "success" => true,
        "message" => "Offre créée avec succès !",
        "offer_id" => $newOfferId
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["message" => "Erreur serveur : " . $e->getMessage()]);
}
?>