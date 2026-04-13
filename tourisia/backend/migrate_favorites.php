<?php
try {
    require_once 'config/database.php';
    $pdo->exec("USE tourisia");
    $pdo->exec("CREATE TABLE IF NOT EXISTS favorites (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        offer_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY user_offer (user_id, offer_id)
    )");
    echo "Table favorites créée avec succès.";
} catch (Exception $e) {
    echo "Erreur : " . $e->getMessage();
}
?>