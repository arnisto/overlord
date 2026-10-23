# Communauté Le Revenu

Espace communautaire des lecteurs du **Revenu** : on y consulte des discussions par catégorie, on ouvre une discussion
pour lire les réponses, on publie des questions et des réponses, on vote « Utile » et l'auteur choisit la meilleure réponse.

**Stack imposée** : Next.js 16 (App Router, React 19, TypeScript, Tailwind CSS 4) · Strapi v5 (TypeScript, API REST) · PostgreSQL 16.

> Réalisé par **LAMJED GAIDI** — lamjed.gaidi070@gmail.com

![Accueil de la communauté](docs/screenshots/frontend-accueil.png)

---

## Sommaire

1. [Ce qui est livré](#ce-qui-est-livré)
2. [Démarrage rapide](#démarrage-rapide)
3. [Architecture](#architecture)
4. [Captures d'écran](#captures-décran)
5. [Tests](#tests)
6. [Structure du dépôt](#structure-du-dépôt)
7. [Documentation détaillée](#documentation-détaillée)

---

## Ce qui est livré

| Exigence du sujet | Réalisation | Où regarder |
| --- | --- | --- |
| **A. Accueil** — discussions issues de Strapi, titre / auteur / catégorie / nb de réponses / date, filtre par catégorie, tri par date, lien vers le détail | Server Component alimenté par `GET /api/discussions` ; filtres, tri, recherche et page dans l'URL | `frontend/src/app/page.tsx` |
| **B. Détail** — URL propre, contenu, auteur, date, catégorie, réponses, publication d'une réponse | `/discussions/[slug]`, réponses triées, formulaire en Server Action enregistré dans PostgreSQL via Strapi | `frontend/src/app/discussions/[slug]` |
| **C. Création** — titre ≥ 10 caractères, contenu obligatoire, catégorie, type, erreurs affichées, redirection | Validation côté navigateur **et** côté Strapi (yup), erreurs Strapi affichées par champ, redirection vers la nouvelle discussion | `backend/src/api/discussion/validation.ts` |
| **D. Utilisateurs et permissions** — auteur obligatoire, refus des anonymes, pas d'usurpation, permissions côté Strapi | Users & Permissions ; auteur imposé par le serveur ; policies `is-authenticated` / `is-not-impersonating` / `is-discussion-author` ; permissions déclarées dans le code | `backend/src/policies`, `backend/src/bootstrap/permissions.ts` |
| **Architecture Strapi** — User, Category, Discussion, Reply, relations, pagination et tri côté serveur, validation, erreurs HTTP cohérentes, Document Service | 4 content types (+ `Vote`), controllers fins, services sur le Document Service API, index PostgreSQL déclarés dans les schémas | [`docs/data-model.md`](docs/data-model.md), [`docs/api.md`](docs/api.md) |
| **Architecture Next.js** — composants réutilisables, appels Strapi centralisés et typés, Server vs Client Components, chargement / erreur / vide, responsive | Client Strapi unique `server-only`, composants client limités aux interactions (formulaires, vote), `loading.tsx` / `error.tsx` / `not-found.tsx` | [`docs/architecture.md`](docs/architecture.md) |
| **Tests** — validation, refus anonyme, usurpation, affichage | 20 tests d'intégration API, 13 tests unitaires frontend, 6 parcours Playwright | [`docs/testing.md`](docs/testing.md) |
| **Livrables** — PostgreSQL, schémas, données de démo, `.env.example`, README | Docker Compose, schémas versionnés, seed automatique (11 catégories, 18 membres, 20 discussions issues de la maquette) | ce fichier |

**Bonus réalisés** : recherche · pagination · votes « Utile » · meilleure réponse · tests Playwright · Docker Compose.

---

## Démarrage rapide

### Option 1 — tout en Docker (recommandé)

```bash
docker compose up --build
```

| Service | URL |
| --- | --- |
| Application | http://localhost:3000 |
| API Strapi | http://localhost:1337/api/discussions |
| Admin Strapi | http://localhost:1337/admin (créer le premier administrateur au premier accès) |
| PostgreSQL | `localhost:5434` — base `lerevenu`, utilisateur / mot de passe `lerevenu` |

Au premier démarrage, Strapi crée les permissions et les données de démonstration.

### Option 2 — en local (Node.js 20.19+ ou 22)

```bash
# 1. PostgreSQL seul (crée aussi la base de test lerevenu_test au premier lancement du volume)
docker compose up -d postgres

# 2. Backend Strapi → http://localhost:1337
cd backend
cp .env.example .env        # puis remplacer les secrets « changeme » (openssl rand -base64 32)
npm install
npm run develop

# 3. Frontend Next.js → http://localhost:3000 (autre terminal)
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

### Comptes de démonstration

Tous les membres créés par le seed partagent le mot de passe `Demo1234!` (variable `DEMO_USER_PASSWORD`) :
`Thomas_PEA`, `Vincent_ETF`, `Odile.Retraite`, `Karim_Immo`, `PapyBoursier`, `LaRedaction`… La page `/connexion` propose
une connexion en un clic.

Pour repartir d'une base vierge : `docker compose down -v` puis relancer.

---

## Architecture

```mermaid
flowchart LR
    U([Lecteur / membre]) -->|HTTP| N

    subgraph N[Next.js 16 · frontend]
        direction TB
        SC[Server Components<br/>pages, listes, détail]
        CC[Client Components<br/>formulaires, vote, meilleure réponse]
        SA[Server Actions<br/>relais du JWT]
        SDK[lib/strapi<br/>client typé server-only]
        CC --> SA
        SC --> SDK
        SA --> SDK
    end

    SDK -->|REST + Bearer JWT| S

    subgraph S[Strapi v5 · backend]
        direction TB
        R[Routes] --> UP[Users & Permissions<br/>rôles Public / Authenticated]
        UP --> P[Policies<br/>authentifié, anti-usurpation, auteur]
        P --> C[Controllers<br/>validation yup]
        C --> SV[Services<br/>Document Service API]
    end

    SV -->|SQL| DB[(PostgreSQL 16)]
```

- **Le navigateur ne parle jamais à Strapi.** Toutes les requêtes passent par le serveur Next.js (Server Components pour
  lire, Server Actions pour écrire) qui ajoute le JWT de l'utilisateur, conservé dans un cookie `httpOnly`.
- **Next.js n'a aucune logique métier** : les Server Actions relaient la requête ; validation, autorisations et
  persistance sont dans Strapi. Next.js n'accède jamais à PostgreSQL.
- **Les règles sont appliquées deux fois côté Strapi** : permissions du rôle (Users & Permissions) puis policies et
  validation dans le controller.

Le parcours « créer une discussion », de bout en bout :

```mermaid
sequenceDiagram
    autonumber
    actor M as Membre
    participant F as Formulaire (Client Component)
    participant A as Server Action createDiscussion
    participant S as Strapi
    participant DB as PostgreSQL

    M->>F: saisit titre, catégorie, type, contenu
    F->>F: validation immédiate (≥ 10 caractères…)
    F->>A: soumission
    A->>S: POST /api/discussions + Bearer JWT
    S->>S: rôle Authenticated autorisé ?
    S->>S: policies is-authenticated, is-not-impersonating
    S->>S: validation yup (400 + erreurs par champ)
    S->>DB: Document Service create (auteur = utilisateur du JWT, slug unique)
    DB-->>S: discussion
    S-->>A: 201 { data }
    A->>A: updateTag("discussions")
    A-->>M: redirection /discussions/{slug}
```

Détails, choix et alternatives écartées : [`docs/architecture.md`](docs/architecture.md) et [`docs/decisions.md`](docs/decisions.md).

### Modèle de données

```mermaid
erDiagram
    USER ||--o{ DISCUSSION : "écrit"
    USER ||--o{ REPLY : "écrit"
    USER ||--o{ VOTE : "donne"
    CATEGORY ||--o{ DISCUSSION : "classe"
    DISCUSSION ||--o{ REPLY : "reçoit"
    DISCUSSION |o--o| REPLY : "meilleure réponse"
    REPLY ||--o{ VOTE : "reçoit"

    CATEGORY {
        string name UK
        uid slug UK
        text description
        string color
        int position
    }
    DISCUSSION {
        string title "10 a 200 caracteres"
        uid slug UK
        text content
        enum type "question ou discussion"
        datetime createdAt
    }
    REPLY {
        text content
        datetime createdAt
    }
    VOTE {
        string key UK "userId:replyId"
    }
    USER {
        string username UK
        string email UK
        string password "hash bcrypt"
    }
```

---

## Captures d'écran

Captures prises sur la stack Docker locale, avec un vrai compte membre **LamjedGaidi** (lamjed.gaidi070@gmail.com)
inscrit via `POST /api/auth/local/register` et un compte administrateur Strapi au même nom.

### Frontend (Next.js)

| Détail d'une discussion : meilleure réponse, votes, réponse | Validation du formulaire de création |
| --- | --- |
| ![Détail](docs/screenshots/frontend-discussion.png) | ![Validation](docs/screenshots/frontend-validation.png) |
| **Connexion (comptes de démo en un clic)** | **Mobile : espaces en défilement, barre basse** |
| ![Connexion](docs/screenshots/frontend-connexion.png) | <img src="docs/screenshots/frontend-mobile.png" alt="Mobile" width="300"> |

### Backend (Strapi v5)

| Réponse de l'API (projection publique, pagination) | Permissions du rôle Authenticated (déclarées dans le code) |
| --- | --- |
| ![API](docs/screenshots/backend-api-json.png) | ![Permissions](docs/screenshots/backend-permissions.png) |
| **Content-Type Builder : Discussion** | **Content Manager : discussions** |
| ![Content type](docs/screenshots/backend-content-type.png) | ![Content Manager](docs/screenshots/backend-content-manager.png) |

![Utilisateurs Users & Permissions](docs/screenshots/backend-users.png)

### Base de données (PostgreSQL)

| Table `discussions` | Table `up_users` (mots de passe hachés bcrypt) |
| --- | --- |
| ![Discussions](docs/screenshots/db-discussions.png) | ![Utilisateurs](docs/screenshots/db-users.png) |

![Structure de la table votes : index unique sur key](docs/screenshots/db-votes-structure.png)

---

## Tests

```mermaid
flowchart LR
    subgraph Backend
        BT[Vitest + fetch<br/>20 tests d'intégration<br/>Strapi réel + PostgreSQL de test]
    end
    subgraph Frontend
        FT[Vitest + Testing Library<br/>13 tests unitaires]
        E2E[Playwright<br/>6 parcours, 1 worker]
    end
```

```bash
# Backend : démarre Strapi en mémoire sur la base lerevenu_test (PostgreSQL doit tourner)
cd backend && npm test

# Frontend : composants, validation, client Strapi
cd frontend && npm test

# Bout en bout : l'application doit tourner (docker compose up)
cd frontend && npx playwright install chromium && npm run e2e
```

Ce que couvrent les tests : [`docs/testing.md`](docs/testing.md).

---

## Structure du dépôt

```
.
├── backend/                     Strapi v5
│   ├── config/                  base de données, plugins (JWT), API
│   ├── src/api/
│   │   ├── category/            endpoints natifs (lecture seule)
│   │   ├── discussion/          controller, service, routes, policy, validation
│   │   ├── reply/               controller, service (votes), routes, validation
│   │   └── vote/                content type
│   ├── src/policies/            is-authenticated, is-not-impersonating
│   ├── src/bootstrap/           permissions des rôles
│   ├── src/seed/                données de démonstration (reprises de la maquette)
│   └── tests/                   tests d'intégration HTTP
├── frontend/                    Next.js 16
│   ├── src/app/                 routes, loading / error / not-found
│   ├── src/components/          composants d'affichage et de formulaire
│   ├── src/lib/strapi/          client, requêtes et types de l'API
│   ├── src/lib/actions/         Server Actions
│   ├── tests/unit/              Vitest
│   └── e2e/                     Playwright
├── docker/postgres-init/        création de la base de test
├── docs/                        documentation détaillée et captures
└── docker-compose.yml
```

---

## Documentation détaillée

| Document | Contenu |
| --- | --- |
| [`docs/architecture.md`](docs/architecture.md) | Flux de données, Server vs Client Components, cache et revalidation, gestion des erreurs |
| [`docs/data-model.md`](docs/data-model.md) | Content types, relations, contraintes et index PostgreSQL |
| [`docs/api.md`](docs/api.md) | Endpoints, paramètres, formats de réponse et codes d'erreur (exemples réels) |
| [`docs/security.md`](docs/security.md) | Authentification, permissions, policies, anti-usurpation |
| [`docs/testing.md`](docs/testing.md) | Stratégie et inventaire des tests |
| [`docs/decisions.md`](docs/decisions.md) | Choix techniques, limites connues et pistes d'évolution |
