# Coding Conventions

## Summary

This is a React 19 + Vite project written entirely in JavaScript (`.jsx`/`.js` — no TypeScript). The codebase uses plain CSS variables for design tokens, inline `style` props for component-level layout, and CSS class names for reusable UI primitives (`.glass-card`, `.btn-primary`, `.input`, `.badge-*`). Naming follows React community conventions: PascalCase components, camelCase hooks and functions, SCREAMING_SNAKE_CASE for module-level constants. There is no Prettier config; formatting is handled by the developer manually. ESLint is configured with the flat-config API and enforces React Hooks rules and React Refresh constraints.

---

## Language

- **JavaScript only** — all source files use `.jsx` or `.js`. No TypeScript.
- Extension rule: components are `.jsx`, pure logic files are `.js`.
- `"type": "module"` in `package.json`; all imports use ES module syntax.

---

## Naming Patterns

**Files:**
- Page components: PascalCase, one page per file — e.g. `src/pages/Expenses.jsx`, `src/pages/Dashboard.jsx`
- Layout/shared components: PascalCase — `src/components/Layout.jsx`, `src/components/TopNavBar.jsx`
- Hooks: camelCase prefixed with `use` — `src/hooks/useModalAnimation.js`, `src/hooks/useResponsive.js`
- Context: PascalCase file, named exports for provider + hook — `src/context/AuthContext.jsx`
- Library files: camelCase — `src/lib/supabase.js`

**Exports:**
- Pages and components: `export default function ComponentName()` (default export, named function)
- Hooks: named export — `export function useModalAnimation()`; one exception: `useResponsive` uses `export default`
- Context: named exports for both provider and hook — `export function AuthProvider`, `export function useAuth`

**Functions:**
- Event handlers: `handle` prefix — `handleClose`, `handleSubmit`, `handleFileUpload`, `handleEdit`
- Async data loaders: bare `load()` or `fetch*` — `load()`, `fetchProfile()`
- CRUD operations: verb + noun — `saveExpense`, `deleteExpense`, `markPaid`, `toggleItem`, `clearChecked`

**Variables / State:**
- Boolean state: bare adjective — `loading`, `adding`, `saving`, `uploading`
- Array state: plural noun — `expenses`, `items`, `groceries`
- Object/map state: noun — `profiles`, `stats`
- Modal control state: `showModal` (boolean) + `editData` (nullable object)

**Module-level constants:**
- SCREAMING_SNAKE_CASE arrays — `DAYS`, `MONTHS`, `TABS`, `BREAKPOINTS` (in `src/hooks/useResponsive.js`), `mobileNav` (exception: camelCase in `src/components/Layout.jsx`)

---

## Component Patterns

**Page structure:**
Every page exports a single default function component. Local sub-components (modals, rows) are defined as named functions in the same file — not exported. Example: `Modal` and `ExpenseRow` in `src/pages/Expenses.jsx`, `GroceryRow` in `src/pages/Groceries.jsx`.

**Anti-pattern to avoid (per `rerender-no-inline-components`):** Sub-components defined inside the same file are acceptable, but they must NOT be defined *inside* the parent component body. All helper components in this codebase are defined at module scope, which is correct.

**Ref pattern:**
Refs used for GSAP animation targets are declared at the top of the component with `useRef(null)` and attached via `ref={containerRef}`. Animated elements use either the `ref` or CSS class selectors (`.glass-card`, `.dashboard-greeting span`).

**GSAP animation placement:**
All GSAP animation logic lives inside `useGSAP()` hooks, not `useEffect`. The `scope` option is always set to a `containerRef` to scope selectors. `dependencies` array is passed as the second argument. Entry animations run after `loading` becomes `false`.

Example pattern from `src/pages/Dashboard.jsx`:
```jsx
const containerRef = useRef(null)
useGSAP(() => {
  if (loading) return
  gsap.fromTo('.glass-card', { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, stagger: 0.03, duration: 0.35, ease: 'expo.out' })
}, { scope: containerRef, dependencies: [loading, stats] })
```

**Modal pattern:**
Modals are inlined as `Modal` components at the top of the page file. They receive `onClose`, `onSave`, `loading`, and optionally `initialData` props. The `useModalAnimation` hook (`src/hooks/useModalAnimation.js`) is used for animated open/close in Expenses and Interests modals. Calendar's Modal omits animation (no `useModalAnimation`).

---

## Styling Conventions

