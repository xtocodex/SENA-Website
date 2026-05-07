# SENA AD — Management Platform

## Project Overview
SENA is a **B2B ad management platform** with two distinct user roles: **Brand** users (who manage their own ad media) and **Dev/Admin** users (who manage brands and curate media collections). This is a **front-end only SPA** built with React + Vite, using mock data throughout — no backend or Firebase integration yet.

## Quick Start
```bash
npm install          # First time only
npm run dev          # Dev server with HMR (default port)
npm run build        # Production build → dist/
npm run preview      # Preview production build
npm run lint         # ESLint (no custom rules configured yet)
```

## Architecture

### Routing (`src/App.jsx`)
| Route | Component | Purpose |
|---|---|---|
| `/` | `LoginPage` | Role selector (Brand / Dev) → login form |
| `/brand` | `BrandDashboard` | Brand user dashboard |
| `/dev` | `DevDashboard` | Admin/Dev dashboard |
| `*` | Redirects to `/` | Catch-all fallback |

### File Structure
```
src/
├── App.jsx                          # Router setup
├── main.jsx                         # React entry point (createRoot)
├── index.css                        # Tailwind directives + CSS custom properties (theme)
├── lib/utils.js                     # cn() helper (clsx + tailwind-merge)
├── data/mockData.js                 # ALL mock data — single source of truth
├── pages/
│   ├── LoginPage.jsx                # Role selection + auth form (mock)
│   ├── BrandDashboard.jsx           # Brand: sidebar + upload/gallery views
│   └── DevDashboard.jsx             # Dev: sidebar + brands/media/collections views
└── components/
    ├── ui/                          # shadcn/ui primitives (managed via CLI)
    │   ├── alert-dialog.jsx         # Used for delete confirmation
    │   ├── alert.jsx
    │   ├── avatar.jsx
    │   ├── badge.jsx
    │   ├── button.jsx               # Variants: default, destructive, outline, secondary, ghost, link, tile
    │   ├── card.jsx
    │   ├── checkbox.jsx           # Used in BrowseBrandMedia multi-select
    │   ├── dialog.jsx               # Used in Add Brand form
    │   ├── input.jsx
    │   ├── label.jsx
    │   ├── layout.jsx               # Custom CVA-based primitives: Flex, Grid, Container, Box
    │   ├── scroll-area.jsx          # Wraps main content areas
    │   ├── select.jsx               # Used for brand/format dropdowns
    │   ├── separator.jsx
    │   ├── table.jsx                # Used in Manage Brands
    │   ├── tabs.jsx                 # Used in My Collections filters
    │   └── tooltip.jsx
    ├── brand/                       # Brand dashboard feature components
    │   ├── BrandSidebar.jsx         # Left nav (4 items), w-60
    │   ├── BrandTopBar.jsx          # Shared header (wordmark + user pill)
    │   ├── MediaGallery.jsx         # 3-column grid, hover delete, placeholder thumbnails
    │   └── UploadZone.jsx           # Drag-and-drop zone + upload specs card
    └── dev/                         # Dev dashboard feature components
        ├── DevSidebar.jsx           # Left nav (3 items), w-60
        ├── DevTopBar.jsx            # Shared header (wordmark + dev user pill)
        ├── ManageBrands.jsx         # Table + Add Brand dialog with validation
        ├── BrowseBrandMedia.jsx     # Brand filter + format filter + media grid
        └── MyCollections.jsx        # Filter tabs (All/Banner/Interstitial/Rewards) + grid
```

## Theme & Styling

### CSS Custom Properties (`src/index.css`)
Dark theme with **yellow/amber accent** (matches brand logo):

| Variable | Value | Purpose |
|---|---|---|
| `--background` | `hsl(30 5% 6%)` | Warm near-black |
| `--card` | `hsl(30 4% 9%)` | Slightly elevated surface |
| `--primary` | `hsl(42 95% 55%)` | Vivid yellow/amber — brand color |
| `--ring` | `hsl(42 95% 55%)` | Matches primary for focus states |
| `--foreground` | `hsl(30 5% 93%)` | Light text on dark bg |
| `--muted-foreground` | `hsl(30 5% 55%)` | Secondary text |
| `--destructive` | `hsl(0 63% 45%)` | Red for errors/destructive actions |
| `--border` | `hsl(30 4% 14%)` | Subtle borders |
| `--radius` | `0.625rem (10px)` | Consistent rounded corners |

All colors use HSL format via CSS variables mapped to Tailwind utilities in `tailwind.config.js`.

### Layout Primitives (`src/components/ui/layout.jsx`)
Custom CVA-based components — **use these instead of raw Tailwind flex/grid classes**:

- `<Flex>` — direction: row/col, align: start/center/end/stretch/baseline, justify: start/center/end/between/around/evenly, wrap: nowrap/wrap/wrap-reverse
- `<Grid>` — cols: 1–6/12, gap: 0–8, state: visible/hidden (animate collapse)
- `<Container>` — maxWidth: sm/md/lg/xl/2xl/screen
- `<Box>` — simple styled div for wrapper hooks

### shadcn/ui Conventions
- **Config**: `components.json` → `tsx: false`, CSS variables enabled, Lucide icons
- **Add components**: `npx shadcn@latest add <component>`
- **`cn()` utility**: Located in `src/lib/utils.js` — merges Tailwind classes safely using `clsx` + `tailwind-merge`

