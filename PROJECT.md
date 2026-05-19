# SENA AD — Management Platform

## Project Overview
SENA is a **B2B ad management platform** for GauravGo Games with two distinct user roles: **Brand** users (upload ad media and configure campaign metadata) and **Dev/Admin** users (review ad requests, schedule campaigns, manage missions, update app versions). The project is a React + Vite SPA backed by Firebase Firestore and Storage, with a separate Express API server for game client integration.

## Quick Start

### Frontend
```bash
npm install          # First time only
npm run dev          # Dev server with HMR
npm run build        # Production build → dist/
npm run preview      # Preview production build
npm run lint         # ESLint
```

### API Server (`api/`)
```bash
cd api
npm install
cp .env.example .env  # Fill in Firebase service account credentials
npm run dev           # nodemon — hot reload
npm start             # Production
```

## Architecture

### Routing (`src/App.jsx`)
| Route | Component | Access |
|---|---|---|
| `/` | `LandingPage` | Public marketing page |
| `/login` | `LoginPage` | Role selector + Firestore auth |
| `/brand` | `BrandDashboard` | Protected — role=brand |
| `/dev` | `DevDashboard` | Protected — role=dev |
| `*` | Redirect to `/` | Catch-all fallback |

### Authentication
Custom localStorage session (`sena_session`). `LoginPage` queries the `brands` or `devs` Firestore collection by email + password to authenticate. Session shape: `{ role, email, id, brandName, name }`. `logout()` clears localStorage and redirects to `/`.

> **Note:** There is no Firebase Authentication — credentials are stored in Firestore. Password hashing and migration to Firebase Auth is a planned improvement.

### Frontend File Structure
```
src/
├── App.jsx                           # Router + AuthProvider + ProtectedRoute
├── main.jsx                          # React entry point
├── index.css                         # Tailwind directives + CSS custom properties
├── lib/
│   ├── utils.js                      # cn() helper (clsx + tailwind-merge)
│   ├── firebase.js                   # Firestore + Storage client init
│   ├── uploadMedia.js                # Firebase Storage upload helpers
│   └── adConstants.js                # Shared: PLACEMENT_LABELS, TYPE_LABELS, PROJECT_LABELS, today()
├── data/mockData.js                  # Legacy mock data (unused when USE_MOCK=false)
├── context/AuthContext.jsx           # Session context + login/logout
├── pages/
│   ├── LandingPage.jsx
│   ├── LoginPage.jsx
│   ├── BrandDashboard.jsx
│   └── DevDashboard.jsx
└── components/
    ├── ui/                           # shadcn/ui primitives (CLI-managed)
    ├── brand/                        # Brand dashboard feature components
    │   ├── BrandSidebar.jsx
    │   ├── BrandTopBar.jsx
    │   ├── UploadZone.jsx            # Firebase Storage upload (images + videos)
    │   └── MediaGallery.jsx          # Reads brandMedia/{id}/images|videos from Firestore
    └── dev/                          # Dev dashboard feature components
        ├── DevSidebar.jsx            # 5-item nav
        ├── DevTopBar.jsx
        ├── ManageBrands.jsx          # CRUD brands — live Firestore
        ├── AdRequests.jsx            # Brand media with AD metadata — Run → schedule
        ├── AdOperations.jsx          # Scheduled ad runs — read-only view
        ├── RunScheduleModal.jsx      # Date picker modal, creates adOperations doc
        ├── Missions.jsx              # CRUD daily/weekly missions — live Firestore
        └── AppVersion.jsx            # Update Android/iOS app versions — live Firestore
```

### Backend API Server (`api/`)
A standalone Express server consumed by the game client (not the frontend). Uses Firebase Admin SDK.

```
api/
├── index.js                          # Express app entry point (port 3000)
├── firebaseAdmin.js                  # Admin SDK init from env vars
├── routes/
│   ├── missions.js                   # GET /missions/daily|weekly, POST/PUT/DELETE /missions
│   └── versionRoutes.js              # GET /app-version
└── services/
    ├── missionService.js             # Firestore CRUD for missions collection
    └── versionService.js             # Firestore read for appVersions/config
```

**Auth:** Write endpoints require `x-api-key` header matching `process.env.API_KEY`. Read endpoints are public.

## Firestore Data Model

