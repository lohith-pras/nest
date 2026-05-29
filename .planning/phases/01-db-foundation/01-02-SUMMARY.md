---
phase: 01-db-foundation
plan: "02"
subsystem: database
tags: [supabase, postgres, rls, sql, ratings]

# Dependency graph
requires:
  - phase: 01-db-foundation/01-01
    provides: interests table with TMDB columns (tmdb_id, media_type, poster_path, release_year, overview)
provides:
  - public.interest_ratings table with per-user rating, rewatch flag, and currently-watching pin
  - UNIQUE constraint (user_id, interest_id) enabling upsert pattern for rating mutations
  - RLS policies scoping read to unit members, write to own rows
affects:
  - 03-movie-tv-watchlist (MOVI-03 star ratings, MOVI-04 rewatch flag, MOVI-05 currently watching pin)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Per-user, per-interest state stored in a separate ratings table (not on the shared interests table)"
    - "Nullable rating column allows watchlist add without rating; UI uses upsert on conflict"
    - "RLS select scoped to unit via subquery on interests.unit_id; write scoped to auth.uid() = user_id"

key-files:
  created: []
  modified:
    - supabase-schema.sql

key-decisions:
  - "Separate interest_ratings table (not columns on interests) — interests is unit-scoped, ratings are user-scoped; mixing would break the unit-wide RLS policy on interests"
  - "rating column nullable — users can add an item to the watchlist without rating it yet; CHECK constraint (1-5) only fires when a value is provided"
  - "is_currently_watching stored per-row (not a single-row-per-user table) — UI enforces one-per-user via upsert; simpler schema, flexible if requirements expand"
  - "UNIQUE (user_id, interest_id) enables upsert-on-conflict pattern for all rating mutations from the app"

patterns-established:
  - "Per-user state tables: separate table with (user_id, interest_id) PK and UNIQUE constraint, RLS split between unit-scoped select and user-scoped write"

requirements-completed:
  - "Enables MOVI-03 (star ratings per-user), MOVI-04 (rewatch flag), MOVI-05 (currently watching pin)"

# Metrics
duration: 1min
completed: 2026-05-21
---

# Phase 01 Plan 02: interest_ratings Table Summary

**Per-user watchlist rating table with RLS — enables MOVI-03 star ratings, MOVI-04 rewatch flag, MOVI-05 currently-watching pin via upsert-safe UNIQUE (user_id, interest_id) constraint**

## Performance

- **Duration:** ~1 min
- **Started:** 2026-05-21T17:24:32Z
- **Completed:** 2026-05-21T17:25:10Z
- **Tasks:** 1
- **Files modified:** 1

## Accomplishments
- Appended `public.interest_ratings` CREATE TABLE block to supabase-schema.sql with 8 columns and IF NOT EXISTS guard
- Added UNIQUE (user_id, interest_id) constraint enabling safe upsert from the app layer
- Enabled RLS and created 4 scoped policies: select (unit members), insert (own row + unit-scoped), update (own row), delete (own row)

## Task Commits

Each task was committed atomically:

1. **Task 1: Append interest_ratings table and RLS to supabase-schema.sql** - `fdf8244` (feat)

**Plan metadata:** _(docs commit follows)_

## Files Created/Modified
- `supabase-schema.sql` - Appended interest_ratings table definition (8 columns), UNIQUE constraint, RLS enable, and 4 RLS policies

## Decisions Made
- Separate table for per-user ratings rather than columns on `interests` — the interests table has a unit-scoped `FOR ALL` policy; per-user state needs user-scoped write policies without touching that policy.
- `rating` is nullable so users can add to watchlist and rate later; the CHECK (1-5) only fires when a value is provided.
- `is_currently_watching` stored per-row; UI enforces single active pin via upsert rather than a DB-level constraint, keeping the schema simple.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None.

## User Setup Required
None - schema changes take effect when the SQL block is applied to Supabase via the SQL Editor (same process as all prior migrations in this file).

## Next Phase Readiness
- `interest_ratings` table and all 4 RLS policies are defined and ready for Phase 3 (Movie & TV Watchlist) implementation.
- The upsert pattern (`INSERT ... ON CONFLICT (user_id, interest_id) DO UPDATE`) is the intended mutation path for all rating changes.
- No blockers.

---
*Phase: 01-db-foundation*
*Completed: 2026-05-21*
