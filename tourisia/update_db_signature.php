<?php
try {
    require_once 'backend/config/database.php';
    $pdo->exec("USE tourisia");
    $pdo->exec("ALTER TABLE partners ADD COLUMN IF NOT EXISTS signature VARCHAR(255) DEFAULT NULL AFTER logo");
    echo "Database updated successfully\n";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>