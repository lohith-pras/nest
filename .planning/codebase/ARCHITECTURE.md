# Architecture

<!-- refreshed: 2026-05-20 -->

**Analysis Date:** 2026-05-20

## Summary

Nest (branded "Roomy") is a mobile-first roommate management PWA built with React 19, React Router v7, Supabase, and GSAP. The system is a thin client architecture: all business logic, data fetching, and mutations occur directly in page components via the Supabase JS client. There is no intermediate service layer. A single React Context (`AuthContext`) holds session and profile state. Page components fetch their own data independently on mount with no shared data cache.

---

## System Overview

```text
┌──────────────────────────────────────────────────────────────────┐
│                       Browser / PWA Shell                        │
│  index.html  +  Vite PWA (service worker, manifest)              │
└─────────────────────────┬────────────────────────────────────────┘
                           │
┌─────────────────────────▼────────────────────────────────────────┐
│                        src/main.jsx                              │
│  BrowserRouter → AuthProvider → App                              │
│  GSAP global setup (ScrollTrigger, reduced-motion, defaults)      │
│  Theme init from localStorage                                    │
└─────────────────────────┬────────────────────────────────────────┘
                           │
┌─────────────────────────▼────────────────────────────────────────┐
│                        src/App.jsx                               │
│  Route declarations + ProtectedRoute guard                       │
│  /login → Login (unauthenticated)                                │
│  / → Layout (ProtectedRoute) → nested page routes               │
└────────┬──────────────────────────────────────────┬─────────────┘
         │                                          │
┌────────▼───────────┐                  ┌───────────▼──────────────┐
│ src/components/    │                  │ src/context/AuthContext   │
│   Layout.jsx       │                  │                          │
│   TopNavBar.jsx    │                  │ session, profile,        │
│                    │                  │ loading, refreshProfile   │
│ Fixed bottom nav   │                  │                          │
│ <Outlet /> for     │                  │ Supabase auth listener   │
│ page content       │                  │ + self-healing profile   │
└────────┬───────────┘                  └──────────────────────────┘
         │
┌────────▼───────────────────────────────────────────────────────────┐
│                       src/pages/                                   │
│  Dashboard  Expenses  Groceries  Calendar  Interests  Apartment    │
│  Settings   More      Login                                        │
│                                                                    │
│  Each page: fetches own data from Supabase on mount               │
│  Each page: runs GSAP entry animations after data loads           │
│  Expenses & Interests & Calendar: embed local Modal components    │
└────────────────────────────┬───────────────────────────────────────┘
                             │
┌────────────────────────────▼───────────────────────────────────────┐
│                       src/lib/supabase.js                          │
│  Single exported `supabase` client (createClient)                 │
│  Falls back to placeholder URL/key when env vars absent           │
└────────────────────────────┬───────────────────────────────────────┘
                             │
┌────────────────────────────▼───────────────────────────────────────┐
│                   Supabase Cloud (BaaS)                            │
│  auth.users → profiles → units                                    │
│  tables: expenses, groceries, events, interests                   │
│  RLS policies: unit-scoped access for all shared data             │
│  RPC: get_unit_by_invite_code (security definer)                  │
│  Storage: receipts bucket                                         │
│  Realtime: groceries table subscribed in Groceries page           │
└────────────────────────────────────────────────────────────────────┘
```

---

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

---

## Pattern Overview

**Overall:** Flat page-based architecture. No services, stores, or dedicated API layer.

**Key Characteristics:**
- All Supabase queries are authored inline inside page components (`useEffect` + async functions).
- Authentication state flows down via `useAuth()` hook from `AuthContext`. Pages read `session`, `profile`, and `loading` from it.
- GSAP animations are scoped to a `containerRef` per page using `useGSAP({ scope: containerRef })`. Animations run after async data loads (guarded by `if (loading) return`).
- Modal components (`Modal`) are co-located as named inner functions inside the same file as the page that uses them (`Expenses.jsx`, `Calendar.jsx`, `Interests.jsx`).
- Dark mode is toggled via `document.documentElement.classList.add/remove('dark')` and persisted in `localStorage`. Initial state is set synchronously in `main.jsx` before React renders.

---

## Layers

**Bootstrap / Entry:**
- Purpose: Initialize GSAP, theme, React root
- Location: `src/main.jsx`
- Contains: GSAP defaults, reduced-motion matchMedia, theme detection
- Depends on: nothing internal
- Used by: nothing (root)

