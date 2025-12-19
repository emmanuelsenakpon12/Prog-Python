def triBulles(tab):
    """
    Tri à bulles, en place.
    Trie 'tab' par ordre croissant.
    """
    n = len(tab)
    echange = True

    while echange:
        echange = False
        for i in range(n - 1):
            if tab[i] > tab[i + 1]:
                tab[i], tab[i + 1] = tab[i + 1], tab[i]
                echange = True
        n -= 1  # Optimisation : la dernière position est déjà correcte

# Exemple d'utilisation
t = [5, 1, 4, 2, 8]
triBulles(t)
print(t)  # [1, 2, 4, 5, 8]
