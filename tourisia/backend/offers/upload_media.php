<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

try {
    if (!isset($_FILES['file'])) {
        http_response_code(400);
        echo json_encode(["message" => "Aucun fichier reçu."]);
        exit();
    }

    $file = $_FILES['file'];
    $uploadDir = '../uploads/offers/';

    if (!file_exists($uploadDir)) {
        mkdir($uploadDir, 0777, true);
    }

    $extension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
    $allowedImageExt = ['jpg', 'jpeg', 'png', 'webp'];
    $allowedVideoExt = ['mp4', 'webm', 'mov'];

    $isImage = in_array($extension, $allowedImageExt);
    $isVideo = in_array($extension, $allowedVideoExt);

    if (!$isImage && !$isVideo) {
        http_response_code(400);
        echo json_encode(["message" => "Format de fichier non supporté."]);
        exit();
    }

    // Subdirectory based on type
    $subDir = $isImage ? 'images/' : 'videos/';
    if (!file_exists($uploadDir . $subDir)) {
        mkdir($uploadDir . $subDir, 0777, true);
    }

    $fileName = uniqid() . '.' . $extension;
    $targetPath = $uploadDir . $subDir . $fileName;

    if (move_uploaded_file($file['tmp_name'], $targetPath)) {
        http_response_code(200);
        echo json_encode([
            "success" => true,
            "path" => "uploads/offers/" . $subDir . $fileName
        ]);
    } else {
        http_response_code(500);
        echo json_encode(["message" => "Erreur lors du téléchargement."]);
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["message" => "Erreur serveur : " . $e->getMessage()]);
}
?>