---
phase: 01-db-foundation
plan: "03"
subsystem: database
tags: [schema, migration, groceries, inventory]
dependency_graph:
  requires: []
  provides: [is_inventory column, stock_count column]
  affects: [Phase 2 GROC-02 through GROC-06]
tech_stack:
  added: []
  patterns: [SQL migrations, ALTER TABLE IF NOT EXISTS]
key_files:
  created: []
  modified: [supabase-schema.sql]
decisions: []
metrics:
  duration: "2 minutes"
  completed_date: "2026-05-21"
  tasks_completed: 1
  files_modified: 1
---

# Phase 01 Plan 03: Groceries Inventory Columns — Summary

**Add is_inventory boolean flag and stock_count integer column to the groceries table for inventory management.**

## Overview

Phase 1 Plan 03 appended two new columns to the existing `public.groceries` table to support the two-section Groceries layout (Phase 2):

- **is_inventory** (boolean NOT NULL DEFAULT false): Distinguishes shopping list items from inventory/pantry items. All existing rows default to false (legacy shopping list mode).
- **stock_count** (integer NOT NULL DEFAULT 1): Numeric stock level for inventory items, enabling increment/decrement operations in Phase 2. The existing `quantity` text column remains unchanged for shopping list display (e.g., "2 lbs", "1 dozen").

## What Was Built

Added to `supabase-schema.sql` (lines 214–218):

```sql
-- ──────────────────────────────────────────────────────────────
-- Phase 1: DB Foundation — groceries table inventory columns
-- ──────────────────────────────────────────────────────────────
alter table public.groceries add column if not exists is_inventory boolean not null default false;
alter table public.groceries add column if not exists stock_count integer not null default 1;
```

Both statements use `ADD COLUMN IF NOT EXISTS` for idempotency (safe to re-run).

## Acceptance Criteria — PASSED

- ✓ `supabase-schema.sql` contains `ADD COLUMN IF NOT EXISTS is_inventory boolean not null default false`
- ✓ `supabase-schema.sql` contains `ADD COLUMN IF NOT EXISTS stock_count integer not null default 1`
- ✓ Both ALTER TABLE statements target `public.groceries`
- ✓ Existing `quantity text` column is unchanged (verified: still present in CREATE TABLE block)
- ✓ No existing schema lines were modified

## Verification

```bash
grep "is_inventory\|stock_count" supabase-schema.sql
# Output:
# alter table public.groceries add column if not exists is_inventory boolean not null default false;
# alter table public.groceries add column if not exists stock_count integer not null default 1;
```

Existing quantity column confirmed intact:
```bash
grep -A 8 "create table if not exists public.groceries" supabase-schema.sql | grep "quantity"
# Output: quantity    text,
```

## Requirements Enabled

Plan 01-03 enables the following Phase 2 Groceries feature requirements:

- **GROC-02**: Two-section layout (Shopping List vs Inventory) — is_inventory flag drives the split
- **GROC-03**: Add inventory items — clients can set is_inventory=true when creating items
- **GROC-04**: Increment/decrement stock — stock_count column supports numeric operations
- **GROC-05**: Auto-restock — stock_count values can be monitored and restored
- **GROC-06**: Restock from shopping list — items can migrate from shopping list (is_inventory=false) to inventory (is_inventory=true)

## Deviations from Plan

None — plan executed exactly as written.

## Self-Check: PASSED

- ✓ supabase-schema.sql exists and contains both new ALTER TABLE statements
- ✓ Commit 6b24720 exists in git history
- ✓ Commit message reflects task scope and requirements

## Next Steps

Plan 01-03 completes Phase 1 DB Foundation. Phase 2 (Groceries — Icons & Inventory) will implement the React components and Supabase mutations that use these new columns.
