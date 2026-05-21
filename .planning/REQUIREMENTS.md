# Requirements: Nest — API Integrations & Analytics Milestone

**Defined:** 2026-05-21
**Core Value:** Roommates stay in sync — shared watchlists, places, and spending insights are accurate and effortless to maintain without manual data entry.

## v1 Requirements

### Movies & TV (Watchlist)

- [ ] **MOVI-01**: User can search for movies and TV shows via TMDB API (title autocomplete, poster + year shown)
- [ ] **MOVI-02**: User can add a searched movie/show to the shared unit watchlist
- [ ] **MOVI-03**: User can give a 1–5 star rating to any watchlist item (per-user rating, visible on the item)
- [ ] **MOVI-04**: User can mark a watchlist item as "would rewatch" or "wouldn't rewatch" (per-user flag)
- [ ] **MOVI-05**: User can pin a watchlist item as "Currently Watching" — displayed for all unit members on Interests page
- [ ] **MOVI-06**: The Interests page shows a "Currently Watching" section with each roommate's pinned show
- [ ] **MOVI-07**: User can see movie/show suggestions derived from TMDB recommendations based on titles rated 4–5 stars by multiple unit members
- [ ] **MOVI-08**: User can remove an item they added from the shared watchlist

### Places

- [ ] **PLAC-01**: User can search for places by name using OSM Nominatim (address + category shown in results)
- [ ] **PLAC-02**: User can save a searched place to the shared unit places list
- [ ] **PLAC-03**: Saved places are auto-categorized from OSM amenity/type tags (e.g. restaurant, hiking, café, bar)
- [ ] **PLAC-04**: Place cards display name, address, category tag, and optional personal notes
- [ ] **PLAC-05**: User can add or edit personal notes on any saved place
- [ ] **PLAC-06**: User can remove a place they added from the shared list
- [ ] **PLAC-07**: User can filter the places list by category

### Expenses — Financial Analytics

- [ ] **EXPN-01**: Expenses page shows per-user spending totals (lifetime and current month)
- [ ] **EXPN-02**: Expenses page shows a category breakdown of all unit spending (ranked list or chart)
- [ ] **EXPN-03**: At the start of a new month, the app displays a summary card for the just-closed month with total spend, per-person breakdown, and top category

### Groceries — Icons & Inventory

- [ ] **GROC-01**: Grocery list items display an emoji icon auto-assigned from the item name
- [ ] **GROC-02**: Groceries page has two sections: "Shopping List" and "Inventory"
- [ ] **GROC-03**: User can add items to the Inventory section with a name and quantity
- [ ] **GROC-04**: User can increment or decrement inventory item quantity
- [ ] **GROC-05**: When an inventory item's quantity reaches 1 or below, it is automatically added to the Shopping List
- [ ] **GROC-06**: When a Shopping List item is purchased (checked off), it can be restocked to Inventory with a quantity

## v2 Requirements

### Movies & TV (Future)

- **MOVI-V2-01**: Map view for places showing all saved locations as pins on an OSM tile map
- **MOVI-V2-02**: Shared watchlist comments/reactions per item
- **MOVI-V2-03**: "Already watched" archive separate from active watchlist

### Expenses (Future)

- **EXPN-V2-01**: Monthly expense report delivered by email (requires Supabase Edge Function + Resend)
- **EXPN-V2-02**: Spending trends chart over multiple months

### Groceries (Future)

- **GROC-V2-01**: Barcode scanning to add inventory items
- **GROC-V2-02**: Open Food Facts API integration for product images

## Out of Scope

| Feature | Reason |
|---------|--------|
| Email delivery for monthly reports | No server infrastructure; Edge Functions + mail service out of scope this milestone |
| Map/pin view for places | List view sufficient for v1; map adds significant complexity |
| ML recommendation models | TMDB recommendations API is sufficient and requires no infra |
| Barcode scanning | Manual entry only; scanning adds native API complexity |
| TypeScript migration | Project is JS throughout, not part of this milestone |
| Server-side rendering | Vite SPA + Supabase client, no SSR |
| Push notifications | Requires service worker notification permissions; deferred |

## Traceability

*Populated during roadmap creation.*

| Requirement | Phase | Status |
|-------------|-------|--------|
| MOVI-01 | TBD | Pending |
| MOVI-02 | TBD | Pending |
| MOVI-03 | TBD | Pending |
| MOVI-04 | TBD | Pending |
| MOVI-05 | TBD | Pending |
| MOVI-06 | TBD | Pending |
| MOVI-07 | TBD | Pending |
| MOVI-08 | TBD | Pending |
| PLAC-01 | TBD | Pending |
| PLAC-02 | TBD | Pending |
| PLAC-03 | TBD | Pending |
| PLAC-04 | TBD | Pending |
| PLAC-05 | TBD | Pending |
| PLAC-06 | TBD | Pending |
| PLAC-07 | TBD | Pending |
| EXPN-01 | TBD | Pending |
| EXPN-02 | TBD | Pending |
| EXPN-03 | TBD | Pending |
| GROC-01 | TBD | Pending |
| GROC-02 | TBD | Pending |
| GROC-03 | TBD | Pending |
| GROC-04 | TBD | Pending |
| GROC-05 | TBD | Pending |
| GROC-06 | TBD | Pending |

**Coverage:**
- v1 requirements: 24 total
- Mapped to phases: 0 (TBD — roadmap creation next)
- Unmapped: 24 ⚠️

---
*Requirements defined: 2026-05-21*
*Last updated: 2026-05-21 after initial definition*
