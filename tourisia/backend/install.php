<?php
/**
 * TOURISIA — Script d'installation complète de la base de données
 * Exécute ce fichier UNE SEULE FOIS via : http://localhost/tourisia/install.php
 */

header("Content-Type: text/html; charset=UTF-8");

require_once 'config/database.php';

$results = [];
$hasError = false;

function runStep(PDO $pdo, string $label, callable $fn) {
    global $results, $hasError;
    try {
        $fn($pdo);
        $results[] = ['ok' => true, 'label' => $label];
    } catch (PDOException $e) {
        $results[] = ['ok' => false, 'label' => $label, 'error' => $e->getMessage()];
        $hasError = true;
    }
}

// ─── 1. Création de la base de données ────────────────────────────────────────
runStep($pdo, "Création de la base de données <strong>tourisia</strong>", function($pdo) {
    $pdo->exec("CREATE DATABASE IF NOT EXISTS tourisia CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
    $pdo->exec("USE tourisia");
    $pdo->exec("SET FOREIGN_KEY_CHECKS = 0");
});

$pdo->exec("USE tourisia");
$pdo->exec("SET FOREIGN_KEY_CHECKS = 0");

// ─── 2. Table users ───────────────────────────────────────────────────────────
runStep($pdo, "Table <code>users</code>", function($pdo) {
    $pdo->exec("CREATE TABLE IF NOT EXISTS users (
        id            INT AUTO_INCREMENT PRIMARY KEY,
        fullname      VARCHAR(255) NOT NULL,
        email         VARCHAR(255) NOT NULL UNIQUE,
        password      VARCHAR(255) NOT NULL,
        phone         VARCHAR(20)  DEFAULT NULL,
        location      VARCHAR(100) DEFAULT NULL,
        bio           TEXT         DEFAULT NULL,
        avatar        VARCHAR(255) DEFAULT NULL,
        cover_image   VARCHAR(255) DEFAULT NULL,
        trips_count   INT          DEFAULT 0,
        countries_count INT        DEFAULT 0,
        wishlist_count  INT        DEFAULT 0,
        reviews_count   INT        DEFAULT 0,
        oauth_provider  VARCHAR(50)  DEFAULT 'email',
        oauth_id        VARCHAR(255) DEFAULT NULL UNIQUE,
        role            ENUM('user','admin') DEFAULT 'user',
        is_active       BOOLEAN      DEFAULT TRUE,
        created_at      TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");
});

// ─── 3. Table partners ────────────────────────────────────────────────────────
runStep($pdo, "Table <code>partners</code>", function($pdo) {
    $pdo->exec("CREATE TABLE IF NOT EXISTS partners (
        id                  INT AUTO_INCREMENT PRIMARY KEY,
        user_id             INT NOT NULL,
        business_name       VARCHAR(255) NOT NULL,
        activity_type       VARCHAR(100) NOT NULL,
        description         TEXT,
        logo                VARCHAR(255),
        address             TEXT,
        city                VARCHAR(100),
        country             VARCHAR(100),
        business_phone      VARCHAR(20),
        business_email      VARCHAR(255),
        website             VARCHAR(255),
        social_networks     TEXT,
        rccm_number         VARCHAR(100),
        ifu_number          VARCHAR(100),
        legal_status        VARCHAR(100),
        identity_document   VARCHAR(255),
        existence_certificate VARCHAR(255),
        manager_name        VARCHAR(255),
        manager_phone       VARCHAR(20),
        manager_email       VARCHAR(255),
        manager_role        VARCHAR(100),
        manager_login       VARCHAR(100),
        manager_password    VARCHAR(255),
        account_holder      VARCHAR(255),
        bank_name           VARCHAR(255),
        iban                VARCHAR(100),
        mobile_money_number VARCHAR(20),
        currency            VARCHAR(10),
        is_vat_applicable   BOOLEAN      DEFAULT FALSE,
        vat_rate            DECIMAL(5,2) DEFAULT 0.00,
        billing_address     TEXT,
        selected_plan       VARCHAR(50)  DEFAULT 'Débutant',
        validation          INT          DEFAULT 0,
        created_at          TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");
});

// ─── 4. Table offers ──────────────────────────────────────────────────────────
runStep($pdo, "Table <code>offers</code>", function($pdo) {
    $pdo->exec("CREATE TABLE IF NOT EXISTS offers (
        id          INT AUTO_INCREMENT PRIMARY KEY,
        partner_id  INT NOT NULL,
        title       VARCHAR(255) NOT NULL,
        type        VARCHAR(100),
        location    VARCHAR(255),
        price       DECIMAL(10,2) DEFAULT 0.00,
        description TEXT,
        images      JSON,
        video       VARCHAR(255),
        details     JSON,
        created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (partner_id) REFERENCES partners(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");
});

// ─── 5. Table reservations ────────────────────────────────────────────────────
runStep($pdo, "Table <code>reservations</code>", function($pdo) {
    $pdo->exec("CREATE TABLE IF NOT EXISTS reservations (
        id         INT AUTO_INCREMENT PRIMARY KEY,
        user_id    INT NOT NULL,
        offer_id   INT NOT NULL,
        status     ENUM('pending','confirmed','cancelled') DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id)  REFERENCES users(id)  ON DELETE CASCADE,
        FOREIGN KEY (offer_id) REFERENCES offers(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");
});

// ─── 6. Table favorites ───────────────────────────────────────────────────────
runStep($pdo, "Table <code>favorites</code>", function($pdo) {
    $pdo->exec("CREATE TABLE IF NOT EXISTS favorites (
        id         INT AUTO_INCREMENT PRIMARY KEY,
        user_id    INT NOT NULL,
        offer_id   INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY user_offer (user_id, offer_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");
});

// ─── 7. Table messages ────────────────────────────────────────────────────────
runStep($pdo, "Table <code>messages</code>", function($pdo) {
    $pdo->exec("CREATE TABLE IF NOT EXISTS messages (
        id          INT AUTO_INCREMENT PRIMARY KEY,
        user_id     INT NOT NULL,
        partner_id  INT NOT NULL,
        sender_type ENUM('user','partner') NOT NULL,
        content     TEXT NOT NULL,
        is_read     TINYINT(1) DEFAULT 0,
        created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id)    REFERENCES users(id)    ON DELETE CASCADE,
        FOREIGN KEY (partner_id) REFERENCES partners(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");
});

// ─── 8. Table notifications ───────────────────────────────────────────────────
runStep($pdo, "Table <code>notifications</code>", function($pdo) {
    $pdo->exec("CREATE TABLE IF NOT EXISTS notifications (
        id         INT AUTO_INCREMENT PRIMARY KEY,
        user_id    INT NOT NULL,
        type       VARCHAR(50)  NOT NULL DEFAULT 'system',
        title      VARCHAR(255) NOT NULL,
        content    TEXT,
        link       VARCHAR(255) DEFAULT NULL,
        is_read    TINYINT(1)   DEFAULT 0,
        created_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_user_read    (user_id, is_read),
        INDEX idx_user_created (user_id, created_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");
});

// ─── 9. Table itineraries ─────────────────────────────────────────────────────
runStep($pdo, "Table <code>itineraries</code>", function($pdo) {
    $pdo->exec("CREATE TABLE IF NOT EXISTS itineraries (
        id          INT AUTO_INCREMENT PRIMARY KEY,
        user_id     INT NOT NULL,
        title       VARCHAR(255) NOT NULL,
        description TEXT,
        created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");
});

// ─── 10. Table itinerary_items ────────────────────────────────────────────────
runStep($pdo, "Table <code>itinerary_items</code>", function($pdo) {
    $pdo->exec("CREATE TABLE IF NOT EXISTS itinerary_items (
        id             INT AUTO_INCREMENT PRIMARY KEY,
        itinerary_id   INT NOT NULL,
        offer_id       INT NOT NULL,
        item_order     INT DEFAULT 0,
        added_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (itinerary_id) REFERENCES itineraries(id) ON DELETE CASCADE,
        FOREIGN KEY (offer_id)     REFERENCES offers(id)      ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");
});

// ─── Fin : réactiver les FK ───────────────────────────────────────────────────
$pdo->exec("SET FOREIGN_KEY_CHECKS = 1");

?>
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Tourisia — Installation BD</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: system-ui, sans-serif; background: #0f172a; color: #e2e8f0; min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 2rem; }
    .card { background: #1e293b; border-radius: 16px; padding: 2rem; max-width: 640px; width: 100%; box-shadow: 0 25px 50px rgba(0,0,0,.4); }
    h1 { font-size: 1.5rem; font-weight: 700; margin-bottom: 0.5rem; }
    .subtitle { color: #94a3b8; margin-bottom: 1.5rem; font-size: .9rem; }
    .step { display: flex; align-items: flex-start; gap: .75rem; padding: .6rem .75rem; border-radius: 8px; margin-bottom: .5rem; }
    .step.ok { background: #052e16; }
    .step.err { background: #450a0a; }
    .icon { font-size: 1rem; flex-shrink: 0; margin-top: 2px; }
    .label { font-size: .875rem; }
    .error-msg { font-size: .75rem; color: #fca5a5; margin-top: .25rem; }
    code { background: #0f172a; padding: 1px 5px; border-radius: 4px; font-size: .85em; }
    .result-banner { margin-top: 1.5rem; padding: 1rem 1.25rem; border-radius: 10px; font-weight: 600; font-size: .95rem; }
    .result-banner.success { background: #14532d; color: #4ade80; }
    .result-banner.fail    { background: #450a0a; color: #f87171; }
    .next-steps { margin-top: 1.25rem; background: #0f172a; border-radius: 10px; padding: 1rem 1.25rem; }
    .next-steps h2 { font-size: .875rem; color: #94a3b8; margin-bottom: .5rem; text-transform: uppercase; letter-spacing: .05em; }
    .next-steps a { color: #60a5fa; text-decoration: none; display: block; margin-bottom: .4rem; font-size: .875rem; }
    .next-steps a:hover { text-decoration: underline; }
  </style>
</head>
<body>
<div class="card">
  <h1>🗄️ Tourisia — Installation de la BD</h1>
  <p class="subtitle">Création de toutes les tables de la base de données <strong>tourisia</strong></p>

  <?php foreach ($results as $r): ?>
    <div class="step <?= $r['ok'] ? 'ok' : 'err' ?>">
      <span class="icon"><?= $r['ok'] ? '✅' : '❌' ?></span>
      <div>
        <div class="label"><?= $r['label'] ?></div>
        <?php if (!$r['ok']): ?>
          <div class="error-msg"><?= htmlspecialchars($r['error']) ?></div>
        <?php endif; ?>
      </div>
    </div>
  <?php endforeach; ?>

  <div class="result-banner <?= $hasError ? 'fail' : 'success' ?>">
    <?= $hasError
      ? '⚠️ Installation terminée avec des erreurs. Vérifie que MySQL est bien démarré dans XAMPP.'
      : '🎉 Installation réussie ! Toutes les tables ont été créées.' ?>
  </div>

  <?php if (!$hasError): ?>
  <div class="next-steps">
    <h2>🚀 Étapes suivantes</h2>
    <a href="http://localhost:3000">→ Ouvrir l'application Tourisia</a>
    <a href="http://localhost/phpmyadmin/index.php?db=tourisia">→ Voir la base de données dans phpMyAdmin</a>
  </div>
  <?php endif; ?>
</div>
</body>
</html>
