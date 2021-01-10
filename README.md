# Oclock

/* jeu dans le style Memory */

Nécessite PostgreSQL et Nodejs !

Pour l'initialisation, il faut créer un utilisateur au niveau de la base de données (login/mot de passe) dans le fichier "helper/data".
Une fois l'utilisateur créé, il suffit de lancer node server.js pour que tout soit créé et le jeu opérationnel.

Description de l'arborescence :

-helper : dossier contenant tous les fichiers gérant le code métier du site
--card.js : fichier de gestion des cartes
--data.js : fichier de gestion du CRUD
--game.js : fichier de gestion des parties
--init.js : fichier d'initialisation de la base de donées
--page.js : fichier de gestions des requêtes (get/post) suivant les urls demandées

-node_modules : ensemble des modules npm (express, pug...)

-public : dossier public pour les CSS, javascript et images

--css : dossier contenant les CSS

---portrait : dossier pour les fichiers CSS pour les écrans de format portrait

---landscape : dossier pour les fichiers CSS pour les écrans de format paysage

---game.css : fichier CSS de la page du jeu (/game)

---home.css : fichier CSS de la homepage (/)

--js : dossier contenant les fichiers javascripts propres aux pages

---game.js : fichier JS du jeu

---home.js : fichier JS de la homepage

--img : dossier contenant les images


-view : dossier contenant les vues PUG

--home.pug : fichier pour la homepage

--game.pug : fichier pour le jeu
