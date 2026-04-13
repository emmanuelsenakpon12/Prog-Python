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
    require_once '../utils/email_helper.php';

    // Sélectionner la base de données
    $pdo->exec("USE tourisia");

    $data = json_decode(file_get_contents("php://input"));

    if (
        !empty($data->fullname) &&
        !empty($data->email) &&
        !empty($data->password)
    ) {
        // Vérifier si l'email existe déjà
        $query = "SELECT id FROM users WHERE email = :email";
        $stmt = $pdo->prepare($query);
        $stmt->bindParam(':email', $data->email);
        $stmt->execute();

        if ($stmt->rowCount() > 0) {
            http_response_code(400);
            echo json_encode(["message" => "Cet email est déjà utilisé."]);
            exit();
        }

        // Préparer la requête d'insertion
        $query = "INSERT INTO users (fullname, email, password) VALUES (:fullname, :email, :password)";
        $stmt = $pdo->prepare($query);

        // Sécuriser les données
        $fullname = htmlspecialchars(strip_tags($data->fullname));
        $email = htmlspecialchars(strip_tags($data->email));
        $password_hash = password_hash($data->password, PASSWORD_BCRYPT);

        $stmt->bindParam(':fullname', $fullname);
        $stmt->bindParam(':email', $email);
        $stmt->bindParam(':password', $password_hash);

        if ($stmt->execute()) {
            $newUserId = $pdo->lastInsertId();
            sendWelcomeEmail($email, $fullname);

            // Welcome notification
            $notifStmt = $pdo->prepare("INSERT INTO notifications (user_id, type, title, content, link) VALUES (?, 'system', ?, ?, '/profile')");
            $notifStmt->execute([
                $newUserId,
                "Bienvenue sur Tourisia ! 🎉",
                "Bonjour $fullname ! Votre compte a été créé avec succès. Explorez nos offres et commencez à planifier votre prochain voyage."
            ]);

            http_response_code(201);
            echo json_encode(["message" => "Utilisateur créé avec succès."]);
        } else {
            http_response_code(500);
            echo json_encode(["message" => "Impossible de créer l'utilisateur."]);
        }
    } else {
        http_response_code(400);
        echo json_encode(["message" => "Données incomplètes."]);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "message" => "Erreur serveur : " . $e->getMessage()
    ]);
}
?>