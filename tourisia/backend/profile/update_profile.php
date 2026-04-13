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

    $data = json_decode(file_get_contents("php://input"));

    if (empty($data->id)) {
        http_response_code(400);
        echo json_encode(["message" => "ID utilisateur manquant."]);
        exit();
    }

    // Préparer les champs à mettre à jour
    $fields = [];
    $params = [':id' => $data->id];

    if (isset($data->fullname)) {
        $fields[] = "fullname = :fullname";
        $params[':fullname'] = htmlspecialchars(strip_tags($data->fullname));
    }
    if (isset($data->phone)) {
        $fields[] = "phone = :phone";
        $params[':phone'] = htmlspecialchars(strip_tags($data->phone));
    }
    if (isset($data->location)) {
        $fields[] = "location = :location";
        $params[':location'] = htmlspecialchars(strip_tags($data->location));
    }
    if (isset($data->bio)) {
        $fields[] = "bio = :bio";
        $params[':bio'] = htmlspecialchars(strip_tags($data->bio));
    }
    if (isset($data->avatar)) {
        $fields[] = "avatar = :avatar";
        $params[':avatar'] = htmlspecialchars(strip_tags($data->avatar));
    }
    if (isset($data->cover_image)) {
        $fields[] = "cover_image = :cover_image";
        $params[':cover_image'] = htmlspecialchars(strip_tags($data->cover_image));
    }

    if (empty($fields)) {
        http_response_code(400);
        echo json_encode(["message" => "Aucune donnée à mettre à jour."]);
        exit();
    }

    $query = "UPDATE users SET " . implode(", ", $fields) . " WHERE id = :id";
    $stmt = $pdo->prepare($query);

    if ($stmt->execute($params)) {
        // Create notification
        $notifStmt = $pdo->prepare("INSERT INTO notifications (user_id, type, title, content, link) VALUES (?, 'system', 'Profil mis à jour ✏️', 'Vos informations personnelles ont été modifiées avec succès.', '/profile')");
        $notifStmt->execute([$data->id]);

        http_response_code(200);
        echo json_encode(["message" => "Profil mis à jour avec succès."]);
    } else {
        http_response_code(500);
        echo json_encode(["message" => "Impossible de mettre à jour le profil."]);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["message" => "Erreur serveur : " . $e->getMessage()]);
}
?>