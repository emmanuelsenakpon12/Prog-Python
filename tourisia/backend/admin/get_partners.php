<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

try {
    require_once '../config/database.php';
    $pdo->exec("USE tourisia");

    $stmt = $pdo->query("SELECT p.*, u.fullname as user_name FROM partners p JOIN users u ON p.user_id = u.id ORDER BY p.created_at DESC");
    $partners = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode($partners);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["message" => "Erreur serveur : " . $e->getMessage()]);
}
?>