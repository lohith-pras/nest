# Testing Patterns

## Summary

This codebase has **zero tests**. No test runner, no test framework, no test files, and no coverage tooling are present. The `package.json` scripts include only `dev`, `build`, `lint`, and `preview`. There is no `test` script, no `vitest.config.*`, no `jest.config.*`, and no `*.test.*` or `*.spec.*` files anywhere in the repository. The project relies entirely on manual browser testing and Supabase's hosted environment for validation.

---

## Test Framework

**Runner:** None installed.

**Assertion library:** None.

**Run commands:** No test command exists. Running `npm test` will fail with a missing script error.

---

## Test Files

```
find /src -name "*.test.*" -o -name "*.spec.*"
# (no results)
```

No test files exist anywhere under `src/`.

---

## Coverage

**Requirements:** None enforced.

**Coverage tooling:** Not configured.

---

## What Would Need to Be Tested

The following areas represent the highest-value targets if tests were added:

### Unit-Testable Logic

**`src/context/AuthContext.jsx` — `fetchProfile` function**
- This is the most complex piece of logic in the app (150+ lines)
- Self-healing flow: creates/joins units, updates profile rows, handles race conditions
- Contains branching based on `user_metadata` fields (`signup_type`, `unit_name`, `invite_code`)
- Currently untested; a regression here would silently break signup for all new users

**`src/hooks/useResponsive.js` — `getBreakpoint` function**
- Pure function; trivially unit-testable
- Boundary cases at 481px and 769px

**Financial calculation logic in `src/pages/Expenses.jsx`**
- `owedToMe` and `iOwe` derived values (lines 211–212)
- Split amount logic: `split_amount != null ? split_amount : amount / 2`
- These calculations run inline during render with no extraction; to test, they would need to be extracted into utility functions

### Integration / Component Tests

**`src/pages/Login.jsx`**
- Mode switching (`login` ↔ `signup`)
- Sign-up flow validation (invite code pre-check before account creation)
- Error display from caught Supabase errors

**`src/pages/Groceries.jsx`**
- Optimistic toggle (`toggleItem` updates local state immediately, then syncs to Supabase)
- Real-time subscription teardown on unmount

**`src/pages/Expenses.jsx`**
- `saveExpense` — insert vs. update branch
- `markPaid` — optimistic local state update
- `deleteExpense` — local filter after DB delete

### GSAP Animation Tests

Not practical to unit-test GSAP animations in this setup. Animation correctness is verified visually. If a test environment is added (e.g. jsdom via Vitest), GSAP animations should be mocked or disabled using the existing `prefers-reduced-motion` path (already set up in `src/main.jsx`).

---

## Recommended Setup (If Tests Are Added)

**Recommended stack for this project type (React + Vite, no SSR):**

```bash
npm install -D vitest @vitest/coverage-v8 @testing-library/react @testing-library/user-event jsdom
```

**`vitest.config.js` minimum config:**
```js
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.js'],
  },
})
```

**Test file placement convention (if adopted):**
Co-locate test files next to source files:
- `src/context/AuthContext.test.jsx`
- `src/hooks/useResponsive.test.js`
- `src/pages/Expenses.test.jsx`

**Mocking Supabase:**
All pages import `supabase` from `src/lib/supabase.js`. Mock at that path:
```js
vi.mock('../lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({ select: vi.fn(), insert: vi.fn(), update: vi.fn(), delete: vi.fn() })),
    auth: { getUser: vi.fn(), getSession: vi.fn(), onAuthStateChange: vi.fn() },
    storage: { from: vi.fn() },
    channel: vi.fn(() => ({ on: vi.fn(), subscribe: vi.fn() })),
    removeChannel: vi.fn(),
  }
}))
```

**Mocking GSAP:**
Prevent GSAP from throwing in jsdom by mocking it globally in the setup file:
```js
vi.mock('gsap', () => ({ default: { fromTo: vi.fn(), from: vi.fn(), to: vi.fn(), set: vi.fn(), timeline: vi.fn(() => ({ from: vi.fn(), reverse: vi.fn() })), defaults: vi.fn(), registerPlugin: vi.fn(), matchMedia: vi.fn(() => ({ add: vi.fn() })), globalTimeline: { timeScale: vi.fn() } } }))
vi.mock('@gsap/react', () => ({ useGSAP: (fn) => { /* no-op in tests */ } }))
```

---

## Notes

- The absence of tests is the single largest quality gap in this codebase.
- The self-healing logic in `src/context/AuthContext.jsx` is both the most critical and the most fragile code path — it should be the first target for test coverage.
- `alert()` calls in `src/pages/Expenses.jsx` block testing of the `saveExpense` and `handleFileUpload` error paths; these should be replaced with state-based error display before adding tests.
- `useResponsive.js` accesses `window.innerWidth` directly during `useState` initialization (line 11), which will throw in a jsdom environment without a mock. This would need to be guarded before testing.
