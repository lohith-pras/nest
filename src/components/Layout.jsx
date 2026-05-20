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
        paddingBottom: 'calc(80px + env(safe-area-inset-bottom))',
        overflowY: 'auto',
        overflowX: 'hidden',
        color: 'var(--cream)',
      }}>
        <Outlet />
      </main>

      <nav className="bottom-nav" style={{
        position: 'fixed',
        bottom: 0, left: 0, right: 0,
        display: 'grid',
        gridTemplateColumns: 'repeat(5, 1fr)',
        gap: 4,
        padding: '10px 12px',
        paddingBottom: 'calc(10px + env(safe-area-inset-bottom))',
        zIndex: 50,
      }}>
        {NAV_ITEMS.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.exact}
            style={({ isActive }) => ({
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
              color: isActive ? 'var(--cream)' : 'var(--cream-faint)',
              fontFamily: 'var(--font-mono)',
              fontSize: 9, fontWeight: 500,
              letterSpacing: '0.16em', textTransform: 'uppercase',
              transition: 'color 200ms',
              WebkitTapHighlightColor: 'transparent',
              textDecoration: 'none',
            })}
          >
            {({ isActive }) => (
              <>
                {item.icon(isActive)}
                <span>{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
