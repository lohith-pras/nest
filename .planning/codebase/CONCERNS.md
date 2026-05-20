# Codebase Concerns

**Analysis Date:** 2026-05-20

## Summary

Nest is a small roommate management PWA built with React, Vite, and Supabase. The codebase is functional and intentional in its design, but carries several recurring concerns: inconsistent error handling (silent failures mixed with raw `alert()` calls), queries that fetch all records without pagination, a complex "self-healing" profile bootstrap that runs eagerly on every login, and a total absence of automated tests. There are also minor security hygiene issues around invite-code generation and an unvalidated avatar URL field. None of these are showstoppers for a personal-use app, but they would each become significant at any scale or with multiple active users.

---

## Error Handling

**Silent failures in Calendar and Groceries:**
- `src/pages/Calendar.jsx` — `load()` (line 83) and `saveEvent()` (lines 89–98) perform Supabase calls and discard errors silently. A network failure or RLS denial produces no user feedback.
- `src/pages/Groceries.jsx` — `load()`, `toggleItem()`, `deleteItem()`, and `clearChecked()` all call Supabase without try/catch or error state. The optimistic UI update (toggling locally before the DB confirms) means a rejected write leaves the UI out of sync with no recovery path.

**Raw `alert()` for user-facing errors:**
- `src/pages/Expenses.jsx` lines 43, 191 — `alert()` used for receipt upload failure and save failure.
- `src/pages/Interests.jsx` line 131 — `alert()` for save failure.
- `src/pages/More.jsx` line 17 — `alert()` for sign-out failure.
- Fix approach: Replace with inline error state rendered in JSX, consistent with how `src/pages/Login.jsx` and `src/pages/Apartment.jsx` already handle errors.

---

## Tech Debt

**No pagination on any list query:**
- `src/pages/Expenses.jsx` line 159 — `select('*')` with no `.limit()`. A household that uses the app for a year will load the full expense history on every mount.
- `src/pages/Calendar.jsx` line 84 — Same pattern; all events are loaded regardless of how far back they go.
- `src/pages/Interests.jsx` line 100 — Full interests table loaded; filtered client-side by category tab.
- Impact: Increasing latency and payload as data grows. Supabase RLS policies enforce unit scoping, but within a unit the entire table is transferred.

**`select('*')` on profile-sensitive tables:**
- `src/pages/Apartment.jsx` line 19 — `supabase.from('profiles').select('*')` fetches every column for all unit members, including `avatar_url` and `created_at`, when only `id`, `full_name`, and potentially `avatar_url` are rendered.
- `src/pages/Apartment.jsx` line 20 — `supabase.from('units').select('*')` fetches the raw `invite_code` alongside all other columns.

**Dashboard owedToMe calculation ignores `split_amount`:**
- `src/pages/Dashboard.jsx` line 39 — The dashboard snapshot always divides `e.amount / 2` to compute `owedToMe`, whereas `src/pages/Expenses.jsx` line 211 correctly uses `e.split_amount` when set. The dashboard summary will show a wrong number for any custom-split expense.
- Files: `src/pages/Dashboard.jsx:39`, `src/pages/Expenses.jsx:211`
- Fix approach: Mirror the logic from `Expenses.jsx`: `e.split_amount != null ? e.split_amount : e.amount / 2`.

**`window.location.reload()` used for state refresh:**
- `src/pages/Apartment.jsx` line 165 — After creating or joining a unit the page does a hard reload rather than calling `refreshProfile()` (already exposed by `AuthContext`). This clears all React state and GSAP animations unnecessarily.
- Fix approach: Call `refreshProfile()` from `useAuth()` and navigate programmatically.

**House Notes are hardcoded strings:**
- `src/pages/Apartment.jsx` lines 109–114 — The "House Notes" section contains literal placeholder text ("Ask your roommate", "Wednesday & Saturday", "Left at door or mailroom") with no edit capability. This is feature-incomplete placeholder content shipped as if it were real data.

**App name inconsistency:**
- `vite.config.js` PWA manifest uses `"Nest"` / `"Nest"`.
- `src/pages/Login.jsx` line 95 renders `<h1>Roomy</h1>` as the visible brand name.
- These must agree for a coherent PWA identity.

---

## Security Considerations

**Weak invite code generation:**
- `src/context/AuthContext.jsx` line 67 and `src/pages/Apartment.jsx` line 130 — Invite codes are generated with `Math.random().toString(36).substring(2, 8).toUpperCase()`. `Math.random()` is not cryptographically random. A 6-character base-36 code has ~2.2 billion combinations, but predictable PRNG output reduces effective entropy. At minimum, use `crypto.getRandomValues()`.
- Current code already guards with `typeof crypto !== 'undefined' && crypto.randomUUID` for UUID generation but does not apply the same guard to the invite code string.

**Receipt filenames are predictable:**
- `src/pages/Expenses.jsx` line 29 — Upload path is `${session.user.id}/${Math.random()}.${fileExt}`. The filename portion uses `Math.random()` (non-CSPRNG), which could be guessed by a determined attacker who knows the storage bucket structure.
- Fix approach: Use `crypto.randomUUID()` for the filename segment.

**Unvalidated avatar URL:**
- `src/pages/Settings.jsx` line 87 — The avatar URL field is a free-text `<input type="url">`. The value is stored in the database and rendered as an `<img src={profile.avatar_url}>` in `src/pages/More.jsx` line 29. No domain allowlist or content-type check is enforced. A user could store a tracking pixel URL or a URL that serves unexpected content.
- Current mitigation: Supabase RLS ensures only the profile owner can write the field; cross-contamination between units is not possible.

