# 🌍 Tourisia — Plateforme de Réservation Touristique

> Tourisia est une plateforme web full-stack permettant aux voyageurs de découvrir et réserver des offres touristiques, et aux prestataires de proposer et gérer leurs services.

---

## 📖 Présentation

### Description

Tourisia est une application web de mise en relation entre voyageurs et prestataires touristiques. Les utilisateurs peuvent parcourir des offres (hôtels, circuits, activités), effectuer des réservations, créer des carnets de voyage personnalisés et échanger directement avec les partenaires. Les prestataires, quant à eux, disposent d'un espace dédié pour publier et gérer leurs offres, soumettre leurs documents légaux et signer un contrat de partenariat numérique.

### Problème résolu

Trouver et réserver des activités touristiques locales reste fragmenté et peu digitalisé dans de nombreux marchés émergents notamment en Afrique. Tourisia centralise l'offre touristique sur une seule plateforme, simplifie la mise en relation entre voyageurs et prestataires, et automatise les étapes administratives (contrats, validations, notifications).

### Public cible

- **Voyageurs** souhaitant découvrir et réserver des activités ou hébergements en ligne.
- **Prestataires touristiques** (agences, hôtels, guides) cherchant à digitaliser leur offre.
- **Administrateurs** gérant les partenaires, utilisateurs et statistiques de la plateforme.

---

##  Fonctionnalités

### Fonctionnalités principales

- **Authentification** : inscription/connexion par email+mot de passe ou via Google OAuth (JWT-less, session côté client)
- **Catalogue d'offres** : affichage, filtrage et recherche d'offres avec images et vidéos
- **Réservations** : réservation d'offres avec suivi dans le profil utilisateur
- **Favoris** : ajout/retrait d'offres en liste de souhaits
- **Carnets de voyage** : création d'itinéraires personnalisés avec ajout d'étapes
- **Messagerie** : système de conversations entre utilisateurs et partenaires
- **Notifications** : alertes temps réel (réservations, messages, itinéraires)
- **Espace partenaire** : inscription en 4 étapes (profil entreprise, légal, responsable, financier), upload de documents, gestion des offres
- **Génération de contrat** : contrat PDF dynamique signé entre Tourisia et le partenaire
- **Panel administrateur** : gestion des utilisateurs, validation des partenaires, statistiques globales
- **Assistant IA** : intégration de l'API Google Gemini pour les suggestions de voyage

### Améliorations et bonus

