# Lalittletribu — V0.9.12 DEV Tag Price + Gallery

Base : V0.9.11.

Conserve :
- galerie complète Shopify ;
- 2e photo au hover desktop ;
- indicateur du nombre de photos.

Réactive et améliore le test prix PRO :
- lit les tags Shopify ;
- priorité à un tag `PRO_HT_10.00`, `PRO_HT_11.50`, etc. ;
- sinon fallback temporaire actuel : Maxi Cœur = 10 € HT / Cœur = 11,50 € HT ;
- sinon produit non commandable ;
- en DEV uniquement, la quick view affiche la source du prix pro et les tags reçus.

Ne pas pousser en PROD tant que le test Barbara n'est pas validé.
