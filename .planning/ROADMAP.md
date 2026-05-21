# Roadmap: Nest — API Integrations & Analytics

## Overview

This milestone upgrades Roomy from a manual-entry app to a live-data-driven household hub. Five phases deliver the work in vertical slices: a shared DB foundation first, then fully functional Groceries icons and Inventory, a TMDB-powered movie/TV watchlist, an OSM Nominatim places search, and finally financial analytics on the Expenses page. Each phase ships a complete, usable feature end-to-end.

## Phases

- [x] **Phase 1: DB Foundation** - Schema migrations for all new tables and columns (interests, inventory, ratings)
- [ ] **Phase 2: Groceries — Icons & Inventory** - Emoji auto-assignment on grocery items plus a two-section Inventory workflow
- [ ] **Phase 3: Movie & TV Watchlist** - TMDB search, shared watchlist, per-user ratings, rewatch flags, Currently Watching, and suggestions
- [ ] **Phase 4: Places Search** - OSM Nominatim search, shared places list, auto-categorization, notes, filter, and remove
- [ ] **Phase 5: Expense Analytics** - Per-user spending totals, category breakdown, and monthly summary card

## Phase Details

### Phase 1: DB Foundation
**Goal**: All database schema changes needed by every downstream phase are applied and stable — Supabase tables, columns, and RLS policies are ready before any UI work begins.
**Mode:** mvp
**Depends on**: Nothing (first phase)
**Requirements**: None directly — enables GROC-01 through GROC-06, MOVI-01 through MOVI-08, PLAC-01 through PLAC-07, EXPN-01 through EXPN-03
**Success Criteria** (what must be TRUE):
  1. The `interests` table has `tmdb_id`, `media_type`, `poster_path`, `release_year`, and `overview` columns without breaking existing rows
  2. An `interest_ratings` table exists with `(user_id, interest_id)` unique constraint and RLS scoped to unit members
  3. The `groceries` table supports inventory items via an `is_inventory` flag and a `quantity` column
**Plans**: TBD
**UI hint**: no

### Phase 2: Groceries — Icons & Inventory
**Goal**: The Groceries page shows emoji icons on every list item and offers a two-section layout where users can manage pantry stock, auto-restock to the shopping list when quantity runs low, and mark purchases as restocked.
**Mode:** mvp
**Depends on**: Phase 1
**Requirements**: GROC-01, GROC-02, GROC-03, GROC-04, GROC-05, GROC-06
**Success Criteria** (what must be TRUE):
  1. Every item in the Shopping List displays a matching emoji icon assigned from its name
  2. The Groceries page shows two distinct sections — "Shopping List" and "Inventory" — with no UI confusion between them
  3. User can add an inventory item with a name and quantity, then increment or decrement that quantity
  4. When an inventory item's quantity drops to 1 or below it automatically appears in the Shopping List; when a Shopping List item is checked off the user can restock it to Inventory with a chosen quantity
**Plans**: TBD
**UI hint**: yes

### Phase 3: Movie & TV Watchlist
**Goal**: The Interests watchlist tab is powered by TMDB — users can search for titles, add them to a shared list, rate and flag them per-user, pin a Currently Watching item visible to all roommates, and browse AI-sourced suggestions based on high-rated titles.
**Mode:** mvp
**Depends on**: Phase 1
**Requirements**: MOVI-01, MOVI-02, MOVI-03, MOVI-04, MOVI-05, MOVI-06, MOVI-07, MOVI-08
**Success Criteria** (what must be TRUE):
  1. User can type a title, see TMDB autocomplete results with poster and year, and add a result to the shared watchlist
  2. User can give each watchlist item a 1–5 star rating and toggle a "would rewatch" flag — both per-user and visible on the item card
  3. A "Currently Watching" section at the top of the Interests page shows each roommate's pinned show, updated in real time
  4. A suggestions section surfaces TMDB-recommended titles derived from items rated 4–5 stars by multiple unit members
**Plans**: TBD
**UI hint**: yes

### Phase 4: Places Search
**Goal**: The Interests places tab lets users search for real-world locations via OSM Nominatim, save them to a shared list with auto-derived categories and personal notes, filter by category, and remove their own entries.
**Mode:** mvp
**Depends on**: Phase 1
**Requirements**: PLAC-01, PLAC-02, PLAC-03, PLAC-04, PLAC-05, PLAC-06, PLAC-07
**Success Criteria** (what must be TRUE):
  1. User can search by name, see Nominatim results with address and category, and save a place to the shared unit list
  2. Saved place cards show name, OSM-derived category tag (restaurant, café, hiking, etc.), address, and any personal notes the user has added or edited
  3. User can filter the places list by category to see only restaurants, parks, etc.
  4. User can remove a place they added and can add or edit personal notes on any saved place
**Plans**: TBD
**UI hint**: yes

### Phase 5: Expense Analytics
**Goal**: The Expenses page surfaces meaningful spending data — per-user totals for the month and lifetime, a ranked category breakdown, and a monthly summary card that appears at the start of each new month.
**Mode:** mvp
**Depends on**: Nothing (reads existing expenses data; no new schema required)
**Requirements**: EXPN-01, EXPN-02, EXPN-03
**Success Criteria** (what must be TRUE):
  1. The Expenses page shows each roommate's total spending for the current month and all-time, derived from existing expense records
  2. A category breakdown (ranked list or chart) shows how unit spending is distributed across categories
  3. At the start of a new month, a summary card for the just-closed month appears showing total spend, per-person breakdown, and the top spending category
**Plans**: TBD
**UI hint**: yes

## Progress

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. DB Foundation | 3/3 | Complete | 2026-05-21 |
| 2. Groceries — Icons & Inventory | 0/TBD | Not started | - |
| 3. Movie & TV Watchlist | 0/TBD | Not started | - |
| 4. Places Search | 0/TBD | Not started | - |
| 5. Expense Analytics | 0/TBD | Not started | - |
