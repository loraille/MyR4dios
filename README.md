# MyR4dios

MyR4dios est une application mobile de streaming radio développée avec React Native et Expo. Elle permet aux utilisateurs d'écouter leurs stations de radio préférées en direct.

## Fonctionnalités

- **Lecture en direct :** Écoutez des flux radio en temps réel.
- **Contrôle du volume :** Ajustez le volume directement depuis l'application.
- **Interface simple :** Une interface utilisateur épurée pour une navigation facile.
- **Affichage des informations de la station :** Affiche le nom, le genre et l'image de la station en cours de lecture.

## Pour commencer

1.  **Installez les dépendances :**

    ```bash
    npm install
    ```

2.  **Démarrez l'application :**
    ```bash
    npx expo start
    ```
    Cela lancera le serveur de développement Metro. Vous pouvez ensuite exécuter l'application sur un appareil physique en utilisant l'application Expo Go ou dans un simulateur iOS/émulateur Android.

## Structure du projet

Le projet est organisé comme suit :

- **/app**: Contient la logique de navigation et les écrans de l'application.
  - **/(tabs)**: Définit la navigation par onglets.
    - `_layout.tsx`: Configuration de la navigation par onglets.
    - `index.tsx`: L'écran d'accueil affichant la liste des stations.
    - `player.tsx`: L'écran du lecteur audio.
  - `_layout.tsx`: La mise en page racine de l'application.
  - `+not-found.tsx`: Écran affiché pour les routes introuvables.
- **/assets**: Contient les polices et les images statiques.
- **/components**: Contient les composants React réutilisables.
- **/constants**: Contient les constantes utilisées dans l'application, comme les couleurs.
- **/hooks**: Contient les hooks React personnalisés.

## Scripts

- `npm run reset-project`: Réinitialise le projet à un état vierge en déplaçant le code de démarrage vers `app-example`.

## Contribuer

Les contributions sont les bienvenues ! N'hésitez pas à ouvrir une issue ou une pull request.
