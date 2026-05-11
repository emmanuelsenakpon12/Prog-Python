<?php
ini_set('display_errors', 0);
error_reporting(0);

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

try {
    require_once '../config/database.php';
    $pdo->exec("USE tourisia");

    $user_id = $_GET['user_id'] ?? null;
    if (!$user_id) {
        http_response_code(400);
        echo json_encode(["message" => "user_id manquant."]);
        exit();
    }

    $stmt = $pdo->prepare("SELECT * FROM partners WHERE user_id = ? LIMIT 1");
    $stmt->execute([$user_id]);
    $partner = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$partner) {
        http_response_code(404);
        echo json_encode(["message" => "Aucun compte partenaire trouvé."]);
        exit();
    }

    unset($partner['manager_password']);
    echo json_encode(["partner" => $partner]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["message" => "Erreur serveur : " . $e->getMessage()]);
}
?>
