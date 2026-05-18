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

    if (empty($data['user_id']) || empty($data['business_name'])) {
        http_response_code(400);
        echo json_encode(["message" => "Données incomplètes (ID utilisateur ou Nom commercial manquant)."]);
        exit();
    }

    $sql = "INSERT INTO partners (
        user_id, business_name, activity_type, description, logo, 
        address, city, country, business_phone, business_email, 
        website, social_networks, rccm_number, ifu_number, 
        legal_status, identity_document, existence_certificate, 
        manager_name, manager_phone, manager_email, manager_role, 
        manager_login, manager_password, account_holder, bank_name, 
        iban, mobile_money_number, currency, is_vat_applicable, 
        vat_rate, billing_address, selected_plan
    ) VALUES (
        :user_id, :business_name, :activity_type, :description, :logo, 
        :address, :city, :country, :business_phone, :business_email, 
        :website, :social_networks, :rccm_number, :ifu_number, 
        :legal_status, :identity_document, :existence_certificate, 
        :manager_name, :manager_phone, :manager_email, :manager_role, 
        :manager_login, :manager_password, :account_holder, :bank_name, 
        :iban, :mobile_money_number, :currency, :is_vat_applicable, 
        :vat_rate, :billing_address, :selected_plan
    )";

    $stmt = $pdo->prepare($sql);

    // On hash le mot de passe du responsable s'il est fourni
    $manager_password = !empty($data['manager_password']) ?
        password_hash($data['manager_password'], PASSWORD_DEFAULT) : null;

    $stmt->execute([
        ':user_id' => $data['user_id'],
        ':business_name' => $data['business_name'],
        ':activity_type' => $data['activity_type'],
        ':description' => $data['description'] ?? null,
        ':logo' => $data['logo'] ?? null,
        ':address' => $data['address'] ?? null,
        ':city' => $data['city'] ?? null,
        ':country' => $data['country'] ?? null,
        ':business_phone' => $data['business_phone'] ?? null,
        ':business_email' => $data['business_email'] ?? null,
        ':website' => $data['website'] ?? null,
        ':social_networks' => $data['social_networks'] ?? null,
        ':rccm_number' => $data['rccm_number'] ?? null,
        ':ifu_number' => $data['ifu_number'] ?? null,
        ':legal_status' => $data['legal_status'] ?? null,
        ':identity_document' => $data['identity_document'] ?? null,
        ':existence_certificate' => $data['existence_certificate'] ?? null,
        ':manager_name' => $data['manager_name'] ?? null,
        ':manager_phone' => $data['manager_phone'] ?? null,
        ':manager_email' => $data['manager_email'] ?? null,
        ':manager_role' => $data['manager_role'] ?? null,
        ':manager_login' => $data['manager_login'] ?? null,
        ':manager_password' => $manager_password,
        ':account_holder' => $data['account_holder'] ?? null,
        ':bank_name' => $data['bank_name'] ?? null,
        ':iban' => $data['iban'] ?? null,
        ':mobile_money_number' => $data['mobile_money_number'] ?? null,
        ':currency' => $data['currency'] ?? 'USD',
        ':is_vat_applicable' => (int) ($data['is_vat_applicable'] ?? 0),
        ':vat_rate' => $data['vat_rate'] ?? 0.00,
        ':billing_address' => $data['billing_address'] ?? null,
        ':selected_plan' => $data['selected_plan'] ?? 'Gratuit'
    ]);

    // Notification for the user
    $notifStmt = $pdo->prepare("INSERT INTO notifications (user_id, type, title, content, link) VALUES (?, 'system', 'Demande de partenariat envoyée 🤝', 'Votre demande de partenariat pour \"" . ($data['business_name'] ?? '') . "\" a été enregistrée. Elle est en attente de validation.', '/profile')");
    $notifStmt->execute([$data['user_id']]);

    http_response_code(201);
    echo json_encode(["message" => "Demande de partenariat enregistrée avec succès."]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["message" => "Erreur serveur : " . $e->getMessage()]);
}
?>