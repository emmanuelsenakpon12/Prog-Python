# TD2 - PROG-JAVA

Ce dossier contient les exercices Python du TD2.

## Fichiers

- `exo1.py` : application Pygame et visualisation de l'algorithme A*.
- `exo2.py` : implémentation d'un algorithme de recherche informée (A* / GBFS).
- `exo3.py` : exercice Python supplémentaire du TD2.

## Exécution

Ouvrez un terminal dans le dossier `TD2` puis lancez :

```bash
python exo1.py
```
ou

```bash
python exo2.py
```
ou

```bash
python exo3.py
```

## Question 1
C'est la recherche gloutonne qui trouve la solution le plus rapidement. Elle n'a parcouru que 264 pas contre 774 pour A* standard. En se basant uniquement sur l'heuristique h, elle se dirige directement vers la sortie sans s'attarder à évaluer le coût réel du chemin parcouru.

## Question 2
A* standard est le seul algorithme qui garantit un chemin optimal. Il évalue à la fois le coût réel parcouru et l'estimation vers le but, ce qui lui permet de ne jamais rater le meilleur chemin. En revanche il explore beaucoup de nœuds, ce qui le rend plus lent comme on le voit avec ses 774 pas.
La recherche gloutonne est la plus rapide car elle explore très peu de nœuds. Cependant elle ne garantit pas un chemin optimal : elle peut passer par des cases coûteuses si elles semblent proches du but. Dans notre cas elle a obtenu le même coût qu'A* mais ce n'est pas toujours le cas.
A* pondéré avec w=9 est un bon compromis. Il est bien plus rapide qu'A* standard (292 pas) tout en conservant le même coût optimal de 115. Plus w est grand, plus il se comporte comme le glouton. Mais dès que w dépasse 1, le chemin optimal n'est plus garanti.


## Question 3

Pour un labyrinthe à coûts variables, A* avec distance de Manhattan reste le meilleur pour un chemin optimal. On peut l’optimiser avec un A* bidirectionnel (recherche depuis départ et arrivée), un A* pondéré (w ≈ 1.1–1.2) pour réduire les explorations, et un tie-breaking sur h pour limiter les nœuds explorés sans changer le résultat.
