<?php
ini_set('display_errors', 0);
ini_set('display_startup_errors', 0);
error_reporting(0);

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

try {
    require_once '../config/database.php';
    $pdo->exec("USE tourisia");

    if (!isset($_GET['user_id'])) {
        http_response_code(400);
        echo json_encode(["message" => "ID utilisateur manquant."]);
        exit();
    }

    $user_id = $_GET['user_id'];

    $query = "SELECT id, validation FROM partners WHERE user_id = :user_id LIMIT 1";
    $stmt = $pdo->prepare($query);
    $stmt->execute([':user_id' => $user_id]);
    $partner = $stmt->fetch(PDO::FETCH_ASSOC);

    echo json_encode([
        "hasPartnerAccount" => $partner ? true : false,
        "validation" => $partner ? (int) $partner['validation'] : null,
        "partner_id" => $partner ? (int) $partner['id'] : null
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["message" => "Erreur serveur : " . $e->getMessage()]);
}
?>