# Design Spec: Phase 4 — Responsive Mobile-Native Foundation

**Date:** May 18, 2026  
**Status:** Design Review  
**Goal:** Transform the app from a locked 430px iPhone-only experience into a responsive, truly mobile-native web app that works across all device sizes while maintaining premium aesthetics and performance.

---

## 1. Problem Statement

**Current State:**
- App is locked to `max-width: 430px` (iPhone 16 Pro Max only)
- Horizontal scrolling occurs on all pages for smaller devices and non-conforming content
- Bottom navigation uses `position: absolute`, causing it to overlay content rather than float during scroll
- No responsive breakpoints for tablets, larger phones, or desktop viewing
- Not suitable for cross-device testing or real-world mobile deployment

**Goals for Phase 4:**
1. ✅ Fix horizontal scroll on all pages
2. ✅ Implement sticky top navbar (page title only)
3. ✅ Fix bottom nav to truly float during vertical scroll
4. ✅ Add responsive breakpoints (mobile, tablet, desktop)
5. ✅ Support devices from 320px (iPhone SE) to 2560px (desktop/tablet)
6. ✅ Maintain premium design token system and animation quality

---

## 2. Architecture: Navigation System

### 2.1 Top Navbar (Sticky Header)

**Position & Layout:**
- `position: sticky; top: 0;` with `z-index: 40`
- Height: 56px (includes 8px padding + safe-area-inset-top)
- Full viewport width, spans edge-to-edge
- Flex layout: [Page Title] on left, [optional: user avatar/settings icon] on right

**Styling:**
- Background: `var(--nav-bg)` = `oklch(99.2% 0.003 145 / 0.85)` (light theme)
- Optional: `backdrop-filter: blur(12px)` for premium glass effect
- Border-bottom: `1px solid var(--border)` for subtle separation
- Text: Page title uses `--font-display` (Plus Jakarta Sans), font-size 18px (scaled per breakpoint)

