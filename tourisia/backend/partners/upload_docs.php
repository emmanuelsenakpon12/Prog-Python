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
    if (!isset($_FILES['file']) || !isset($_POST['type'])) {
        http_response_code(400);
        echo json_encode(["message" => "Fichier ou type manquant."]);
        exit();
    }

    $file = $_FILES['file'];
    $type = $_POST['type']; // 'logo', 'rccm', 'ifu', 'identity', 'existence', 'signature'

    // Déterminer le dossier de destination
    $uploadDir = '../uploads/partners/';
    if (!file_exists($uploadDir)) {
        mkdir($uploadDir, 0777, true);
    }

    $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
    $fileName = $type . '_' . uniqid() . '.' . $extension;
    $targetPath = $uploadDir . $fileName;

    // Validation sommaire
    $allowedImageExt = ['jpg', 'jpeg', 'png', 'svg', 'webp'];
    $allowedDocExt = ['pdf'];

    if ($type === 'logo' || $type === 'signature') {
        if (!in_array(strtolower($extension), $allowedImageExt)) {
            http_response_code(400);
            echo json_encode(["message" => "Format d'image non supporté pour $type."]);
            exit();
        }
    } else {
        if (!in_array(strtolower($extension), $allowedDocExt)) {
            http_response_code(400);
            echo json_encode(["message" => "Format de document non supporté (PDF uniquement)."]);
            exit();
        }
    }

    if (move_uploaded_file($file['tmp_name'], $targetPath)) {
        http_response_code(200);
        // On retourne le chemin relatif pour la base de données
        echo json_encode([
            "message" => "Téléchargement réussi.",
            "path" => "uploads/partners/" . $fileName
        ]);
    } else {
        http_response_code(500);
        echo json_encode(["message" => "Erreur lors du déplacement du fichier."]);
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["message" => "Erreur serveur : " . $e->getMessage()]);
}
?>