---
phase: 03-movie-tv-watchlist
plan: "02"
subsystem: interests
tags: [ratings, watchlist, supabase, upsert, star-rating]
dependency_graph:
  requires: ["03-01"]
  provides: [interest-ratings-load, upsert-rating, watch-row-star-rating, watch-row-rewatch-toggle]
  affects: [src/pages/Interests.jsx]
tech_stack:
  added: []
  patterns: [upsert-on-conflict, optimistic-local-state-update, tappable-star-rating]
key_files:
  modified:
    - src/pages/Interests.jsx
decisions:
  - "alignItems changed from 'center' to 'start' on WatchRow grid to allow the taller content column (with stars) to align poster to top"
  - "Star rating row placed inside the 1fr content div (below meta row) rather than as a separate grid column — keeps the 52px 1fr auto auto layout unchanged"
  - "Clicking the currently-selected star passes null to onRate, clearing the rating (toggle-off behavior per success criteria 4)"
metrics:
  duration_seconds: 105
  completed_date: "2026-05-21"
  tasks_completed: 1
  tasks_total: 1
  files_modified: 1
---

# Phase 03 Plan 02: Star Ratings and Rewatch Toggle Summary

**One-liner:** Per-user 5-star ratings and would-rewatch toggle on each WatchRow, stored in interest_ratings via Supabase upsert with (user_id, interest_id) conflict resolution.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Load interest_ratings and add upsertRating to Interests | f890c9e | src/pages/Interests.jsx |

## What Was Built

**ratingsMap state** — `{ [interest_id]: { id, rating, would_rewatch, is_currently_watching } }` holding current user's rating data for all watchlist items.

**Extended load() Promise.all** — now fetches `interest_ratings` for the current user alongside interests and profiles (3-item Promise.all). Results populate `ratingsMap` after load.

**upsertRating(interestId, patch) function** — merges the existing rating record with the incoming patch (preserving fields not being changed), then upserts to `interest_ratings` with `onConflict: 'user_id,interest_id'`. On success, updates `ratingsMap` optimistically with the returned row.

**WatchRow upgrades:**
- Now accepts `myRating`, `onRate`, `onToggleRewatch` props
- 5 tappable star buttons rendered below the title/meta row — filled with `var(--accent-soft)` up to `myRating.rating`, empty (`var(--border)`) beyond
- Clicking a filled star (matches current rating) calls `onRate(null)` to clear it
- Rewatch toggle button labeled `↺ rewatch` — accent color when `myRating.would_rewatch` is true, faint when false
- WatchRow grid `alignItems` changed from `center` to `start` so the poster aligns to the top when content column is taller

## Deviations from Plan

**Minor layout adjustment: alignItems: 'start' on WatchRow grid**
- **Found during:** Task 1 implementation
- **Issue:** The plan's star rating row adds height to the 1fr content column; using `alignItems: 'center'` would misalign the poster image and action buttons when the content column is taller than the poster
- **Fix:** Changed `alignItems: 'center'` to `alignItems: 'start'` on the WatchRow grid container so the poster aligns to the top edge, matching common media list UI patterns
- **Files modified:** src/pages/Interests.jsx
- **Rule:** Rule 1 (bug fix — visual alignment issue caused by the new implementation)

## Known Stubs

None. Star ratings and rewatch state are fully wired to Supabase `interest_ratings` via live upsert. All UI state derives from real data loaded on mount and updated optimistically on interaction.

## Threat Flags

None. The upsert uses RLS policies from Phase 1 DB Foundation: users can only insert/update their own rating rows (enforced by `auth.uid() = user_id` policy). No new endpoints or trust boundaries introduced.

## Self-Check: PASSED

- [x] `src/pages/Interests.jsx` — file exists and modified
- [x] Commit `f890c9e` exists: confirmed via `git rev-parse --short HEAD`
- [x] `ratingsMap` state — present at line 222
- [x] `interest_ratings` fetch in load() Promise.all — present at line 232
- [x] `upsertRating` function — present at line 250
- [x] `onConflict: 'user_id,interest_id'` — present at line 262
- [x] `myRating` prop passed to WatchRow — present at line 382
- [x] Star buttons `[1,2,3,4,5]` with `★` character — present at lines 480-487
- [x] `↺ rewatch` toggle button — present at line 498
