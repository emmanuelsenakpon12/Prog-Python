def factoriel(n):
    """
    Calcule la factorielle d'un entier n.
    Par définition :
        n! = n * (n-1) * (n-2) * ... * 2 * 1
    Avec 0! = 1 par convention.
    Paramètre :
        n (int) : entier >= 0
    Retour :
        int : n!
    """

    # Pour n < 0, la factorielle n'est pas définie (au sens classique)
    if n < 0:
        raise ValueError("La factorielle n'est pas définie pour n < 0")

    # 0! = 1
    if n == 0:
        return 1

    # On initialise le résultat à 1 (élément neutre de la multiplication)
    resultat = 1

    # On multiplie resultat par tous les entiers de 1 à n
    for i in range(1, n + 1):
        resultat = resultat * i

    return resultat


# Exemple
# print(factoriel(5))  # 120
