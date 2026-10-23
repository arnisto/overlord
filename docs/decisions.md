# Choix techniques, limites et évolutions

[← README](../README.md)

## Choix

**Endpoints de lecture personnalisés plutôt que le `find` natif.**
Le `find` natif applique le sanitizer de Strapi, qui retire toute relation vers un modèle que le rôle ne peut pas lire.
Pour afficher l'auteur, il aurait fallu accorder `users-permissions.user.find` au rôle Public, ce qui publie
l'annuaire complet des membres avec leurs e-mails (`GET /api/users`). Le service construit donc une projection
explicite (pseudo uniquement) avec le Document Service API. Les catégories, sans donnée sensible, utilisent les
endpoints natifs.

**Document Service API pour toute la logique métier.** Création, comptages (`count`), relations par `documentId`,
filtres sur relations : c'est l'API recommandée par Strapi v5, et elle fonctionne aussi bien depuis les services que
depuis le seed.

**Controllers fins, services porteurs de la logique, policies pour l'autorisation.** Chaque couche a une seule raison de
changer : le controller valide l'entrée HTTP, la policy décide si l'appel est permis, le service applique la règle et
persiste.

**Validation yup (`@strapi/utils`).** C'est l'outil utilisé par Strapi lui-même ; `validateYupSchema` produit
directement une `ValidationError` au format standard (`details.errors[].path`), que le frontend sait afficher par champ.

**Permissions et données de démonstration dans `bootstrap`.** Une base neuve est opérationnelle sans clic dans l'admin,
et la configuration des droits est relue en revue de code comme le reste.

**Index déclarés dans les schémas.** `votes.key` et `discussions.slug` sont uniques au niveau PostgreSQL ; l'unicité ne
dépend pas d'une vérification applicative sujette aux accès concurrents.

**Server Actions comme simple relais.** Elles évitent d'exposer Strapi et le JWT au navigateur et donnent des
formulaires qui fonctionnent avec `useActionState`. Elles ne contiennent aucune règle métier, conformément au sujet
(pas de backend parallèle dans Next.js).

**Cache par `fetch` plutôt que `cacheComponents`.** Toutes les pages lisent la session (en-tête) ou les paramètres
d'URL ; le gain de Cache Components serait faible et le modèle `next.revalidate` / `next.tags` + `updateTag` est plus
direct à expliquer et à faire évoluer.

**Filtres dans l'URL, sans état client.** Liens partageables, bouton retour fonctionnel, pas de JavaScript pour filtrer.

**Aucune dépendance ajoutée au-delà de la stack imposée**, hormis l'outillage de test (Vitest, Testing Library,
Playwright) et `server-only` (garantit à la compilation que le client Strapi n'est jamais inclus côté navigateur).

## Limites connues

- Authentification de démonstration : pas d'écran d'inscription ni de mot de passe oublié (l'endpoint
  `POST /api/auth/local/register` de Strapi reste disponible).
- L'auteur d'une question peut choisir sa propre réponse comme meilleure réponse.
- Avec le streaming (`loading.tsx`), une discussion inconnue affiche la page 404 mais la réponse HTTP est envoyée avant
  et porte le statut 200 (comportement de Next.js ; la page contient `noindex`).
- Le contenu est en texte brut (retours à la ligne conservés), sans mise en forme riche ni mentions.

## Évolutions envisagées

1. Connexion avec le compte lerevenu.com (SSO / OIDC) à la place des comptes locaux.
2. Modération : signalements, masquage au-delà d'un seuil, rôle « Rédaction » avec réponses mises en avant.
3. Notifications (réponse à une discussion suivie) et récapitulatif e-mail.
4. Recherche plein texte PostgreSQL (`tsvector`, accents) à la place de `ILIKE`.
5. Limitation du débit des écritures (création de discussions et de réponses) par utilisateur.
6. Éditeur riche (Markdown) avec liste blanche de liens, comme prévu dans la maquette.
