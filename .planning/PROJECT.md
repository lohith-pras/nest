# Nest (Roomy) — Feature Milestone: API Integrations & Analytics

## What This Is

Nest (branded "Roomy") is a mobile-first roommate management PWA for shared households. Roommates share a "unit" and collaborate on groceries, expenses, a calendar, and a shared interests board. This milestone adds live API integrations to the Interests page (TMDB for movies/TV, OSM Nominatim for places), financial analytics to the Expenses page, and a two-section Inventory system to Groceries.

## Core Value

Roommates stay in sync — shared watchlists, places, and spending insights are accurate and effortless to maintain without manual data entry.

## Requirements

### Validated

- ✓ Multi-user unit system (roommates share a unit, RLS-scoped data) — existing
- ✓ Email/password auth via Supabase — existing
- ✓ Shared grocery list with real-time sync — existing
- ✓ Expenses tracking with categories and split tracking — existing
- ✓ Shared calendar/events — existing
- ✓ Interests page with watchlist and places tabs (manual entry) — existing
- ✓ PWA installable, iOS-native feel, dark mode — existing

### Active

**Interests — Movies & TV:**
- [ ] TMDB API search for movies and TV shows (title + poster + metadata)
- [ ] Add searched item to shared unit watchlist
- [ ] 5-star rating per user on any watchlist item
- [ ] Rewatch flag (yes/no) per user on any watchlist item
- [ ] Per-user "Currently Watching" pin, displayed unit-wide on Interests page
- [ ] Movie/show suggestion engine: surface TMDB recommendations based on titles both users rated 4–5 stars

**Interests — Places:**
- [ ] OSM Nominatim search for finding places by name
- [ ] Save places to shared unit list with address and OSM-derived category
- [ ] Auto-categorize places from OSM amenity tags (restaurant, hiking, café, etc.)
- [ ] Place cards show name, category, address, and optional personal notes

**Expenses — Financial Analysis:**
- [ ] Per-user spending totals (lifetime and current month)
- [ ] Category breakdown of all unit spending (chart or ranked list)
- [ ] Monthly in-app summary: statistics for the just-closed month, accessible from Expenses page

**Groceries — Icons & Inventory:**
- [ ] Emoji auto-assigned to grocery list items based on item name matching
- [ ] Inventory section on Groceries page (separate from the shopping list)
- [ ] Inventory items have a quantity field; user can increment/decrement
- [ ] When inventory quantity reaches 1 or below, item is automatically added to the shopping list

### Out of Scope

- Email delivery for monthly reports — no server infrastructure; in-app only this milestone
- Map/pin view for places — list view only; map is a future milestone
- ML recommendation models — TMDB recommendations API is sufficient
- Barcode scanning for grocery inventory — manual entry only
- TypeScript migration — project is JS throughout, no scope change
- Server-side rendering — Vite SPA + Supabase, no SSR this milestone

## Context

**Existing codebase:** React 19, Vite 8, Supabase JS client, GSAP 3, React Router v7. Pure client-side — all data fetching happens inline in page components. No service layer or query cache exists.

**Interests table** currently has: `id`, `category` (watchlist/places), `title`, `description`, `link`, `added_by`, `unit_id`, `created_at`. Movie integration requires schema changes: add `tmdb_id`, `media_type`, `poster_path`, `release_year`, `overview` to interests. Ratings and rewatch flags belong in a separate `interest_ratings` table (per-user, per-item).

**Groceries table** currently tracks list items. Inventory needs either a new `inventory` table or an `is_inventory` flag + `quantity` column added to `groceries`.

**TMDB API:** Free developer key required (`VITE_TMDB_API_KEY`). Supports CORS from browser. Has `/search/multi`, `/movie/{id}/recommendations`, `/tv/{id}/recommendations` endpoints. Better choice than OMDB: supports TV shows natively, provides poster images, has a recommendations endpoint.

**OSM Nominatim:** No API key required. Free for reasonable usage. Returns `address`, `type`, `class` (amenity tags) — enough for auto-categorization. Must respect usage policy (1 req/sec max).

**Multi-user scoping:** All new features follow existing RLS pattern — `unit_id` scopes shared data (watchlist, places, inventory), `user_id` scopes personal data (ratings, rewatch flags, currently-watching pins).

## Constraints

- **No server:** All logic runs client-side or in Supabase (RLS, functions). No Node/Express backend.
- **Supabase only:** New tables and schema changes go through Supabase; no other DB.
- **API keys client-side:** TMDB key exposed in browser — use TMDB read-only key (safe by TMDB's design). OSM needs no key.
- **Existing patterns:** New code follows the established pattern — `useEffect` data fetching in page components, `useAuth()` for session, GSAP entry animations after load.
- **No TypeScript:** All new files are `.jsx`/`.js`.
- **OSM rate limit:** Nominatim requests must be debounced (min 300ms between keystrokes, max 1 req/sec).

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| TMDB over OMDB | TMDB supports TV shows natively, provides poster images, has a recommendations API, and has a free read-only key with generous rate limits | — Pending |
| OSM Nominatim for place search | Free, no API key, returns amenity/category tags, GDPR-friendly, sufficient accuracy for casual use | — Pending |
| In-app monthly report only (no email) | No server exists; adding Supabase Edge Functions + email service (Resend) is out of scope for this milestone | — Pending |
| Emoji icons for grocery items | Zero dependencies, auto-assign via name-matching dictionary, renders natively on all platforms | — Pending |
| Per-user ratings on shared watchlist | Watchlist is shared (unit-scoped) but ratings are personal — separate `interest_ratings` table with `(user_id, interest_id)` unique constraint | — Pending |
| Inventory as separate section in Groceries | Two distinct workflows: curated pantry stock (inventory) vs. active shopping list (list) — keeping them separate prevents UX confusion | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd:complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-05-21 after initialization*