- Connexion via Google OAuth (sans mot de passe)
- Email de bienvenue automatique à l'inscription (PHPMailer)
- Upload de médias (images et vidéos) pour les offres
- Contrat de partenariat généré dynamiquement en HTML/PDF
- Support multi-devises pour les offres
- Statistiques admin en temps réel (nombre d'utilisateurs, partenaires, offres)
- Variables d'environnement pour la configuration de la base de données (`DB_HOST`, `DB_USER`, etc.)

---

##  Prérequis

- **PHP** 8.1 ou supérieur (avec extensions : `pdo_mysql`, `curl`, `json`, `mbstring`)
- **MySQL** 8.0 ou supérieur
- **Composer** (gestionnaire de dépendances PHP)
- **Serveur web local** : XAMPP, Laragon, ou PHP built-in server
- **Clé API Google Gemini** (pour l'assistant IA)
- **Google Client ID** (pour l'authentification OAuth)

---

##  Installation

### 1. Cloner le dépôt

```bash
git clone https://github.com/emmanuelsenakpon12/Prog-Python.git
cd tourisia
```

### 2. Installer les dépendances PHP

```bash
cd backend
composer install
```

### 3. Configurer la base de données

Créer un fichier `backend/config/ai_config.php` :

```php
<?php
return [
    'api_key' => 'VOTRE_CLE_API_GEMINI'
];
```

Variables d'environnement supportées (optionnel) :

| Variable   | Valeur par défaut |
|------------|-------------------|
| `DB_HOST`  | `localhost`       |
| `DB_NAME`  | `tourisia`        |
| `DB_USER`  | `root`            |
| `DB_PASS`  | _(vide)_          |

### 4. Initialiser la base de données

Démarrer votre serveur MySQL, puis accéder à :

```
http://localhost:8000/backend/setup_db.php
```

Ce script crée automatiquement la base de données `tourisia` et toutes les tables nécessaires.

Ensuite, initialiser les tables supplémentaires :

```
http://localhost:8000/backend/itineraries/setup_tables.php
http://localhost:8000/backend/notifications/setup_notifications.php
```

---

##  Lancement

### Option A — PHP built-in server

```bash
# Depuis la racine du projet
php -S localhost:8000
```

Accéder à l'application : [http://localhost:8000](http://localhost:8000)

### Option B — XAMPP / Laragon

Placer le dossier `tourisia/` dans le répertoire `htdocs/` (XAMPP) ou `www/` (Laragon), puis démarrer Apache et MySQL depuis le panneau de contrôle.

Accéder à : [http://localhost/tourisia](http://localhost/tourisia)

---

##  Tests

Les scénarios de test peuvent être exécutés manuellement via les endpoints API suivants :

### Tester l'authentification

```bash
# Inscription
curl -X POST http://localhost:8000/backend/auth/register.php \
  -H "Content-Type: application/json" \
  -d '{"fullname":"Test User","email":"test@test.com","password":"password123"}'

# Connexion
curl -X POST http://localhost:8000/backend/auth/login.php \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"password123"}'
```

### Tester les offres

```bash
# Récupérer toutes les offres
curl http://localhost:8000/backend/offers/get_offers.php

# Récupérer les offres d'un partenaire
curl http://localhost:8000/backend/offers/get_offers.php?partner_id=1
```

### Tester l'IA (Gemini)

```bash
# Lister les modèles disponibles
curl http://localhost:8000/backend/ai/test_models.php
```

---

##  Structure du projet


```
tourisia/
├── app/
│   ├── page.tsx                       # Page d'accueil
│   ├── offres/
│   │   ├── page.tsx                   # Liste des offres
│   │   └── [id]/page.tsx              # Détail + réservation
│   ├── vols/page.tsx                  # Recherche de vols
│   ├── transport/page.tsx             # Location et transport
│   ├── circuits/page.tsx              # Carte interactive Bénin
│   ├── espace_partenaire/page.tsx     # Dashboard partenaire
│   ├── profile/page.tsx               # Profil utilisateur
│   ├── mes-reservations/page.tsx      # Historique réservations
│   └── register/page.tsx              # Création de compte
├── components/
│   ├── navbar.tsx                     # Navbar double ligne
│   ├── OfferCard.tsx                  # Carte offre avec galerie
│   ├── CircuitsMap.tsx                # Carte Leaflet
│   ├── FlightSearchBar.tsx            # Recherche vols
│   ├── TransportSearchBar.tsx         # Recherche transport
│   └── forms/
│       ├── HebergementForm.tsx
│       ├── TransportForm.tsx
│       ├── ActiviteForm.tsx
│       └── VolForm.tsx
├── backend/
│   ├── config.php
│   ├── offers/
│   │   ├── get_offers.php
│   │   ├── add_offer.php
│   │   ├── add_reservation.php
│   │   └── cancel_reservation.php
│   ├── partners/
│   │   ├── partner_login.php
│   │   ├── get_notifications.php
│   │   └── mark_read.php
│   └── flights/
│       ├── get_flights.php
│       ├── add_flight.php
│       └── book_flight.php
├── database/
│   └── tourisia.sql
├── lib/
│   └── config.ts                      # URL API centralisée
└── next.config.js                     # Proxy API
```

---

##  Exemples d'utilisation
### Scénarios de test manuels

**Inscription et connexion utilisateur**

Aller sur `/register`, remplir le formulaire avec un email valide et un mot de passe. Après soumission, l'utilisateur est redirigé automatiquement. Se déconnecter puis se reconnecter depuis la navbar pour vérifier que la session fonctionne.

**Devenir partenaire**

Depuis la navbar, cliquer sur "Devenir Partenaire". Si non connecté, l'application redirige vers la page d'inscription. Après création de compte, le formulaire de candidature partenaire est accessible. Une fois validé, le bouton "Devenir Partenaire" se transforme en "Espace Partenaire".

**Réservation d'une offre**

Cliquer sur une offre depuis la page d'accueil. Le widget de réservation apparaît directement. Sélectionner une date d'arrivée et une date de départ dans le calendrier. Le nombre de nuits et le prix total se calculent automatiquement. La politique d'annulation et la date limite sont affichées. Cliquer sur Confirmer.

**Tentative d'annulation hors délai**

Dans "Mes Réservations", si une réservation a une date d'arrivée dans moins de 72 heures, le bouton Annuler doit être désactivé et afficher un message explicatif.

**Publication d'une offre partenaire**

Dans l'espace partenaire, cliquer sur "Nouvelle Publication". Choisir le type de service. Vérifier que le formulaire affiché correspond bien au type choisi : un formulaire hébergement ne doit pas avoir les mêmes champs qu'un formulaire vol.

---
### Créer un carnet de voyage

```bash
curl -X POST http://localhost:8000/backend/itineraries/itinerary_manager.php \
  -H "Content-Type: application/json" \
  -d '{"user_id":1,"title":"Road Trip Côte Ouest","description":"Mon voyage de 2 semaines"}'
```

### Ajouter une offre en favori

```bash
curl -X POST http://localhost:8000/backend/offers/toggle_favorite.php \
  -H "Content-Type: application/json" \
  -d '{"user_id":1,"offer_id":5}'
```

### Envoyer un message

```bash
curl -X POST http://localhost:8000/backend/messages/send_message.php \
  -H "Content-Type: application/json" \
  -d '{"sender_id":1,"receiver_id":2,"content":"Bonjour, est-ce disponible ?"}'
```

---

##  Limites et pistes d'amélioration

### Limites actuelles

- Pas de système de paiement en ligne intégré — les réservations ne sont pas liées à une transaction réelle.
- L'authentification ne repose pas sur des tokens JWT ; les sessions sont gérées côté client (localStorage), ce qui est moins sécurisé.
- L'assistant IA ne mémorise pas le contexte de conversation entre les requêtes.
- Le frontend et le backend sont fortement couplés via des URLs en dur (`localhost:8000`), rendant le déploiement en production non trivial.
- Pas de tests automatisés (unit tests) implémentés pour le moment.

### Pistes d'amélioration

- Intégrer un système de paiement (Stripe, PayDunya, Monetbil pour l'Afrique).
- Migrer vers une authentification par tokens JWT pour plus de sécurité.
- Ajouter un système de notation et d'avis sur les offres.
- Implémenter des tests unitaires avec PHPUnit.
- Dockeriser l'application pour faciliter le déploiement.
- Internationalisation (i18n) pour supporter plusieurs langues.

---

##  Usage IA

L'intelligence artificielle a été utilisée dans ce projet. Voici le détail de son utilisation :

### Outils utilisés

- **Claude (Anthropic)** — aide à la conception et au debug

### Pourquoi l'IA a été utilisée

- Debug de certaines requêtes PDO complexes
- Suggestions d'architecture pour le module messagerie


### Exemples de prompts utilisés

1. `"Comment gérer proprement les CORS en PHP pour une API REST ?"`
2. `"Comment vérifier un token Google OAuth sans librairie externe en PHP ?"`

### Ce qui a été modifié / compris / validé

- Toutes les requêtes SQL générées ont été relues, adaptées au modèle de données réel, et testées manuellement.
- La logique de vérification du token Google a été comprise et validée avant intégration.
- Les suggestions d'architecture ont été évaluées et partiellement adoptées.

> ℹ Tout code produit avec l'aide de l'IA dans le code source est encadré par :
> ```php
> # ############### CODE IA (Claude) ################
> # VOTRE CODE
> # ########################################
> ```

---

##  Références

- [Documentation PHP PDO](https://www.php.net/manual/fr/book.pdo.php)
- [PHPMailer](https://github.com/PHPMailer/PHPMailer)
- [Google Gemini API](https://ai.google.dev/docs)
- [Google Identity Services (OAuth)](https://developers.google.com/identity/gsi/web)

---

##  Auteur

**Emmanuel SENAKPON** — Module Programmation Orientée Objet, M1  
Projet encadré par Adrien ESCOURROU  
Date de rendu : 29/05/2026
