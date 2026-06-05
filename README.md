# SENA — Ad Management Platform

> A B2B advertising management platform for GauravGo Games. Enables brand partners to upload and configure ad campaigns, while internal dev/admin teams review, schedule, and operate ad runs.

---

## Table of Contents

- [Overview](#overview)
- [Related Repositories](#related-repositories)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Frontend Setup](#frontend-setup)
- [Project Structure](#project-structure)
- [Architecture](#architecture)
  - [Authentication](#authentication)
  - [Routing](#routing)
  - [Ad Workflow](#ad-workflow)
  - [Firestore Data Model](#firestore-data-model)
- [Game API](#game-api)
- [Environment Variables](#environment-variables)
- [Docker](#docker)
- [Conventions](#conventions)
- [Known Limitations](#known-limitations)

---

## Overview

SENA is a role-based SPA with two user types:

| Role | Capabilities |
|---|---|
| **Brand** | Upload ad media (images/videos), configure campaign metadata (dates, placements, type, project) |
| **Dev / Admin** | Review ad requests, schedule ad runs, manage missions, update app versions, manage brand accounts |

The frontend is a React + Vite SPA connected to Firebase Firestore and Storage. The game-client API (missions, players, app version) lives in its **own repository** and deploys independently to Cloud Run — see [Related Repositories](#related-repositories).

---

## Related Repositories

| Repo | Purpose | Deploys to |
|---|---|---|
| **this repo** (`SENA-Website`) | React + Vite web app (brand + dev dashboards) | Cloud Run / Netlify |
| [`xtocodex/sena-missions-api`](https://github.com/xtocodex/sena-missions-api) | Express + Firebase Admin API for the game client (missions, players, app version) | Cloud Run `sena-missions-api` (us-central1) — auto-deploys on push to `main` |

The two are linked only over **HTTP** (the website calls the API's Cloud Run URL) and by sharing the **same Firebase/Firestore project** (`crucial-summer-456605-p8`). They have no shared code. See [Game API](#game-api).

---

## Tech Stack

| Category | Technology | Version |
|---|---|---|
| Framework | React | 19.2.5 |
| Build Tool | Vite | 8.0.10 |
| Routing | React Router DOM | 7.14.2 |
| Styling | Tailwind CSS | 3.4.19 |
| UI Components | shadcn/ui | CLI-managed |
| Icons | Lucide React | 1.14.0 |
| Firebase (client) | firebase | 12.12.1 |
| Utilities | CVA + clsx + tailwind-merge | — |
| Language | JavaScript (JSX) — no TypeScript | — |

---

## Getting Started

### Prerequisites

- Node.js 20+
- A Firebase project with Firestore and Storage enabled

### Frontend Setup

```bash
npm install
npm run dev        # Dev server at http://localhost:5173
npm run build      # Production build → dist/
npm run preview    # Preview production build locally
npm run lint       # ESLint
```

---

## Project Structure

```
.
└── src/
    ├── App.jsx                      # Router + AuthProvider + ProtectedRoute
    ├── main.jsx                     # React entry point
    ├── index.css                    # Tailwind directives + CSS custom properties
    ├── lib/
    │   ├── firebase.js              # Firestore + Storage client init
    │   ├── uploadMedia.js           # Firebase Storage upload helpers
    │   ├── adConstants.js           # Shared: PLACEMENT_LABELS, TYPE_LABELS, PROJECT_LABELS
    │   └── utils.js                 # cn() helper (clsx + tailwind-merge)
    ├── context/
    │   └── AuthContext.jsx          # Session context + login/logout
    ├── pages/
    │   ├── LandingPage.jsx
    │   ├── LoginPage.jsx
    │   ├── BrandDashboard.jsx
    │   └── DevDashboard.jsx
    └── components/
        ├── ui/                      # shadcn/ui primitives (CLI-managed)
        ├── brand/                   # Brand dashboard feature components
        │   ├── BrandSidebar.jsx
        │   ├── BrandTopBar.jsx
        │   ├── UploadZone.jsx       # Firebase Storage upload (images + videos)
        │   └── MediaGallery.jsx
        └── dev/                     # Dev dashboard feature components
            ├── DevSidebar.jsx
            ├── DevTopBar.jsx
            ├── ManageBrands.jsx
            ├── AdRequests.jsx
            ├── AdOperations.jsx
            ├── RunScheduleModal.jsx
            ├── Missions.jsx
            └── AppVersion.jsx
```

> The game API source lives in the separate [`sena-missions-api`](https://github.com/xtocodex/sena-missions-api) repo.

---

## Architecture

### Authentication

Custom session stored in `localStorage` under the key `sena_session`. `LoginPage` queries the `brands` or `devs` Firestore collection by email + password to authenticate.

Session shape:
```json
{ "role": "brand | dev", "email": "", "id": "", "brandName": "", "name": "" }
```

`logout()` clears `localStorage` and redirects to `/`.

> **Note:** There is no Firebase Authentication — credentials are stored directly in Firestore. Migration to Firebase Auth with proper password hashing is a planned improvement.

### Routing

| Route | Component | Access |
|---|---|---|
| `/` | `LandingPage` | Public |
| `/login` | `LoginPage` | Public |
| `/brand` | `BrandDashboard` | Protected — `role=brand` |
| `/dev` | `DevDashboard` | Protected — `role=dev` |
| `*` | Redirect → `/` | Catch-all |

### Ad Workflow

1. Brand uploads media and fills in ad metadata (dates, placements, type, project)
2. Dev opens **Ad Requests** — views all brand media filtered by status (Active / Upcoming / Expired)
3. Dev clicks **Run** → `RunScheduleModal` opens with the brand's requested dates pre-filled
4. Dev confirms or adjusts dates → a document is created in `adOperations` and source media gets `runStatus: 'queued'`
5. Dev reviews all scheduled runs in **Ad Operations** (Running / Upcoming / Expired tabs)

### Firestore Data Model

| Collection / Path | Key Fields |
|---|---|
| `brands/{id}` | `email`, `password`, `brandName`, `name`, `createdAt`, `createdBy` |
| `devs/{id}` | `email`, `password`, `name` |
| `brandMedia/{brandId}/images/{id}` | `fileName`, `url`, `thumbnailUrl`, `ratio`, `adStartDate`, `adEndDate`, `adPlacements[]`, `adType`, `project`, `uploadedAt`, `runStatus` |
| `brandMedia/{brandId}/videos/{id}` | Same schema as images |
| `adOperations/{id}` | Media snapshot + `opStartDate`, `opEndDate`, `runnedBy`, `runnedAt`, `sourceMediaPath`, `runStatus: 'queued'` |
| `missions/{id}` | `id`, `type` (daily\|weekly), `description`, `active`, `rewards[]`, `createdAt` |
| `appVersions/config` | `android_version`, `ios_version` |

> The `missions`, `players`, and `appVersions` collections are also read/written by the [`sena-missions-api`](https://github.com/xtocodex/sena-missions-api) service via the Firebase Admin SDK.

---

## Game API

The game-client API (missions, players, app version) is maintained in a **separate repository** and deployed to Cloud Run:

- **Repo:** [`xtocodex/sena-missions-api`](https://github.com/xtocodex/sena-missions-api)
- **Base URL (prod):** `https://sena-missions-api-332405485338.us-central1.run.app`
- **Endpoint reference:** see that repo's `README.md`

If/when the website needs to call the API, set the base URL via a Vite env var and read it with `import.meta.env.VITE_API_BASE_URL` — **never** hardcode the URL or embed the API write-key (`x-api-key`) in frontend code. Public reads (`/missions/daily`, `/app-version`) need no auth; writes should stay behind the Firebase SDK + Firestore rules (as the dashboard does today) or a server-side proxy.

---

## Environment Variables

The frontend's Firebase web config lives in `src/lib/firebase.js` (public web keys — safe to ship). Optional Vite env (`.env`, see `.env.example`):

```env
# Base URL of the game API — only needed if/when the dashboard calls it directly.
VITE_API_BASE_URL=https://sena-missions-api-332405485338.us-central1.run.app
```

The API server's own secrets (`FIREBASE_*`, `API_KEY`) live in the [`sena-missions-api`](https://github.com/xtocodex/sena-missions-api) repo and on its Cloud Run service — not here.

---

## Docker

**Frontend** (project root) — builds the React app and serves it via Nginx on port 8080:
```bash
docker build -t sena-frontend .
docker run -p 8080:8080 sena-frontend
```

The API server has its own Dockerfile in the [`sena-missions-api`](https://github.com/xtocodex/sena-missions-api) repo.

---

## Conventions

- **File naming:** PascalCase for all `.jsx` components
- **Exports:** Default export for page/feature components
- **State:** Local `useState` — keep state close to where it's used
- **Layout:** Use `<Flex>`, `<Grid>`, `<Container>`, `<Box>` from `src/components/ui/layout.jsx` instead of raw Tailwind flex/grid utilities
- **Colors:** Always use CSS variable utilities (`bg-card`, `text-foreground`) — never hardcoded hex or HSL values
- **Icons:** Import exclusively from `lucide-react`
- **Shared AD constants:** Import `PLACEMENT_LABELS`, `TYPE_LABELS`, `PROJECT_LABELS`, `today` from `src/lib/adConstants.js`
- **shadcn components:** Add via `npx shadcn@latest add <name>` — do not copy manually

---

## Known Limitations

- Passwords are stored in plaintext in Firestore — Firebase Auth migration is planned
- `AdRequests` and `AdOperations` have a `USE_MOCK` flag at the top of each file — set to `false` to switch from mock data to live Firestore
- N+1 Firestore query pattern in `AdRequests.fetchAllMedia` — a `collectionGroup` refactor is planned
- Mission ID generation has a race condition under concurrent writes — transaction-based counter is planned
- No test suite
