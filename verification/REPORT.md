# Vérification Kozein 1.0.0

Date : 4 novembre 2026. Environnement local : Windows, Node.js 24.22.1, Vite 6.4.5.

| Contrôle | Résultat |
|---|---|
| Compilation TypeScript et frontend | Réussite |
| Traductions | 1 897 clés cohérentes dans les 12 catalogues ; nouveaux textes FR/EN |
| Tests ajoutés Kozein | 11 réussis |
| Suites héritées | i18n, lecteur, historique, routes, séances partagées et 8 tests d’archives réussis |
| Garde de qualité | 14 tests réussis ; comparaison au code Anix d’origine propre |
| Audit npm | 0 vulnérabilité après mise à jour de React Router et des dépendances de compilation |
| Secrets dans le code préparé | Aucun secret détecté par la recherche ciblée |

## Vérifications dans le navigateur

- Catalogue réel chargé via AniList lorsque Jikan ne répond pas ; couvertures et 24 fiches affichées.
- Ajout d’Attack on Titan à la liste, rechargement et conservation de l’entrée ; ouverture de la fiche et copie du lien de partage vérifiées.
- Import de trois images locales de la marque Kozein comme données de test ; ordre naturel 1, 2, 10 ; progression jusqu’à la page 2 puis reprise après rechargement ; flèche clavier et Échap vérifiés.
- Refus d’un SVG à l’import sans perte du volume enregistré.
- Neuf thèmes vérifiés à 960 × 780 sans débordement horizontal ; captures `theme-*.jpg` et observations de couleurs dans `theme-observations.json`.
- Fenêtre large 1440 × 900 et mobile 390 × 844 vérifiées sur l’interface rendue. Sur mobile : absence de débordement, liens de navigation de 53 px de haut, volume ouvert. La capture mobile est indisponible dans l’outil ; le DOM rendu et les mesures sont conservés dans `mobile-390-dom.txt`.

Les captures montrent des données de catalogue publiques et des images de test créées pour Kozein. Elles ne contiennent aucun compte de suivi connecté.

## Limites précises

- Le moteur Rust et les paquets Linux n’ont pas été compilés localement : l’environnement Windows ne fournit ni Rust ni WebKitGTK. Les workflows Linux hérités sont conservés pour la validation sur GitHub. Aucune compatibilité native Windows, Android ou iOS n’est annoncée.
- Le repli vers un catalogue en cache après une panne totale, le refus du presse-papiers et l’échec de quota IndexedDB n’ont pas été exercés visuellement. Les refus de formats et les erreurs de catalogue sont couverts par les tests ; cela ne remplace pas ces vérifications visuelles.
- Le réglage système de réduction des animations et le décodage de tous les formats vidéo n’ont pas été exercés. Les règles CSS de réduction des animations sont présentes ; les formats vidéo dépendent du navigateur.
- Le code applicatif Weebox n’est pas public dans le dépôt examiné. Ce projet conserve Anix comme base et recrée une partie des usages de lecture et de bibliothèque ; il ne revendique pas une fusion du code indisponible.

## Revue ECC

Exactitude : 4/5, compilation et tests vérifiés, moteur natif restant à valider sur Linux. Complétude : 3/5, la source Weebox indisponible empêche une fusion littérale et les binaires mobiles ne sont pas produits. Clarté : 4/5, README et tableau des fonctions distinguent les interfaces. Utilisabilité : 4/5, interface web et lanceur local fournis. Concision : 4/5, documentation détaillée limitée aux fichiers du projet. Moyenne : 3,8/5.

Améliorations prioritaires : terminer la validation Linux, puis exercer les erreurs de stockage et le cache hors ligne dans un navigateur de test, puis étudier un port natif Windows/mobile si demandé. Les limites sont exposées dans le README et ne sont pas présentées comme des fonctions livrées.
