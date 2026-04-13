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

    // Récupérer les infos du partenaire
    $stmt = $pdo->prepare("SELECT p.*, u.fullname as user_name FROM partners p JOIN users u ON p.user_id = u.id WHERE p.id = ?");
    $stmt->execute([$partnerId]);
    $partner = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$partner) {
        http_response_code(404);
        echo json_encode(["message" => "Partenaire non trouvé."]);
        exit();
    }

    // Récupérer les offres du partenaire
    $stmt = $pdo->prepare("SELECT * FROM offers WHERE partner_id = ? ORDER BY created_at DESC");
    $stmt->execute([$partnerId]);
    $offers = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Décoder les images et détails JSON pour chaque offre
    foreach ($offers as &$offer) {
        $offer['images'] = json_decode($offer['images'], true) ?: [];
        $offer['details'] = json_decode($offer['details'], true) ?: [];
    }

    // Calculer les statistiques réelles
    // Note: Pour l'instant on se base sur les offres, les réservations et revenus viendront plus tard avec les tables correspondantes
    $stats = [
        "total_views" => 0, // À implémenter avec une table de tracking
        "total_bookings" => 0, // À implémenter avec la table bookings
        "revenue" => "0 CFA", // À implémenter avec les paiements
        "active_offers" => count($offers)
    ];

    // Construire le journal d'activités à partir des offres
    $recent_actions = [];
    foreach (array_slice($offers, 0, 5) as $off) {
        $recent_actions[] = [
            "date" => $off['created_at'],
            "action" => "Nouvelle offre",
            "details" => "Publication de l'offre : " . $off['title']
        ];
    }

    // Ajouter l'action de création du profil si possible
    $recent_actions[] = [
        "date" => $partner['created_at'],
        "action" => "Création du compte",
        "details" => "Le partenaire a rejoint la plateforme"
    ];

    // Trier les actions par date décroissante
    usort($recent_actions, function ($a, $b) {
        return strtotime($b['date']) - strtotime($a['date']);
    });

    echo json_encode([
        "partner" => $partner,
        "activities" => [
            "stats" => $stats,
            "recent_actions" => array_slice($recent_actions, 0, 10),
            "offers" => $offers
        ]
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["message" => "Erreur serveur : " . $e->getMessage()]);
}
?>