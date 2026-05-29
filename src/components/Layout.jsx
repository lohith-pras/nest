import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { AnimatePresence, motion, LayoutGroup } from 'framer-motion'

const NAV_ITEMS = [
  {
    to: '/', exact: true, label: 'Home',
    icon: (active) => (
      <svg width={22} height={22} viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth={active ? 2 : 1.6} strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1.5"/>
        <rect x="14" y="3" width="7" height="7" rx="1.5"/>
        <rect x="3" y="14" width="7" height="7" rx="1.5"/>
        <rect x="14" y="14" width="7" height="7" rx="1.5"/>
      </svg>
    )
  },
  {
    to: '/expenses', label: 'Expenses',
    icon: (active) => (
      <svg width={22} height={22} viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth={active ? 2 : 1.6} strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3v18M16 6.5c0-1.4-1.8-2.5-4-2.5s-4 1.1-4 2.5 1.8 2.5 4 2.5 4 1.1 4 2.5-1.8 2.5-4 2.5-4-1.1-4-2.5"/>
      </svg>
    )
  },
  {
    to: '/groceries', label: 'Pantry',
    icon: (active) => (
      <svg width={22} height={22} viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth={active ? 2 : 1.6} strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 7h16l-1.5 12.2A2 2 0 0 1 16.5 21h-9a2 2 0 0 1-2-1.8L4 7z"/>
        <path d="M8 7V5.5A3.5 3.5 0 0 1 11.5 2h1A3.5 3.5 0 0 1 16 5.5V7"/>
      </svg>
    )
  },
  {
    to: '/interests', label: 'Interests',
    icon: (active) => (
      <svg width={22} height={22} viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth={active ? 2 : 1.6} strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3v6M12 15v6M3 12h6M15 12h6M5.5 5.5l4 4M14.5 14.5l4 4M18.5 5.5l-4 4M9.5 14.5l-4 4"/>
      </svg>
    )
  },
  {
    to: '/more', label: 'More',
    icon: (active) => (
      <svg width={22} height={22} viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth={active ? 2 : 1.6} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="5" cy="12" r="1.4" fill={active ? 'currentColor' : 'none'} stroke={active ? 'none' : 'currentColor'} strokeWidth="1.6"/>
        <circle cx="12" cy="12" r="1.4" fill={active ? 'currentColor' : 'none'} stroke={active ? 'none' : 'currentColor'} strokeWidth="1.6"/>
        <circle cx="19" cy="12" r="1.4" fill={active ? 'currentColor' : 'none'} stroke={active ? 'none' : 'currentColor'} strokeWidth="1.6"/>
      </svg>
    )
  },
]

export default function Layout() {
  const location = useLocation()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', position: 'relative' }}>
      <main style={{
        flex: 1,
        padding: '0 20px',
        paddingTop: 'max(16px, env(safe-area-inset-top))',
        paddingBottom: 'calc(96px + env(safe-area-inset-bottom))',
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
            style={{ height: '100%' }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      <nav className="bottom-nav" style={{
        position: 'fixed',
        bottom: 'calc(16px + env(safe-area-inset-bottom))',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        alignItems: 'center',
        padding: '6px 6px',
        borderRadius: 999,
        gap: 2,
        zIndex: 50,
        boxShadow: '0 8px 32px rgba(0,0,0,0.14), 0 2px 8px rgba(0,0,0,0.08)',
        whiteSpace: 'nowrap',
      }}>
        <LayoutGroup>
          {NAV_ITEMS.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.exact}
              style={({ isActive }) => ({
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 3,
                color: isActive ? 'var(--cream)' : 'var(--cream-faint)',
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--text-overline)',
                fontWeight: 500,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                transition: 'all 220ms var(--ease-spring)',
                WebkitTapHighlightColor: 'transparent',
                textDecoration: 'none',
                padding: isActive ? '8px 14px' : '10px 12px',
                borderRadius: 999,
                position: 'relative',
                minWidth: 44,
                justifyContent: 'center',
              })}
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.div
                      layoutId="nav-pill"
                      style={{
                        position: 'absolute',
                        inset: 0,
                        borderRadius: 999,
                        background: 'var(--surface-hover)',
                        zIndex: -1,
                      }}
                      transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                    />
                  )}
                  {item.icon(isActive)}
                  {isActive && <span style={{ lineHeight: 1 }}>{item.label}</span>}
                </>
              )}
            </NavLink>
          ))}
        </LayoutGroup>
      </nav>
    </div>
  )
}
