<?php
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

    // Check if handling JSON body (legacy) or FormData with images (new)
    $isMultipart = isset($_POST['offers_json']);

    if ($isMultipart) {
        $input = [
            'partner_id' => $_POST['partner_id'] ?? null,
            'offers' => json_decode($_POST['offers_json'], true)
        ];
    } else {
        $inputJSON = file_get_contents('php://input');
        $input = json_decode($inputJSON, true);
    }

    if (!isset($input['partner_id']) || empty($input['partner_id'])) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "L'ID du partenaire est manquant."]);
        exit();
    }

    $partnerId = $input['partner_id'];

    // Check plan restrictions
    $stmtPlan = $pdo->prepare("SELECT selected_plan FROM partners WHERE id = ?");
    $stmtPlan->execute([$partnerId]);
    $partner = $stmtPlan->fetch(PDO::FETCH_ASSOC);

    if (!$partner) {
        http_response_code(404);
        echo json_encode(["success" => false, "message" => "Partenaire introuvable."]);
        exit();
    }

    if ($partner['selected_plan'] === 'Gratuit') {
        http_response_code(403);
        echo json_encode([
            "success" => false,
            "message" => "L'importation en masse est réservée aux comptes professionnels. Veuillez passer au pack professionnel pour utiliser cette fonctionnalité."
        ]);
        exit();
    }

    if (!isset($input['offers']) || !is_array($input['offers'])) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Aucune donnée d'offre valide fournie."]);
        exit();
    }

    // Process uploaded images if they exist
    $uploadedFilePaths = []; // Original filename => server path
    if ($isMultipart && isset($_FILES['images'])) {
        $uploadDir = '../uploads/offers/images/';
        if (!file_exists($uploadDir)) {
            mkdir($uploadDir, 0777, true);
        }

        $allowedExt = ['jpg', 'jpeg', 'png', 'webp'];

        foreach ($_FILES['images']['tmp_name'] as $key => $tmpName) {
            $originalName = $_FILES['images']['name'][$key];
            $extension = strtolower(pathinfo($originalName, PATHINFO_EXTENSION));

            if (in_array($extension, $allowedExt)) {
                $fileName = uniqid() . '.' . $extension;
                $targetPath = $uploadDir . $fileName;

                if (move_uploaded_file($tmpName, $targetPath)) {
                    $uploadedFilePaths[$originalName] = "uploads/offers/images/" . $fileName;
                }
            }
        }
    }

    $offers = $input['offers'];
    $insertedCount = 0;
    $errors = [];

    // Prepare statement for insertion
    $stmt = $pdo->prepare("
        INSERT INTO offers (type, title, description, location, price, currency, partner_id, images, details) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ");

    foreach ($offers as $index => $offer) {
        $rowNumber = $index + 2; // +2 to account for header and 0-indexing

        $type = isset($offer['type']) ? trim($offer['type']) : '';
        $title = isset($offer['titre']) ? trim($offer['titre']) : '';
        $description = isset($offer['description']) ? trim($offer['description']) : '';
        $location = isset($offer['location']) ? trim($offer['location']) : '';
        $price = isset($offer['prix']) ? trim($offer['prix']) : '';
        $currency = isset($offer['devise']) ? trim($offer['devise']) : 'CFA';
        $detailsAssoc = isset($offer['caracteristiques']) && is_array($offer['caracteristiques']) ? $offer['caracteristiques'] : [];
        $requestedImageNames = isset($offer['images']) && is_array($offer['images']) ? $offer['images'] : [];

        // Basic validation for the row
        if (empty($title) || empty($price) || empty($location)) {
            $errors[] = "Ligne $rowNumber : Titre, prix et location sont obligatoires.";
            continue;
        }

        // Match requested images with successfully uploaded ones
        $offerImagePaths = [];
        foreach ($requestedImageNames as $imgName) {
            if (isset($uploadedFilePaths[$imgName])) {
                $offerImagePaths[] = $uploadedFilePaths[$imgName];
            } else {
                $errors[] = "Ligne $rowNumber : Image '$imgName' introuvable dans le dossier uploadé.";
            }
        }

        // Parse characteristics into JSON
        $details = json_encode($detailsAssoc);
        $images = empty($offerImagePaths) ? null : json_encode($offerImagePaths);

        try {
            if ($stmt->execute([$type, $title, $description, $location, $price, $currency, $partnerId, $images, $details])) {
                $insertedCount++;
            } else {
                $errors[] = "Ligne $rowNumber : Erreur lors de l'insertion.";
            }
        } catch (PDOException $e) {
            $errors[] = "Ligne $rowNumber : Erreur de base de données (" . $e->getMessage() . ")";
        }
    }

    if ($insertedCount > 0) {
        echo json_encode([
            "success" => true,
            "message" => "$insertedCount offre(s) importée(s) avec succès.",
            "errors" => $errors
        ]);
    } else {
        echo json_encode([
            "success" => false,
            "message" => "Aucune offre n'a pu être importée. " . (count($errors) > 0 ? $errors[0] : ""),
            "errors" => $errors
        ]);
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Erreur serveur : " . $e->getMessage()]);
}
?>