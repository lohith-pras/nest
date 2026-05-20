# Technology Stack

**Analysis Date:** 2026-05-20

## Summary

Nest is a React 19 single-page application targeting a mobile-native (iOS-style) experience, served as a Progressive Web App (PWA). It is built with Vite 8 for development and bundling, uses JavaScript (JSX) throughout — no TypeScript — and is deployed to Vercel with SPA-style routing rewrites. GSAP is the animation layer, Supabase is the backend, and React Router v7 handles client-side navigation.

## Languages

**Primary:**
- JavaScript (ES Modules, JSX) — all source files in `src/`

**Secondary:**
- CSS — global styles in `src/index.css`, `src/responsive.css`, `src/styles/`

**No TypeScript** — type packages (`@types/react`, `@types/react-dom`) are present but the project uses `.jsx`/`.js` extensions throughout. ESLint targets `**/*.{js,jsx}` only.

## Runtime

**Environment:**
- Node.js v26 (resolved at runtime; no `.nvmrc` or `.node-version` pinning)
- ES Module project (`"type": "module"` in `package.json`)

**Package Manager:**
- npm (lockfile v3 at `package-lock.json`)
- Lockfile: present

## Frameworks

**Core:**
- React 19.2.6 — UI framework (`src/main.jsx`, `src/App.jsx`)
- React DOM 19.2.6 — DOM renderer

**Routing:**
- React Router DOM 7.15.1 — declarative client-side routing (`src/App.jsx`, `src/main.jsx`)
- Route structure: nested layout route (`/`) guarded by `ProtectedRoute`, plus `/login` public route

**Animation:**
- GSAP 3.15.0 — animation engine, registered globally in `src/main.jsx`
- @gsap/react 2.1.2 — `useGSAP` hook, registered as GSAP plugin at app boot
- GSAP ScrollTrigger plugin registered at `src/main.jsx:12`
- `gsap.matchMedia` used for `prefers-reduced-motion` global support (`src/main.jsx:18-21`)

**Build/Dev:**
- Vite 8.0.13 — dev server and build tool (`vite.config.js`)
- @vitejs/plugin-react 6.0.2 — React Fast Refresh and JSX transform

## Key Dependencies

**Critical:**
- `@supabase/supabase-js` 2.105.4 — backend client for auth, database, storage, RPC (`src/lib/supabase.js`)
- `gsap` 3.15.0 + `@gsap/react` 2.1.2 — used across multiple pages and hooks for UI animations

**Infrastructure:**
- `vite-plugin-pwa` 1.3.0 — PWA manifest and service worker injection (`vite.config.js`)
  - `registerType: 'autoUpdate'` — service worker auto-updates silently
  - App name: `Nest`, display mode: `standalone`, theme color: `#0D0E15`

## Configuration

**Environment:**
- Vite exposes env vars prefixed `VITE_` via `import.meta.env`
- Required vars: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
- Template: `.env.example` — copy to `.env.local` (gitignored)
- `.env.local` is present locally; never commit it

**Build:**
- `vite.config.js` — single config file, plugins: `@vitejs/plugin-react`, `vite-plugin-pwa`
- Output: `dist/` directory (gitignored for deploy but committed build artifacts visible)
- `eslint.config.js` — flat ESLint config targeting `**/*.{js,jsx}` with `eslint-plugin-react-hooks` and `eslint-plugin-react-refresh`

## Platform Requirements

**Development:**
- Node.js (v26 in use; no engine constraint pinned in `package.json`)
- `npm install` to restore dependencies
- `npm run dev` — Vite dev server
- `npm run build` — production bundle to `dist/`
- `npm run lint` — ESLint check
- `npm run preview` — preview production build locally

**Production:**
- Deployed to Vercel (`vercel.json` with SPA rewrite: all routes → `/index.html`)
- PWA-capable: service worker + manifest generated at build time

---

*Stack analysis: 2026-05-20*
