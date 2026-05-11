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

    // Récupérer un vol précis par ID
    if (!empty($_GET['id'])) {
        $id = intval($_GET['id']);
        $stmt = $pdo->prepare("SELECT * FROM flights WHERE id = ?");
        $stmt->execute([$id]);
        $flight = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$flight) {
            http_response_code(404);
            echo json_encode(["message" => "Vol introuvable."]);
            exit();
        }
        echo json_encode(["flight" => $flight]);
        exit();
    }

    // Recherche avec filtres
    $conditions = [];
    $params     = [];

    if (!empty($_GET['depart'])) {
        $conditions[] = "(depart_iata LIKE ? OR depart_ville LIKE ?)";
        $q = "%" . $_GET['depart'] . "%";
        $params[] = $q; $params[] = $q;
    }
    if (!empty($_GET['destination'])) {
        $conditions[] = "(arrivee_iata LIKE ? OR arrivee_ville LIKE ?)";
        $q = "%" . $_GET['destination'] . "%";
        $params[] = $q; $params[] = $q;
    }
    if (!empty($_GET['date_aller'])) {
        $conditions[] = "DATE(date_depart) = ?";
        $params[] = $_GET['date_aller'];
    }
    if (!empty($_GET['classe'])) {
        $conditions[] = "classe = ?";
        $params[] = $_GET['classe'];
    }

    // Toujours afficher les vols disponibles
    $conditions[] = "places_disponibles > 0";

    $where = count($conditions) ? "WHERE " . implode(" AND ", $conditions) : "";
    $sql   = "SELECT * FROM flights $where ORDER BY prix ASC";

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $flights = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(["flights" => $flights, "total" => count($flights)]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["message" => "Erreur serveur : " . $e->getMessage()]);
}
?>
