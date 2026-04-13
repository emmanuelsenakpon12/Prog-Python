<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Liste statique de villes béninoises et africaines connues
$staticCities = [
    // Bénin
    "Cotonou", "Porto-Novo", "Parakou", "Abomey-Calavi", "Natitingou",
    "Kandi", "Ouidah", "Abomey", "Lokossa", "Bohicon",
    "Djougou", "Tchaourou", "Pobè", "Savè", "Malanville",
    "Nikki", "Dassa-Zoumè", "Gogounou", "Bembèrèkè", "Tanguiéta",
    "Aplahoué", "Comè", "Grand-Popo", "Allada", "Ketou",
    "Sakété", "Sèmè-Kpodji", "Ve d'Or", "Bopa",

    // Destinations touristiques du Bénin
    "Pendjari (Tanguiéta)", "Ganvié", "La Route des Esclaves", "Palais Royaux d'Abomey",
    "Temple des Pythons (Ouidah)", "Porte du Non-Retour",

    // Afrique de l'Ouest
    "Lomé", "Accra", "Lagos", "Abuja", "Dakar",
    "Abidjan", "Bamako", "Ouagadougou", "Niamey", "Conakry",
    "Nouakchott", "Banjul", "Bissau", "Freetown", "Monrovia",
    "Yamoussoukro", "Kumasi", "Tema",

    // Villes populaires (international)
    "Paris", "Marseille", "Lyon", "Bordeaux",
    "Bruxelles", "Genève", "Montréal", "Casablanca", "Tunis"
];

$query = isset($_GET['q']) ? trim($_GET['q']) : '';

// Filtrer les villes depuis la DB (villes des offres existantes)
$dbCities = [];
try {
    require_once '../config/database.php';
    $pdo->exec("USE tourisia");

    $stmt = $pdo->prepare("
        SELECT DISTINCT location 
        FROM offers 
        WHERE location IS NOT NULL AND location != '' AND location LIKE ?
        ORDER BY location ASC
        LIMIT 20
    ");
    $stmt->execute([$query . '%']);
    $rows = $stmt->fetchAll(PDO::FETCH_COLUMN);
    $dbCities = $rows ?? [];
} catch (Exception $e) {
    // En cas d'erreur DB, on continue avec les villes statiques uniquement
    $dbCities = [];
}

// Filtrer les villes statiques selon la requête
if ($query !== '') {
    $filtered = array_filter($staticCities, function($city) use ($query) {
        return stripos($city, $query) === 0; // Commence par le texte tapé
    });
} else {
    $filtered = [];
}

// Fusionner les résultats DB + statiques, sans doublons
$merged = array_values(array_unique(array_merge($dbCities, array_values($filtered))));

// Limiter à 8 suggestions
$result = array_slice($merged, 0, 8);

echo json_encode($result);
?>
