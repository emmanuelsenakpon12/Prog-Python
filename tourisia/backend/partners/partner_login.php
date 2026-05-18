<?php
ini_set('display_errors', 0);
ini_set('display_startup_errors', 0);
error_reporting(0);

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

try {
    require_once '../config/database.php';
    $pdo->exec("USE tourisia");

    $data = json_decode(file_get_contents("php://input"), true);

    if (empty($data['login']) || empty($data['password'])) {
        http_response_code(400);
        echo json_encode(["message" => "Identifiants manquants."]);
        exit();
    }

    $login = $data['login'];
    $password = $data['password'];

    // Dans notre table, manager_login est le login et manager_password est le hash
    $query = "SELECT * FROM partners WHERE manager_login = :login LIMIT 1";
    $stmt = $pdo->prepare($query);
    $stmt->execute([':login' => $login]);
    $partner = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($partner && password_verify($password, $partner['manager_password'])) {
        unset($partner['manager_password']); // Sécurité
        http_response_code(200);
        echo json_encode([
            "message" => "Connexion partenaire réussie.",
            "partner" => $partner
        ]);
    } else {
        http_response_code(401);
        echo json_encode(["message" => "Login ou mot de passe incorrect."]);
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["message" => "Erreur serveur : " . $e->getMessage()]);
}
?>