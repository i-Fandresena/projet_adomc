# Projet SAW Logement (Aggregation ponderee)

Ce dossier contient un nouveau projet autonome, distinct du projet serveur, avec le meme principe d aide a la decision multicritere par aggregation ponderee (methode SAW).

## Nouveau cas concret

Selection de logements locatifs etudiants selon:
- loyer (minimiser)
- distance campus (minimiser)
- surface (maximiser)
- transport (maximiser)
- securite de zone (maximiser)

## Ce qui est different de l ancien projet

- Sujet metier different: logement au lieu de VPS
- Interface tres differente: direction editoriale, carte de compromis SVG, cartes produit style catalogue
- Aucun framework requis pour lancer la demo
- Comparaison directe de 3 logements maximum
- Export CSV et export PDF du classement courant

## Lancement

Ouvrir simplement le fichier index.html dans un navigateur.

## Methodes implementees

- Normalisation min-max
  - critere a minimiser: (max - x) / (max - min)
  - critere a maximiser: (x - min) / (max - min)
- Score global SAW
  - somme(score_normalise_critere * poids_critere)
- Redistribution automatique des poids pour conserver une somme a 100%
- Filtrage concret (budget, distance, surface, meuble)

## Fichiers

- index.html: structure de la page
- styles.css: design visuel et responsive
- app.js: donnees, algorithme SAW, filtres, rendu dynamique
