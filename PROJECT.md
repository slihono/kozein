# Architecture Kozein

`src/main.tsx` détecte Tauri et charge l’une des deux interfaces à la demande.

- **Linux natif** : `src/App.tsx` → `src/router.tsx` → hooks IPC → moteur Rust d’Anix. Le lecteur `src/screens/Reading.tsx` est ajouté aux routes et à la navigation.
- **Navigateur** : `src/WebApp.tsx` → catalogues publics Jikan et AniList, liste locale, lecteur vidéo local et lecteur manga commun. Aucun IPC natif n’est simulé.
- **Lecture commune** : `src/lib/reading.ts` valide et trie les pages ; `readingStore.ts` persiste les images et positions dans IndexedDB.
- **Données et confiance** : les fichiers sont sélectionnés explicitement. Les SVG et le HTML sont refusés à l’import manga. Les liens de partage sont limités aux pages anime HTTPS de MyAnimeList. Les suppressions de volumes demandent une confirmation dans l’interface.
- **Identité** : Kozein, identifiant natif `io.kozein.app`. Copyright d’origine préservé. Les noms techniques `anix_lib`, les formats d’extensions et les anciens schémas sont conservés pour compatibilité.
- **Mises à jour** : aucune mise à jour native tant que `KOZEIN_SITE_URL` n’est pas défini à la compilation. Le répertoire d’extensions conserve sa source d’origine.

## Contrat d’interface

Public : lecteur qui retrouve fréquemment sa liste et sa position. Action principale : découvrir ou reprendre son propre contenu. Direction : bibliothèque calme et dense, couvertures lisibles, marque K, navigation persistante et couleurs issues des thèmes existants. Références : navigation et catalogue du code Anix, usages lecture/partage décrits par Weebox.

Vues de vérification : `390x844`, `960x780`, `1440x900`. Vérifier les neuf thèmes, le clavier, la réduction des animations et les libellés longs. La navigation descend en barre mobile en dessous de 520 px.

États : chargement du catalogue et d’IndexedDB ; bibliothèque vide avec action d’import ; erreur réseau avec réessai ; résultats en cache marqués comme anciens ; réussite d’un ajout/import ; refus du presse-papiers ou du stockage local avec message et solution. Aucune permission système n’est demandée avant la sélection volontaire d’un fichier.

## Tests

`scripts/kozein-test.mjs` utilise `node:test` pour le tri, les limites et refus de pages, les positions, les liens, la lecture d’une liste corrompue, l’adaptateur Jikan et les liens profonds. Les suites héritées sont conservées. Les captures et résultats de la vérification visuelle sont dans `verification/` lorsqu’ils ont été exécutés.
