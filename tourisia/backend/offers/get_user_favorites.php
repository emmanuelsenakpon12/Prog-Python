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

    $userId = isset($_GET['user_id']) ? $_GET['user_id'] : null;

    if (!$userId) {
        http_response_code(400);
        echo json_encode(["message" => "ID de l'utilisateur manquant."]);
        exit();
    }

    $stmt = $pdo->prepare("
        SELECT o.* FROM offers o
        JOIN favorites f ON o.id = f.offer_id
        WHERE f.user_id = ?
        ORDER BY f.created_at DESC
    ");
    $stmt->execute([$userId]);
    $favorites = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Decode JSON fields
    foreach ($favorites as &$offer) {
        if ($offer['images'])
            $offer['images'] = json_decode($offer['images']);
        if ($offer['details'])
            $offer['details'] = json_decode($offer['details']);
    }

    echo json_encode($favorites);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["message" => "Erreur serveur : " . $e->getMessage()]);
}
?>