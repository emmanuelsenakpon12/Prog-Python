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

    if (empty($data['email']) || empty($data['password'])) {
        http_response_code(400);
        echo json_encode(["message" => "Email et mot de passe requis."]);
        exit();
    }

    $email = $data['email'];
    $password = $data['password'];

    // Vérifier les identifiants utilisateur
    $query = "SELECT id, fullname, email, password FROM users WHERE email = :email LIMIT 1";
    $stmt = $pdo->prepare($query);
    $stmt->execute([':email' => $email]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user || !password_verify($password, $user['password'])) {
        http_response_code(401);
        echo json_encode(["message" => "Email ou mot de passe incorrect."]);
        exit();
    }

    // Vérifier si cet utilisateur a un compte partenaire
    $query_partner = "SELECT * FROM partners WHERE user_id = :user_id LIMIT 1";
    $stmt_partner = $pdo->prepare($query_partner);
    $stmt_partner->execute([':user_id' => $user['id']]);
    $partner = $stmt_partner->fetch(PDO::FETCH_ASSOC);

    if (!$partner) {
        http_response_code(403);
        echo json_encode(["message" => "Aucun compte partenaire trouvé pour cet utilisateur."]);
        exit();
    }

    // Retourner les données du partenaire
    unset($partner['manager_password']); // Sécurité
    http_response_code(200);
    echo json_encode([
        "message" => "Connexion partenaire réussie.",
        "partner" => $partner,
        "user" => $user
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["message" => "Erreur serveur : " . $e->getMessage()]);
}
?>