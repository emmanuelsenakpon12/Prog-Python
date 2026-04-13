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

    // Statistiques simples
    $usersCount = $pdo->query("SELECT COUNT(*) FROM users WHERE role != 'admin'")->fetchColumn();
    $partnersCount = $pdo->query("SELECT COUNT(*) FROM partners")->fetchColumn();
    $pendingPartners = $pdo->query("SELECT COUNT(*) FROM partners WHERE validation = 0")->fetchColumn();

    echo json_encode([
        "users" => $usersCount,
        "partners" => $partnersCount,
        "pending_partners" => $pendingPartners
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["message" => "Erreur serveur : " . $e->getMessage()]);
}
?>