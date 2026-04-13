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

    if (empty($data->partner_id) || !isset($data->status)) {
        http_response_code(400);
        echo json_encode(["message" => "Données incomplètes."]);
        exit();
    }

    $stmt = $pdo->prepare("UPDATE partners SET validation = :status WHERE id = :id");
    $stmt->execute([
        ':status' => $data->status,
        ':id' => $data->partner_id
    ]);

    // Notify the partner's user account
    $partnerStmt = $pdo->prepare("SELECT user_id, business_name FROM partners WHERE id = ?");
    $partnerStmt->execute([$data->partner_id]);
    $partnerInfo = $partnerStmt->fetch();
    if ($partnerInfo) {
        if ($data->status == 1) {
            $notifStmt = $pdo->prepare("INSERT INTO notifications (user_id, type, title, content, link) VALUES (?, 'system', 'Compte partenaire validé ✅', ?, '/espace_partenaire')");
            $notifStmt->execute([
                $partnerInfo['user_id'],
                "Félicitations ! Votre compte partenaire \"{$partnerInfo['business_name']}\" a été validé. Vous pouvez maintenant publier vos offres."
            ]);
        } else {
            $notifStmt = $pdo->prepare("INSERT INTO notifications (user_id, type, title, content, link) VALUES (?, 'system', 'Statut partenaire modifié ⚠️', ?, '/profile')");
            $notifStmt->execute([
                $partnerInfo['user_id'],
                "Le statut de votre compte partenaire \"{$partnerInfo['business_name']}\" a été modifié par l'administration."
            ]);
        }
    }

    echo json_encode(["message" => "Statut mis à jour avec succès."]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["message" => "Erreur serveur : " . $e->getMessage()]);
}
?>