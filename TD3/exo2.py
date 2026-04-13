def rechDic(tab, valeur):
    """
    Recherche dichotomique (binaire).
    'tab' doit être trié par ordre croissant.
    Retourne l'indice de 'valeur' si trouvée, sinon -1.
    """
    gauche = 0
    droite = len(tab) - 1

    while gauche <= droite:
        milieu = (gauche + droite) // 2
        if tab[milieu] == valeur:
            return milieu
        elif tab[milieu] < valeur:
            gauche = milieu + 1
        else:
            droite = milieu - 1

    return -1

# Exemple d'utilisation
t = [1, 3, 5, 7, 9, 11, 15]
print(rechDic(t, 15))  # 6
print(rechDic(t, 4))   # -1
