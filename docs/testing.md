# Tests

[← README](../README.md)

| Niveau | Outil | Fichiers | Nombre |
| --- | --- | --- | --- |
| Intégration API | Vitest + `fetch` sur une vraie instance Strapi et PostgreSQL | `backend/tests/*.test.ts` | 20 |
| Unitaires frontend | Vitest + Testing Library (jsdom) | `frontend/tests/unit/*` | 13 |
| Bout en bout | Playwright (Chromium, 1 worker) | `frontend/e2e/*.spec.ts` | 6 |

## Backend — `cd backend && npm test`

`tests/global-setup.ts` compile et démarre Strapi en mémoire sur la base **`lerevenu_test`** (port 1338), avec les
données de démonstration. Les tests passent par HTTP, exactement comme le frontend. Prérequis : PostgreSQL lancé
(`docker compose up -d postgres`) ; la base de test est créée par `docker/postgres-init/01-test-db.sql` à la première
initialisation du volume.

| Exigence du sujet | Tests |
| --- | --- |
| Validation d'une discussion | titre < 10 caractères → 400 sur `title` ; espaces autour du titre ignorés ; contenu vide, type inconnu → 400 ; catégorie inexistante → 400 |
| Refus d'une publication non authentifiée | création de discussion / réponse sans jeton → 403 ; jeton invalide → 401 ; meilleure réponse anonyme → 403 |
| Protection contre l'usurpation d'auteur | `author` = id, documentId ou objet d'un autre membre → 403 `PolicyError` ; l'auteur enregistré est toujours l'appelant |
| Affichage des discussions | pagination, champs publics de l'auteur uniquement, tri croissant / décroissant, filtre par catégorie, recherche, tri et taille de page refusés hors contrat, 404 |
| Bonus | slug unique (`-2`), vote ajouté puis retiré, vote sur sa propre réponse refusé, meilleure réponse réservée à l'auteur et limitée aux réponses de la discussion |

## Frontend — `cd frontend && npm test`

- `DiscussionCard` : titre (lien vers le slug), auteur, catégorie, nombre de réponses, statut résolu, date relative ;
- `NewDiscussionForm` : erreurs affichées sans appel serveur, présélection de la catégorie ;
- `validation.ts` : mêmes règles que Strapi ;
- `search-params.ts` : normalisation des paramètres d'URL et construction des liens ;
- `strapi/client.ts` : en-tête `Authorization`, conversion des erreurs Strapi en erreurs par champ.

## Bout en bout — `cd frontend && npm run e2e`

Application lancée au préalable (`docker compose up`). Parcours :

1. l'accueil affiche les discussions de Strapi et filtre par catégorie ;
2. ouverture du détail d'une discussion depuis une recherche ;
3. un visiteur qui veut publier est redirigé vers la connexion ;
4. page 404 pour un slug inconnu ;
5. connexion → erreurs de validation → création → redirection → réponse → la discussion est en tête de l'accueil ;
6. vote « Utile » ajouté puis retiré, confirmé après rechargement.

## Vérifications statiques

```bash
cd backend && npx tsc --noEmit
cd frontend && npm run typecheck && npm run lint
```
