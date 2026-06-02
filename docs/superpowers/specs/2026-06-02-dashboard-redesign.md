# Dashboard Redesign — Pill Nav + New Layout

## Goal
Redesign the dashboard to match an app-like feel inspired by the provided mockup: a full-screen, card-based layout with a top pill navigation bar replacing the global bottom navbar.

## Layout

```
┌──────────────────────────────┐
│ ✦ Roomy              [Grid]  │  ← Header row
│                              │
│ Welcome home,                │  ← Greeting
│ Lohith                       │
│                              │
│ [Overview] Balance Groc Cal  │  ← Pill nav bar (scrollable)
│──────────────────────────────│
│ ┌────────────────────────┐   │
│ │ OWED TO YOU    [G]     │   │  ← Balance card (full-width, liquid glass)
│ │ €42.50                 │   │
│ │ Gokul owes you         │   │
│ │ [Settle up] [Remind G] │   │
│ └────────────────────────┘   │
│ ┌────────┐ ┌──────────────┐  │
│ │Shopping│ │ ON TONIGHT   │  │  ← Two-col cards
│ │List    │ │ Trash night  │  │
│ │☑ Coffee│ │ • 21:00      │  │
│ │○ Channa│ └──────────────┘  │
│ └────────┘                   │
└──────────────────────────────┘
```

## Components

### 1. Header
- Left: Star/asterisk logo icon (SVG, accent color)
- Right: Grid/dots menu icon (SVG, navigates to More page)
- No title text

### 2. Greeting
- "Welcome home," in Sora, small/muted
- First name in Fraunces, large (clamp 42–56px), bold weight

### 3. Pill Nav Bar
- Horizontal scrollable row, no scrollbar visible
- Pills: Overview · Balance · Groceries · Calendar · More
- Active pill: filled accent background, white text, rounded-full
- Inactive pills: transparent, muted text, border
- Tapping navigates to the respective page (replaces bottom navbar globally)

### 4. Balance Card
- Full-width, liquid glass styling
- Label: "OWED TO YOU" / "YOU OWE" in mono overline
- Amount in Fraunces display size
- Roommate avatar circle (top right)
- Settle up (primary btn) + Remind (ghost btn)

### 5. Two-Column Cards Row
- Left: Grocery/Shopping List card — shows top 3 items with checkbox state
- Right: Next Event card — "ON TONIGHT" label + event title + time

## Changes Required

- **Remove** `<BottomNav />` from `Layout.jsx` globally
- **Remove** the existing `<Dashboard />` content and replace with the new layout
- Dashboard becomes the full-screen home; all navigation happens through pill bar

## Fonts
- Fraunces for display/headings
- Sora for body/labels
- SF Mono for overline labels

## Liquid Glass
- Balance card and both lower cards use existing `.glass-card` class
