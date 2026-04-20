# Projet Logement ADOMC - Dashboard SAW

Ce projet est autonome et distinct du projet serveur.
Il applique la meme methode d aggregation ponderee (SAW) a une problematique plus concrete: choisir un logement locatif.

## Fonctionnalites implementees

- Dashboard multi-sections avec navigation laterale:
  - Apercu
  - Pre-guide
  - Ponderation
  - Visualisation
  - Classement
  - Comparaison
  - Sensibilite
  - Calcul SAW
- Authentification locale demo (session localStorage) avec compte par defaut:
  - Email: groupe.logement@adomc.demo
  - Mot de passe: adomc2026
- Pre-guide de besoin qui genere poids + filtres selon un profil locataire.
- Ponderation dynamique avec redistribution automatique pour garder 100%.
- Presets de demonstration (equilibre, budget, confort, mobilite).
- Filtres metier:
  - budget max
  - distance max
  - surface min
  - ville
  - meuble uniquement
  - recommandes uniquement
- Sauvegarde et chargement de scenarios (localStorage).
- Visualisation Pareto (SVG) avec:
  - option afficher/masquer logements domines
  - plafond de loyer affiche
- Radar profil logement (SVG) pour lecture rapide des compromis.
- Classement tableau avec:
  - tri multi-colonnes
  - pagination configurable de 5 a 50
  - mode catalogue complet ou filtre
  - bouton comparer par ligne
- Comparaison directe de 3 logements max.
- Analyse de sensibilite (what-if) sur un critere, avec courbes SVG et indicateurs de robustesse.
- Details de calcul SAW pour le top 3.
- Fallback intelligent sur catalogue complet pour eviter les onglets vides quand les filtres sont trop stricts.
- Export CSV, export PDF imprimable, et partage de configuration par URL.

## Donnees diversifiees

Le catalogue est genere de facon synthetique mais realiste a partir de:
- 35 villes internationales
- 12 modeles de logement
- 3 profils de quartier

Total: 1260 logements avec variations de:
- loyer
- distance
- surface
- securite
- qualite internet
- statut meuble/non meuble
- type de logement
- quartier

## Methode SAW

Criteres utilises:
- Loyer (minimiser)
- Distance (minimiser)
- Surface (maximiser)
- Securite (maximiser)
- Internet (maximiser)

Calcul:
1. Normalisation min-max par critere.
2. Application des poids utilisateur.
3. Score global par somme ponderee.
4. Classement decroissant.
5. Detection Pareto (domination multicritere).

## Lancement

Ouvrir [index.html](index.html) dans un navigateur.

## Cloner le projet

1. Cloner le depot:

```bash
git clone https://github.com/i-Fandresena/projet_adomc.git
```

2. Entrer dans le dossier:

```bash
cd projet_adomc
```

3. Verifier les fichiers attendus:
  - index.html
  - styles.css
  - app.js
  - README.md

## Lancer le projet en local

Ce projet est en HTML/CSS/JS pur, sans installation de dependances.

Option 1 (rapide):
1. Double-cliquer sur index.html.
2. Le projet s ouvre dans le navigateur.

Option 2 (recommandee avec serveur local):
1. Depuis le dossier du projet, lancer un serveur statique.

Avec Python:

```bash
python -m http.server 5500
```

2. Ouvrir ensuite:
  - http://localhost:5500

Connexion de demo:
- Email: groupe.logement@adomc.demo
- Mot de passe: adomc2026

## Tester le projet

### 1. Test de demarrage

1. Ouvrir l application.
2. Se connecter avec le compte demo.
3. Verifier que le dashboard apparait avec toutes les sections dans la barre laterale.

Resultat attendu:
- Acces au dashboard sans erreur visible.
- Les onglets Apercu, Pre-guide, Ponderation, Visualisation, Classement, Comparaison, Sensibilite et Calcul SAW sont accessibles.

### 2. Test fonctionnel rapide (smoke test)

1. Aller dans Pre-guide et choisir un profil.
2. Verifier que les poids et filtres se mettent a jour.
3. Aller dans Classement et verifier que la table contient des logements.
4. Trier par score puis par loyer.
5. Ajouter 2 ou 3 logements en comparaison.
6. Aller dans Comparaison pour verifier les cartes.
7. Aller dans Sensibilite et changer le critere analyse.
8. Aller dans Visualisation pour verifier Pareto et radar.

Resultat attendu:
- Le score est calcule pour un catalogue massif (1260 logements).
- Aucun onglet ne reste vide grace aux fallback integres.
- Tri, pagination, comparaison et graphiques fonctionnent.

### 3. Test des exports

1. Dans la section Classement, lancer Export CSV.
2. Lancer Export PDF.
3. Utiliser Partager la configuration et ouvrir l URL generee.

Resultat attendu:
- Le CSV se telecharge avec les colonnes principales.
- Le PDF imprimable s ouvre correctement.
- Le lien partage recharge une configuration equivalente (poids/filtres).

### 4. Test de robustesse des filtres

1. Regler des filtres tres stricts (budget bas, distance faible, surface elevee).
2. Parcourir Visualisation, Sensibilite et Calcul SAW.

Resultat attendu:
- L application reste exploitable.
- Les sections utilisent automatiquement un fallback et affichent des donnees utiles.

### 5. Test de persistence locale

1. Sauvegarder un scenario dans Ponderation.
2. Recharger la page.
3. Verifier que session/scenarios sont recuperes.

Resultat attendu:
- Les donnees localStorage sont bien relues.
- Le scenario sauvegarde peut etre recharge.

## Fichiers

- [index.html](index.html): structure du dashboard
- [styles.css](styles.css): theme et responsive
- [app.js](app.js): donnees, algorithmes SAW, interactions UI, exports et partage
