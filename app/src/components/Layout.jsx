import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'

const navItems = [
  {
    to: '/', label: 'Dashboard', exact: true,
    icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>
  },
  {
    to: '/expenses', label: 'Expenses',
    icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" x2="12" y1="2" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
  },
  {
    to: '/groceries', label: 'Groceries',
    icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
  },
  {
    to: '/calendar', label: 'Calendar',
    icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
  },
  {
    to: '/interests', label: 'Interests',
    icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M7 3v18"/><path d="M17 3v18"/><path d="M3 7h4"/><path d="M3 17h4"/><path d="M17 7h4"/><path d="M17 17h4"/></svg>
  },
  {
    to: '/apartment', label: 'Apartment',
    icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
  },
]

const mobileNav = [
  navItems[0], navItems[1], navItems[2], navItems[4],
]

export default function Layout() {
  const { profile } = useAuth()
  const initials = profile?.full_name
    ? profile.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : '?'

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* ── Sidebar (desktop) ─────────────────────── */}
      <aside className="sidebar" style={{
        display: 'none',
        flexDirection: 'column',
        width: 240,
        height: '100vh',
        position: 'sticky',
        top: 0,
        padding: '28px 16px',
        zIndex: 50,
        flexShrink: 0,
      }}
        id="sidebar"
      >
        <style>{`
          @media (min-width: 768px) { #sidebar { display: flex !important; } }
        `}</style>

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 40 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 12,
            background: 'var(--primary)', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            color: 'white', boxShadow: '0 4px 12px rgba(27,67,50,0.25)'
          }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          </div>
          <span className="font-display" style={{ fontSize: '1.2rem', fontWeight: 800, letterSpacing: '-0.02em' }}>Roomy</span>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.exact}
              className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* User + Sign Out */}
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <NavLink 
            to="/settings" 
            style={({ isActive }) => ({ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 12, 
              textDecoration: 'none', 
              color: isActive ? 'var(--bg)' : 'var(--fg)' 
            })} 
            className="nav-link"
          >
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="Avatar" style={{ width: 38, height: 38, borderRadius: '50%', border: '2px solid var(--bg)', objectFit: 'cover' }} />
            ) : (
              <div style={{
                width: 38, height: 38, borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--primary), var(--tertiary))',
                border: '2px solid var(--bg)', display: 'flex', alignItems: 'center',
                justifyContent: 'center', color: 'var(--bg)', fontWeight: 800, fontSize: '0.8rem'
              }}>{initials}</div>
            )}
            <div>
              <p style={{ fontSize: '0.875rem', fontWeight: 700 }}>{profile?.full_name || 'Loading…'}</p>
            </div>
          </NavLink>
          <button
            onClick={() => supabase.auth.signOut()}
            style={{ fontSize: '0.8rem', color: 'var(--muted)', textAlign: 'left', padding: '6px 4px', borderRadius: 8, transition: 'color 0.2s' }}
            onMouseOver={e => e.target.style.color = 'var(--danger)'}
            onMouseOut={e => e.target.style.color = 'var(--muted)'}
          >
            Sign out
          </button>
        </div>
      </aside>

      {/* ── Main ──────────────────────────────────── */}
      <main style={{
        flex: 1,
        padding: '24px',
        paddingTop: 'max(24px, env(safe-area-inset-top))',
        paddingBottom: 'max(112px, calc(96px + env(safe-area-inset-bottom)))',
        maxWidth: 1100,
        width: '100%',
      }}>
        <style>{`@media(min-width:768px){main{padding:48px;padding-bottom:48px;}}`}</style>
        <Outlet />
      </main>

      {/* ── Bottom Nav (mobile) ────────────────────── */}
      <nav className="bottom-nav" style={{
        position: 'fixed',
        bottom: 0, left: 0, right: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        padding: '12px 16px',
        paddingBottom: 'calc(12px + env(safe-area-inset-bottom))',
        zIndex: 50,
      }}
        id="bottom-nav"
      >
        <style>{`@media(min-width:768px){#bottom-nav{display:none!important;}}`}</style>
        {mobileNav.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.exact}
            style={({ isActive }) => ({
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
              color: isActive ? 'var(--primary)' : 'var(--muted)',
              fontSize: '0.6rem', fontWeight: 800, textTransform: 'uppercase',
              letterSpacing: '0.08em', transition: 'color 0.2s',
            })}
          >
            {item.icon}
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
