def min_max(tab):
    """
    Trouve la plus petite et la plus grande valeur dans une liste d'entiers.
    Paramètre :
        tab (list[int]) : liste non vide d'entiers
    Retour :
        tuple (min_val, max_val)
    """

    # On suppose que le premier élément est à la fois le min et le max
    min_val = tab[0]
    max_val = tab[0]

    # On parcourt le reste du tableau à partir de l'indice 1
    for i in range(1, len(tab)):
        valeur = tab[i]

        # Si la valeur courante est plus petite que le min actuel,
        # on met à jour min_val
        if valeur < min_val:
            min_val = valeur

        # Si la valeur courante est plus grande que le max actuel,
        # on met à jour max_val
        if valeur > max_val:
            max_val = valeur

    # On retourne les deux extrêmes
    return min_val, max_val


# Exemple
# t = [5, 2, 9, -3, 7]
# print(min_max(t))  # (-3, 9)
