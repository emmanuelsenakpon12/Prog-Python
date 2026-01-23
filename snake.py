import pygame
import random
from typing import List, Tuple

"""
TP04 - Jeu Snake en Programmation Orientée Objet
Auteur: Emmanuel Sènakpon AGBOTOME 

Ce programme implémente un jeu Snake complet avec :
- Héritage : Entity → MovingEntity → Snake/Food
- Polymorphisme : update() et draw() surchargées
- Encapsulation : attributs privés avec _prefixe
- Bonus : IA autonome, grille visuelle, respawn intelligent
"""

# INITIALISATION PYGAME ET CONSTANTES GLOBALES
# Initialisation de la bibliothèque Pygame
pygame.init()

# Constantes de la grille de jeu (paramètres globaux)
CELL_SIZE = 20      # Taille d'une cellule en pixels
DEFAULT_SPEED = 10  # Vitesse de base du serpent (FPS / DEFAULT_SPEED)
WIDTH = 800         # Largeur de la fenêtre
HEIGHT = 600        # Hauteur de la fenêtre
GRID_WIDTH = WIDTH // CELL_SIZE   # Nombre de cellules en largeur
GRID_HEIGHT = HEIGHT // CELL_SIZE # Nombre de cellules en hauteur

# Couleurs RGB (tuple (R,G,B))
WHITE = (255, 255, 255)  # Blanc - texte
BLACK = (0, 0, 0)        # Noir - fond et bordures
RED = (255, 0, 0)        # Rouge - nourriture
GREEN = (0, 255, 0)      # Vert - tête serpent joueur
GRAY = (128, 128, 128)   # Gris - grille
YELLOW = (255, 255, 0)   # Jaune - tête serpent IA

# Paramètres d'affichage et de boucle de jeu
FPS = 60                # Images par seconde
clock = pygame.time.Clock()  # Contrôleur de FPS
screen = pygame.display.set_mode((WIDTH, HEIGHT))  # Création fenêtre
pygame.display.set_caption("Snake Game - TP04")

class Entity:
    """Classe de base abstraite pour TOUTES les entités du jeu.
    
    Définit l'INTERFACE commune :
    - update(game) : mise à jour état
    - draw(screen) : affichage sur écran
    
    PERMET LE POLYMORPHISME : Game appelle ces méthodes sans connaître le type exact.
    """

    def __init__(self):
        """Constructeur vide - redéfini par les sous-classes."""
        pass

    def update(self, game):
        """Mise à jour de l'état de l'entité à chaque tour.
        
        Args:
            game (Game): Référence au jeu pour accès aux autres entités
        """
        pass

    def draw(self, screen):
        """Affichage de l'entité sur l'écran.
        
        Args:
            screen: Surface Pygame pour le rendu
        """
        pass


class MovingEntity(Entity):
    """Classe intermédiaire pour les entités mobiles.
    
    Contient les PARAMÈTRES GLOBAUX partagés par Snake et Food :
    - CELL_SIZE : taille de la grille
    - DEFAULT_SPEED : vitesse de déplacement
    """
    # Attributs de CLASSE (partagés par toutes les instances)
    CELL_SIZE = CELL_SIZE
    DEFAULT_SPEED = DEFAULT_SPEED

    @classmethod
    def set_cell_size(cls, size: int):
        """Modifie la taille de cellule pour TOUTES les entités mobiles.
        
        Args:
            size (int): Nouvelle taille en pixels
        """
        cls.CELL_SIZE = size

    @classmethod
    def set_default_speed(cls, speed: int):
        """Modifie la vitesse par défaut pour TOUTES les entités mobiles.
        
        Args:
            speed (int): Nouvelle vitesse
        """
        cls.DEFAULT_SPEED = speed

    @classmethod
    def set_direction(cls, dx: int, dy: int):
        """
        Méthode de classe prévue par l'énoncé (interface).
        Non utilisée directement car chaque Snake gère sa propre direction.
        Pourrait servir pour une direction 'par défaut' globale.
        
        Args:
            dx (int): Déplacement horizontal (±CELL_SIZE ou 0)
            dy (int): Déplacement vertical (±CELL_SIZE ou 0)
        """
        # Placeholder respectant l'interface de l'énoncé
        pass


class Snake(MovingEntity):
    """Classe principale : représente le SERPENT (joueur ou IA).
    
    Caractéristiques :
    - Corps : liste de positions (head en index 0)
    - Croissance différée via _grow_pending
    - Direction contrôlée par _dx/_dy
    - Mode IA optionnel
    """
