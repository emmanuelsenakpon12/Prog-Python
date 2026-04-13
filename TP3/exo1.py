def somme(n):
    """
    Calcule la somme des n premiers entiers naturels : 1 + 2 + ... + n.
    Paramètre :
        n (int) : entier positif
    Retour :
        int : somme des entiers de 1 à n
    """

    # On initialise la somme à 0 (neutre pour l'addition)
    s = 0

    # On parcourt tous les entiers de 1 jusqu'à n inclus
    # range(1, n + 1) génère 1, 2, ..., n
    for i in range(1, n + 1):
        # À chaque tour, on ajoute i à la somme courante
        s = s + i

    # Une fois la boucle terminée, s contient la somme finale
    return s


def sommeChoix():
    """
    Demande à l'utilisateur combien de nombres il veut saisir,
    puis lui demande ces nombres un par un, et calcule la somme.
    Ne prend pas de paramètre, affiche directement le résultat.
    """

    # On demande combien de valeurs l'utilisateur veut saisir
    n = int(input("Combien de nombres veux-tu saisir ? "))

    # Initialisation de la somme à 0
    s = 0

    # On répète la saisie n fois
    for i in range(1, n + 1):
        # On demande la i-ème valeur
        val = float(input(f"Saisis la valeur numéro {i} : "))

        # On ajoute cette valeur à la somme
        s = s + val

    # À la fin, on affiche la somme totale
    print("La somme des", n, "valeurs est :", s)


# Exemple d'utilisation
print(somme(5))        # 1+2+3+4+5 = 15
sommeChoix()
