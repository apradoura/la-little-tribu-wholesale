# Lalittletribu — V0.9.13 Clean

Version propre issue de V0.9.12.

Conservé :
- catalogue Shopify live ;
- galerie complète produit ;
- deuxième photo au hover desktop ;
- indicateur discret du nombre de photos ;
- lecture automatique des tags Shopify `PRO_HT_XX.XX` ;
- un tag prix PRO trouvé est prioritaire ;
- fallback temporaire pour les quelques tarifs déjà connus tant que Barbara n'a pas renseigné tous les tags ;
- panier HT, minimum 300 € HT, franco 500 € HT.

Nettoyé :
- suppression de tous les cadres et textes de diagnostic DEV ;
- suppression de la mention redondante « Nouveauté Lalittletribu » dans la quick view ;
- aucune information technique affichée au prospect.

Workflow recommandé :
1. tester sur DEV apradoura ;
2. vérifier Maxi Coeur Duo = 15 € HT via le tag Shopify ;
3. vérifier un produit sans tag ;
4. si OK : Actions > Deploy to production.
