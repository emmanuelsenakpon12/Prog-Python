def pgcd(a, b):
    """
    Calcule le PGCD (Plus Grand Commun Diviseur) de deux entiers a et b
    en utilisant l'algorithme d'Euclide.
    """

    # On travaille en valeurs positives pour simplifier
    a = abs(a)
    b = abs(b)

    # Algorithme d'Euclide :
    # Tant que le second nombre n'est pas nul,
    # on remplace (a, b) par (b, a mod b).
    while b != 0:
        reste = a % b      # reste de la division de a par b
        a = b              # l'ancien b devient le nouveau a
        b = reste          # le reste devient le nouveau b

    # Quand b vaut 0, a contient le PGCD
    return a


def ppcm(a, b):
    """
    Calcule le PPCM (Plus Petit Commun Multiple) de deux entiers a et b.
    Utilise la relation : ppcm(a, b) = |a * b| // pgcd(a, b)
    """

    # Si un des deux nombres est 0, le PPCM est 0
    if a == 0 or b == 0:
        return 0

    # On calcule d'abord le PGCD avec la fonction au-dessus
    d = pgcd(a, b)

    # Puis on applique la formule du PPCM
    resultat = abs(a * b) // d

    return resultat


# Exemple d'utilisation
print(pgcd(12, 18))   # 6
print(ppcm(12, 18))   # 36
