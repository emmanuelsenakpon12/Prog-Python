def triInsertion(tab):
    """
    Tri par insertion, en place.
    Trie 'tab' par ordre croissant.
    """
    for i in range(1, len(tab)):
        cle = tab[i]
        j = i - 1

        # Décale les éléments plus grands que 'cle'
        while j >= 0 and tab[j] > cle:
            tab[j + 1] = tab[j]
            j -= 1

        tab[j + 1] = cle

# Exemple d'utilisation
t = [5, 2, 4, 6, 1, 3]
triInsertion(t)
print(t)  # [1, 2, 3, 4, 5, 6]