## Data Models (`src/data/mockData.js`)

### Brand Data
```js
MOCK_IMAGES  // 6 items: id, filename, ratio (16:9|1:1|9:16), type (Banner|Interstitial|Rewards), size
MOCK_VIDEOS  // 4 items: same structure as images
```

### Dev Data
```js
MOCK_BRANDS         // 5 brands: id, name, email, created (YYYY-MM-DD)
MOCK_BRAND_MEDIA    // 10 items: id, filename, ratio, type, brand, size, format (image|video)
MOCK_DEV_COLLECTIONS // 5 items: same as brand media (dev's curated set)
```

### Type → Badge Mapping
```js
RATIO_BADGE_VARIANTS = { 'Banner': 'default', 'Interstitial': 'secondary', 'Rewards': 'outline' }
```

## Key Components Detail

### BrandDashboard (`/brand`)
- **State**: `activeNav` controls view — `upload-images`, `upload-videos`, `my-images`, `my-videos`
- **Layout**: TopBar (full-width) → Sidebar (w-60) + ScrollArea (flex-1)
- **CONTENT_MAP**: Maps nav ID → component render function
- Upload zone: drag-and-drop UI only (no file persistence)

### DevDashboard (`/dev`)
- **State**: `activeNav` controls view — `manage-brands`, `browse-media`, `my-collections`
- **Layout**: Same pattern as BrandDashboard

### ManageBrands
- **Table**: Lists brands (name, email, date created) with delete action column
- **Add Brand Dialog**: Fields — Name, Email, Phone (+91 fixed prefix), Password
- **Validation**:
  - Email: regex `/^[^\s@]+@[^\s@]+\.[^\s@]+$/` — shows error inline
  - Phone: digits only, exactly 10 digits after +91 — error inline if invalid
  - Button disabled until all fields valid
- **Delete Brand**: Trash icon per row opens `AlertDialog` confirmation with brand name — "Are you sure you want to delete {name}? This action cannot be undone."
- **Reset**: All form state clears on dialog close
- **State**: Local `useState` initialized from `MOCK_BRANDS` — deletions work in-memory only

### BrowseBrandMedia
- **Dual filters**: Format (All/Images/Videos) + Brand (All/each brand)
- **Filter logic**: AND — both conditions must match
- **Grid**: 3-column, MediaCard with thumbnail placeholder, filename, type badge, brand name
- **Multi-select mode**:
  - Click "Select" button to enter selection mode (checkboxes appear on cards)
  - Select multiple items via checkboxes (top-left on thumbnail)
  - Selected cards highlighted with primary border
  - Action bar replaces filters: count badge, Select All, Clear, Copy/Move dropdown, Add to Collection, Cancel (X)
  - "Select All" only selects visible filtered items
  - Bulk actions (Copy/Move) logged to console — no persistence yet

### MyCollections
- **Tabs**: All, Banner, Interstitial, Rewards (Button-based filter)
- **Grid**: Same MediaCard pattern with hover delete overlay

## Path Alias
`@/*` → `./src/*` (configured in `vite.config.js` + `jsconfig.json`)

## Gotchas & Known Limitations
- **No backend**: All data is mock, no API calls or persistence
- **No global state**: Component-level `useState` only — no Redux/Zustand/Context
- **No ESLint config**: `eslint.config.js` does not exist — `npm run lint` uses ESLint defaults
- **Media upload is UI only**: Drag-and-drop works but files are not saved anywhere
- **No test suite**: No testing framework installed
- **README.md is Vite default**: Does not reflect this project's actual purpose
- **Phone validation is client-side only**: No server-side validation exists
- **Brand CRUD is UI only**: Create and delete work in-memory — no API or persistence, data resets on refresh

## Tech Stack
| Category | Technology | Version |
|---|---|---|
| Framework | React | 19.2.5 |
| Build Tool | Vite | 8.0.10 |
| Routing | React Router DOM | 7.14.2 |
| Styling | Tailwind CSS | 3.4.19 |
| UI Components | shadcn/ui | CLI-installed primitives |
| Radix Primitives | @radix-ui/* | Various |
| Icons | Lucide React | 1.14.0 |
| Class Utilities | CVA + clsx + tailwind-merge | Various |
| PostCSS | postcss + autoprefixer | 8.5.13 / 10.5.0 |
| Language | JavaScript (JSX) — no TypeScript | — |

## Conventions
- **File naming**: PascalCase for all `.jsx` components
- **Exports**: Default export for page/feature components
- **State**: Local `useState` — keep it close to where it's used
- **Layout**: Prefer `Flex`/`Grid`/`Container`/`Box` over raw Tailwind flex/grid
- **Colors**: Always use CSS variable utilities (`bg-card`, `text-foreground`, etc.) — never hardcoded hex/HSL in components
- **Icons**: Import from `lucide-react`
- **Add new shadcn components**: `npx shadcn@latest add <name>` — don't manually copy files

## Future Work (Not Implemented)
- Backend integration (Firebase or custom API)
- Real authentication flow
- File upload persistence
- Brand edit functionality (update existing brands)
- Media collection management (add/remove items)
- Dev dashboard analytics
- ESLint custom configuration
- Test suite (unit/integration)
- TypeScript migration (if desired)
