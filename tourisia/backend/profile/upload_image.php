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

    if (!isset($_POST['id']) || !isset($_POST['type'])) {
        http_response_code(400);
        echo json_encode(["message" => "Données manquantes (id ou type)."]);
        exit();
    }

    $id = intval($_POST['id']);
    $type = $_POST['type']; // 'avatar' ou 'cover_image'

    if ($type !== 'avatar' && $type !== 'cover_image') {
        http_response_code(400);
        echo json_encode(["message" => "Type d'image invalide."]);
        exit();
    }

    if (!isset($_FILES['image'])) {
        http_response_code(400);
        echo json_encode(["message" => "Aucun fichier envoyé."]);
        exit();
    }

    $file = $_FILES['image'];
    $allowed_extensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
    $extension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));

    if (!in_array($extension, $allowed_extensions)) {
        http_response_code(400);
        echo json_encode(["message" => "Format de fichier non supporté."]);
        exit();
    }

    // Créer les dossiers d'upload si inexistants
    $upload_dir = __DIR__ . '/../uploads/profiles/';
    if (!file_exists($upload_dir)) {
        mkdir($upload_dir, 0777, true);
    }
    $banners_dir = __DIR__ . '/../uploads/banners/';
    if (!file_exists($banners_dir)) {
        mkdir($banners_dir, 0777, true);
    }

    $filename = $type . '_' . $id . '_' . time() . '.' . $extension;
    $target_path = $upload_dir . $filename;
    // URL relative depuis la racine backend — le frontend préfixe avec BASE_URL
    $relative_url = '/uploads/profiles/' . $filename;

    if (move_uploaded_file($file['tmp_name'], $target_path)) {
        // Mettre à jour la base de données
        $query = "UPDATE users SET $type = :path WHERE id = :id";
        $stmt = $pdo->prepare($query);
        $stmt->bindParam(':path', $relative_url);
        $stmt->bindParam(':id', $id);

        if ($stmt->execute()) {
            http_response_code(200);
            echo json_encode([
                "success" => true,
                "message" => "Image mise à jour avec succès.",
                "url"     => $relative_url,
                "path"    => $relative_url
            ]);
        } else {
            http_response_code(500);
            echo json_encode(["message" => "Erreur lors de la mise à jour de la base de données."]);
        }
    } else {
        http_response_code(500);
        echo json_encode(["message" => "Erreur lors du déplacement du fichier."]);
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["message" => "Erreur serveur : " . $e->getMessage()]);
}
?>