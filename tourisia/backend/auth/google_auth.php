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

// REMPLACEZ CECI PAR VOTRE CLIENT ID GOOGLE
$GOOGLE_CLIENT_ID = "1064867979845-f1f4re147ugosa4c0i7vukshfq5doi4s.apps.googleusercontent.com";

try {
    require_once '../config/database.php';
    require_once '../utils/email_helper.php';
    $pdo->exec("USE tourisia");

    $data = json_decode(file_get_contents("php://input"));

    if (empty($data->credential)) {
        http_response_code(400);
        echo json_encode(["message" => "Jeton Google manquant."]);
        exit();
    }

    $id_token = $data->credential;

    // Vérifier le jeton auprès de Google en utilisant cURL (plus fiable que file_get_contents)
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, "https://oauth2.googleapis.com/tokeninfo?id_token=" . $id_token);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false); // Pour le développement local
    $response = curl_exec($ch);
    $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if (!$response || $http_code !== 200) {
        http_response_code(401);
        echo json_encode(["message" => "Échec de la vérification Google. Code : " . $http_code]);
        exit();
    }

    $payload = json_decode($response, true);

    if (!$payload || isset($payload['error'])) {
        http_response_code(401);
        echo json_encode(["message" => "Jeton Google invalide."]);
        exit();
    }

    // Vérification de sécurité supplémentaire : s'assurer que le token appartient à NOTRE Client ID
    if ($payload['aud'] !== $GOOGLE_CLIENT_ID) {
        http_response_code(401);
        echo json_encode(["message" => "ID Client ne correspond pas."]);
        exit();
    }

    // Informations utilisateur de Google
    $google_id = $payload['sub'];
    $email = $payload['email'];
    $fullname = $payload['name'] ?? 'Google User';
    $avatar = $payload['picture'] ?? null;

    // Vérifier si l'utilisateur existe déjà
    $query = "SELECT * FROM users WHERE oauth_id = :oauth_id OR email = :email";
    $stmt = $pdo->prepare($query);
    $stmt->execute([':oauth_id' => $google_id, ':email' => $email]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($user) {
        // Mettre à jour l'utilisateur existant
        $updateQuery = "UPDATE users SET oauth_id = :oauth_id, oauth_provider = 'google', avatar = IFNULL(avatar, :avatar) WHERE id = :id";
        $updateStmt = $pdo->prepare($updateQuery);
        $updateStmt->execute([
            ':oauth_id' => $google_id,
            ':avatar' => $avatar,
            ':id' => $user['id']
        ]);

        // Récupérer les données mises à jour
        $stmt->execute([':oauth_id' => $google_id, ':email' => $email]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
    } else {
        // Créer un nouvel utilisateur
        $insertQuery = "INSERT INTO users (fullname, email, password, oauth_provider, oauth_id, avatar) 
                        VALUES (:fullname, :email, :password, 'google', :google_id, :avatar)";
        $insertStmt = $pdo->prepare($insertQuery);
        $insertStmt->execute([
            ':fullname' => $fullname,
            ':email' => $email,
            ':password' => password_hash(bin2hex(random_bytes(16)), PASSWORD_DEFAULT),
            ':google_id' => $google_id,
            ':avatar' => $avatar
        ]);

        $userId = $pdo->lastInsertId();
        sendWelcomeEmail($email, $fullname);

        // Récupérer le nouvel utilisateur
        $stmt = $pdo->prepare("SELECT * FROM users WHERE id = :id");
        $stmt->execute([':id' => $userId]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
    }

    unset($user['password']);
    http_response_code(200);
    echo json_encode([
        "message" => "Connexion réussie via Google.",
        "user" => $user
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["message" => "Une erreur est survenue côté serveur."]);
}
?>