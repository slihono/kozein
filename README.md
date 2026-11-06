# Kozein

[Dépôt GitHub](https://github.com/slihono/kozein) · [Application web](https://slihono.github.io/kozein/)

Un espace anime et manga maintenu par **Kozein** : découverte, bibliothèque personnelle, lecture et vidéo.

Ce dépôt réunit le code Linux d’[Anix](https://github.com/MaidLover69/Anix), une nouvelle interface navigateur et un lecteur manga local. [Weebox 1.1.0](https://github.com/RimamashiroHina/Weebox/releases/tag/v1.1.0) sert de référence fonctionnelle : son dépôt public ne fournit pas le code de l’application. Aucun binaire Weebox n’a été renommé ou intégré.

## Démarrage rapide — Windows, macOS, Linux

Avec Node.js 22.6 ou plus récent :

```sh
npm ci
npm run dev
```

Ouvrir `http://localhost:1420`. Pour une version optimisée :

```sh
npm run build
npm run preview -- --host 127.0.0.1
```

Sous Windows, `Lancer-Kozein.cmd` lance la version navigateur et affiche son adresse. Le navigateur doit rester sur la même adresse et le même port pour retrouver ses données locales.

## Fonctions

| Fonction | Navigateur | Application Linux |
|---|---|---|
| Recherche et découverte anime | Jikan / MyAnimeList, secours AniList | AniList et catalogues de secours |
| Liste à regarder | Enregistrée dans le navigateur | Bibliothèque et comptes de suivi |
| Vidéo locale | Formats lisibles par le navigateur, reprise en rouvrant le fichier | Lecteur web, mpv / VLC, bibliothèque locale |
| Manga / BD | Pages image, stockage hors ligne, reprise, sens de lecture | Même lecteur local intégré |
| Extensions de sources | — | Moteur QuickJS hérité d’Anix |
| Synchronisation AniList / MAL / Comick | — | Fonctions héritées d’Anix ; configuration propre à la distribution à prévoir |
| Séances partagées sur le réseau local | — | Fonction héritée d’Anix |
| Téléchargements et notifications natives | — | Fonctions héritées d’Anix |
| Interface mobile | Adaptative dans le navigateur | Fenêtre native de 960 px minimum |

Le lecteur manga accepte les pages JPEG, PNG, WebP, AVIF et GIF, triées naturellement par nom de fichier. Sélectionner toutes les pages d’un volume lors de l’import. Limites : 600 pages, 30 Mo et 80 millions de pixels par page, 350 Mo par volume. Les archives CBZ/CBR et PDF ne sont pas importées.

Dans le navigateur, l’onglet **Lecteur vidéo** intègre des épisodes et des films du [programme officiel Gundam](https://fr.gundam-official.com/feature/gwoy/) et les listes d’épisodes publiées par [TMS Entertainment](https://tmsanime.com/anime-on-tms-official-channel). Le diffuseur décide de la disponibilité par pays et des sous-titres. Tu peux aussi ouvrir une adresse directe HTTPS vers un flux MP4, WebM ou HLS (.m3u8) que tu as le droit d’utiliser. Le serveur source doit autoriser les requêtes du navigateur pour la lecture HLS. Les liens directs restent en mémoire pendant la session du lecteur.

L’onglet **Lecture** affiche les planches originales de [Pepper&Carrot](https://www.peppercarrot.com/fr/about/index.html) de David Revoy (CC BY 4.0) en français ou en anglais, et de [Ubunchu!](https://seotch.wordpress.com/ubunchu/) de Hiroshi Seo, publié par ASCII MEDIA WORKS Inc. (CC BY-NC 3.0, usage non commercial), en japonais. Le lecteur indique la licence, les crédits et la source de chaque chapitre.

Les fichiers vidéo et les pages de manga importés pour une lecture locale restent sur ton appareil. La version navigateur fonctionne sur Windows, Android et iOS avec un navigateur compatible.

## Application Linux

Le moteur natif nécessite Rust stable et les dépendances Tauri 2 pour Linux (WebKitGTK 4.1, GTK 3, OpenSSL et AppIndicator). Le code natif conserve le nom technique `anix` / `anix_lib` pour rester compatible avec ses scripts et tests ; le nom public est Kozein.

```sh
npm ci
npm run tauri -- dev
```

Les nouveaux profils natifs utilisent `kozein/` et l’identifiant `io.kozein.app`. Les dossiers des installations Anix et Anilili ne sont pas migrés automatiquement. Les liens `kozein://anime/<id>` fonctionnent, avec les anciens schémas comme alias.

Les mises à jour natives sont désactivées par défaut pour éviter d’installer une version Anix par-dessus Kozein. Pour publier des mises à jour propres, définir `KOZEIN_SITE_URL` à la compilation vers un site de confiance servant le format `version.json` hérité. `ANIX_SITE_URL` reste utilisé par le répertoire d’extensions hérité. Ne jamais publier de clés ou secrets OAuth dans le dépôt.

Le lecteur manga stocke ses images dans IndexedDB, séparément des sauvegardes SQLite natives. Conserver les fichiers originaux. Effacer les données de l’application ou du navigateur efface aussi ses données locales.

## Vérification

```sh
npm run build
npm test
npm run i18n:check
npm run floor
```

Sur Linux avec Rust et les bibliothèques système installés :

```sh
cargo check --manifest-path src-tauri/Cargo.toml
cargo test --manifest-path src-tauri/Cargo.toml
```

`npm run floor` compare au dépôt source `upstream/main`. Après un téléchargement sans historique Git, utiliser un clone pour cette vérification. Les ajouts Kozein sont traduits en français et en anglais ; les autres langues utilisent l’anglais pour ces ajouts. Les traductions héritées sont conservées.

## Origine et licence

- Responsable de cette distribution et des ajouts : **Kozein**.
- Code d’origine Anix : **MaidLover69**, licence MIT. Son historique et son copyright sont conservés.
- Weebox : référence des usages anime, lecture et partage ; aucun code applicatif non public repris.
- [UPSTREAMS.json](UPSTREAMS.json) épingle les deux révisions examinées.
- [LICENSE](LICENSE) et [THIRD-PARTY-NOTICES.md](THIRD-PARTY-NOTICES.md) contiennent les crédits et licences.
- [UPSTREAM-README.md](UPSTREAM-README.md) conserve la documentation originale pour l’historique ; ses téléchargements et versions appartiennent à Anix.

Les textes et couvertures des catalogues appartiennent à leurs ayants droit. Aucune télémétrie ajoutée. Le navigateur contacte Jikan et les hôtes de couvertures pour afficher le catalogue.
