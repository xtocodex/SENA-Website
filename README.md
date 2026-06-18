# SENA — Ad Management Platform

> A B2B advertising management platform for GauravGo Games. Brand partners upload and configure ad campaigns, players redeem reward coupons, and the internal dev/admin team reviews applications, schedules ad runs, and manages the game economy.

---

## Table of Contents

- [Overview](#overview)
- [Related Repositories](#related-repositories)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Architecture](#architecture)
  - [Authentication](#authentication)
  - [Routing](#routing)
  - [Brand Onboarding](#brand-onboarding)
  - [Rewards & Coupons](#rewards--coupons)
  - [Ad Workflow](#ad-workflow)
  - [Firestore Data Model](#firestore-data-model)
- [Game API](#game-api)
- [Environment Variables](#environment-variables)
- [Docker & Deploy](#docker--deploy)
- [Conventions](#conventions)
- [Known Limitations](#known-limitations)

---

## Overview

SENA is a role-based SPA with **three** user types:

| Role | Auth | Capabilities |
|---|---|---|
| **Player** | Firebase Auth (Google) | View game rewards (coins + stats), browse the coupon catalog, redeem coupons |
| **Brand** | Firebase Auth (Google) | Apply for an account; once approved, upload ad media and configure campaign metadata |
| **Dev / Admin** | Firestore `devs` lookup (email + password) | Review brand applications & ad requests, schedule ad runs, curate the coupon catalog, settle player coins, manage missions & app versions |

The frontend is a React 19 + Vite 8 SPA connected to **Firebase Firestore, Storage, and Authentication**. The game-client API (missions, players, app version) lives in its **own repository** and deploys independently to Cloud Run — see [Related Repositories](#related-repositories).

---

## Related Repositories

| Repo | Purpose | Deploys to |
|---|---|---|
| **this repo** (`SENA-Website`) | React + Vite web app (player, brand & dev dashboards) | Netlify / Cloud Run (Nginx) |
| [`xtocodex/sena-missions-api`](https://github.com/xtocodex/sena-missions-api) | Express + Firebase Admin API for the game client (missions, players, app version) | Cloud Run `sena-missions-api` (us-central1) — auto-deploys on push to `main` |

The two are linked only over **HTTP** and by sharing the **same Firebase project** (`crucial-summer-456605-p8`). They have no shared code.

---

## Tech Stack

| Category | Technology | Version |
|---|---|---|
| Framework | React | 19.2.5 |
| Build Tool | Vite | 8.0.10 |
| Routing | React Router DOM | 7.14.2 |
| Styling | Tailwind CSS | 3.4.19 |
| UI Components | shadcn/ui (Radix primitives) | CLI-managed |
| Icons | Lucide React | 1.14.0 |
| Toasts | sonner | 2.0.7 |
| Date picker | react-day-picker | 10.0.1 |
| Firebase (client) | firebase (Firestore + Storage + Auth) | 12.12.1 |
| Utilities | CVA + clsx + tailwind-merge | — |
| Language | JavaScript (JSX) — no TypeScript | — |

---

## Getting Started

### Prerequisites
- Node.js 20+
- A Firebase project with Firestore, Storage, and Authentication (Google provider) enabled

### Frontend Setup
```bash
npm install
npm run dev        # Dev server at http://localhost:5173
npm run build      # Production build → dist/
npm run preview    # Preview production build locally
npm run lint       # ESLint (runs on defaults — no config file in repo)
```

No test or typecheck scripts are configured.

---

## Project Structure

```
.
└── src/
    ├── App.jsx                     # Router + AuthProvider + ProtectedDevRoute
    ├── main.jsx                    # React entry point
    ├── index.css                  # Tailwind directives + CSS custom properties
    ├── lib/
    │   ├── firebase.js            # Firestore + Storage + Auth + GoogleAuthProvider init
    │   ├── uploadMedia.js         # Brand ad-media upload helpers
    │   ├── adConstants.js         # PLACEMENT_LABELS, TYPE_LABELS, PROJECT_LABELS, today()
    │   ├── brandRequest.js        # brand_requests + brands; sample uploads
    │   ├── userAccount.js         # users collection (players): ensureUserDoc, subscribe, updateUser
    │   ├── rewards.js             # reward_brands catalog + coupon_requests
    │   └── utils.js               # cn() helper (clsx + tailwind-merge)
    ├── context/AuthContext.jsx    # Session context + login/logout
    ├── pages/                     # LandingPage, LoginPage, BrandGate, BrandRegister,
    │                             #   BrandStatus, BrandDashboard, UserGate, UserDashboard, DevDashboard
    └── components/
        ├── ui/                    # shadcn/ui primitives + layout.jsx (Flex/Grid/Container/Box)
        ├── brand/                 # BrandSidebar, BrandTopBar, UploadZone, MediaGallery, AdMetadataModal
        ├── user/                  # UserSidebar, UserTopBar, UserOverview, RewardsGrid, RedeemModal, MyRequests
        └── dev/                   # DevSidebar, DevTopBar, ManageBrands, BrandRequests, BrandDetailsDialog,
                                   #   AdRequests, AdOperations, RunScheduleModal, Missions, AppVersion,
                                   #   Players, CouponManagement, CouponRequests, RewardBrands
```

> The game API source lives in the separate [`sena-missions-api`](https://github.com/xtocodex/sena-missions-api) repo. See [`PROJECT.md`](PROJECT.md) for the full architecture deep-dive.

---

## Architecture

### Authentication

Three mechanisms, mirrored into a `localStorage` session under `sena_session` (`AuthContext`), shape `{ role, email, id, brandName, name }`:

- **Player & Brand** authenticate via **Firebase Auth Google sign-in** (`signInWithPopup`). Their gates (`UserGate` / `BrandGate`) react to `onAuthStateChanged`.
- **Dev** authenticates via a **Firestore `devs` lookup** by email + password (plaintext) in `LoginPage`.

`logout()` clears `localStorage`, resets context, redirects to `/`, and calls Firebase `signOut()` when a Firebase user is present.

> **Note:** Player and Brand use real Firebase Authentication. Only **Dev** still relies on a plaintext Firestore credential lookup — migrating Dev to Firebase Auth (with a `dev` custom claim) is planned and is what unlocks tightening `firestore.rules`.

### Routing

| Route | Component | Access |
|---|---|---|
| `/` | `LandingPage` | Public |
| `/login` | `LoginPage` | Public (Player / Brand / Dev selector) |
| `/brand` | `BrandGate` | Firebase Auth gate → register / status / dashboard |
| `/user` | `UserGate` | Firebase Auth gate → player dashboard |
| `/dev` | `DevDashboard` | Protected — `ProtectedDevRoute` requires `role=dev` |
| `*` | Redirect → `/` | Catch-all |

### Brand Onboarding

1. Brand signs in with Google (`BrandRegister`), establishing a Firebase `uid`.
2. `BrandGate` watches `brand_requests/{uid}` and `brands/{uid}`.
3. No request → a 3-step form (company details + ≥1 sample image and video uploaded to Storage) creates `brand_requests/{uid}` with `status: 'pending'`.
4. **Pending/Rejected** → `BrandStatus` (rejected shows feedback + resubmit).
5. Dev approves in **Brand Requests** → `brands/{uid}` (`status: 'approved'`) → `BrandDashboard` opens and the session is seeded as `role: 'brand'`.

### Rewards & Coupons

Players see their `coins` and `stats` (currently mock) on **Overview**, browse Dev-curated brands on **Rewards**, and redeem via **RedeemModal**, which creates a `coupon_requests` doc. **v1 is track-only:** the UI guards `coins >= cost` but performs **no automatic coin debit**. Dev approves/rejects in **Coupon Requests** (approval decrements `reward_brands.availableCoupons`) and settles coins manually via the **Players** panel.

### Ad Workflow

1. Brand uploads media and fills in ad metadata (dates, placements, type, project).
2. Dev opens **Ad Requests** — brand media filtered by status (Active / Upcoming / Expired).
3. Dev clicks **Run** → `RunScheduleModal` opens with the brand's requested dates pre-filled.
4. Dev confirms/adjusts → a document is created in `adOperations` and the source media gets `runStatus: 'queued'`.
5. Dev reviews scheduled runs in **Ad Operations** (Running / Upcoming / Expired). `USE_MOCK` is now `false` (live Firestore).

### Firestore Data Model

Security rules live in `firestore.rules` (currently **permissive** pending the Dev → Firebase Auth migration).

| Collection / Path | Key Fields |
|---|---|
| `brand_requests/{uid}` | company details, `phone`, `email`, `sampleImages[]`/`sampleVideos[]` (+ storage paths), `status`, `feedback`, `reviewedAt/By/ById`, `createdAt` |
| `brands/{uid}` | Approved brand profile + `status: 'approved'`, keyed by Firebase Auth `uid` |
| `brandMedia/{uid}/images\|videos/{id}` | `fileName`, `url`, `thumbnailUrl`, `ratio`, `adStartDate`, `adEndDate`, `adPlacements[]`, `adType`, `project`, `uploadedAt`, `runStatus` |
| `adOperations/{id}` | Media snapshot + `opStartDate`, `opEndDate`, `runnedBy`, `runnedAt`, `sourceMediaPath`, `runStatus: 'queued'` |
| `devs/{id}` | `email`, `password` (plaintext), `name` — client write denied |
| `users/{uid}` | `email`, `name`, `photoURL`, `role: 'user'`, `coins`, `stats`, `optionalData`, `createdAt` (website player accounts) |
| `reward_brands/{id}` | `name`, `active`, `availableCoupons`, `denominations[] { value, coinCost }`, timestamps |
| `coupon_requests/{id}` | `userId`, `brandId`, `denomination`, `coinCost`, `quantity`, `status`, `message`, `processedBy/ById/At`, `createdAt` |
| `missions/{id}` | `id`, `type`, `description`, `active`, `rewards[]`, `value`, `createdAt` |
| `appVersions/config` | `android_version`, `ios_version` |
| `demoRequests/{id}` | Landing-page demo form submissions |
| `players/{playerId}` | **Game API only** (firebase-admin); web client read/write denied — distinct from `users` |

> **`users` vs `players`:** the website's player accounts are in **`users`**; the Game API's **`players`** collection is separate and never touched by the web app. The `missions` and `appVersions` collections are read/written by both the dashboard and the [`sena-missions-api`](https://github.com/xtocodex/sena-missions-api) service.

---

## Game API

The game-client API (missions, players, app version) is maintained in a **separate repository** and deployed to Cloud Run:

- **Repo:** [`xtocodex/sena-missions-api`](https://github.com/xtocodex/sena-missions-api)
- **Base URL (prod):** `https://sena-missions-api-332405485338.us-central1.run.app`
- **Endpoint reference:** see that repo's `README.md` and `docs/`

If/when the website calls the API, set the base URL via a Vite env var (`import.meta.env.VITE_API_BASE_URL`) — **never** hardcode the URL or embed the API write-key (`x-api-key`) in frontend code.

---

## Environment Variables

The frontend's Firebase web config (public web keys — safe to ship) is hardcoded in `src/lib/firebase.js`. Optional Vite env (`.env`, see `.env.example`):

```env
# Base URL of the game API — only needed if/when the dashboard calls it directly.
VITE_API_BASE_URL=https://sena-missions-api-332405485338.us-central1.run.app
```

The API server's own secrets (`FIREBASE_*`, `API_KEY`) live in the [`sena-missions-api`](https://github.com/xtocodex/sena-missions-api) repo and on its Cloud Run service — not here.

---

## Docker & Deploy

**Frontend** (project root) — builds the React app and serves it via Nginx on port 8080:
```bash
docker build -t sena-frontend .
docker run -p 8080:8080 sena-frontend
```

Also deployable to Netlify (`netlify.toml`) and Firebase Hosting (`firebase.json`). The API server has its own Dockerfile in the [`sena-missions-api`](https://github.com/xtocodex/sena-missions-api) repo.

---

## Conventions

- **File naming:** PascalCase for all `.jsx` components
- **Exports:** Default export for page/feature components
- **State:** Local `useState` — keep state close to where it's used; no global store
- **Layout:** Use `<Flex>`, `<Grid>`, `<Container>`, `<Box>` from `src/components/ui/layout.jsx` instead of raw Tailwind flex/grid
- **Colors:** Always use CSS variable utilities (`bg-card`, `text-foreground`) — never hardcoded hex/HSL
- **Icons:** Import exclusively from `lucide-react`
- **Toasts:** Use `sonner`'s `toast` (the `<Toaster />` is mounted in `App.jsx`)
- **Shared AD constants:** Import `PLACEMENT_LABELS`, `TYPE_LABELS`, `PROJECT_LABELS`, `today` from `src/lib/adConstants.js`
- **shadcn components:** Add via `npx shadcn@latest add <name>` — do not copy manually

---

## Known Limitations

- **Dev** credentials are plaintext in `devs`; Player/Brand use Firebase Auth. Dev → Firebase Auth migration is planned.
- `firestore.rules` are intentionally **permissive** until Dev has a Firebase Auth identity — see TODOs in that file.
- Rewards are **v1 track-only** — coin settlement on coupon approval is manual via the Players panel.
- Player `stats` are mock placeholders until the real game-player link lands.
- N+1 Firestore query pattern in `AdRequests` media fetch — a `collectionGroup` refactor is planned.
- No test suite; no ESLint config file (`npm run lint` runs on defaults).
