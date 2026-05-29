# Codebase Structure

<!-- refreshed: 2026-05-20 -->

**Analysis Date:** 2026-05-20

## Summary

The project is a Vite + React SPA with a flat, feature-by-type layout. Source files live entirely under `src/`, divided into `pages/`, `components/`, `context/`, `hooks/`, `lib/`, `styles/`, and `assets/`. There is no barrel-file pattern, no feature-folder grouping, and no shared UI component library — UI is built inline using CSS classes and inline styles throughout page files.

---

## Directory Layout

```
nest/                          # Project root
├── src/
│   ├── main.jsx               # App entry: GSAP init, theme, ReactDOM.createRoot
│   ├── App.jsx                # Route declarations, ProtectedRoute
│   ├── index.css              # Global tokens (OKLCH), base reset, utility classes
│   ├── assets/
│   │   ├── hero.png           # Static image asset
│   │   ├── react.svg
│   │   └── vite.svg
│   ├── components/
│   │   ├── Layout.jsx         # Shell: fixed bottom nav + <Outlet />
│   │   └── TopNavBar.jsx      # Sticky page title header (currently unused in Layout)
│   ├── context/
│   │   └── AuthContext.jsx    # Session + profile state, self-healing unit association
│   ├── hooks/
│   │   ├── useModalAnimation.js  # GSAP open/close animation for modals
│   │   └── useResponsive.js      # Breakpoint detection hook
│   ├── lib/
│   │   └── supabase.js        # Singleton Supabase client
│   ├── pages/
│   │   ├── Apartment.jsx      # Unit info + roommate list + invite code display
│   │   ├── Calendar.jsx       # Monthly calendar grid + event CRUD
│   │   ├── Dashboard.jsx      # Aggregated home view with finance/grocery/calendar previews
│   │   ├── Expenses.jsx       # Expense tracking, 50/50 and custom splits, receipt upload
│   │   ├── Groceries.jsx      # Grocery list with real-time Supabase sync
│   │   ├── Interests.jsx      # Shared watchlist + places bucket list
│   │   ├── Login.jsx          # Email/password auth, create-unit/join-unit signup flow
│   │   ├── More.jsx           # Profile display, nav to Interests/Apartment/Settings, sign out
│   │   └── Settings.jsx       # Profile name/avatar edit, dark mode toggle
│   └── styles/
│       └── responsive.css     # Mobile-first breakpoint overrides for CSS tokens
├── public/
│   ├── pwa-192x192.png        # PWA icon
│   ├── pwa-512x512.png        # PWA icon
│   └── (other static assets)
├── dist/                      # Vite build output (committed, not source-controlled pattern)
├── docs/
│   └── superpowers/           # Planning specs and implementation checklists
├── .agents/
│   └── skills/                # Project-specific skill definitions for AI agents
├── .planning/
│   └── codebase/              # Codebase map documents (this directory)
├── index.html                 # HTML shell with <div id="root">
├── vite.config.js             # Vite + React + VitePWA plugin config
├── eslint.config.js           # ESLint flat config
├── package.json               # Dependencies: react, react-router-dom, supabase, gsap
├── supabase-schema.sql        # Full DB schema + RLS policies + storage config
├── vercel.json                # Vercel deployment config
├── .env.example               # Required env var template
└── skills-lock.json           # Agent skill versions lock file
```

---

## Directory Purposes

**`src/pages/`:**
- Purpose: One file per route/screen. Contains all data fetching, mutations, local state, and GSAP animation for that screen.
- Contains: Page-level React components, co-located inner components (modals, row items).
- Key files: `Dashboard.jsx` (entry screen), `Login.jsx` (auth flow), `Expenses.jsx` (most complex, ~340 lines)

**`src/components/`:**
- Purpose: Shared structural components used by the routing layer.
- Contains: `Layout.jsx` (the persistent shell), `TopNavBar.jsx` (sticky header, currently extracted but not rendered by Layout).
- Note: There are no shared UI primitives here (no Button, Input, Modal base components). All UI is inline.

**`src/context/`:**
- Purpose: React context providers for cross-cutting state.
- Contains: `AuthContext.jsx` — the only context in the app.

**`src/hooks/`:**
- Purpose: Reusable logic extracted from components.
- Contains: `useModalAnimation.js` (GSAP modal animations), `useResponsive.js` (breakpoint detection).
- Note: `useResponsive` is defined but its usage across pages is limited. Most responsive behavior is handled via CSS tokens and media queries in `src/styles/responsive.css`.

**`src/lib/`:**
- Purpose: Third-party client setup.
- Contains: `supabase.js` — the single Supabase client instance.

**`src/styles/`:**
- Purpose: Global CSS that is not design-token definitions.
- Contains: `responsive.css` — media queries that override CSS token values at tablet/desktop breakpoints.

