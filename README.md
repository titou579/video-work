# Lecteur vidéo – présentation en classe

Site statique (HTML/CSS/JS, aucune dépendance) pour lire une vidéo proprement, avec quelques options.

## Contenu du dépôt

```
index.html
style.css
script.js
render.yaml
work.MP4      <- ta vidéo (à ajouter, même nom exact)
```

## 1. Ajouter ta vidéo

Place ta vidéo **à côté de `index.html`**, avec le nom `work.MP4` (majuscules comprises : GitHub et Render distinguent majuscules et minuscules).

Si le nom change, modifie `CONFIG.video` en haut de `script.js`. Tu peux aussi y changer le titre et ton nom.

Conseils pour la vidéo :
- Format MP4 en H.264 + AAC : lu par tous les navigateurs.
- GitHub refuse les fichiers de plus de 100 Mo (et 25 Mo via l'upload dans le navigateur). Si elle est trop lourde, compresse-la avec HandBrake (preset « Fast 1080p30 ») avant de l'ajouter.

## 2. Mettre sur GitHub

1. Crée un dépôt sur github.com (New repository).
2. Clique sur « uploading an existing file » et glisse tous les fichiers, vidéo comprise (si elle fait moins de 25 Mo), puis « Commit changes ».
   Si elle est plus grosse : utilise Git en ligne de commande (`git add .`, `git commit`, `git push`, limite 100 Mo).

## 3. Publier sur Render

1. Sur render.com : **New +** → **Static Site**.
2. Connecte ton compte GitHub et choisis le dépôt.
3. Laisse **Build Command** vide et mets **Publish Directory** à `.`
4. **Create Static Site**. Au bout d'une minute, Render te donne une adresse en `onrender.com`.

(Le fichier `render.yaml` permet aussi de le faire en « Blueprint ».)

## Si la vidéo ne se charge pas

- Vérifie le nom exact du fichier (`work.MP4`).
- Essaie de le renommer en `work.mp4` et change `CONFIG.video` dans `script.js`.

## Options du lecteur

Raccourcis : Espace/K lecture, ← → 5 s, J/L 10 s, ↑ ↓ volume, M muet, C sous-titres, F plein écran, P vue épurée, R recommencer, S réglages, 0–9 saut en %.
Réglages : vitesse, boucle, thèmes de couleur, ajustement de l'image, halo lumineux, sous-titres (.vtt ou .srt), titre et nom modifiables.
Les réglages sont mémorisés dans le navigateur.

Conseil : avant le passage en classe, teste le site sur l'ordinateur et la connexion de la salle, et garde la vidéo en local en secours.
