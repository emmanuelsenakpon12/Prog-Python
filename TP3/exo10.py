def convHexa(n):
    """
    Convertit un entier positif n en chaîne de caractères représentant
    sa valeur en hexadécimal (sans utiliser hex()).
    Paramètre :
        n (int) : entier >= 0
    Retour :
        str : représentation hexadécimale de n
    """

    # Cas particulier : 0 en hexa s'écrit "0"
    if n == 0:
        return "0"

    # Chaine contenant tous les symboles possibles en base 16
    # indices : 0->'0', 1->'1', ..., 10->'A', ..., 15->'F'
    hexa_digits = "0123456789ABCDEF"

    # Liste pour stocker les "chiffres" hexadécimaux
    digits = []

    # Tant que n n'est pas nul, on le divise par 16
    while n > 0:
        # Le reste de la division par 16 donne l'indice du chiffre hexa
        reste = n % 16

        # On récupère le caractère correspondant dans hexa_digits
        digit = hexa_digits[reste]

        # On stocke ce caractère dans la liste
        digits.append(digit)

        # On divise n par 16 (division entière)
        n = n // 16

    # Les chiffres ont été ajoutés dans l'ordre inverse,
    # donc on les renverse pour avoir la bonne représentation
    digits.reverse()

    # On joint la liste en une chaîne unique
    return "".join(digits)


# Exemple
print(convHexa(255))  # "FF"
