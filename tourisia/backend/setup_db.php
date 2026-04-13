<?php
require_once 'config/database.php';

try {
    // Création de la base de données si elle n'existe pas
    $pdo->exec("CREATE DATABASE IF NOT EXISTS tourisia CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
    $pdo->exec("USE tourisia");

    // Création de la table users (on la supprime d'abord pour être sûr d'avoir la bonne structure)
    $pdo->exec("SET FOREIGN_KEY_CHECKS = 0");
    $pdo->exec("DROP TABLE IF EXISTS users");

    $sql = "CREATE TABLE users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        fullname VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        phone VARCHAR(20) DEFAULT NULL,
        location VARCHAR(100) DEFAULT NULL,
        bio TEXT DEFAULT NULL,
        avatar VARCHAR(255) DEFAULT NULL,
        cover_image VARCHAR(255) DEFAULT NULL,
        trips_count INT DEFAULT 0,
        countries_count INT DEFAULT 0,
        wishlist_count INT DEFAULT 0,
        reviews_count INT DEFAULT 0,
        oauth_provider VARCHAR(50) DEFAULT 'email',
        oauth_id VARCHAR(255) DEFAULT NULL UNIQUE,
        role ENUM('user', 'admin') DEFAULT 'user',
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB";

    $pdo->exec($sql);

    // Création de la table partners
    $pdo->exec("DROP TABLE IF EXISTS partners");

    $sql_partners = "CREATE TABLE partners (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        
        -- Etape 1 : Profil entreprise
        business_name VARCHAR(255) NOT NULL,
        activity_type VARCHAR(100) NOT NULL,
        description TEXT,
        logo VARCHAR(255),
        address TEXT,
        city VARCHAR(100),
        country VARCHAR(100),
        business_phone VARCHAR(20),
        business_email VARCHAR(255),
        website VARCHAR(255),
        social_networks TEXT,
        
        -- Etape 2 : Informations légales
        rccm_number VARCHAR(100),
        ifu_number VARCHAR(100),
        legal_status VARCHAR(100),
        identity_document VARCHAR(255),
        existence_certificate VARCHAR(255),
        
        -- Etape 3 : Responsable du compte
        manager_name VARCHAR(255),
        manager_phone VARCHAR(20),
        manager_email VARCHAR(255),
        manager_role VARCHAR(100),
        manager_login VARCHAR(100),
        manager_password VARCHAR(255),
        
        -- Etape 4 : Informations financières
        account_holder VARCHAR(255),
        bank_name VARCHAR(255),
        iban VARCHAR(100),
        mobile_money_number VARCHAR(20),
        currency VARCHAR(10),
        is_vat_applicable BOOLEAN DEFAULT FALSE,
        vat_rate DECIMAL(5,2) DEFAULT 0.00,
        billing_address TEXT,
        
        -- Plan choisi
        selected_plan VARCHAR(50) DEFAULT 'Débutant',
        
        -- Statut de validation
        validation INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB";

    $pdo->exec($sql_partners);
    $pdo->exec("SET FOREIGN_KEY_CHECKS = 1");
    echo "Base de données et tables 'users' et 'partners' créées avec succès !";

} catch (PDOException $e) {
    die("Erreur lors de la configuration : " . $e->getMessage());
}
?>