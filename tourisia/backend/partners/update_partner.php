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
    require_once '../config/database.php';
    $pdo->exec("USE tourisia");

    $data = json_decode(file_get_contents("php://input"), true);

    if (!isset($data['partner_id'])) {
        http_response_code(400);
        echo json_encode(["message" => "ID du partenaire manquant."]);
        exit();
    }

    $partnerId = $data['partner_id'];

    // Fields that can be updated
    $allowedFields = [
        'business_name',
        'activity_type',
        'description',
        'address',
        'city',
        'country',
        'business_phone',
        'business_email',
        'website',
        'social_networks',
        'manager_name',
        'manager_phone',
        'manager_email',
        'account_holder',
        'bank_name',
        'iban',
        'mobile_money_number',
        'currency',
        'billing_address',
        'signature'
    ];

    $updateParts = [];
    $params = [':id' => $partnerId];

    foreach ($allowedFields as $field) {
        if (isset($data[$field])) {
            $updateParts[] = "$field = :$field";
            $params[":$field"] = $data[$field];
        }
    }

    if (empty($updateParts)) {
        http_response_code(400);
        echo json_encode(["message" => "Aucune donnée à mettre à jour."]);
        exit();
    }

    $sql = "UPDATE partners SET " . implode(", ", $updateParts) . " WHERE id = :id";
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);

    // Fetch updated data to return it
    $stmt = $pdo->prepare("SELECT * FROM partners WHERE id = ?");
    $stmt->execute([$partnerId]);
    $updatedPartner = $stmt->fetch(PDO::FETCH_ASSOC);

    echo json_encode([
        "message" => "Profil partenaire mis à jour avec succès.",
        "partner" => $updatedPartner
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["message" => "Erreur serveur : " . $e->getMessage()]);
}
?>