def premier(n):
    """
    Vérifie si un entier n (>1) est premier.
    Un nombre est premier s'il n'a que 2 diviseurs : 1 et lui-même.
    Paramètre :
        n (int) : entier strictement supérieur à 1
    Retour :
        bool : True si n est premier, False sinon
    """

    # Par sécurité, on élimine les cas <= 1
    if n <= 1:
        return False

    # 2 est premier
    if n == 2:
        return True

    # Tous les nombres pairs > 2 ne sont pas premiers
    if n % 2 == 0:
        return False

    # On teste les diviseurs possibles de 3 jusqu'à racine(n) (approx)
    # avec un pas de 2 (uniquement les impairs)
    i = 3
    # i * i <= n équivaut à i <= sqrt(n)
    while i * i <= n:
        if n % i == 0:
            # Si n est divisible par i, il n'est pas premier
            return False
        i += 2

    # Si aucun diviseur trouvé, le nombre est premier
    return True


# Exemple
# print(premier(17))  # True
# print(premier(18))  # False