**Routing:**
- Purpose: Declare all routes; gate authenticated routes
- Location: `src/App.jsx`
- Contains: `ProtectedRoute`, `Routes`/`Route` declarations
- Depends on: `AuthContext`, all page components
- Used by: `main.jsx` via `<App />`

**Auth Context:**
- Purpose: Single source of truth for `session` and `profile`
- Location: `src/context/AuthContext.jsx`
- Contains: Supabase auth listener, profile fetch with self-healing unit association
- Depends on: `src/lib/supabase.js`
- Used by: `App`, all page components via `useAuth()`

**Layout Shell:**
- Purpose: Persistent chrome (bottom nav); renders nested route content via `<Outlet />`
- Location: `src/components/Layout.jsx`
- Contains: `mobileNav` config array, fixed bottom `<nav>` with `NavLink`s
- Depends on: `react-router-dom`
- Used by: `App` as the outer element wrapping all protected routes

**Pages:**
- Purpose: Feature screens (Dashboard, Expenses, Groceries, Calendar, Interests, Apartment, Settings, More, Login)
- Location: `src/pages/*.jsx`
- Contains: local state, Supabase queries, GSAP animation setup, inline sub-components (rows, modals)
- Depends on: `AuthContext`, `supabase`, hooks, `gsap`
- Used by: `App` routing

**Hooks:**
- Purpose: Reusable logic
- Location: `src/hooks/`
- `useModalAnimation.js` — GSAP timeline for modal open/close; called by `Expenses.jsx` and `Interests.jsx`
- `useResponsive.js` — breakpoint detector; exported but minimally used by pages directly

**Supabase Client:**
- Purpose: Singleton DB/auth/storage client
- Location: `src/lib/supabase.js`
- Depends on: `@supabase/supabase-js`, env vars `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`

---

## Data Flow

### Authentication Flow

1. `main.jsx` wraps the tree in `<AuthProvider>` (`src/context/AuthContext.jsx`)
2. `AuthProvider` calls `supabase.auth.getSession()` on mount. A 3-second safety timeout resolves to `null` if Supabase doesn't respond (handles missing env vars).
3. On session resolution, `fetchProfile()` is called with the user's UUID.
4. `fetchProfile` queries `profiles` table. If profile lacks `unit_id` but has signup metadata in `user_metadata`, it performs self-healing: creates or joins a `unit` and updates the profile record.
5. `session === undefined` → `loading: true`. Pages render a spinner. `session === null` → redirect to `/login`.
6. `onAuthStateChange` subscription keeps the session live for the lifetime of the app.

### Page Data Flow (typical)

1. Page mounts; calls `load()` inside `useEffect` (`src/pages/Expenses.jsx:130`, `src/pages/Groceries.jsx:31`, etc.)
2. `load()` issues one or more parallel `supabase.from(...).select(...)` calls via `Promise.all`.
3. Results stored in `useState`. `loading` set to `false`.
4. `useGSAP` hook fires after `loading` becomes `false`, animating elements into view.

### Real-time Groceries Flow

1. `Groceries.jsx` subscribes to `postgres_changes` on the `groceries` table on mount (`src/pages/Groceries.jsx:35`).
2. Any change event triggers `load()` to re-fetch the full list.
3. Subscription is cleaned up on unmount via `supabase.removeChannel(channel)`.

### Mutation Flow

1. User action (form submit, button click) calls an async function (e.g., `saveExpense`, `toggleItem`).
2. Function calls `supabase.from(...).insert/update/delete(...)`.
3. On success, either re-fetches via `load()` or performs optimistic local state update (e.g., `toggleItem` in `Groceries.jsx:91` updates local state before the DB call).

---

## State Management

**No global store.** All state is component-local (`useState`) except:

- **Auth/Profile** (`src/context/AuthContext.jsx`) — the only React Context; provides `session`, `profile`, `loading`, `refreshProfile` to the entire tree.
- **Theme** — managed imperatively via `document.documentElement.classList`; `localStorage` persists the preference; no React state owns it globally except a local `useState` inside `Settings.jsx`.
- **GSAP** — registered globally in `main.jsx` (plugins, defaults, reduced-motion matchMedia). Animation state is fully owned by GSAP timelines, not React state.

---

## Key Abstractions

**`glass-card` CSS class:**
- Used across every page as the standard content surface (card). Defined in `src/index.css`.
- Not a React component — it is a CSS utility class applied via `className="glass-card"`.

