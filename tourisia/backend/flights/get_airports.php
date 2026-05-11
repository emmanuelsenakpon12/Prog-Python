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

    $q = trim($_GET['q'] ?? '');
    if (strlen($q) < 2) {
        echo json_encode([]);
        exit();
    }

    $like  = "%" . $q . "%";
    $stmt  = $pdo->prepare("
        SELECT iata, nom, ville, pays
        FROM airports
        WHERE iata LIKE ? OR ville LIKE ? OR nom LIKE ?
        ORDER BY
          CASE WHEN UPPER(iata) = UPPER(?) THEN 0 ELSE 1 END,
          ville ASC
        LIMIT 8
    ");
    $stmt->execute([$like, $like, $like, $q]);
    $airports = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode($airports);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["message" => "Erreur serveur : " . $e->getMessage()]);
}
?>
