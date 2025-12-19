def triSelection(tab):
    """
    Tri par sélection, en place.
    Trie 'tab' par ordre croissant.
    """
    n = len(tab)
    for i in range(n - 1):
        # On suppose que le minimum est à la position i
        indice_min = i

        # On cherche le vrai minimum dans le reste du tableau
        for j in range(i + 1, n):
            if tab[j] < tab[indice_min]:
                indice_min = j

        # On échange l'élément à i avec le minimum trouvé
        tab[i], tab[indice_min] = tab[indice_min], tab[i]

# Exemple d'utilisation
t = [64, 25, 12, 22, 11]
triSelection(t)
print(t)  # [11, 12, 22, 25, 64]
