-- ═══════════════════════════════════════════════
--  TOURISIA – Tables Vols
--  Exécuter dans la base de données tourisia
-- ═══════════════════════════════════════════════

USE tourisia;

-- ─────────────────────────────────────────────
--  Table flights
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS flights (
  id                  INT AUTO_INCREMENT PRIMARY KEY,
  compagnie           VARCHAR(100)    NOT NULL,
  logo                VARCHAR(255)    DEFAULT NULL,
  depart_iata         VARCHAR(10)     NOT NULL,
  depart_ville        VARCHAR(100)    NOT NULL,
  arrivee_iata        VARCHAR(10)     NOT NULL,
  arrivee_ville       VARCHAR(100)    NOT NULL,
  date_depart         DATETIME        NOT NULL,
  date_arrivee        DATETIME        NOT NULL,
  heure_depart        VARCHAR(10)     NOT NULL,
  heure_arrivee       VARCHAR(10)     NOT NULL,
  duree               VARCHAR(20)     NOT NULL,
  escales             INT             DEFAULT 0,
  classe              VARCHAR(50)     DEFAULT 'Économique',
  prix                DECIMAL(12,2)   NOT NULL,
  devise              VARCHAR(10)     DEFAULT 'CFA',
  places_total        INT             NOT NULL DEFAULT 100,
  places_disponibles  INT             NOT NULL DEFAULT 100,
  partenaire_id       INT             DEFAULT NULL,
  created_at          TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_depart (depart_iata),
  INDEX idx_arrivee (arrivee_iata),
  INDEX idx_date (date_depart)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─────────────────────────────────────────────
--  Table flight_reservations
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS flight_reservations (
  id                INT AUTO_INCREMENT PRIMARY KEY,
  flight_id         INT             NOT NULL,
  user_id           INT             NOT NULL,
  nombre_passagers  INT             DEFAULT 1,
  classe            VARCHAR(50)     DEFAULT 'Économique',
  prix_total        DECIMAL(12,2)   NOT NULL,
  devise            VARCHAR(10)     DEFAULT 'CFA',
  statut            VARCHAR(20)     DEFAULT 'confirmée',
  created_at        TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (flight_id) REFERENCES flights(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id)   REFERENCES users(id)   ON DELETE CASCADE,
  INDEX idx_user (user_id),
  INDEX idx_flight (flight_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─────────────────────────────────────────────
--  Table airports
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS airports (
  id    INT AUTO_INCREMENT PRIMARY KEY,
  iata  VARCHAR(10)  UNIQUE NOT NULL,
  nom   VARCHAR(200) NOT NULL,
  ville VARCHAR(100) NOT NULL,
  pays  VARCHAR(100) NOT NULL,
  INDEX idx_iata (iata),
  INDEX idx_ville (ville)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─────────────────────────────────────────────
--  Aéroports Afrique + Europe
-- ─────────────────────────────────────────────
INSERT IGNORE INTO airports (iata, nom, ville, pays) VALUES
-- Afrique de l'Ouest
('COO', 'Aéroport International Cadjehoun',    'Cotonou',      'Bénin'),
('LOS', 'Aéroport International Murtala Muhammed', 'Lagos',   'Nigeria'),
('ABJ', 'Aéroport International Félix Houphouët-Boigny', 'Abidjan', 'Côte d\'Ivoire'),
('DKR', 'Aéroport International Blaise Diagne', 'Dakar',      'Sénégal'),
('ACC', 'Aéroport International Kotoka',        'Accra',       'Ghana'),
('OUA', 'Aéroport International de Ouagadougou','Ouagadougou', 'Burkina Faso'),
('BKO', 'Aéroport International Modibo Keita', 'Bamako',       'Mali'),
('LFW', 'Aéroport International Gnassingbé Eyadema', 'Lomé',  'Togo'),
('COT', 'Aéroport de Niamey',                  'Niamey',       'Niger'),
-- Afrique de l'Est & Sud
('NBO', 'Aéroport International Jomo Kenyatta', 'Nairobi',     'Kenya'),
('ADD', 'Aéroport International Bole',          'Addis-Abeba',  'Éthiopie'),
('JNB', 'Aéroport International OR Tambo',      'Johannesburg', 'Afrique du Sud'),
('CAI', 'Aéroport International du Caire',      'Le Caire',     'Égypte'),
('CMN', 'Aéroport Mohammed V',                  'Casablanca',   'Maroc'),
('TUN', 'Aéroport International Tunis-Carthage','Tunis',        'Tunisie'),
-- Europe
('CDG', 'Aéroport Charles de Gaulle',           'Paris',        'France'),
('ORY', 'Aéroport d\'Orly',                     'Paris',        'France'),
('LHR', 'Aéroport de Heathrow',                 'Londres',      'Royaume-Uni'),
('FRA', 'Aéroport de Francfort',                'Francfort',    'Allemagne'),
('AMS', 'Aéroport d\'Amsterdam Schiphol',        'Amsterdam',   'Pays-Bas'),
('BRU', 'Aéroport de Bruxelles-National',        'Bruxelles',   'Belgique'),
('MAD', 'Aéroport Adolfo Suárez Madrid-Barajas', 'Madrid',      'Espagne'),
('FCO', 'Aéroport Leonardo da Vinci (Fiumicino)','Rome',        'Italie'),
-- Moyen-Orient & Asie
('DXB', 'Aéroport International de Dubaï',       'Dubaï',       'Émirats arabes unis'),
('DOH', 'Aéroport International Hamad',          'Doha',        'Qatar'),
('IST', 'Aéroport Istanbul',                     'Istanbul',    'Turquie');

-- ─────────────────────────────────────────────
--  Vols de démonstration
-- ─────────────────────────────────────────────
INSERT IGNORE INTO flights
  (compagnie, depart_iata, depart_ville, arrivee_iata, arrivee_ville,
   date_depart, date_arrivee, heure_depart, heure_arrivee, duree,
   escales, classe, prix, devise, places_total, places_disponibles)
VALUES
('Air France',   'CDG', 'Paris',   'COO', 'Cotonou',  '2026-07-01 10:00:00', '2026-07-01 18:30:00', '10h00', '18h30', '8h30',  1, 'Économique', 245000, 'CFA', 180, 45),
('Air France',   'CDG', 'Paris',   'COO', 'Cotonou',  '2026-07-01 10:00:00', '2026-07-01 18:30:00', '10h00', '18h30', '8h30',  1, 'Affaires',   620000, 'CFA', 40,  12),
('Ethiopian',    'ADD', 'Addis-Abeba', 'COO', 'Cotonou', '2026-07-02 06:00:00', '2026-07-02 14:00:00', '06h00', '14h00', '8h00', 1, 'Économique', 180000, 'CFA', 200, 78),
('Royal Air Maroc','CMN','Casablanca','COO','Cotonou',  '2026-07-03 07:30:00', '2026-07-03 13:45:00', '07h30', '13h45', '6h15',  1, 'Économique', 155000, 'CFA', 160, 34),
('Turkish Airlines','IST','Istanbul', 'COO','Cotonou', '2026-07-04 02:00:00', '2026-07-04 13:00:00', '02h00', '13h00', '11h00', 1, 'Économique', 195000, 'CFA', 220, 90),
('ASKY Airlines','LOS','Lagos',   'COO','Cotonou',     '2026-07-05 08:00:00', '2026-07-05 09:10:00', '08h00', '09h10', '1h10',  0, 'Économique',  35000, 'CFA', 80,  22),
('Emirates',     'DXB','Dubaï',   'LOS','Lagos',       '2026-07-06 14:00:00', '2026-07-06 20:30:00', '14h00', '20h30', '6h30',  0, 'Économique', 310000, 'CFA', 300, 145),
('Emirates',     'DXB','Dubaï',   'LOS','Lagos',       '2026-07-06 14:00:00', '2026-07-06 20h30',    '14h00', '20h30', '6h30',  0, 'Première',   980000, 'CFA', 10,  4);