**Design tokens:** All colors, spacing, radii, and easing are defined as CSS custom properties in `src/index.css`. Dark mode uses `:root.dark` overrides.

**CSS class names for reusable primitives:**
- Cards: `.glass-card` — elevated surface with border, shadow, border-radius
- Buttons: `.btn-primary`, `.btn-ghost`, `.btn-danger`
- Inputs: `.input`
- Badges: `.badge`, `.badge-green`, `.badge-blue`, `.badge-orange`, `.badge-sage`
- Typography: `.font-display`, `.section-title`
- Layout: `.bottom-nav`, `.nav-link`, `.modal`, `.modal-overlay`
- Animations: `.animate-spin`, `.animate-pulse`

**Inline styles for layout:** All component-level layout (flex, grid, padding, gap, margin) is done via `style={{}}` props, not CSS classes. Typography overrides (font-size, fontWeight, color) are also inline.

**No Tailwind, no CSS modules.** The design system is entirely custom CSS variables + utility classes.

**iOS safe area insets:** Applied via `env(safe-area-inset-top)` and `env(safe-area-inset-bottom)` in `src/components/Layout.jsx` and `src/pages/Login.jsx`.

**Hover states:** All hover rules are gated inside `@media (hover: hover) and (pointer: fine)` in `src/index.css` to avoid sticky hover on touch devices.

**Responsive tokens:** Breakpoints at 481px and 769px update CSS variable values in `src/styles/responsive.css`. The `useResponsive` hook mirrors these breakpoints in JS.

---

## Import Organization

**Order used throughout the codebase:**
1. React hooks from `react` — `import { useEffect, useState, useRef } from 'react'`
2. Router utilities — `import { NavLink, Outlet } from 'react-router-dom'`
3. Internal lib/data — `import { supabase } from '../lib/supabase'`
4. Internal context — `import { useAuth } from '../context/AuthContext'`
5. Internal hooks — `import { useModalAnimation } from '../hooks/useModalAnimation'`
6. Animation libraries — `import gsap from 'gsap'`, `import { useGSAP } from '@gsap/react'`

No barrel files / index re-exports. All imports are direct file paths.

---

## Error Handling

**Data fetching errors:** `try/catch` with `console.error` logging. User-visible errors use either local `error` state (Login page) or `alert()` for quick feedback (Expenses file upload, save errors). No global error boundary.

**Auth loading state:** `session === undefined` signals loading (not `null` or a boolean). Guard in `ProtectedRoute` (`src/App.jsx`): renders spinner while `loading` is true.

**Supabase fallback:** `src/lib/supabase.js` uses placeholder URL/key when env vars are absent, preventing a crash on misconfigured environments.

**Self-healing profile flow:** `src/context/AuthContext.jsx` includes a recovery path that reconstructs unit associations from `user_metadata` when a profile row is missing or incomplete.

---

## ESLint Configuration

Config file: `eslint.config.js` (flat config format).

- Targets: `**/*.{js,jsx}` only (no TypeScript files)
- Extends: `@eslint/js` recommended + `eslint-plugin-react-hooks` recommended + `eslint-plugin-react-refresh` (Vite preset)
- Globals: browser
- No Prettier integration — no `.prettierrc` present

Key enforced rules (from plugins):
- `react-hooks/rules-of-hooks` — hooks must only be called at top level
- `react-hooks/exhaustive-deps` — effect dependency arrays must be complete
- `react-refresh/only-export-components` — each file should export only components for HMR

---

## Logging

- `console.log` used for self-healing debug traces in `src/context/AuthContext.jsx`
- `console.error` used on caught exceptions throughout pages
- No structured logging, no log levels, no external logging service

---

## Comments

- Section separators use `/* ── Section Name ───── */` style in JSX (Layout, Dashboard)
- Code comments explain non-obvious behavior: safety timeouts, self-healing rationale, GSAP configuration choices
- No JSDoc usage anywhere in the codebase

---

## Notes

- `useResponsive` uses a default export inconsistently with the rest of the hooks which use named exports.
- `Math.random()` is used for generating receipt filenames and invite codes (`src/context/AuthContext.jsx` line 67). For filenames this is acceptable; for invite codes, `crypto.randomUUID` is preferred and is used as a fallback.
- `alert()` is used for error feedback in `src/pages/Expenses.jsx` — should be replaced with in-page error state.
- Inline `onMouseOver`/`onMouseOut` handlers on icon buttons (Expenses, Groceries) manually toggle color — this should use CSS `:hover` or a React state pattern instead.
