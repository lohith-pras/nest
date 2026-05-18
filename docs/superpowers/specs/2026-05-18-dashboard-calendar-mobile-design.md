# Design Spec: Dashboard & Calendar Mobile Layout Fixes

## 1. Goal
Fix overlapping and oversized sections on the Dashboard, and ensure the Upcoming Events list on the Calendar page sits directly below the calendar grid, perfectly sized for the iPhone 16 Pro (max-width 430px).

## 2. Architecture & Layout Updates
The issues stem from legacy desktop CSS configurations (CSS Grid with spanning and auto-fit rules) fighting the constrained mobile viewport container we established earlier. We will resolve this by migrating these specific pages to pure vertical Flexbox layouts.

## 3. Dashboard Refactor
*   **Remove Grid Containers**: The main dashboard content wrapper will be changed from `display: 'grid'` to `display: 'flex', flexDirection: 'column', gap: '24px'`.
*   **Remove Column Spans**: Eliminate `gridColumn: 'span 2'` from the Financial Snapshot and Watchlist sections. In a vertical flex container, elements naturally occupy full width without forcing horizontal overflow.
*   **Financial Cards**: The two inner cards ("You are owed" and "Total Pending") will remain side-by-side using a simple CSS Grid (`gridTemplateColumns: '1fr 1fr'`) with appropriate gaps, which fits safely within 430px without overlapping.

## 4. Calendar Refactor
*   **Remove Desktop Grid**: The `.cal-grid` container currently uses a two-column layout (`minmax(0, 1fr) minmax(0, 340px)`) with an inline media query. We will remove the grid and the media query entirely.
*   **Vertical Stacking**: The calendar component will be wrapped in a standard flex column (`flexDirection: 'column', gap: '28px'`).
*   **Flow Order**: The Month Grid (interactive calendar) will be the top element. The detail card for the selected date and the "Upcoming Events" card will immediately follow it vertically.

## 5. Testing
*   Verify no horizontal scrolling or clipped edges on the Dashboard on an iPhone 16 Pro viewport.
*   Verify the Calendar grid is fully visible and the Upcoming Events panel stacks cleanly beneath it.