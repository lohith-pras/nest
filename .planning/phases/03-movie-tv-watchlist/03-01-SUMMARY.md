---
phase: 03-movie-tv-watchlist
plan: "01"
subsystem: interests
tags: [tmdb, watchlist, search, modal, supabase]
dependency_graph:
  requires: []
  provides: [tmdb-search-modal, watchlist-insert-with-metadata]
  affects: [src/pages/Interests.jsx]
tech_stack:
  added: []
  patterns: [debounced-fetch, conditional-modal-by-tab, gated-delete]
key_files:
  modified:
    - src/pages/Interests.jsx
decisions:
  - "TMDBSearchModal added as a separate file-internal component alongside the existing Modal (no new files needed)"
  - "WatchRow edit button removed — TMDB items are not manually editable; PlaceRow retains edit"
  - "WatchRow grid adjusted from 5 columns to 4 (removed edit button column)"
  - "WatchRow shows TMDB metadata badge (media_type + release_year) for TMDB-sourced items; falls back to description for legacy manual items"
  - "Delete button on WatchRow conditionally rendered only when addedByMe === true (MOVI-08 ownership gate)"
metrics:
  duration_seconds: 135
  completed_date: "2026-05-21"
  tasks_completed: 1
  tasks_total: 1
  files_modified: 1
---

# Phase 03 Plan 01: TMDB Search Modal for Watchlist Summary

**One-liner:** TMDB /search/multi autocomplete modal replacing manual watchlist add, with poster images, media metadata, and ownership-gated delete.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Add TMDBSearchModal and update Interests page | 32d20de | src/pages/Interests.jsx |

## What Was Built

**TMDBSearchModal component** — a new file-internal modal (before the `Interests` default export) that:
- Accepts a search query and debounces TMDB `/search/multi` calls at 350ms
- Filters results to `movie` and `tv` media types only, excludes items without a title/name, caps at 6 results
- Renders each result with TMDB poster image (w300) or a deterministic color placeholder fallback
- Shows media type badge (FILM / TV) and release year beneath the title
- On selection, calls `onSave` with full TMDB metadata: `category`, `title`, `description` (first 200 chars of overview), `tmdb_id`, `media_type`, `poster_path`, `release_year`, `overview`

**saveWatchlistItem function** — inserts to Supabase `interests` table with the full TMDB payload plus `added_by` and `unit_id`. No edit path (watchlist items are TMDB-sourced only).

**Conditional modal rendering** — FAB and "Add one now" button both trigger `setShowModal(true)`. JSX then conditionally renders:
- `TMDBSearchModal` when `tab === 'watchlist'`
- Original `Modal` when `tab === 'places'` (unchanged, with `defaultCategory="places"` and `initialData={editData}`)

**WatchRow updates:**
- Renders `<img src={TMDB_IMAGE_BASE + item.poster_path}>` when `poster_path` is present; falls back to the colored placeholder div
- Edit button removed entirely — TMDB items are not manually editable
- Delete button conditionally rendered: `{addedByMe && <button onClick={onDelete}>...</button>}` (MOVI-08)
- Grid changed from `52px 1fr auto auto auto` to `52px 1fr auto auto` (4 columns, removed edit column)
- Meta row shows `media_type` + `release_year` badge for TMDB items; falls back to `description` for legacy manual entries

**PlaceRow** — unchanged.

## Deviations from Plan

None — plan executed exactly as written.

The only lint errors present in the repo (`RoomyUI.jsx` `react-refresh/only-export-components`, `SuccessOverlay.jsx` missing dep) are pre-existing and out of scope for this task.

## Known Stubs

None. TMDB poster images, media type, and release year are all wired from the live TMDB API response and persisted in Supabase. No placeholder data flows to the UI.

## Threat Flags

| Flag | File | Description |
|------|------|-------------|
| threat_flag: client-side-api-key | src/pages/Interests.jsx | VITE_TMDB_API_KEY exposed in browser bundle — acceptable per project constraints (TMDB read-only key, safe by TMDB's design as documented in CLAUDE.md) |

## Self-Check: PASSED

- [x] `src/pages/Interests.jsx` — file exists and modified
- [x] Commit `32d20de` exists: `git log --oneline | grep 32d20de` confirms
- [x] `TMDBSearchModal` — present at line 10
- [x] `VITE_TMDB_API_KEY` — present at line 25
- [x] `search/multi` — present at line 25
- [x] `saveWatchlistItem` — present at line 265
- [x] Conditional `TMDBSearchModal` rendered at line 293
- [x] Conditional `Modal` (places) rendered at line 295
- [x] `addedByMe` gates delete button at line 445
- [x] `poster_path` in insert payload at line 52
- [x] TMDB poster `<img>` in WatchRow at line 412
