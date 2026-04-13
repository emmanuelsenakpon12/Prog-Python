def pgcd(a, b):
    """
    Calcule le PGCD (Plus Grand Commun Diviseur) de deux entiers a et b
    en utilisant l'algorithme d'Euclide.
    Paramètres :
        a (int), b (int) : entiers
    Retour :
        int : PGCD de a et b
    """

    # On s'assure de travailler avec des valeurs positives
    a = abs(a)
    b = abs(b)

    # Tant que b n'est pas nul, on continue
    # Rappel : PGCD(a, b) = PGCD(b, a mod b)
    while b != 0:
        # r est le reste de la division euclidienne de a par b
        r = a % b

        # On décale les valeurs :
        # le "nouveau" a devient l'ancien b
        # le "nouveau" b devient le reste r
        a = b
        b = r

    # Quand b = 0, l'algorithme s'arrête et a contient le PGCD
    return a


# Exemple
# print(pgcd(48, 18))  # 6
