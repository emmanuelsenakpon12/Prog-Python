def termeSuite2(n):
    """
    Calcule et renvoie la valeur de Un pour la suite :
        U0 = 3, U1 = 1
        Un = Un-1 + Un-2  pour n >= 2
    Paramètre :
        n (int) : indice du terme à calculer
    Retour :
        int : valeur de Un
    """

    # Cas simples : si n vaut 0 ou 1, on renvoie directement
    if n == 0:
        return 3
    if n == 1:
        return 1

    # Sinon, on calcule de manière itérative
    U0 = 3  # valeur de U0
    U1 = 1  # valeur de U1

    # On va calculer successivement U2, U3, ..., Un
    for i in range(2, n + 1):
        # Un = Un-1 + Un-2
        U = U1 + U0

        # On décale : l'ancien U1 devient U0, et le nouveau U devient U1
        U0 = U1
        U1 = U

    # À la fin de la boucle, U1 contient Un
    return U1


# Exemple
# print(termeSuite2(5))
