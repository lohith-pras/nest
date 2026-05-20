import { NavLink, Outlet } from 'react-router-dom'

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
    to: '/calendar', label: 'Calendar',
    icon: (active) => (
      <svg width={22} height={22} viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth={active ? 2 : 1.6} strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="5" width="18" height="16" rx="2"/>
        <path d="M3 9h18M8 3v4M16 3v4"/>
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
        <Outlet />
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
              fontSize: 9,
              fontWeight: 500,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              transition: 'all 220ms var(--ease-spring)',
              WebkitTapHighlightColor: 'transparent',
              textDecoration: 'none',
              padding: isActive ? '8px 14px' : '10px 12px',
              borderRadius: 999,
              background: isActive ? 'var(--surface-hover)' : 'transparent',
              minWidth: 44,
              justifyContent: 'center',
            })}
          >
            {({ isActive }) => (
              <>
                {item.icon(isActive)}
                {isActive && <span style={{ lineHeight: 1 }}>{item.label}</span>}
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
