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

    $partnerId = isset($_GET['partner_id']) ? $_GET['partner_id'] : null;

    if ($partnerId) {
        $stmt = $pdo->prepare("SELECT o.*, p.selected_plan FROM offers o JOIN partners p ON o.partner_id = p.id WHERE o.partner_id = ? ORDER BY o.created_at DESC");
        $stmt->execute([$partnerId]);
    } else {
        // Fetch all offers for the public page
        $stmt = $pdo->prepare("SELECT o.*, p.selected_plan FROM offers o JOIN partners p ON o.partner_id = p.id ORDER BY o.created_at DESC");
        $stmt->execute();
    }
    $offers = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Decode JSON fields
    foreach ($offers as &$offer) {
        if ($offer['images'])
            $offer['images'] = json_decode($offer['images']);
        if ($offer['details'])
            $offer['details'] = json_decode($offer['details']);
    }

    echo json_encode($offers);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["message" => "Erreur serveur : " . $e->getMessage()]);
}
?>