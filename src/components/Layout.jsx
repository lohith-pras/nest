import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'

// ── Pill nav config ──────────────────────────────────────────────────────────
const NAV_PILLS = [
  { label: 'Overview',  to: '/' },
  { label: 'Balance',   to: '/expenses' },
  { label: 'Groceries', to: '/groceries' },
  { label: 'Calendar',  to: '/calendar' },
  { label: 'Interests', to: '/interests' },
  { label: 'More',      to: '/more' },
]

export default function Layout() {
  const location = useLocation()
  const navigate = useNavigate()

  // Match active pill: exact for '/', prefix for everything else
  const activeTo = (() => {
    for (const pill of NAV_PILLS) {
      if (pill.to === '/') {
        if (location.pathname === '/') return '/'
      } else if (location.pathname.startsWith(pill.to)) {
        return pill.to
      }
    }
    return '/'
  })()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', position: 'relative' }}>

      {/* ── Sticky pill nav ──────────────────────────────────── */}
      <nav style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        paddingTop: 'max(12px, env(safe-area-inset-top))',
        paddingBottom: 10,
        paddingLeft: 20,
        paddingRight: 20,
        background: 'var(--bg)',
      }}>
        <div style={{
          display: 'flex',
          gap: 8,
          overflowX: 'auto',
          scrollbarWidth: 'none',
          WebkitOverflowScrolling: 'touch',
        }}>
          {NAV_PILLS.map((pill) => {
            const isActive = activeTo === pill.to
            return (
              <button
                key={pill.to}
                onClick={() => navigate(pill.to)}
                style={{
                  flexShrink: 0,
                  padding: '9px 18px',
                  borderRadius: 999,
                  border: isActive ? 'none' : 'none',
                  background: isActive ? 'var(--accent)' : 'transparent',
                  color: isActive ? '#fff' : 'var(--cream-dim)',
                  fontFamily: 'var(--font-body)',
                  fontSize: 'var(--text-sm)',
                  fontWeight: isActive ? 600 : 400,
                  cursor: 'pointer',
                  letterSpacing: '-0.01em',
                  transition: 'background 200ms ease, color 200ms ease',
                  WebkitTapHighlightColor: 'transparent',
                }}
              >
                {pill.label}
              </button>
            )
          })}
        </div>
      </nav>

      {/* ── Page content ─────────────────────────────────────── */}
      <main style={{
        flex: 1,
        padding: '16px 20px',
        paddingBottom: 'max(24px, env(safe-area-inset-bottom))',
        overflowY: 'auto',
        overflowX: 'hidden',
        color: 'var(--cream)',
      }}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18, ease: [0.23, 1, 0.32, 1] }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

    </div>
  )
}
