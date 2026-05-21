---
phase: 03-movie-tv-watchlist
plan: "03"
subsystem: interests
tags: [tmdb, watchlist, currently-watching, suggestions, recommendations, supabase]
dependency_graph:
  requires: ["03-01", "03-02"]
  provides: [currently-watching-section, tmdb-suggestions-section, toggle-currently-watching]
  affects: [src/pages/Interests.jsx]
tech_stack:
  added: []
  patterns: [all-unit-ratings-fetch, tmdb-recommendations-fetch, optimistic-list-state-update, horizontal-scroll-poster-cards]
key_files:
  modified:
    - src/pages/Interests.jsx
decisions:
  - "Currently Watching section rendered via IIFE-wrapped cwItems derivation to avoid top-level variable pollution in JSX; placed above the loading spinner/list block"
  - "allRatings fetch placed at end of load() after setLoading(false) guard is ready, separate from the 3-item Promise.all (interests, profiles, current user ratings)"
  - "fetchSuggestions called with both interests and allRatData from load() so it never runs before items are in state"
  - "isCW prop on WatchRow reads from ratingsMap (current user's data) not allRatings — ensures reactivity from upsertRating optimistic update"
  - "👁 button shares the same row as the ↺ rewatch toggle using borderLeft separator for visual grouping without layout changes"
metrics:
  duration_seconds: 180
  completed_date: "2026-05-21"
  tasks_completed: 1
  tasks_total: 1
  files_modified: 1
---

# Phase 03 Plan 03: Currently Watching and Suggestions Summary

**One-liner:** Horizontal poster-card "Currently Watching" and "You might like" sections added to watchlist tab, backed by unit-wide interest_ratings and TMDB /recommendations endpoint.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Add Currently Watching and Suggestions to Interests | bcb20b3 | src/pages/Interests.jsx |

## What Was Built

**allRatings state** — `useState([])` holding all unit members' `interest_ratings` rows (id, interest_id, user_id, rating, would_rewatch, is_currently_watching). Supabase RLS scopes this to unit members automatically via the existing policy.

**suggestions state** — `useState([])` holding deduplicated TMDB recommendation results (up to 6 items).

**load() extension** — After the existing 3-item Promise.all and state updates, load() now also fetches all unit ratings via a bare `.select()` (no `.eq()` filter — RLS handles scope), sets `allRatings`, then calls `fetchSuggestions(intRes.data, allRatData)`.

**fetchSuggestions(interests, ratings) function** — Filters ratings to `rating >= 4`, maps to interest_ids, joins against interests to find items with `tmdb_id` and `media_type`. Deduplicates by tmdb_id, takes up to 3 as seeds. For each seed, fetches `https://api.themoviedb.org/3/{media_type}/{tmdb_id}/recommendations?api_key=...`. Filters results that are not already on the watchlist, takes up to 4 per seed. Deduplicates final set by id, caps at 6 suggestions. Gracefully handles fetch errors via console.error.

**toggleCurrentlyWatching(interestId) function** — Reads current `ratingsMap[interestId].is_currently_watching`, inverts it. If turning ON: clears all other `is_currently_watching=true` rows for the current user in Supabase and in local `allRatings` state. Calls `upsertRating(interestId, { is_currently_watching: isNowWatching })` for the target item. Updates `allRatings` optimistically (finds existing entry by user_id+interest_id or appends new entry).

**Currently Watching section** — Rendered just before the loading block inside the watchlist tab. Uses an IIFE to derive `cwItems` from `allRatings.filter(r => r.is_currently_watching)`, joined with `items` to get poster_path and title, and `profiles` to get the watcher's first name. Renders as `SectionRule "00 — Currently watching"` + horizontal flex scroll of 90px-wide poster cards (72×108 poster or color placeholder, watcher name, truncated title).

**Suggestions section** — Rendered at the bottom of the non-loading content block (`tab === 'watchlist' && suggestions.length > 0`). Shows `SectionRule "02 — You might like"` + horizontal flex scroll of 90px-wide poster cards (72×108 TMDB poster or color placeholder, title, release year in mono font).

**WatchRow 👁 toggle** — WatchRow now accepts `isCW` (boolean) and `onToggleCW` (function) props. A `👁` button rendered in the star rating row (after ↺ rewatch, separated by borderLeft) toggles accent color when `isCW` is true. Prop passed from parent: `isCW={ratingsMap[item.id]?.is_currently_watching ?? false}` and `onToggleCW={() => toggleCurrentlyWatching(item.id)}`.

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None. Currently Watching reads live `allRatings` from Supabase. Suggestions fetch live TMDB /recommendations. Both sections are conditionally rendered only when data is present (no empty state placeholders shown).

## Threat Flags

| Flag | File | Description |
|------|------|-------------|
| threat_flag: client-side-api-key | src/pages/Interests.jsx | VITE_TMDB_API_KEY used in fetchSuggestions recommendations fetch — same as prior plans, acceptable per project constraints (TMDB read-only key) |

## Self-Check: PASSED

- [x] `src/pages/Interests.jsx` — file exists and modified
- [x] Commit `bcb20b3` — confirmed via `git rev-parse --short HEAD`
- [x] `allRatings` state — present at line 223
- [x] `suggestions` state — present at line 224
- [x] `fetchSuggestions` function — present at line 258
- [x] TMDB recommendations URL — present at line 273
- [x] `toggleCurrentlyWatching` function — present at line 309
- [x] `cwItems` derived value — present at line 420
- [x] `SectionRule "00 — Currently watching"` — present at line 432
- [x] `SectionRule "02 — You might like"` — present at line 513
- [x] `isCW` prop on WatchRow call — present at line 492
- [x] `onToggleCW` prop on WatchRow call — present at line 493
- [x] `isCW`/`onToggleCW` in WatchRow signature — present at line 575
- [x] 👁 button in WatchRow — present at lines 641-648
- [x] Build passes: `npm run build` — confirmed, 0 errors
