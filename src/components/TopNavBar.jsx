import { useLocation } from 'react-router-dom'

const PAGE_TITLES = {
  '/': 'Dashboard',
  '/expenses': 'Expenses',
  '/groceries': 'Groceries',
  '/calendar': 'Calendar',
  '/interests': 'Interests',
  '/apartment': 'Apartment',
  '/settings': 'Settings',
  '/more': 'More',
}

export default function TopNavBar() {
  const location = useLocation()
  const title = PAGE_TITLES[location.pathname] || 'App'

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 40,
        height: '56px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingLeft: 'var(--spacing-h, 24px)',
        paddingRight: 'var(--spacing-h, 24px)',
        paddingTop: 'max(8px, env(safe-area-inset-top))',
        backgroundColor: 'var(--nav-bg)',
        borderBottom: '1px solid var(--border)',
        backdropFilter: 'blur(12px)',
      }}
    >
      <h1 style={{
        fontSize: 'var(--font-h2, 22px)',
        fontWeight: 600,
        fontFamily: 'var(--font-display)',
        color: 'var(--fg)',
        margin: 0,
      }}>
        {title}
      </h1>
      
      {/* Right side: optional avatar/settings icon placeholder */}
      <div style={{ width: 32 }} />
    </header>
  )
}
