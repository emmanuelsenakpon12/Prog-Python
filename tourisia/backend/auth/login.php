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

    // Sélectionner la base de données
    $pdo->exec("USE tourisia");

    $data = json_decode(file_get_contents("php://input"));

    if (!empty($data->email) && !empty($data->password)) {
        $query = "SELECT id, fullname, email, password, phone, location, bio, avatar, cover_image, trips_count, countries_count, wishlist_count, reviews_count, role, created_at FROM users WHERE email = :email";
        $stmt = $pdo->prepare($query);

        $email = htmlspecialchars(strip_tags($data->email));
        $stmt->bindParam(':email', $email);
        $stmt->execute();

        if ($stmt->rowCount() > 0) {
            $row = $stmt->fetch(PDO::FETCH_ASSOC);

            if (password_verify($data->password, $row['password'])) {
                http_response_code(200);
                echo json_encode([
                    "message" => "Connexion réussie.",
                    "user" => [
                        "id" => $row['id'],
                        "fullname" => $row['fullname'],
                        "email" => $row['email'],
                        "phone" => $row['phone'],
                        "location" => $row['location'],
                        "bio" => $row['bio'],
                        "avatar" => $row['avatar'],
                        "cover_image" => $row['cover_image'],
                        "trips_count" => $row['trips_count'],
                        "countries_count" => $row['countries_count'],
                        "wishlist_count" => $row['wishlist_count'],
                        "reviews_count" => $row['reviews_count'],
                        "role" => $row['role'],
                        "created_at" => $row['created_at']
                    ]
                ]);
            } else {
                http_response_code(401);
                echo json_encode(["message" => "Mot de passe incorrect."]);
            }
        } else {
            http_response_code(404);
            echo json_encode(["message" => "Utilisateur non trouvé."]);
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