# ###################### CODE IA ######################
    def __init__(self, x: int, y: int, is_ai: bool = False):
        """Constructeur du serpent.
        
        Args:
            x (int): Position X initiale de la tête
            y (int): Position Y initiale de la tête
            is_ai (bool): True si contrôle automatique par IA
        """
        super().__init__()
        self._body: List[Tuple[int, int]] = [(x, y)]  # Corps (tête en [0])
        self._grow_pending = 0                         # Croissance en attente
        self._dx = CELL_SIZE                           # Direction X (droite)
        self._dy = 0                                   # Direction Y (0)
        self._is_ai = is_ai                            # Mode IA ?

    def update(self, game):
        """Mise à jour : mouvement + croissance + IA.
        
        1. Si IA : calculer meilleure direction
        2. Calculer nouvelle position tête
        3. Ajouter tête AVANT
        4. Retirer queue SI pas de croissance
        """
        # Phase IA (avant mouvement)
        if self._is_ai and not game.game_over:
            self._update_ai_direction(game)

        # Calcul nouvelle tête
        new_x = self._body[0][0] + self._dx
        new_y = self._body[0][1] + self._dy
        self._body.insert(0, (new_x, new_y))  # NOUVELLE TÊTE EN TÊTE

        # Gestion croissance
        if self._grow_pending > 0:
            self._grow_pending -= 1  # On garde la queue
        else:
            self._body.pop()         # Retirer queue

    def draw(self, screen):
        """Affichage segment par segment avec couleurs différenciées."""
        for i, (x, y) in enumerate(self._body):
            # Tête spéciale (JAUNE si IA, VERT si joueur)
            color = (YELLOW if self._is_ai else GREEN) if i == 0 else (0, 200, 0)
            pygame.draw.rect(screen, color, (x, y, CELL_SIZE, CELL_SIZE))
            pygame.draw.rect(screen, BLACK, (x, y, CELL_SIZE, CELL_SIZE), 1)
#############################################
    def grow(self, n: int):
        """Planifie la croissance (ajout de n segments).
        
        Args:
            n (int): Nombre de segments à ajouter
        """
        self._grow_pending += n

    def set_direction(self, dx: int, dy: int):
        """Change direction avec validation (pas de demi-tour).
        
        Règle : on ne peut changer que d'un axe à l'autre.
        
        Args:
            dx (int): Nouveau déplacement X
            dy (int): Nouveau déplacement Y
        """
        # Validation : éviter inversion immédiate (ex: droite → gauche)
        if (dx != 0 and self._dx == 0) or (dy != 0 and self._dy == 0):
            self._dx = dx
            self._dy = dy

    @property
    def body(self):
        """Accès lecture seule au corps (encapsulation)."""
        return self._body

    @property
    def head(self):
        """Position tête (lecture seule)."""
        return self._body[0] if self._body else None

    # ###################### CODE IA ######################
    # ALGORITHME IA SIMPLE (GLUTTON / GREEDY)
    # Stratégie : aller vers nourriture en évitant collisions immédiates
    def _update_ai_direction(self, game):
        """IA heuristique : minimise distance Manhattan à nourriture."""
        if not self.head:
            return

        head_x, head_y = self.head
        food_x, food_y = game.food.pos()

        # 4 directions possibles
        candidates = [
            (0, -CELL_SIZE),   # ↑ haut
            (0, CELL_SIZE),    # ↓ bas
            (-CELL_SIZE, 0),   # ← gauche
            (CELL_SIZE, 0),    # → droite
        ]

        valid_moves = []
        for dx, dy in candidates:
            # 1. Éviter demi-tour (contrainte énoncé)
            if dx == -self._dx and dy == -self._dy:
                continue

            nx = head_x + dx
            ny = head_y + dy

            # 2. Collision mur ?
            if nx < 0 or nx >= WIDTH or ny < 0 or ny >= HEIGHT:
                continue
            # 3. Collision corps (sauf queue qui bouge) ?
            if (nx, ny) in self._body[:-1]:
                continue

            # Heuristique : distance Manhattan à nourriture
            dist = abs(food_x - nx) + abs(food_y - ny)
            valid_moves.append((dist, dx, dy))

        if not valid_moves:
            # Pas de coup sûr → garder direction actuelle
            return

        # Meilleur coup (distance minimale)
        valid_moves.sort(key=lambda t: t[0])
        _, best_dx, best_dy = valid_moves[0]
        self._dx = best_dx
        self._dy = best_dy
    # ############################################


class Food(MovingEntity):
    """Nourriture : apparaît aléatoirement, disparaît au contact."""

    def __init__(self):
        """Spawn initial aléatoire."""
        super().__init__()
        self._x = 0
        self._y = 0
        self.respawn()

    def update(self, game):
        """Aucune logique interne (mais respecte interface Entity)."""
        pass

    def draw(self, screen):
        """Carré rouge + bordure noire."""
        pygame.draw.rect(screen, RED, (self._x, self._y, CELL_SIZE, CELL_SIZE))
        pygame.draw.rect(screen, BLACK, (self._x, self._y, CELL_SIZE, CELL_SIZE), 1)

    def pos(self):
        """Position actuelle (x, y)."""
        return (self._x, self._y)

    def respawn(self):
        """Nouveau spawn aléatoire sur la grille."""
        self._x = random.randint(0, GRID_WIDTH - 1) * CELL_SIZE
        self._y = random.randint(0, GRID_HEIGHT - 1) * CELL_SIZE


