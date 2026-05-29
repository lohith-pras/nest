## Project

**Nest (Roomy) — Feature Milestone: API Integrations & Analytics**

Nest (branded "Roomy") is a mobile-first roommate management PWA for shared households. Roommates share a "unit" and collaborate on groceries, expenses, a calendar, and a shared interests board. This milestone adds live API integrations to the Interests page (TMDB for movies/TV, OSM Nominatim for places), financial analytics to the Expenses page, and a two-section Inventory system to Groceries.

**Core Value:** Roommates stay in sync — shared watchlists, places, and spending insights are accurate and effortless to maintain without manual data entry.

### Constraints

- **No server:** All logic runs client-side or in Supabase (RLS, functions). No Node/Express backend.
- **Supabase only:** New tables and schema changes go through Supabase; no other DB.
- **API keys client-side:** TMDB key exposed in browser — use TMDB read-only key (safe by TMDB's design). OSM needs no key.
- **Existing patterns:** New code follows the established pattern — `useEffect` data fetching in page components, `useAuth()` for session, GSAP entry animations after load.
- **No TypeScript:** All new files are `.jsx`/`.js`.
- **OSM rate limit:** Nominatim requests must be debounced (min 300ms between keystrokes, max 1 req/sec).

## Technology Stack

## Summary
## Languages
- JavaScript (ES Modules, JSX) — all source files in `src/`
- CSS — global styles in `src/index.css`, `src/responsive.css`, `src/styles/`
## Runtime
- Node.js v26 (resolved at runtime; no `.nvmrc` or `.node-version` pinning)
- ES Module project (`"type": "module"` in `package.json`)
- npm (lockfile v3 at `package-lock.json`)
- Lockfile: present
## Frameworks
- React 19.2.6 — UI framework (`src/main.jsx`, `src/App.jsx`)
- React DOM 19.2.6 — DOM renderer
- React Router DOM 7.15.1 — declarative client-side routing (`src/App.jsx`, `src/main.jsx`)
- Route structure: nested layout route (`/`) guarded by `ProtectedRoute`, plus `/login` public route
- GSAP 3.15.0 — animation engine, registered globally in `src/main.jsx`
- @gsap/react 2.1.2 — `useGSAP` hook, registered as GSAP plugin at app boot
- GSAP ScrollTrigger plugin registered at `src/main.jsx:12`
- `gsap.matchMedia` used for `prefers-reduced-motion` global support (`src/main.jsx:18-21`)
- Vite 8.0.13 — dev server and build tool (`vite.config.js`)
- @vitejs/plugin-react 6.0.2 — React Fast Refresh and JSX transform
## Key Dependencies
- `@supabase/supabase-js` 2.105.4 — backend client for auth, database, storage, RPC (`src/lib/supabase.js`)
- `gsap` 3.15.0 + `@gsap/react` 2.1.2 — used across multiple pages and hooks for UI animations
- `vite-plugin-pwa` 1.3.0 — PWA manifest and service worker injection (`vite.config.js`)
## Configuration
- Vite exposes env vars prefixed `VITE_` via `import.meta.env`
- Required vars: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
- Template: `.env.example` — copy to `.env.local` (gitignored)
- `.env.local` is present locally; never commit it
- `vite.config.js` — single config file, plugins: `@vitejs/plugin-react`, `vite-plugin-pwa`
- Output: `dist/` directory (gitignored for deploy but committed build artifacts visible)
- `eslint.config.js` — flat ESLint config targeting `**/*.{js,jsx}` with `eslint-plugin-react-hooks` and `eslint-plugin-react-refresh`
## Platform Requirements
- Node.js (v26 in use; no engine constraint pinned in `package.json`)
- `npm install` to restore dependencies
- `npm run dev` — Vite dev server
- `npm run build` — production bundle to `dist/`
- `npm run lint` — ESLint check
- `npm run preview` — preview production build locally
- Deployed to Vercel (`vercel.json` with SPA rewrite: all routes → `/index.html`)
- PWA-capable: service worker + manifest generated at build time

## Conventions

## Summary
## Language
- **JavaScript only** — all source files use `.jsx` or `.js`. No TypeScript.
- Extension rule: components are `.jsx`, pure logic files are `.js`.
- `"type": "module"` in `package.json`; all imports use ES module syntax.
## Naming Patterns
- Page components: PascalCase, one page per file — e.g. `src/pages/Expenses.jsx`, `src/pages/Dashboard.jsx`
- Layout/shared components: PascalCase — `src/components/Layout.jsx`, `src/components/TopNavBar.jsx`
- Hooks: camelCase prefixed with `use` — `src/hooks/useModalAnimation.js`, `src/hooks/useResponsive.js`
- Context: PascalCase file, named exports for provider + hook — `src/context/AuthContext.jsx`
- Library files: camelCase — `src/lib/supabase.js`
- Pages and components: `export default function ComponentName()` (default export, named function)
- Hooks: named export — `export function useModalAnimation()`; one exception: `useResponsive` uses `export default`
- Context: named exports for both provider and hook — `export function AuthProvider`, `export function useAuth`
- Event handlers: `handle` prefix — `handleClose`, `handleSubmit`, `handleFileUpload`, `handleEdit`
- Async data loaders: bare `load()` or `fetch*` — `load()`, `fetchProfile()`
- CRUD operations: verb + noun — `saveExpense`, `deleteExpense`, `markPaid`, `toggleItem`, `clearChecked`
- Boolean state: bare adjective — `loading`, `adding`, `saving`, `uploading`
- Array state: plural noun — `expenses`, `items`, `groceries`
- Object/map state: noun — `profiles`, `stats`
- Modal control state: `showModal` (boolean) + `editData` (nullable object)
- SCREAMING_SNAKE_CASE arrays — `DAYS`, `MONTHS`, `TABS`, `BREAKPOINTS` (in `src/hooks/useResponsive.js`), `mobileNav` (exception: camelCase in `src/components/Layout.jsx`)
## Component Patterns
## Styling Conventions
- Cards: `.glass-card` — elevated surface with border, shadow, border-radius
- Buttons: `.btn-primary`, `.btn-ghost`, `.btn-danger`
- Inputs: `.input`
- Badges: `.badge`, `.badge-green`, `.badge-blue`, `.badge-orange`, `.badge-sage`
- Typography: `.font-display`, `.section-title`
- Layout: `.bottom-nav`, `.nav-link`, `.modal`, `.modal-overlay`
- Animations: `.animate-spin`, `.animate-pulse`
## Import Organization
## Error Handling
## ESLint Configuration
- Targets: `**/*.{js,jsx}` only (no TypeScript files)
- Extends: `@eslint/js` recommended + `eslint-plugin-react-hooks` recommended + `eslint-plugin-react-refresh` (Vite preset)
- Globals: browser
- No Prettier integration — no `.prettierrc` present
- `react-hooks/rules-of-hooks` — hooks must only be called at top level
- `react-hooks/exhaustive-deps` — effect dependency arrays must be complete
- `react-refresh/only-export-components` — each file should export only components for HMR
## Logging
- `console.log` used for self-healing debug traces in `src/context/AuthContext.jsx`
- `console.error` used on caught exceptions throughout pages
- No structured logging, no log levels, no external logging service
## Comments
- Section separators use `/* ── Section Name ───── */` style in JSX (Layout, Dashboard)
- Code comments explain non-obvious behavior: safety timeouts, self-healing rationale, GSAP configuration choices
- No JSDoc usage anywhere in the codebase
## Notes
- `useResponsive` uses a default export inconsistently with the rest of the hooks which use named exports.
- `Math.random()` is used for generating receipt filenames and invite codes (`src/context/AuthContext.jsx` line 67). For filenames this is acceptable; for invite codes, `crypto.randomUUID` is preferred and is used as a fallback.
- `alert()` is used for error feedback in `src/pages/Expenses.jsx` — should be replaced with in-page error state.
- Inline `onMouseOver`/`onMouseOut` handlers on icon buttons (Expenses, Groceries) manually toggle color — this should use CSS `:hover` or a React state pattern instead.

## Architecture

## Summary
## System Overview
```text
```
## Component Responsibilities
| Component | Responsibility | File |
|-----------|----------------|------|
| `main.jsx` | App bootstrap, GSAP plugin registration, theme init, React tree root | `src/main.jsx` |
| `App` | Route tree, `ProtectedRoute` guard | `src/App.jsx` |
| `AuthProvider` | Session state, profile fetch + self-heal, auth state listener | `src/context/AuthContext.jsx` |
| `Layout` | Shell with fixed bottom nav bar and `<Outlet />` for page content | `src/components/Layout.jsx` |
| `TopNavBar` | Sticky header showing current page title (unused in current Layout) | `src/components/TopNavBar.jsx` |
| `supabase` | Singleton Supabase client | `src/lib/supabase.js` |
| `useResponsive` | Breakpoint hook based on `window.innerWidth` | `src/hooks/useResponsive.js` |
| `useModalAnimation` | GSAP-powered open/close animation for overlay modals | `src/hooks/useModalAnimation.js` |
| Page components | Data fetching, mutations, local UI state, GSAP animations | `src/pages/*.jsx` |
## Pattern Overview
- All Supabase queries are authored inline inside page components (`useEffect` + async functions).
- Authentication state flows down via `useAuth()` hook from `AuthContext`. Pages read `session`, `profile`, and `loading` from it.
- GSAP animations are scoped to a `containerRef` per page using `useGSAP({ scope: containerRef })`. Animations run after async data loads (guarded by `if (loading) return`).
- Modal components (`Modal`) are co-located as named inner functions inside the same file as the page that uses them (`Expenses.jsx`, `Calendar.jsx`, `Interests.jsx`).
- Dark mode is toggled via `document.documentElement.classList.add/remove('dark')` and persisted in `localStorage`. Initial state is set synchronously in `main.jsx` before React renders.
## Layers
- Purpose: Initialize GSAP, theme, React root
- Location: `src/main.jsx`
- Contains: GSAP defaults, reduced-motion matchMedia, theme detection
- Depends on: nothing internal
- Used by: nothing (root)
- Purpose: Declare all routes; gate authenticated routes
- Location: `src/App.jsx`
- Contains: `ProtectedRoute`, `Routes`/`Route` declarations
- Depends on: `AuthContext`, all page components
- Used by: `main.jsx` via `<App />`
- Purpose: Single source of truth for `session` and `profile`
- Location: `src/context/AuthContext.jsx`
- Contains: Supabase auth listener, profile fetch with self-healing unit association
- Depends on: `src/lib/supabase.js`
- Used by: `App`, all page components via `useAuth()`
- Purpose: Persistent chrome (bottom nav); renders nested route content via `<Outlet />`
- Location: `src/components/Layout.jsx`
- Contains: `mobileNav` config array, fixed bottom `<nav>` with `NavLink`s
- Depends on: `react-router-dom`
- Used by: `App` as the outer element wrapping all protected routes
- Purpose: Feature screens (Dashboard, Expenses, Groceries, Calendar, Interests, Apartment, Settings, More, Login)
- Location: `src/pages/*.jsx`
- Contains: local state, Supabase queries, GSAP animation setup, inline sub-components (rows, modals)
- Depends on: `AuthContext`, `supabase`, hooks, `gsap`
- Used by: `App` routing
- Purpose: Reusable logic
- Location: `src/hooks/`
- `useModalAnimation.js` — GSAP timeline for modal open/close; called by `Expenses.jsx` and `Interests.jsx`
- `useResponsive.js` — breakpoint detector; exported but minimally used by pages directly
- Purpose: Singleton DB/auth/storage client
- Location: `src/lib/supabase.js`
- Depends on: `@supabase/supabase-js`, env vars `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
## Data Flow
### Authentication Flow
### Page Data Flow (typical)
### Real-time Groceries Flow
### Mutation Flow
## State Management
- **Auth/Profile** (`src/context/AuthContext.jsx`) — the only React Context; provides `session`, `profile`, `loading`, `refreshProfile` to the entire tree.
- **Theme** — managed imperatively via `document.documentElement.classList`; `localStorage` persists the preference; no React state owns it globally except a local `useState` inside `Settings.jsx`.
- **GSAP** — registered globally in `main.jsx` (plugins, defaults, reduced-motion matchMedia). Animation state is fully owned by GSAP timelines, not React state.
## Key Abstractions
- Used across every page as the standard content surface (card). Defined in `src/index.css`.
- Not a React component — it is a CSS utility class applied via `className="glass-card"`.
- Reads `{ session, loading }` from `useAuth()`.
- Shows a spinner while `loading`, redirects to `/login` if no session, renders children otherwise.
- Accepts `overlayRef`, `panelRef`, `onClose`. Builds a GSAP timeline for entry animation and a reversed timeline for exit.
- Returns `handleClose` which reverses the timeline before calling `onClose`.
- Used by `Expenses.jsx` and `Interests.jsx` modals.
## Entry Points
- Location: `src/main.jsx`
- Triggers: Vite loads `index.html`, which imports `src/main.jsx`
- Responsibilities: GSAP setup, theme init, ReactDOM render
- Location: `vite.config.js` → VitePWA plugin → `public/pwa-*.png` icons
- `display: 'standalone'` — the app can be installed and run as a native-feeling PWA
## Architectural Constraints
- **No server:** All logic runs client-side. Supabase is the only backend.
- **Single Supabase client:** `src/lib/supabase.js` exports one instance; no per-user client creation.
- **Global state:** Only `AuthContext`. Theme is global via DOM class manipulation.
- **No data cache:** Each page re-fetches from Supabase on every mount. No query caching layer (no React Query, SWR, etc.).
- **GSAP global timeline:** `gsap.globalTimeline.timeScale(0)` is applied for reduced-motion; this affects all animations app-wide.
- **Circular imports:** None detected.
- **iOS safe-area:** Layout uses `env(safe-area-inset-top/bottom)` in padding throughout `Layout.jsx` and `Login.jsx`.
## Anti-Patterns
### Inline Data Fetching in Page Components
### `window.location.reload()` for State Reset
### Modals Co-located as File-Internal Functions
## Error Handling
- Async mutations use `try/catch`; errors are shown via `alert()` (e.g., `Expenses.jsx:189`) or local `error` state variables.
- `AuthContext.fetchProfile` has an outer `try/catch` that falls back to a minimal profile object on database errors.
- Supabase client initialization falls back to placeholder values so the app renders even without env vars (`src/lib/supabase.js:7-12`).
- No React `ErrorBoundary` component exists anywhere in the tree.
## Cross-Cutting Concerns
