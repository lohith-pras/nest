// Shared editorial UI primitives for Roomy

export const InitialsAvatar = ({ initials = '?', isMe = true, size = 28, ring }) => (
  <div style={{
    width: size, height: size, borderRadius: 999,
    background: isMe ? '#3B3B3B' : 'var(--accent)',
    color: '#fff',
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    fontFamily: 'var(--font-body)', fontWeight: 600,
    fontSize: Math.round(size * 0.42), letterSpacing: '-0.01em',
    flexShrink: 0,
    boxShadow: ring ? `0 0 0 2px ${ring}` : 'none',
  }}>{initials}</div>
)

export const AvatarStack = ({ items, size = 26, ring = 'var(--bg)' }) => (
  <div style={{ display: 'inline-flex', alignItems: 'center' }}>
    {items.map((a, i) => (
      <div key={i} style={{ marginLeft: i === 0 ? 0 : -8 }}>
        <InitialsAvatar {...a} size={size} ring={ring} />
      </div>
    ))}
  </div>
)

export const SectionRule = ({ label, right }) => (
  <div style={{
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    borderTop: '1px solid var(--border-rule)',
    paddingTop: 10,
  }}>
    <div style={{
      fontFamily: 'var(--font-mono)', fontSize: 'var(--text-overline)', letterSpacing: '0.22em',
      color: 'var(--cream)', textTransform: 'uppercase', whiteSpace: 'nowrap',
    }}>{label}</div>
    {right && (
      <div style={{
        fontFamily: 'var(--font-mono)', fontSize: 'var(--text-overline)', letterSpacing: '0.18em',
        color: 'var(--cream-faint)', textTransform: 'uppercase',
        display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer',
        whiteSpace: 'nowrap',
      }}>{right}</div>
    )}
  </div>
)

export const Masthead = ({ title, meta }) => (
  <div style={{
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    borderBottom: '1px solid var(--border-rule)',
    paddingBottom: 10,
  }}>
    <div style={{
      fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)',
      letterSpacing: '-0.01em', color: 'var(--cream)',
    }}>{title}</div>
    {meta && (
      <div style={{
        fontFamily: 'var(--font-mono)', fontSize: 'var(--text-overline)', letterSpacing: '0.2em',
        textTransform: 'uppercase', color: 'var(--cream-faint)',
      }}>{meta}</div>
    )}
  </div>
)

export const Kicker = ({ children, color = 'var(--accent-soft)' }) => (
  <div style={{
    fontFamily: 'var(--font-mono)', fontSize: 'var(--text-overline)', letterSpacing: '0.22em',
    textTransform: 'uppercase', color,
  }}>{children}</div>
)

export const ArrowRight = ({ size = 11, stroke = 2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
)

export const PlusIcon = ({ size = 16, stroke = 2.5 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 5v14M5 12h14" />
  </svg>
)

export const CheckIcon = ({ size = 13, stroke = 3 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 12.5L9.5 18 20 6" />
  </svg>
)

export const XIcon = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
)

export const PinIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s7-7.5 7-13a7 7 0 1 0-14 0c0 5.5 7 13 7 13z" />
    <circle cx="12" cy="9" r="2.5" />
  </svg>
)

// Deterministic pastel-dark color from string
const POSTER_COLORS = ['#5a3e2b','#2b3a4a','#3a2b4a','#4a3a2b','#2b4a3a','#6a6b78','#7a3a35','#8a6b35']
export const posterColor = (str = '') => {
  let h = 0
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) & 0xffff
  return POSTER_COLORS[h % POSTER_COLORS.length]
}