**`src/index.css`:**
- Purpose: Master stylesheet. Defines all OKLCH design tokens for light and dark modes, base reset, utility classes (`.glass-card`, `.glass`, `.btn-primary`, `.btn-ghost`, `.input`, `.badge`, `.modal`, `.modal-overlay`, `.animate-spin`, `.fade-in`, `.section-title`, `.font-display`).
- Imported once in `src/main.jsx`.

**`public/`:**
- Purpose: Static assets served at root URL. PWA icons, manifest data is generated by `vite-plugin-pwa`.

**`docs/`:**
- Purpose: Design specs and planning documents. Not imported by source code.

**`.agents/skills/`:**
- Purpose: AI agent skill definitions for guiding code generation and design decisions.
- Generated: No (manually maintained)
- Committed: Yes

---

## Key File Locations

**Entry Points:**
- `src/main.jsx` — React tree root, GSAP registration, theme bootstrap
- `index.html` — HTML shell with `<div id="root">`

**Configuration:**
- `vite.config.js` — Build tooling, PWA manifest
- `eslint.config.js` — Linting rules
- `vercel.json` — Production deploy config
- `.env.example` — Documents required env vars (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`)

**Core Logic:**
- `src/context/AuthContext.jsx` — Auth state, self-healing profile association
- `src/lib/supabase.js` — Supabase client
- `src/App.jsx` — Route map + auth guard

**Styles:**
- `src/index.css` — All design tokens + utility classes
- `src/styles/responsive.css` — Breakpoint token overrides

**Database:**
- `supabase-schema.sql` — Full Postgres schema, RLS policies, RPC functions, storage config

---

## Naming Conventions

**Files:**
- Page components: PascalCase, one file per route. Example: `Dashboard.jsx`, `Expenses.jsx`
- Hooks: camelCase prefixed with `use`. Example: `useModalAnimation.js`, `useResponsive.js`
- Context: PascalCase with `Context` suffix. Example: `AuthContext.jsx`
- Lib utilities: camelCase. Example: `supabase.js`
- Styles: camelCase. Example: `responsive.css`

**Components:**
- All React components are PascalCase function declarations exported as `default`.
- Inner/co-located sub-components (modals, row items) are PascalCase but not exported. Examples: `Modal`, `ExpenseRow`, `GroceryRow`, `EventCard`, `NoUnitView`.

**CSS classes:**
- Utility classes use `kebab-case`. Examples: `glass-card`, `btn-primary`, `btn-ghost`, `section-title`, `font-display`, `badge-sage`, `badge-green`.

---

## Where to Add New Code

**New feature page (e.g., a Tasks screen):**
- Create: `src/pages/Tasks.jsx`
- Register route: `src/App.jsx` — add `<Route path="tasks" element={<Tasks />} />` inside the Layout route
- Add nav item: `src/components/Layout.jsx` — add entry to the `mobileNav` array
- Tests: No test directory exists; add `src/pages/Tasks.test.jsx` if testing is introduced

**New shared component (e.g., an Avatar component):**
- Create: `src/components/Avatar.jsx`
- Import directly in the pages that need it

**New custom hook:**
- Create: `src/hooks/useHookName.js`
- Follow the pattern in `src/hooks/useModalAnimation.js` (named export, `use` prefix)

**New Supabase table:**
- Add table + RLS policy to `supabase-schema.sql`
- Query inline in the relevant page component using the existing `supabase` import from `src/lib/supabase.js`

**New global CSS utility:**
- Add to `src/index.css` following the existing pattern (kebab-case class, CSS custom properties for theming)

**New design token:**
- Add to `:root` block in `src/index.css`
- Add dark mode override to `:root.dark` block in the same file
- Add responsive override to `src/styles/responsive.css` if the value should change at breakpoints

---

## Special Directories

**`dist/`:**
- Purpose: Vite production build output
- Generated: Yes (by `npm run build`)
- Committed: Yes (present in repo, though unusual — likely for manual deploy or Vercel integration)

**`.planning/codebase/`:**
- Purpose: Codebase map documents consumed by AI planning and execution agents
- Generated: By AI agents
- Committed: Yes

**`.agents/skills/`:**
- Purpose: AI skill definitions (GSAP, design taste, iOS design, etc.)
- Generated: No
- Committed: Yes

**`.vite/`:**
- Purpose: Vite dependency pre-bundling cache
- Generated: Yes
- Committed: Should not be (add to `.gitignore` if not already present)

---

## Notes

- `TopNavBar.jsx` is fully implemented (`src/components/TopNavBar.jsx`) but is not rendered in `Layout.jsx`. It was removed in a recent refactor (commit `5c82230`). It can be deleted or re-integrated.
- There is no `src/components/ui/` or shared component library. Every page builds its own UI inline. If the app grows, extracting `Button`, `Input`, `Modal`, `Badge` into `src/components/ui/` would reduce duplication significantly.
- The `dist/` directory being committed to git is unusual. If Vercel handles builds automatically, `dist/` should be gitignored.

---

*Structure analysis: 2026-05-20*
