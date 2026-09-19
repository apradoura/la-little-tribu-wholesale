# La Little Tribu Wholesale — V0.3

## Nouveauté principale
Le front tente maintenant de charger directement la collection Shopify :
`https://lalittletribu.fr/collections/nouveautes/products.json?limit=250`

Si l'appel cross-origin est accepté par Shopify :
- titres
- prix
- variantes
- liens produits
- vraies images Shopify

sont utilisés automatiquement.

Si le navigateur bloque CORS, le front retombe sur `products.json`.
Le bandeau en haut indique alors `Catalogue local`.

## Test
Après déploiement, regarder en haut :
- `Catalogue LLT live` = connexion directe réussie.
- `Catalogue local` = CORS bloqué ; prochaine étape = synchronisation via GitHub Action / backend.

## Sécurité
Aucune donnée sensible, aucun prix wholesale, aucune clé Shopify.
