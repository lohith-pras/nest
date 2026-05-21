---
phase: 01-db-foundation
plan: "01"
subsystem: database
tags: [supabase, postgres, sql, tmdb, interests, schema-migration]

# Dependency graph
requires: []
provides:
  - "interests table has tmdb_id, media_type, poster_path, release_year, overview columns"
  - "Phase 3 movie/TV watchlist schema is ready for use"
affects:
  - "03-interests-watchlist"
  - "any phase that reads/writes the interests table"

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "ALTER TABLE ... ADD COLUMN IF NOT EXISTS pattern for safe idempotent schema migrations"

key-files:
  created: []
  modified:
    - "supabase-schema.sql"

key-decisions:
  - "tmdb_id stored as text (not integer) to avoid potential overflow edge cases with large TMDB IDs"
  - "media_type has CHECK constraint ('movie' | 'tv') — nullable so existing places entries are unaffected"
  - "All 5 new columns are nullable — existing watchlist/places rows without TMDB data remain valid"

patterns-established:
  - "Phase-labeled migration blocks appended after the Migrations section in supabase-schema.sql"
  - "IF NOT EXISTS on all ALTER TABLE ADD COLUMN statements makes migrations idempotent"

requirements-completed:
  - "Enables MOVI-01 through MOVI-08 (interests table needs TMDB metadata columns)"

# Metrics
duration: 1min
completed: 2026-05-21
---

# Phase 01 Plan 01: DB Foundation — interests TMDB Columns Summary

**5 nullable TMDB metadata columns added to public.interests via idempotent ALTER TABLE migration block appended to supabase-schema.sql**

## Performance

- **Duration:** ~1 min
- **Started:** 2026-05-21T17:22:45Z
- **Completed:** 2026-05-21T17:23:18Z
- **Tasks:** 1 of 1
- **Files modified:** 1

## Accomplishments

- Appended clearly-labeled Phase 1 migration block to supabase-schema.sql
- Added `tmdb_id text` — stores TMDB item ID as text to prevent overflow
- Added `media_type text check (media_type in ('movie', 'tv'))` — constrained but nullable for places entries
- Added `poster_path text` — relative path; UI prepends base URL at render time
- Added `release_year integer` — nullable; places entries have no year
- Added `overview text` — nullable synopsis from TMDB API

## Task Commits

Each task was committed atomically:

1. **Task 1: Append TMDB columns migration to supabase-schema.sql** - `a2d6e49` (feat)

**Plan metadata:** _(final docs commit follows)_

## Files Created/Modified

- `/Users/lohith/Projects/Personal/nest/supabase-schema.sql` — Phase 1 migration block appended (9 lines added: comment header + 5 ALTER TABLE statements)

## Decisions Made

- `tmdb_id` is `text` not `integer` — TMDB IDs can be large; text avoids any overflow risk
- `media_type` gets a `CHECK (media_type IN ('movie', 'tv'))` constraint — enforces data integrity while still being nullable so existing `places` category rows are not broken
- All 5 columns are nullable — no `NOT NULL` defaults needed; this is a schema extension, not a schema replacement

## Deviations from Plan

None — plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

To apply this migration to an existing Supabase project, open the Supabase SQL Editor and run the 5 `ALTER TABLE` statements from the Phase 1 block at the bottom of `supabase-schema.sql`. The `IF NOT EXISTS` guard makes it safe to run on both fresh and existing databases.

## Known Stubs

None — this plan adds pure schema SQL only. No UI components or data-wiring stubs exist.

## Threat Flags

None — schema migration adds nullable columns to an existing table within the existing RLS perimeter. The `interests_all` policy already scopes all reads/writes by `unit_id`; no new network endpoints or auth paths introduced.

## Self-Check

- [x] `supabase-schema.sql` modified: FOUND
- [x] Commit `a2d6e49` exists in git log
- [x] 5 new column names present in file (grep count = 5)
- [x] All 5 ALTER TABLE statements target `public.interests`
- [x] No existing schema lines modified

## Self-Check: PASSED

## Next Phase Readiness

- `interests` table schema is ready for Phase 3 movie/TV watchlist feature work
- Phase 01-02 and 01-03 migrations can proceed independently (different tables)
- No blockers

---
*Phase: 01-db-foundation*
*Completed: 2026-05-21*
