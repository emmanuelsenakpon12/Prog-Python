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

    // Only return validated partners who can actually communicate and provide services
    $stmt = $pdo->prepare("SELECT id, business_name, business_email, activity_type FROM partners WHERE validation = 1 ORDER BY business_name ASC");
    $stmt->execute();
    $partners = $stmt->fetchAll();

    echo json_encode($partners);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
}
?>