**Self-healing logic runs on every auth state change:**
- `src/context/AuthContext.jsx` line 25 — `onAuthStateChange` calls `fetchProfile` on every session event. The `fetchProfile` function performs up to 4 sequential/parallel Supabase writes (create unit, update profile) during the "self-healing" path. If a user's connection drops mid-flow, partial writes can leave the profile in an inconsistent state with only `console.error` as the signal.

---

## Performance Bottlenecks

**GSAP targeting by element type, not scoped refs:**
- `src/pages/Dashboard.jsx` line 57 — `gsap.fromTo('.dashboard-greeting span', ...)` and `gsap.set('.glass-card', ...)` target global class selectors even inside `{ scope: containerRef }`. If multiple page components are mounted simultaneously (e.g., during a route transition), animations from one page will accidentally target `.glass-card` elements belonging to another.
- `src/pages/Calendar.jsx` line 70, `src/pages/Groceries.jsx` line 17, `src/pages/Interests.jsx` line 82 — `gsap.from('header', ...)` targets the first `<header>` in the document scope, not necessarily the page's own header.

**ScrollTrigger instances not refreshed on content change:**
- `src/pages/Dashboard.jsx` lines 83–94 — `ScrollTrigger.batch` is created inside `useGSAP` but depends on the DOM having the correct number of `.glass-card` elements at animation time. If `stats` data loads after the batch is created, new cards may miss the trigger. The cleanup (line 96) kills all triggers globally, which could interfere with any other page that has active ScrollTrigger instances during transitions.

**Real-time subscription on Groceries re-fetches full table:**
- `src/pages/Groceries.jsx` line 37 — The Postgres `changes` subscription fires `load()` on every change event, which re-fetches the entire grocery list. For a shared household doing rapid updates this means N full-table reads for N individual changes. The payload from the subscription event itself (the changed row) is discarded.

---

## Fragile Areas

**`AuthContext` self-healing flow:**
- `src/context/AuthContext.jsx` lines 62–148 — The profile-bootstrap path has 6 distinct `console.error` sites and multiple early returns, but no consolidated error state surfaced to the UI. If the self-healing fails, the user is silently placed into a `{ id, full_name: 'Roommate', unit_id: null }` fallback state (line 153–157). They will see the app but be unable to write any data (RLS blocks `unit_id: null` inserts). There is no prompt to retry or contact support.
- Safe modification: Add a boolean `profileError` to the context value and render a recovery UI in `App.jsx` when it is true.

**Optimistic UI without rollback:**
- `src/pages/Groceries.jsx` `toggleItem()` line 90, `deleteItem()` line 97 — Local state is mutated before the Supabase call completes, with no rollback on error. If the DB write fails the UI is permanently desynchronised until a page reload.
- `src/pages/Expenses.jsx` `markPaid()` lines 198–200 and `deleteExpense()` lines 202–205 — Same pattern.

**Calendar `load()` called without error surfacing:**
- `src/pages/Calendar.jsx` `saveEvent()` line 89 — On save, there is no try/catch. If the insert fails, `setShowModal(false)` is still called (line 97) and `load()` is called after, so the modal closes and the list refreshes. The user has no signal that their event was not actually saved — the list will simply not contain it.

---

## Test Coverage Gaps

**Zero test files exist in the project:**
- No `*.test.*` or `*.spec.*` files found anywhere in `src/`.
- No test runner configured (`jest`, `vitest`, or similar absent from `package.json`).
- Critical untested areas:
  - `AuthContext` self-healing logic (most complex code in the project)
  - Expense split calculation logic (`src/pages/Expenses.jsx` lines 211–212)
  - Dashboard `owedToMe` calculation (`src/pages/Dashboard.jsx` line 39) — which is already buggy
  - Invite code join flow in `Apartment.jsx`
- Priority: High — the dashboard calculation bug in particular would have been caught by a unit test.

---

## Missing Critical Features

**No delete confirmation dialog:**
- Every delete action (`deleteExpense`, `deleteItem`, `deleteEvent`, `clearChecked`) executes immediately on button click with no confirmation prompt. A mis-tap permanently deletes data.

**No offline/empty error state for failed loads:**
- When `load()` fails in `Expenses.jsx` (line 170) or `Interests.jsx` (line 111), `setLoading(false)` is still called (via `finally`) but the data arrays remain empty. The UI renders an "empty state" (e.g., "No expenses yet") which is misleading — the list may simply have failed to load, not actually be empty.

**Supabase placeholder fallback hides misconfiguration:**
- `src/lib/supabase.js` lines 7–12 — When `VITE_SUPABASE_URL` is missing or set to the placeholder string, the client is created against `https://placeholder.supabase.co` with a dummy key. The app renders normally but all DB calls silently fail. A missing environment variable should throw at startup, not silently degrade.

---

## Notes

- Row Level Security policies in `supabase-schema.sql` are correctly scoped by `unit_id` for all data tables, so the main data isolation concern is enforced at the DB level even if the client code omits a filter.
- The `get_unit_by_invite_code` RPC is `SECURITY DEFINER`, which is appropriate — it allows unauthenticated users to look up a unit by code without exposing the full units table.
- The `vercel.json` file is present but was not read (not a security-sensitive file, but worth reviewing for any rewrites that affect SPA routing).
- No `.env` contents were read during this analysis.