| Collection / Path | Key Fields |
|---|---|
| `brands/{id}` | `email`, `password`, `brandName`, `name`, `createdAt`, `createdBy` |
| `devs/{id}` | `email`, `password`, `name` |
| `brandMedia/{brandId}/images/{id}` | `fileName`, `url`, `thumbnailUrl`, `ratio`, `adStartDate`, `adEndDate`, `adPlacements[]`, `adType`, `project`, `uploadedAt`, `runStatus` |
| `brandMedia/{brandId}/videos/{id}` | Same as images |
| `adOperations/{id}` | Media snapshot + `opStartDate`, `opEndDate`, `runnedBy`, `runnedAt`, `sourceMediaPath`, `runStatus: 'queued'` |
| `missions/{id}` | `id`, `type` (daily\|weekly), `description`, `active`, `rewards[]`, `createdAt` |
| `appVersions/config` | `android_version`, `ios_version` |

## Dev Dashboard — AD Workflow
1. Brand uploads media and fills in ad metadata (dates, placements, type, project)
2. Dev opens **AD Requests** — sees all brand media with AD metadata, filtered by status (Active / Upcoming / Expired)
3. Dev clicks **Run** on an item → **RunScheduleModal** opens with brand's requested dates pre-filled
4. Dev confirms or adjusts dates → a doc is created in `adOperations` and the source media gets `runStatus: 'queued'`
5. Dev can review all scheduled runs in **AD Operations** (Running / Upcoming / Expired tabs)

> **Mock mode:** `AdRequests.jsx` and `AdOperations.jsx` both have a `USE_MOCK` constant at the top. Set to `false` to switch from mock data to live Firestore.

## Theme & Styling

Dark theme with yellow/amber accent (brand color):

| Variable | Value | Purpose |
|---|---|---|
| `--background` | `hsl(30 5% 6%)` | Warm near-black |
| `--card` | `hsl(30 4% 9%)` | Elevated surface |
| `--primary` | `hsl(42 95% 55%)` | Yellow/amber — brand accent |
| `--foreground` | `hsl(30 5% 93%)` | Light text |
| `--muted-foreground` | `hsl(30 5% 55%)` | Secondary text |
| `--destructive` | `hsl(0 63% 45%)` | Red for errors |
| `--border` | `hsl(30 4% 14%)` | Subtle borders |
| `--radius` | `0.625rem` | Rounded corners |

### Layout Primitives (`src/components/ui/layout.jsx`)
CVA-based components — use these instead of raw Tailwind flex/grid:
- `<Flex>` — direction, align, justify, wrap
- `<Grid>` — cols, gap, animated collapse via `state`
- `<Container>` — maxWidth
- `<Box>` — simple wrapper div

### shadcn/ui
- Config: `components.json` — `tsx: false`, CSS variables enabled, Lucide icons
- Add components: `npx shadcn@latest add <name>`
- `cn()` utility: `src/lib/utils.js`

## API Server Environment Variables
Create `api/.env` with:
```
FIREBASE_PROJECT_ID=
FIREBASE_PRIVATE_KEY_ID=
FIREBASE_PRIVATE_KEY=
FIREBASE_CLIENT_EMAIL=
FIREBASE_CLIENT_ID=
API_KEY=
PORT=3000
```

## Tech Stack
| Category | Technology | Version |
|---|---|---|
| Framework | React | 19.2.5 |
| Build Tool | Vite | 8.0.10 |
| Routing | React Router DOM | 7.14.2 |
| Styling | Tailwind CSS | 3.4.19 |
| UI Components | shadcn/ui | CLI primitives |
| Icons | Lucide React | 1.14.0 |
| Firebase (client) | firebase | 12.12.1 |
| Firebase (server) | firebase-admin | 12.0.0 |
| API Server | Express | 4.18.2 |
| Class Utilities | CVA + clsx + tailwind-merge | — |
| Language | JavaScript (JSX) — no TypeScript | — |

## Conventions
- **File naming:** PascalCase for all `.jsx` components
- **Exports:** Default export for page/feature components
- **State:** Local `useState` — keep it close to where it's used
- **Layout:** Prefer `Flex`/`Grid`/`Container`/`Box` over raw Tailwind flex/grid
- **Colors:** Always use CSS variable utilities (`bg-card`, `text-foreground`) — never hardcoded hex/HSL
- **Icons:** Import from `lucide-react`
- **Shared AD constants:** Import `PLACEMENT_LABELS`, `TYPE_LABELS`, `PROJECT_LABELS`, `today` from `src/lib/adConstants.js`
- **Add new shadcn components:** `npx shadcn@latest add <name>` — don't copy manually

## Known Limitations
- Passwords stored in plaintext in Firestore — Firebase Auth migration is planned
- `AdRequests` and `AdOperations` use `USE_MOCK=true` — switch to `false` to go live
- N+1 Firestore query pattern in `AdRequests.fetchAllMedia` — collectionGroup refactor planned
- Mission ID generation has a race condition under concurrent writes — transaction-based counter planned
- No test suite
- No rate limiting on the Express API public routes
