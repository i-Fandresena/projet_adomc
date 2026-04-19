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

## Fichiers

- [index.html](index.html): structure du dashboard
- [styles.css](styles.css): theme et responsive
- [app.js](app.js): donnees, algorithmes SAW, interactions UI, exports et partage