class Game:
    """Classe ORCHESTRATRICE : gère boucle de jeu, collisions, affichage."""

    def __init__(self, use_ai: bool = True):
        """Initialisation complète du jeu.
        
        Args:
            use_ai (bool): Mode IA ou manuel
        """
        pygame.init()
        self.score = 0
        self.game_over = False
        self.use_ai = use_ai

        # Position de départ centrale
        start_x = GRID_WIDTH // 2 * CELL_SIZE
        start_y = GRID_HEIGHT // 2 * CELL_SIZE
###################CODE IA##########################
        # Création entités (polymorphisme)
        self.snake = Snake(start_x, start_y, is_ai=self.use_ai)
        self.food = Food()
        self.entities: List[Entity] = [self.food, self.snake]

    def handle_events(self):
        """Gestion événements clavier/souris."""
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                return False
            elif event.type == pygame.KEYDOWN:
                # ESC : sortie immédiate
                if event.key == pygame.K_ESCAPE:
                    return False

                # MODE MANUEL uniquement
                if not self.use_ai:
                    if event.key == pygame.K_UP:
                        self.snake.set_direction(0, -CELL_SIZE)
                    elif event.key == pygame.K_DOWN:
                        self.snake.set_direction(0, CELL_SIZE)
                    elif event.key == pygame.K_LEFT:
                        self.snake.set_direction(-CELL_SIZE, 0)
                    elif event.key == pygame.K_RIGHT:
                        self.snake.set_direction(CELL_SIZE, 0)

        return True
#############################################
    def update(self):
        """LOGIQUE DE JEU : mise à jour + détection collisions."""
        # 1. Mise à jour POLYMORPHIQUE de toutes les entités
        for e in self.entities:
            e.update(self)

        head_x, head_y = self.snake.head

        # 2. COLLISION MURS
        if head_x < 0 or head_x >= WIDTH or head_y < 0 or head_y >= HEIGHT:
            self.game_over = True
            return

        # 3. COLLISION CORPS (auto-destruction)
        if (head_x, head_y) in self.snake.body[1:]:
            self.game_over = True
            return

        # 4. COLLISION NOURRITURE (croissance + score)
        food_x, food_y = self.food.pos()
        if head_x == food_x and head_y == food_y:
            self.score += 10
            self.snake.grow(1)
            # Respawn SANS apparaître sur le serpent
            while True:
                self.food.respawn()
                if self.food.pos() not in self.snake.body:
                    break

    def draw_grid(self):
        """Bonus : affichage grille pour visualisation."""
        for x in range(0, WIDTH, CELL_SIZE):
            pygame.draw.line(screen, GRAY, (x, 0), (x, HEIGHT), 1)
        for y in range(0, HEIGHT, CELL_SIZE):
            pygame.draw.line(screen, GRAY, (0, y), (WIDTH, y), 1)

    def draw(self):
        """RENDERING COMPLET : fond + entités + UI."""
        screen.fill(BLACK)      # Fond noir

        self.draw_grid()        # Grille (bonus)

        # Affichage POLYMORPHIQUE entités
        for entity in self.entities:
            entity.draw(screen)

        # UI Score + Mode
        font = pygame.font.Font(None, 36)
        mode = "IA" if self.use_ai else "Joueur"
        score_text = font.render(f"Score: {self.score}  |  Mode: {mode}", True, WHITE)
        screen.blit(score_text, (10, 10))

        # Game Over
        if self.game_over:
            game_over_font = pygame.font.Font(None, 72)
            game_over_text = game_over_font.render("GAME OVER", True, RED)
            text_rect = game_over_text.get_rect(center=(WIDTH // 2, HEIGHT // 2))
            screen.blit(game_over_text, text_rect)

        pygame.display.flip()   # Rafraîchissement écran

    def run(self):
        """BOUCLE PRINCIPALE DU JEU."""
        running = True
        frame_counter = 0       # Compteur pour réguler vitesse

        while running:
            running = self.handle_events()              # Événements

            frame_counter += 1
            # Mise à jour seulement tous les (FPS/DEFAULT_SPEED) frames
            if frame_counter >= FPS // DEFAULT_SPEED and not self.game_over:
                self.update()
                frame_counter = 0

            self.draw()
            clock.tick(FPS)                             # 60 FPS

            if self.game_over:
                pygame.time.wait(3000)                  # Pause 3s
                break

        pygame.quit()


# POINT D'ENTRÉE DU PROGRAMME
if __name__ == "__main__":
    # Configuration mode de jeu :
    # use_ai=True  → Serpent IA autonome (JAUNE)
    # use_ai=False → Contrôle clavier (VERT)
    game = Game(use_ai=True)
    game.run()
