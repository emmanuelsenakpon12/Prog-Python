def convBinaire(n):
    """
    Convertit un entier positif n en chaîne de caractères représentant
    sa valeur en binaire (sans utiliser bin()).
    Paramètre :
        n (int) : entier >= 0
    Retour :
        str : représentation binaire de n
    """

    # Cas particulier : 0 en binaire s'écrit "0"
    if n == 0:
        return "0"

    # Liste pour stocker les restes successifs (bits)
    bits = []

    # Tant que n n'est pas nul, on le divise par 2
    while n > 0:
        # Le reste de la division par 2 est le bit de poids faible
        reste = n % 2

        # On ajoute ce reste dans la liste
        bits.append(str(reste))

        # On remplace n par le quotient de la division entière par 2
        n = n // 2

    # Les bits ont été stockés du moins significatif au plus significatif,
    # donc on inverse la liste pour obtenir le bon ordre
    bits.reverse()

    # On joint la liste de caractères en une seule chaîne
    return "".join(bits)


# Exemple
# print(convBinaire(13))  # "1101"
