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

    $lieu         = isset($_GET['lieu'])         ? trim($_GET['lieu'])         : '';
    $date_prise   = isset($_GET['date_prise'])   ? $_GET['date_prise']         : '';
    $heure_prise  = isset($_GET['heure_prise'])  ? $_GET['heure_prise']        : '';
    $date_retour  = isset($_GET['date_retour'])  ? $_GET['date_retour']        : '';
    $heure_retour = isset($_GET['heure_retour']) ? $_GET['heure_retour']       : '';

    $sql    = "SELECT o.*, p.selected_plan
               FROM offers o
               JOIN partners p ON o.partner_id = p.id
               WHERE o.type = 'transport'";
    $params = [];

    if (!empty($lieu)) {
        $sql     .= " AND (o.location LIKE ? OR o.title LIKE ?)";
        $params[] = "%$lieu%";
        $params[] = "%$lieu%";
    }

    $sql .= " ORDER BY o.created_at DESC";

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $offers = $stmt->fetchAll(PDO::FETCH_ASSOC);

    foreach ($offers as &$offer) {
        if ($offer['images'])  $offer['images']  = json_decode($offer['images']);
        if ($offer['details']) $offer['details'] = json_decode($offer['details']);
    }

    echo json_encode($offers);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["message" => "Erreur serveur : " . $e->getMessage()]);
}
?>