**Content:**
- Left: Page title (e.g., "Dashboard", "Expenses", "Settings")
- Right: Optional compact action (user avatar or settings icon)
- No back button (bottom nav provides primary navigation; tab-based navigation doesn't need back)

**Responsive Behavior:**
- Mobile (320-480px): Full-width navbar, centered title
- Tablet (481-768px): Same, but title slightly larger (20px)
- Desktop (769px+): Same, but with additional breadcrumb or context

---

### 2.2 Bottom Tab Navigation (Fixed)

**Position & Layout:**
- `position: fixed; bottom: 0;` with `z-index: 50`
- Left: 0, Right: 0 (spans full viewport width)
- Height: ~72px (includes 12px padding + env(safe-area-inset-bottom))
- Flex layout: 5 equal-width tabs

**Styling:**
- Background: `var(--nav-bg)` = `oklch(99.2% 0.003 145 / 0.85)` with optional backdrop blur
- Border-top: `1px solid var(--border)` for separation from content
- Tab items: flexbox, centered, flex: 1 (equal width distribution)

**Tab Items:**
- Icon: 22px (SVG), changes color based on active state
- Label: 10px, uppercase, letter-spacing 0.04em, font-weight 800
- Color (inactive): `var(--muted)` (sage grey)
- Color (active): `var(--primary)` (deep forest green)
- Transition: `color 0.2s, transform 0.15s ease`
- Active state: `transform: scale(1.05)`

**Tabs (in order):**
1. Dashboard (grid icon)
2. Expenses (dollar icon)
3. Groceries (shopping bag icon)
4. Calendar (calendar icon)
5. More (three dots icon)

**Responsive Behavior:**
- Mobile (320px+): Full-width fixed nav with 5 tabs
- Tablet/Desktop (769px+): Could optionally show horizontal top nav + hide bottom nav, or keep bottom nav

---

### 2.3 Content Area (Responsive Main)

**Layout:**
- Flex column: `display: flex; flex-direction: column; height: 100vh;`
- Main content: `flex: 1; overflow-y: auto; overflow-x: hidden;`
- Padding: Responsive
  - Mobile: `24px` (left/right), `24px top`, `calc(80px + safe-area-inset-bottom)` bottom
  - Tablet (481px+): `32px` (left/right)
  - Desktop (769px+): `48px` (left/right), centered with max-width container

**Width Constraints:**
- Remove global `max-width: 430px`
- Use CSS container queries or media queries per breakpoint
- Mobile: 100% width (minus padding)
- Tablet: 100% width (minus padding)
- Desktop: Centered, max-width ~900px

**Overflow Handling:**
- `overflow-x: hidden` on main to prevent horizontal scroll
- All child elements must respect parent width
- Cards, lists, tables: use `width: 100%` or flex, not fixed pixel widths
- If a component needs horizontal scroll (data table), it's wrapped in a scoped container with `overflow-x: auto` (not page-level)

---

## 3. Responsive Breakpoints & Scaling

### 3.1 Breakpoints

```css
/* Mobile First Approach */
@media (min-width: 481px) {
  /* Tablet adjustments */
}

@media (min-width: 769px) {
  /* Desktop adjustments */
}

@media (min-width: 1024px) {
  /* Large desktop */
}
```

| Breakpoint | Device | Max Width | Strategy |
|------------|--------|-----------|----------|
| **320px–480px** | Mobile (iPhone SE, 12, 14, 15) | 100% | Single-column, compact spacing, full-width cards |
| **481px–768px** | Tablet (iPad, Galaxy Tab) | 100% | 2-column grids where appropriate, increased spacing |
| **769px–1024px** | Desktop (small), iPad Pro | ~900px centered | Multi-column layouts, sidebar navigation optional |
| **1025px+** | Large desktop, monitors | ~900px centered | Full multi-column, optional top horizontal nav |

### 3.2 Responsive Typography & Spacing

**Font Sizes (scale per breakpoint):**
- **Mobile:** H1=28px, H2=22px, H3=18px, body=14px
- **Tablet:** H1=32px, H2=24px, H3=20px, body=15px
- **Desktop:** H1=36px, H2=28px, H3=22px, body=16px

**Spacing (left/right padding):**
- **Mobile:** 24px
- **Tablet:** 32px
- **Desktop:** 48px (centered container)

**Gap Spacing (between components):**
- **Mobile:** 16px (compact)
- **Tablet:** 20px
- **Desktop:** 24px

---

## 4. Component Audit & Fixes

### 4.1 Pages to Audit

1. **Dashboard** — Check for hardcoded widths, overflow issues
2. **Expenses** — Ensure list/table doesn't overflow horizontally
3. **Groceries** — Check grid layout, card sizing
4. **Calendar** — Responsive calendar grid
5. **More** — Secondary menu, ensure proper layout
6. **Settings** — Form inputs, toggles scaled per breakpoint

### 4.2 Common Issues & Fixes

**Issue:** Hardcoded `width: 400px` on card
**Fix:** Change to `width: 100%` or `flex: 1; min-width: 0`

**Issue:** List items with fixed padding `20px` on all sides
**Fix:** Use responsive padding: `padding: var(--spacing-mobile)` → `calc(var(--spacing-tablet))` at breakpoints

**Issue:** Expense table with overflow-x on page
**Fix:** Wrap table in scoped container with `overflow-x: auto`, not on main

**Issue:** Images/screenshots at 100% width causing overflow
**Fix:** Use `max-width: 100%; height: auto;` on all images

---

## 5. Mobile Gestures (Phase 4.2)

**Scope:** Not Phase 4.1, but planned for Phase 4.2 after layout fixes are solid.

1. **Swipe Left/Right** — Navigate between adjacent tabs (Dashboard → Expenses, etc.)
2. **Pull-to-Refresh** — On Dashboard/Expenses to reload data from Supabase
3. **Swipe Up on Nav** — Reveal secondary actions (logout, help, feedback)

---

## 6. Phase 3 Features (Phase 4.3+)

Continue Phase 3 roadmap while building on responsive foundation:
- **Analytics Dashboard** — Charts for spending trends, chore completion
- **Advanced Notifications** — Push notifications, in-app notification bell
- **Deep PWA Support** — Offline-first actions, Web Share API

---

## 7. Testing Strategy

### 7.1 Unit Tests
- Responsive hook/utility tests (breakpoint detection, spacing calculations)
- Component snapshot tests across breakpoints

### 7.2 E2E Tests
- Navigation: clicking tabs, sticky header visibility, bottom nav fixed positioning
- Responsive: test at 3+ breakpoints (320px, 768px, 1024px)
- Gestures (Phase 4.2): swipe navigation, pull-to-refresh

### 7.3 Manual QA (All Phases)
- iPhone SE (375px)
- iPhone 14 Pro Max (430px)
- iPad (768px)
- Desktop (1440px+)
- Android equivalents if possible

---

## 8. Implementation Phases

### Phase 4.1: Layout & Navigation Foundation
1. Remove `max-width: 430px` global constraint
2. Implement sticky top navbar component
3. Fix bottom nav positioning (absolute → fixed)
4. Add responsive breakpoints & CSS variables for spacing
5. Audit & fix all pages for horizontal scroll
6. Test on 3+ devices

### Phase 4.2: Mobile Gestures
1. Implement swipe-to-navigate (tabs)
2. Add pull-to-refresh on Dashboard/Expenses
3. Optional: swipe-up secondary menu

### Phase 4.3: Phase 3 Features
1. Continue analytics/notifications from Phase 3 roadmap
2. Build on responsive foundation without layout rework

### Phase 4.4: Testing & QA
1. Unit test coverage for responsive utilities
2. E2E tests for navigation & gestures
3. Manual testing on real devices

---

## 9. Success Criteria

✅ No horizontal scroll on any page (320px–2560px)  
✅ Top navbar sticky and always visible  
✅ Bottom nav fixed during vertical scroll  
✅ App works on mobile, tablet, desktop without layout breaks  
✅ Premium design tokens maintained across all breakpoints  
✅ GSAP animations smooth on all devices  
✅ Manual QA passed on 3+ real devices  
✅ E2E tests passing for navigation & responsiveness  

---

## 10. Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Refactoring layout breaks animations | High | Lock GSAP code, test animations after each change |
| Third-party components (charts, datepickers) not responsive | Medium | Audit dependencies early, wrap in responsive containers |
| Tailwind + custom CSS conflicts on responsive | Medium | Audit Tailwind config, use CSS custom properties for responsive values |
| Testing on limited devices | Low | Use browser DevTools, BrowserStack, or real devices from team |

---

## Notes

- **CSS Strategy:** Mobile-first approach (start with mobile styles, add media queries for larger breakpoints)
- **No Breaking Changes:** Phase 4.1 layout fixes are backward compatible; existing features unchanged
- **Animation Preservation:** All GSAP animations from Phase 3 work unchanged; test after each layout change
- **Design Tokens:** Use existing `--spacing-*`, `--radius-*` custom properties; add responsive variants if needed
