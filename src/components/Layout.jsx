import { NavLink, Outlet } from 'react-router-dom'
import TopNavBar from './TopNavBar'

const mobileNav = [
  {
    to: '/', label: 'Dashboard', exact: true,
    icon: <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>
  },
  {
    to: '/expenses', label: 'Expenses',
    icon: <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" x2="12" y1="2" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
  },
  {
    to: '/groceries', label: 'Groceries',
    icon: <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
  },
  {
    to: '/calendar', label: 'Calendar',
    icon: <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
  },
  {
    to: '/more', label: 'More',
    icon: <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
  },
]

export default function Layout() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', position: 'relative' }}>
      
      {/* ── Sticky Top Navbar ──────────────────────────────────── */}
      <TopNavBar />

      {/* ── Main Content Area ──────────────────────────────────── */}
      <main style={{
        flex: 1,
        padding: '24px',
        paddingTop: '24px',
        paddingBottom: 'calc(80px + env(safe-area-inset-bottom))',
        overflowY: 'auto',
        overflowX: 'hidden'
      }}>
        <Outlet />
      </main>

      {/* ── Bottom Nav (Fixed, Always Visible) ───────────────── */}
      <nav className="bottom-nav" style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        padding: '12px 8px',
        paddingBottom: 'calc(12px + env(safe-area-inset-bottom))',
        zIndex: 50,
        backgroundColor: 'var(--nav-bg)',
        borderTop: '1px solid var(--border)',
        backdropFilter: 'blur(12px)',
      }}>
        {mobileNav.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.exact}
            style={({ isActive }) => ({
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
              color: isActive ? 'var(--primary)' : 'var(--muted)',
              fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase',
              letterSpacing: '0.04em', transition: 'color 0.2s, transform 0.15s ease',
              transform: isActive ? 'scale(1.05)' : 'scale(1)',
              flex: 1,
              WebkitTapHighlightColor: 'transparent',
              textDecoration: 'none'
            })}
          >
            {item.icon}
            <span style={{ marginTop: 2 }}>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  )
}