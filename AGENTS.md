# SENA — Ad Platform Dashboard (agent guide)

## Commands

```
npm run dev       # Start Vite dev server (HMR) at http://localhost:5173
npm run build     # Production build → dist/
npm run preview   # Preview production build locally
npm run lint      # ESLint (no config file in repo — runs on defaults)
```

No test or typecheck scripts.

## Architecture

Single-page React 19 app (JS, not TS) with client-side routing and a **real Firebase backend** (Firestore + Storage + Auth):

- `/` → `LandingPage` (public marketing)
- `/login` → `LoginPage` (3-role selector: Player / Brand / Dev)
- `/brand` → `BrandGate` → `BrandRegister` / `BrandStatus` / `BrandDashboard` (Firebase Auth, Google)
- `/user` → `UserGate` → `UserDashboard` (Firebase Auth, Google)
- `/dev` → `DevDashboard`, wrapped in `ProtectedDevRoute` (localStorage `role=dev`)

**Auth:** Player & Brand use Firebase Auth (Google sign-in). Dev uses a Firestore `devs` email+password lookup. Session is mirrored to `localStorage` (`sena_session`) via `AuthContext`.

### Key directories
```
src/
├── pages/                  # Route-level (Landing, Login, Brand{Gate,Register,Status,Dashboard}, User{Gate,Dashboard}, DevDashboard)
├── components/
│   ├── ui/                 # shadcn/ui primitives + layout.jsx (Flex, Grid, Container, Box)
│   ├── brand/              # BrandSidebar, BrandTopBar, UploadZone, MediaGallery, AdMetadataModal
│   ├── user/               # UserSidebar, UserTopBar, UserOverview, RewardsGrid, RedeemModal, MyRequests
│   └── dev/                # ManageBrands, BrandRequests, AdRequests, AdOperations, Missions, AppVersion,
│                           #   CouponManagement, CouponRequests, RewardBrands, Players, RunScheduleModal, ...
├── context/AuthContext.jsx # Session + login/logout
├── lib/                    # firebase, uploadMedia, adConstants, brandRequest, userAccount, rewards, utils
└── App.jsx                 # Router + AuthProvider + ProtectedDevRoute
```

## Important Conventions

- **shadcn/ui**: `tsx: false`, CSS variables enabled, Lucide icons. Add via `npx shadcn@latest add <component>`.
- **Path alias**: `@/*` → `./src/*` (`vite.config.js` + `jsconfig.json`)
- **Layout primitives**: Use `Flex`, `Grid`, `Container`, `Box` from `@/components/ui/layout` instead of raw Tailwind
- **Color system**: All colors via CSS custom properties in `src/index.css` (dark theme, yellow/amber accent)
- **CVA variants**: Button, badge, alert, and layout components use class-variance-authority
- **Toasts**: `sonner` — `toast.*` (the `<Toaster />` is mounted in `App.jsx`)
- **No TypeScript**: this project is JavaScript only

## Gotchas

- ESLint has no config file — `npm run lint` runs with defaults only.
- All state is component-level `useState` — no global state management.
- Brand ad media (`UploadZone`) **and** brand-application samples **are persisted to Firebase Storage**; brand applications write `brand_requests` docs (real backend, not UI-only).
- `AdRequests`/`AdOperations` have a `USE_MOCK` flag, now set to **`false`** (live Firestore); the mock branch is fallback only.
- Players (`users` collection) are distinct from the Game API's `players` collection (the web app never touches `players`).
- Phone validation: +91 fixed prefix, digits only, exactly 10 digits.
- `firestore.rules` are intentionally permissive pending the Dev → Firebase Auth migration.

## Full Context

- **`PROJECT.md`** — Complete documentation: architecture, auth, flows, full data model, theme, tech stack, conventions, limitations. Read this first for context on any change.
- **`README.md`** — Public-facing project README (current and accurate).