**`ProtectedRoute` (`src/App.jsx:14`):**
- Reads `{ session, loading }` from `useAuth()`.
- Shows a spinner while `loading`, redirects to `/login` if no session, renders children otherwise.

**`useModalAnimation` (`src/hooks/useModalAnimation.js`):**
- Accepts `overlayRef`, `panelRef`, `onClose`. Builds a GSAP timeline for entry animation and a reversed timeline for exit.
- Returns `handleClose` which reverses the timeline before calling `onClose`.
- Used by `Expenses.jsx` and `Interests.jsx` modals.

---

## Entry Points

**Browser entry:**
- Location: `src/main.jsx`
- Triggers: Vite loads `index.html`, which imports `src/main.jsx`
- Responsibilities: GSAP setup, theme init, ReactDOM render

**PWA entry:**
- Location: `vite.config.js` → VitePWA plugin → `public/pwa-*.png` icons
- `display: 'standalone'` — the app can be installed and run as a native-feeling PWA

---

## Architectural Constraints

- **No server:** All logic runs client-side. Supabase is the only backend.
- **Single Supabase client:** `src/lib/supabase.js` exports one instance; no per-user client creation.
- **Global state:** Only `AuthContext`. Theme is global via DOM class manipulation.
- **No data cache:** Each page re-fetches from Supabase on every mount. No query caching layer (no React Query, SWR, etc.).
- **GSAP global timeline:** `gsap.globalTimeline.timeScale(0)` is applied for reduced-motion; this affects all animations app-wide.
- **Circular imports:** None detected.
- **iOS safe-area:** Layout uses `env(safe-area-inset-top/bottom)` in padding throughout `Layout.jsx` and `Login.jsx`.

---

## Anti-Patterns

### Inline Data Fetching in Page Components

**What happens:** All Supabase queries are written directly inside each page component's `useEffect` and event handlers (e.g., `src/pages/Dashboard.jsx:26-50`, `src/pages/Expenses.jsx:155-175`).

**Why it's wrong:** Logic is not reusable. Changing query structure (e.g., adding `unit_id` filter) requires editing every page individually. There is no single place to add cross-cutting concerns like error normalization or logging.

**Do this instead:** Extract data access into dedicated hook files (`src/hooks/useExpenses.js`) or a service module (`src/services/expenses.js`) that pages call. Pages stay presentation-focused.

### `window.location.reload()` for State Reset

**What happens:** `Apartment.jsx:165` calls `window.location.reload()` after a successful unit join/create operation to refresh auth context.

**Why it's wrong:** Causes a full page reload instead of using `refreshProfile()` which is already exposed by `AuthContext`. Destroys all React state unnecessarily.

**Do this instead:** Call `refreshProfile()` from `useAuth()` to trigger a clean re-fetch of the profile, then navigate to `/` with `useNavigate()`.

### Modals Co-located as File-Internal Functions

**What happens:** `Modal` components in `Expenses.jsx`, `Calendar.jsx`, and `Interests.jsx` are declared as named functions inside the same file rather than as separate files.

**Why it's wrong:** Files grow large (Expenses.jsx is 340 lines). The modal cannot be reused, tested, or navigated to in isolation.

**Do this instead:** Move modals to `src/components/modals/ExpenseModal.jsx` etc. and import them.

---

## Error Handling

**Strategy:** Ad-hoc per mutation. No centralized error boundary.

**Patterns:**
- Async mutations use `try/catch`; errors are shown via `alert()` (e.g., `Expenses.jsx:189`) or local `error` state variables.
- `AuthContext.fetchProfile` has an outer `try/catch` that falls back to a minimal profile object on database errors.
- Supabase client initialization falls back to placeholder values so the app renders even without env vars (`src/lib/supabase.js:7-12`).
- No React `ErrorBoundary` component exists anywhere in the tree.

---

## Cross-Cutting Concerns

**Logging:** `console.error` and `console.log` used directly in `AuthContext.jsx` for self-healing flow diagnostics. No structured logging.

**Validation:** Client-side only. Form fields use HTML5 `required` and `type` attributes. No Zod/Yup schemas.

**Authentication:** Supabase email/password auth. Session managed by `AuthContext`. All protected routes gated by `ProtectedRoute`. Supabase RLS provides server-side enforcement scoped to `unit_id`.

**Theming:** OKLCH design tokens defined in `src/index.css` `:root` and `:root.dark`. System preference detected in `main.jsx`; user override stored in `localStorage`.

---

*Architecture analysis: 2026-05-20*
