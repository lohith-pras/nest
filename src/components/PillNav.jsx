import { useLocation, useNavigate } from 'react-router-dom'

const NAV_PILLS = [
  { label: 'Overview',  to: '/' },
  { label: 'Balance',   to: '/expenses' },
  { label: 'Groceries', to: '/groceries' },
  { label: 'Calendar',  to: '/calendar' },
  { label: 'Interests', to: '/interests' },
  { label: 'More',      to: '/more' },
]

export default function PillNav() {
  const location = useLocation()
  const navigate = useNavigate()

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
    <div style={{
      display: 'flex',
      gap: 8,
      overflowX: 'auto',
      scrollbarWidth: 'none',
      WebkitOverflowScrolling: 'touch',
      margin: '14px 0 24px 0',
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
              border: 'none',
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
  )
}
