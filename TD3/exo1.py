def rechSeq(tab, valeur):
    """
    Recherche séquentielle.
    Retourne l'indice de 'valeur' dans 'tab' si trouvée, sinon -1.
    """
    for i in range(len(tab)):
        if tab[i] == valeur:
            return i
    return -1

# Exemple d'utilisation
t = [3, 7, 5, 2, 9]
print(rechSeq(t, 5))   # 2
print(rechSeq(t, 4))   # -1
