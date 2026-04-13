<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

try {
    require_once '../config/database.php';
    $pdo->exec("USE tourisia");

    $partnerId = isset($_GET['partner_id']) ? $_GET['partner_id'] : null;

    if (!$partnerId) {
        http_response_code(400);
        echo json_encode(["message" => "ID du partenaire manquant."]);
        exit();
    }

    $stmt = $pdo->prepare("SELECT * FROM partners WHERE id = ?");
    $stmt->execute([$partnerId]);
    $partner = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$partner) {
        http_response_code(404);
        echo json_encode(["message" => "Partenaire non trouvé."]);
        exit();
    }

    $date = date('d/m/Y');

    // Contrat Template
    $contractHtml = "
    <div style='font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: auto; padding: 40px; border: 1px solid #eee;'>
        <div style='text-align: center; margin-bottom: 40px;'>
            <h1 style='color: #2563eb; margin: 0;'>CONTRAT DE PRESTATION DE SERVICES</h1>
            <p style='color: #666;'>TOURISIA x {$partner['business_name']}</p>
        </div>

        <section style='margin-bottom: 30px;'>
            <h2 style='border-bottom: 2px solid #2563eb; padding-bottom: 5px;'>1. LES PARTIES</h2>
            <p>Le présent contrat est conclu le <strong>{$date}</strong> entre :</p>
            <p><strong>D'une part :</strong> La société <strong>TOURISIA</strong>, plateforme de réservation de voyages.</p>
            <p><strong>Et d'autre part :</strong> La société <strong>{$partner['business_name']}</strong>, située à {$partner['address']}, {$partner['city']}, {$partner['country']}, 
            représentée par M./Mme <strong>{$partner['manager_name']}</strong> en qualité de {$partner['manager_role']}.</p>
        </section>

        <section style='margin-bottom: 30px;'>
            <h2 style='border-bottom: 2px solid #2563eb; padding-bottom: 5px;'>2. OBJET DU CONTRAT</h2>
            <p>Le présent contrat a pour objet de définir les conditions dans lesquelles le Partenaire propose ses services ({$partner['activity_type']}) sur la plateforme TOURISIA.</p>
        </section>

        <section style='margin-bottom: 30px;'>
            <h2 style='border-bottom: 2px solid #2563eb; padding-bottom: 5px;'>3. ENGAGEMENTS DU PARTENAIRE</h2>
            <ul>
                <li>Fournir des informations exactes et à jour sur ses offres.</li>
                <li>Honorer les réservations effectuées via la plateforme.</li>
                <li>Maintenir un niveau de qualité de service conforme aux standards de TOURISIA.</li>
            </ul>
        </section>

        <section style='margin-bottom: 30px;'>
            <h2 style='border-bottom: 2px solid #2563eb; padding-bottom: 5px;'>4. CONDITIONS FINANCIÈRES</h2>
            <p>Le partenaire a souscrit au plan <strong>{$partner['selected_plan']}</strong>. Les commissions et frais de services sont calculés selon les modalités de ce plan.</p>
            <p>Coordonnées bancaires pour les reversements : <strong>{$partner['bank_name']} - IBAN: {$partner['iban']}</strong></p>
        </section>

        <section style='margin-top: 60px;'>
            <div style='display: flex; justify-content: space-between; align-items: flex-end;'>
                <div style='width: 45%; text-align: center;'>
                    <div style='height: 80px; display: flex; align-items: center; justify-content: center; margin-bottom: 10px;'>
                        <img src='http://localhost:8000/backend/uploads/signatures/tourisia_default.png' style='max-height: 80px; max-width: 150px;' alt='Tourisia Signature'>
                    </div>
                    <div style='border-top: 1px solid #000; padding-top: 10px;'>
                        <p style='margin: 0; font-weight: bold;'>Signature TOURISIA</p>
                        <p style='font-size: 10px; color: #999; margin: 0;'>(Cachet et Signature)</p>
                    </div>
                </div>
                <div style='width: 45%; text-align: center;'>
                    <div style='height: 80px; display: flex; align-items: center; justify-content: center; margin-bottom: 10px;'>
                        " . ($partner['signature'] ? "<img src='http://localhost:8000/backend/{$partner['signature']}' style='max-height: 80px; max-width: 150px;' alt='Partner Signature'>" : "<div style='height: 80px;'></div>") . "
                    </div>
                    <div style='border-top: 1px solid #000; padding-top: 10px;'>
                        <p style='margin: 0; font-weight: bold;'>Signature Partenaire</p>
                        <p style='font-size: 10px; color: #999; margin: 0;'>(Cachet et Signature)</p>
                    </div>
                </div>
            </div>
        </section>
        
        <div style='margin-top: 40px; text-align: center; font-size: 10px; color: #999;'>
            Document généré automatiquement le {$date} - ID Contrat: TR-{$partner['id']}-" . time() . "
        </div>
    </div>
    ";

    echo json_encode([
        "partner" => $partner,
        "contract_html" => $contractHtml
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["message" => "Erreur serveur : " . $e->getMessage()]);
}
?>