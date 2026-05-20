# Phase 4.1 Responsive QA Checklist

**Date:** May 18, 2026  
**Phase:** 4.1 — Layout & Navigation Foundation  
**Branch:** `feat/phase-4-responsive-mobile-native`

---

## Visual Regression Testing

### No Horizontal Scroll ✓
- [ ] Mobile (375px) — No horizontal scroll
- [ ] Tablet (768px) — No horizontal scroll
- [ ] Desktop (1440px) — No horizontal scroll
- [ ] Ultra-wide (2560px) — Content centered, no overflow

### Top Navbar (Sticky) ✓
- [ ] Visible on page load
- [ ] Stays visible during vertical scroll
- [ ] Shows correct page title per route
- [ ] Background: sage-tinted with optional blur effect
- [ ] Border-bottom visible (1px solid var(--border))
- [ ] Height: ~56px on all sizes
- [ ] Padding respects safe-area-inset-top

### Bottom Navigation (Fixed) ✓
- [ ] Visible on page load
- [ ] Stays fixed during vertical scroll (does not scroll with content)
- [ ] Position: fixed (not absolute)
- [ ] 5 tabs present: Dashboard, Expenses, Groceries, Calendar, More
- [ ] Active tab highlights in primary color
- [ ] Inactive tabs show muted color
- [ ] Tabs scale on active: transform scale(1.05)
- [ ] Background: sage-tinted with optional blur effect
- [ ] Border-top visible (1px solid var(--border))
- [ ] Padding respects safe-area-inset-bottom
- [ ] Height: ~72px (with safe area)

### Responsive Breakpoints ✓
- [ ] Mobile (320-480px): Single column, compact spacing
- [ ] Tablet (481-768px): 2-column grids where applicable, increased padding
- [ ] Desktop (769-1024px): Multi-column layouts, max-width container
- [ ] Large Desktop (1025px+): Full-width usage

### Typography Scaling ✓
- [ ] H1: 28px (mobile) → 32px (tablet) → 36px (desktop) → 40px (large)
- [ ] H2: 22px (mobile) → 24px (tablet) → 28px (desktop) → 32px (large)
- [ ] H3: 18px (mobile) → 20px (tablet) → 22px (desktop) → 24px (large)
- [ ] Body: 14px (mobile) → 15px (tablet) → 16px (desktop) → 17px (large)

### Spacing Scaling ✓
- [ ] Horizontal padding: 24px (mobile) → 32px (tablet) → 48px (desktop)
- [ ] Gap between components: 16px (mobile) → 20px (tablet) → 24px (desktop)

### Content Area Padding ✓
- [ ] Main content has proper top padding (24px, no safe-area addition needed since TopNavBar is sticky)
- [ ] Bottom padding accounts for fixed bottom nav: calc(80px + safe-area-inset-bottom)
- [ ] No content hidden behind navbars
- [ ] Overflow-x: hidden on main

---

## Functional Testing

### Navigation ✓
- [ ] Clicking Dashboard tab loads Dashboard page
- [ ] Clicking Expenses tab loads Expenses page
- [ ] Clicking Groceries tab loads Groceries page
- [ ] Clicking Calendar tab loads Calendar page
- [ ] Clicking More tab loads More page
- [ ] Active tab highlights correctly after navigation
- [ ] Page title in TopNavBar updates on route change

### Animations ✓
- [ ] GSAP animations from Phase 3 still smooth (60fps+)
- [ ] No jank or layout thrashing on scroll
- [ ] No console errors related to animations

### Forms & Interactivity ✓
- [ ] Input fields full-width and responsive
- [ ] Buttons accessible (touch target min 44px)
- [ ] Modal overlays centered and responsive
- [ ] All form submissions work

### Images & Media ✓
- [ ] Images scale with viewport
- [ ] No image overflow
- [ ] Receipt uploads/images responsive

---

## Cross-Device Testing

### Real Device Testing
- [ ] iPhone SE (375px) — No scroll, layout correct
- [ ] iPhone 14 Pro Max (430px) — All features work
- [ ] iPad (768px) — 2-column grids render
- [ ] Android phone (360px–480px) — No horizontal scroll
- [ ] Desktop (1440px) — Proper spacing, centered layout

### Browser DevTools Testing
- [ ] Chrome DevTools: responsive viewport at 320px, 375px, 768px, 1440px
- [ ] Firefox DevTools: responsive viewport at multiple sizes
- [ ] Safari: responsive design mode at various breakpoints

### Safe Area Handling
- [ ] Notched phones (iPhone X+): content respects notch (env(safe-area-inset-*))
- [ ] iPad with Dynamic Island: layout adjusts correctly
- [ ] Android with gesture bar: bottom nav padding correct

---

## Console & Performance

### No Errors ✓
- [ ] No console errors on any page
- [ ] No warnings related to responsive CSS
- [ ] No missing imports or undefined variables

### Performance ✓
- [ ] Page loads fast (< 2s on 3G throttle)
- [ ] Scroll smooth (60fps)
- [ ] No layout shifts (CLS < 0.1)
- [ ] Memory usage stable during scroll

---

## Regression Testing (Phase 3 Features)

### GSAP Animations ✓
- [ ] Dashboard greeting stagger animation works
- [ ] Dashboard card waterfall animation works
- [ ] Dashboard owed amount count-up works
- [ ] Staggered list animations on all pages
- [ ] Smooth transitions between pages

### Phase 3 Features Still Work ✓
- [ ] Expense tracking functions
- [ ] Grocery list interactions
- [ ] Calendar events display
- [ ] Settings toggles
- [ ] Premium design tokens (OKLCH colors) applied

---

## Checklist Sign-Off

- [ ] All items above completed
- [ ] No regressions from Phase 3
- [ ] Ready for PR review

**Date Completed:** ___________  
**Tested By:** ___________  
**Notes:** ___________

---

## Known Limitations

- No horizontal scroll-based data tables yet (Phase 4.2+)
- Mobile gestures (swipe navigation) not yet implemented (Phase 4.2)
- Tablet-specific layouts not yet fully optimized (Phase 4.2)
- Desktop navigation redesign deferred to Phase 4.3+
