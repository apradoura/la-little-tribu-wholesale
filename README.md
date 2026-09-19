# La Little Tribu — Wholesale V0.1

Prototype du showroom professionnel La Little Tribu.

## Fonctionnalités
- Landing B2B / Wholesale
- Capture lead : nom, boutique, email, téléphone, localisation
- Tracking de source via UTM / `src`
- Showroom nouveautés
- Variantes + quantités
- Ma sélection
- Export prospect + sélection
- Mode édition Barbara via `?edit=1`

## Mode édition
Ajouter `?edit=1` à l'URL publiée.

Les changements sont actuellement stockés dans le navigateur et peuvent être exportés. Une V0.2 pourra ajouter une édition persistante.

## Déploiement
Le dépôt contient un workflow GitHub Pages. Chaque push sur `main` redéploie automatiquement le prototype.

Dans GitHub : **Settings → Pages → Source: GitHub Actions**.

## Tracking de campagne
Exemples :

- `?utm_source=bijorhca&utm_medium=qr&utm_campaign=wholesale_2026`
- `?src=barbara`

## Suite prévue
1. Connexion produits Shopify
2. Vraies images LLT
3. Stockage persistant des leads
4. Demande de compte B2B
5. Tarifs et catalogues professionnels
6. Relances CRM / automatisées
