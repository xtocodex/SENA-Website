# SENA — Ad Management Platform

> A B2B advertising management platform for GauravGo Games. Enables brand partners to upload and configure ad campaigns, while internal dev/admin teams review, schedule, and operate ad runs.

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Frontend Setup](#frontend-setup)
  - [API Server Setup](#api-server-setup)
- [Project Structure](#project-structure)
- [Architecture](#architecture)
  - [Authentication](#authentication)
  - [Routing](#routing)
  - [Ad Workflow](#ad-workflow)
  - [Firestore Data Model](#firestore-data-model)
- [API Reference](#api-reference)
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

The frontend is a React + Vite SPA connected to Firebase Firestore and Storage. A separate Express API server handles game client integration via Firebase Admin SDK.

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
| Firebase (server) | firebase-admin | 12.0.0 |
| API Server | Express | 4.18.2 |
| Utilities | CVA + clsx + tailwind-merge | — |
| Language | JavaScript (JSX) — no TypeScript | — |

---

## Getting Started

### Prerequisites

- Node.js 20+
- A Firebase project with Firestore and Storage enabled
- Firebase service account credentials (for the API server)

### Frontend Setup

```bash
npm install
npm run dev        # Dev server at http://localhost:5173
npm run build      # Production build → dist/
npm run preview    # Preview production build locally
npm run lint       # ESLint
```

### API Server Setup

```bash
cd api
npm install
cp .env.example .env   # Fill in Firebase service account credentials
npm run dev            # Development with nodemon (hot reload)
npm start              # Production
```

---

## Project Structure

```
.
├── src/
│   ├── App.jsx                      # Router + AuthProvider + ProtectedRoute
│   ├── main.jsx                     # React entry point
│   ├── index.css                    # Tailwind directives + CSS custom properties
│   ├── lib/
│   │   ├── firebase.js              # Firestore + Storage client init
│   │   ├── uploadMedia.js           # Firebase Storage upload helpers
│   │   ├── adConstants.js           # Shared: PLACEMENT_LABELS, TYPE_LABELS, PROJECT_LABELS
│   │   └── utils.js                 # cn() helper (clsx + tailwind-merge)
│   ├── context/
│   │   └── AuthContext.jsx          # Session context + login/logout
│   ├── pages/
│   │   ├── LandingPage.jsx
│   │   ├── LoginPage.jsx
│   │   ├── BrandDashboard.jsx
│   │   └── DevDashboard.jsx
│   └── components/
│       ├── ui/                      # shadcn/ui primitives (CLI-managed)
│       ├── brand/                   # Brand dashboard feature components
│       │   ├── BrandSidebar.jsx
│       │   ├── BrandTopBar.jsx
│       │   ├── UploadZone.jsx       # Firebase Storage upload (images + videos)
│       │   └── MediaGallery.jsx
│       └── dev/                     # Dev dashboard feature components
│           ├── DevSidebar.jsx
│           ├── DevTopBar.jsx
│           ├── ManageBrands.jsx
│           ├── AdRequests.jsx
│           ├── AdOperations.jsx
│           ├── RunScheduleModal.jsx
│           ├── Missions.jsx
│           └── AppVersion.jsx
└── api/
    ├── index.js                     # Express entry point (port 3000)
    ├── firebaseAdmin.js             # Admin SDK init from env vars
    ├── routes/
    │   ├── missions.js              # Mission CRUD routes
    │   └── versionRoutes.js        # App version routes
    └── services/
        ├── missionService.js
        └── versionService.js
```

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

---

## API Reference

Base URL: `http://localhost:3000`

**Authentication:** Write endpoints require the `x-api-key` header matching `process.env.API_KEY`. Read endpoints are public.

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/missions/daily` | — | Fetch active daily missions |
| `GET` | `/missions/weekly` | — | Fetch active weekly missions |
| `POST` | `/missions` | Required | Create a mission |
| `PUT` | `/missions/:id` | Required | Update a mission |
| `DELETE` | `/missions/:id` | Required | Delete a mission |
| `GET` | `/app-version` | — | Get current Android/iOS versions |

---

## Environment Variables

Create `api/.env` from `api/.env.example`:

```env
FIREBASE_PROJECT_ID=
FIREBASE_PRIVATE_KEY_ID=
FIREBASE_PRIVATE_KEY=
FIREBASE_CLIENT_EMAIL=
FIREBASE_CLIENT_ID=
API_KEY=
PORT=3000
```

> `FIREBASE_PRIVATE_KEY` must include literal `\n` newlines as provided by the Firebase service account JSON.

---

## Docker

Two separate Dockerfiles are provided:

**Frontend** (project root) — builds the React app and serves it via Nginx on port 8080:
```bash
docker build -t sena-frontend .
docker run -p 8080:8080 sena-frontend
```

**API Server** (`api/`) — runs the Express server on port 8080:
```bash
cd api
docker build -t sena-api .
docker run --env-file .env -p 3000:8080 sena-api
```

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
- No rate limiting on public API routes
