# SENA AD — Management Platform

## Project Overview
SENA is a **B2B ad management platform for GauravGo Games** with **three** user roles:

- **Player** — signs in with Google to view game rewards (coins + stats) and redeem brand coupons.
- **Brand** — signs in with Google, applies for an account, and (once approved) uploads ad media and configures campaign metadata.
- **Dev / Admin** — reviews brand applications and ad requests, schedules campaigns, curates the coupon catalog, settles player coins, and manages missions and app versions.

The project is a **React 19 + Vite 8 SPA** backed by **Firebase** (Firestore + Storage + Auth). A separate Express API server (its own repo, `sena-missions-api`) serves missions/players/app-version to the game client — see [Game API](#game-api-separate-repo).

## Quick Start

```bash
npm install          # First time only
npm run dev          # Dev server with HMR (http://localhost:5173)
npm run build        # Production build → dist/
npm run preview      # Preview production build
npm run lint         # ESLint (runs on defaults — no config file in repo)
```

There is **no test or typecheck** script.

## Architecture

### Routing (`src/App.jsx`)
| Route | Component | Access |
|---|---|---|
| `/` | `LandingPage` | Public marketing page |
| `/login` | `LoginPage` | Role selector (Player / Brand / Dev) |
| `/brand` | `BrandGate` | Firebase Auth gate → register / status / dashboard |
| `/user` | `UserGate` | Firebase Auth gate → player dashboard |
| `/dev` | `DevDashboard` | Protected — `ProtectedDevRoute` requires `session.role === 'dev'` |
| `*` | Redirect to `/` | Catch-all fallback |

Only `/dev` is wrapped in `ProtectedDevRoute` (a localStorage-session role check). `/brand` and `/user` self-gate via Firebase Auth state inside `BrandGate` / `UserGate`.

### Authentication — three mechanisms
| Role | Mechanism | Where |
|---|---|---|
| **Player** | Firebase Auth **Google sign-in** (`signInWithPopup`) | `LoginPage` → `/user` → `UserGate` |
| **Brand** | Firebase Auth **Google sign-in** | `LoginPage` / `BrandRegister` → `/brand` → `BrandGate` |
| **Dev** | **Firestore lookup** of the `devs` collection by `email` + `password` (plaintext) | `LoginPage` `handleDevSubmit` |

A local session is mirrored to `localStorage` under `sena_session` (`AuthContext`), shape:
`{ role, email, id, brandName, name }`. `logout()` clears localStorage, resets context, and calls Firebase `signOut()` if a Firebase user is present.

> **Note:** Player and Brand use real Firebase Authentication. Only **Dev** still uses a plaintext Firestore credential lookup; migrating Dev to Firebase Auth (with a `dev` custom claim) is the planned path that would also let `firestore.rules` be locked down — see `firestore.rules` TODOs.

### Brand onboarding flow (`BrandGate`)
1. **Google sign-in** (`BrandRegister` step 1) establishes a Firebase Auth identity (`uid`).
2. `BrandGate` subscribes to `brand_requests/{uid}` and `brands/{uid}`.
3. **No request yet** → `BrandRegister` step 2: a 3-step form (name, company, address, +91 phone, operating products, additional info, ≥1 sample image, ≥1 sample video). Samples upload to Storage under `brandRequests/{uid}/samples/…`; a `brand_requests/{uid}` doc is created with `status: 'pending'`.
4. **Pending** → `BrandStatus` (waiting screen). **Rejected** → `BrandStatus` with feedback + resubmit.
5. Dev approves in **Brand Requests** → a `brands/{uid}` doc with `status: 'approved'` is created → `BrandGate` renders `BrandDashboard` and seeds the session (`role: 'brand'`). If the brand doc is later removed, the brand is auto-logged-out.

### Player flow (`UserGate`)
Players get **instant access — no approval gate**. On first Google sign-in, `ensureUserDoc` seeds `users/{uid}` with `coins: 0`, mock `stats`, and `role: 'user'`. Unauthenticated visitors are redirected to `/login`.

### Dashboards (section maps)
- **`DevDashboard`** (`CONTENT_MAP`): `manage-brands` · `brand-requests` · `ad-requests` · `ad-operations` · `missions` · `app-version` · `coupon-management` · `players`
- **`BrandDashboard`**: `upload-images` · `upload-videos` (`UploadZone`) · `my-images` · `my-videos` (`MediaGallery`)
- **`UserDashboard`**: `overview` (`UserOverview`) · `rewards` (`RewardsGrid` → `RedeemModal`) · `my-requests` (`MyRequests`)

### Frontend File Structure
```
src/
├── App.jsx                           # Router + AuthProvider + ProtectedDevRoute
├── main.jsx                          # React entry point
├── index.css                         # Tailwind directives + CSS custom properties
├── lib/
│   ├── utils.js                      # cn() helper (clsx + tailwind-merge)
│   ├── firebase.js                   # Firestore + Storage + Auth + GoogleAuthProvider init
│   ├── uploadMedia.js                # Firebase Storage upload helpers (brand ad media)
│   ├── adConstants.js                # PLACEMENT_LABELS, TYPE_LABELS, PROJECT_LABELS, today()
│   ├── brandRequest.js               # brand_requests + brands reads/writes, sample uploads
│   ├── userAccount.js                # users collection: ensureUserDoc, subscribe, updateUser
│   └── rewards.js                    # reward_brands catalog + coupon_requests
├── data/mockData.js                  # Legacy mock data (USE_MOCK fallback, now off)
├── context/AuthContext.jsx           # Session context + login/logout
├── pages/
│   ├── LandingPage.jsx
│   ├── LoginPage.jsx                 # 3-role selector
│   ├── BrandGate.jsx                 # Firebase Auth gate for brands
│   ├── BrandRegister.jsx             # 3-step brand application
│   ├── BrandStatus.jsx               # Pending / rejected status screen
│   ├── BrandDashboard.jsx
│   ├── UserGate.jsx                  # Firebase Auth gate for players
│   ├── UserDashboard.jsx
│   └── DevDashboard.jsx
└── components/
    ├── ui/                           # shadcn/ui primitives + layout.jsx (Flex/Grid/Container/Box)
    ├── brand/                        # BrandSidebar, BrandTopBar, UploadZone, MediaGallery, AdMetadataModal
    ├── user/                         # UserSidebar, UserTopBar, UserOverview, RewardsGrid, RedeemModal, MyRequests
    └── dev/                          # DevSidebar, DevTopBar, ManageBrands, BrandRequests, BrandDetailsDialog,
                                      #   AdRequests, AdOperations, RunScheduleModal, Missions, AppVersion,
                                      #   Players, CouponManagement, CouponRequests, RewardBrands
```

## Firestore Data Model

All collections live in the shared Firebase project `crucial-summer-456605-p8`. Security rules are in `firestore.rules` (currently **permissive** — see its header for the lock-down TODOs that depend on migrating Dev to Firebase Auth).

| Collection / Path | Owner / Writer | Key Fields |
|---|---|---|
| `brand_requests/{uid}` | Brand (own), Dev (review) | `name`, `companyName`, `address`, `phone`, `email`, `operatingProducts`, `additionalInfo`, `sampleImages[]`, `sampleImagePaths[]`, `sampleVideos[]`, `sampleVideoPaths[]`, `status` (pending\|approved\|rejected), `feedback`, `reviewedAt/By/ById`, `createdAt` |
| `brands/{uid}` | Dev | Approved brand profile (mirrors request) + `status: 'approved'`. Keyed by the brand's Firebase Auth `uid` |
| `brandMedia/{uid}/images\|videos/{id}` | Brand | `fileName`, `url`, `thumbnailUrl`, `ratio`, `adStartDate`, `adEndDate`, `adPlacements[]`, `adType`, `project`, `uploadedAt`, `runStatus` |
| `adOperations/{id}` | Dev | Media snapshot + `opStartDate`, `opEndDate`, `runnedBy`, `runnedAt`, `sourceMediaPath`, `runStatus: 'queued'` |
| `devs/{id}` | (server tooling only) | `email`, `password` (plaintext), `name`. Client `write` is denied |
| `users/{uid}` | Player (own), Dev (settle) | `uid`, `email`, `name`, `photoURL`, `role: 'user'`, `coins`, `stats` `{ matchesPlayed, matchesWon, adViews, adWatchTime }`, `optionalData`, `createdAt` |
| `reward_brands/{id}` | Dev | Coupon catalog: `name`, `active`, `availableCoupons`, `denominations[] { value, coinCost }`, `createdAt`, `updatedAt` |
| `coupon_requests/{id}` | Player (create), Dev (process) | `userId`, `userName`, `userEmail`, `brandId`, `brandName`, `denomination`, `coinCost`, `quantity`, `status` (pending\|approved\|rejected), `message`, `processedBy/ById/At`, `createdAt` |
| `missions/{id}` | Dev + Game API | `id`, `type` (daily\|weekly), `description`, `active`, `rewards[]`, `value`, `createdAt` |
| `appVersions/config` | Dev + Game API | `android_version`, `ios_version` |
| `demoRequests/{id}` | Public (create only) | Landing-page demo form submissions |
| `players/{playerId}` | **Game API only** | Written exclusively by `sena-missions-api` via firebase-admin. **Web client read/write is denied** — distinct from `users` |

> **`users` vs `players`:** the website's player accounts live in **`users`** (Google sign-in, coins/rewards). The Game API's **`players`** collection is a separate, game-client-owned store the web app never touches.

## Dev Workflows

### AD scheduling
1. Brand uploads media + ad metadata (dates, placements, type, project).
2. Dev opens **AD Requests** — all brand media with AD metadata, filtered by status (Active / Upcoming / Expired).
3. Dev clicks **Run** → **RunScheduleModal** opens with the brand's requested dates pre-filled.
4. Dev confirms/adjusts → a doc is created in `adOperations` and the source media gets `runStatus: 'queued'`.
5. Dev reviews scheduled runs in **AD Operations** (Running / Upcoming / Expired tabs).

> `AdRequests.jsx` and `AdOperations.jsx` keep a `USE_MOCK` constant at the top; it is now **`false`** (live Firestore). The mock branch remains only as a fallback.

### Rewards / coupons (v1 — track-only)
1. Dev curates the catalog in **Coupon Management** (`reward_brands`: brand, denominations, `coinCost`, `availableCoupons`).
2. Player browses **Rewards** and submits a redemption via **RedeemModal** → a `coupon_requests` doc (`status: 'pending'`). The UI guards `coins >= cost`; **no coin debit happens automatically**.
3. Dev approves/rejects in **Coupon Requests**. Approval decrements `reward_brands.availableCoupons`; **coin settlement is manual** via the **Players** panel (`updateUser`).

## Game API (separate repo)
The game-client API (missions, players, app-version) lives in **[`xtocodex/sena-missions-api`](https://github.com/xtocodex/sena-missions-api)** and auto-deploys to Cloud Run (`us-central1`) on push to `main`. Prod URL: `https://sena-missions-api-332405485338.us-central1.run.app`. It shares the same Firebase project but **no code**, talking only over HTTP. If the dashboard ever calls it, read the base URL from `import.meta.env.VITE_API_BASE_URL` and never embed the write `x-api-key` in the frontend.

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
CVA-based — use instead of raw Tailwind flex/grid: `<Flex>`, `<Grid>` (animated collapse via `state`), `<Container>`, `<Box>`.

### shadcn/ui
- Config: `components.json` — `tsx: false`, CSS variables enabled, Lucide icons.
- Add components: `npx shadcn@latest add <name>`. `cn()` utility: `src/lib/utils.js`.
- Toasts via **sonner** (`<Toaster />` mounted in `App.jsx`); date pickers via **react-day-picker**.

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
| Class Utilities | CVA + clsx + tailwind-merge | — |
| Language | JavaScript (JSX) — no TypeScript | — |

Firebase web config (public keys) is hardcoded in `src/lib/firebase.js`. Path alias `@/* → ./src/*` (`vite.config.js` + `jsconfig.json`). Deploy configs: `Dockerfile` + `nginx.conf` (Nginx on 8080), `netlify.toml`, `firebase.json`.

## Conventions
- **File naming:** PascalCase for all `.jsx` components.
- **Exports:** Default export for page/feature components.
- **State:** Local `useState` — no global store; keep it close to where it's used.
- **Layout:** Prefer `Flex`/`Grid`/`Container`/`Box` over raw Tailwind flex/grid.
- **Colors:** Always use CSS variable utilities (`bg-card`, `text-foreground`) — never hardcoded hex/HSL.
- **Icons:** Import from `lucide-react`.
- **Shared AD constants:** Import `PLACEMENT_LABELS`, `TYPE_LABELS`, `PROJECT_LABELS`, `today` from `src/lib/adConstants.js`.
- **Add new shadcn components:** `npx shadcn@latest add <name>` — don't copy manually.

## Known Limitations
- **Dev** credentials are plaintext in `devs`; Player/Brand use Firebase Auth. Dev → Firebase Auth migration is planned (and gates the `firestore.rules` lock-down).
- `firestore.rules` are intentionally **permissive** (open reads/writes on most collections) until Dev has a Firebase Auth identity — see the TODOs in that file.
- Rewards are **v1 track-only**: coin settlement on coupon approval is manual via the Players panel, not automatic.
- Player `stats` are mock placeholders until the real game-player link lands.
- N+1 Firestore query pattern in `AdRequests` media fetch — `collectionGroup` refactor planned.
- Mission ID generation (Game API) has a race condition under concurrent writes — see `sena-missions-api` `API_ISSUES.md`.
- No test suite. No ESLint config file (`npm run lint` uses defaults).
