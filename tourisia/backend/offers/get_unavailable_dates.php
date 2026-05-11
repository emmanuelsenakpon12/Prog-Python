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

    $offer_id = $_GET['offer_id'] ?? null;
    if (!$offer_id) {
        http_response_code(400);
        echo json_encode(["message" => "offer_id manquant."]);
        exit();
    }

    $stmt = $pdo->prepare("
        SELECT date_arrivee, date_depart FROM reservations
        WHERE offer_id = ? AND status != 'cancelled'
          AND date_arrivee IS NOT NULL AND date_depart IS NOT NULL
    ");
    $stmt->execute([$offer_id]);
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Développe chaque plage en jours individuels
    $dates = [];
    foreach ($rows as $row) {
        $current = new DateTime($row['date_arrivee']);
        $end     = new DateTime($row['date_depart']);
        while ($current <= $end) {
            $dates[] = $current->format('Y-m-d');
            $current->modify('+1 day');
        }
    }

    echo json_encode(["dates" => array_values(array_unique($dates))]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["message" => "Erreur serveur : " . $e->getMessage()]);
}
?>
