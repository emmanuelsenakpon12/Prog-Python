def termeSuite(n):
    """
    Calcule et affiche les n premiers termes de la suite :
        U0 = 3
        Un = 2*Un-1 - 4  pour n >= 1
    Paramètre :
        n (int) : nombre de termes à afficher
    """

    # Terme initial U0
    U = 3

    # On affiche d'abord U0
    print("U0 =", U)

    # On calcule ensuite U1, U2, ..., U(n-1)
    # On a déjà U0, donc on commence la boucle à 1
    for i in range(1, n):
        # Application de la relation de récurrence :
        # Un = 2 * U(n-1) - 4
        U = 2 * U - 4

        # On affiche le terme courant Ui
        print(f"U{i} =", U)


# Exemple
# termeSuite(5)
