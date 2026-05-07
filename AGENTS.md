# SENA - Ad Platform Dashboard

## Commands

```
npm run dev       # Start Vite dev server (HMR)
npm run build     # Production build → dist/
npm run preview   # Preview production build locally
npm run lint      # ESLint (no config file exists yet — uses defaults)
```

No test or typecheck scripts configured.

## Architecture

Single-page React app (JS, not TS) with client-side routing:
- `/` → LoginPage (mock auth, no backend)
- `/brand` → BrandDashboard
- `/dev` → DevDashboard (Manage Brands, Browse Media, Collections)

### Key directories
```
src/
├── pages/                  # Route-level (LoginPage, BrandDashboard, DevDashboard)
├── components/
│   ├── ui/                 # shadcn/ui primitives + layout.jsx (Flex, Grid, Container, Box)
│   ├── brand/              # Brand-specific (BrandSidebar, BrandTopBar, MediaGallery, UploadZone)
│   └── dev/                # Dev-specific (DevSidebar, DevTopBar, ManageBrands, BrowseBrandMedia, MyCollections)
├── data/mockData.js        # All mock data — single source of truth
├── lib/utils.js            # cn() utility (clsx + tailwind-merge)
└── App.jsx                 # Router setup
```

## Important Conventions

- **shadcn/ui**: `tsx: false`, CSS variables enabled, Lucide icons. Add via `npx shadcn@latest add <component>`.
- **Path alias**: `@/*` → `./src/*` (vite.config.js + jsconfig.json)
- **Layout primitives**: Use `Flex`, `Grid`, `Container`, `Box` from `@/components/ui/layout` instead of raw Tailwind
- **Color system**: All colors via CSS custom properties in `src/index.css` (dark theme, yellow/amber accent matching logo)
- **CVA variants**: Button, badge, alert, and layout components use class-variance-authority
- **No TypeScript**: Despite Vite template README mentioning TS, this project is JavaScript only

## Gotchas

- ESLint has no config file — `npm run lint` runs with defaults only
- All state is component-level `useState` — no global state management
- Media upload UI is drag-and-drop but files are not persisted
- Brand creation form is UI only — no state mutation or backend
- Phone validation: +91 fixed prefix, digits only, exactly 10 digits required
- Email validation: regex `/^[^\s@]+@[^\s@]+\.[^\s@]+$/` with inline error
- README.md is default Vite template — does not reflect this project's purpose

## Full Context

- **`PROJECT.md`** — Complete documentation: architecture, theme system, data models, component details, validation rules, tech stack, conventions, and known limitations. Read this first for context on any change.
