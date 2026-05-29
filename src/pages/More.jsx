import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { Masthead, SectionRule, InitialsAvatar, ArrowRight } from '../components/RoomyUI'

export default function More() {
  const { profile } = useAuth()
  const initials = profile?.full_name
    ? profile.full_name.split(' ').reduce((acc, n) => n ? acc + n[0] : acc, '').slice(0, 2).toUpperCase()
    : '?'

  async function handleSignOut() {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    } catch (err) {
      console.error('Error signing out:', err)
      alert('Failed to sign out: ' + err.message)
    }
  }

  return (
    <div style={{ paddingTop: 16 }}>
      <Masthead title="More" meta="Account" />

      {/* Profile */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 14,
        marginTop: 22, paddingBottom: 22,
        borderBottom: '1px solid var(--border)',
      }}>
        <InitialsAvatar initials={initials} isMe size={56} />
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', color: 'var(--cream)', lineHeight: 1.05, letterSpacing: '-0.02em' }}>
            {profile?.full_name || 'Loading…'}
          </div>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--cream-faint)', marginTop: 3 }}>
            Roommate
          </div>
        </div>
      </div>

      {/* Shortcuts */}
      <div style={{ marginTop: 18 }}>
        <SectionRule label="01 — Shortcuts" />
        <div style={{ display: 'flex', flexDirection: 'column', marginTop: 4 }}>
          {[
            { to: '/calendar', icon: CalendarIcon, title: 'Calendar', sub: 'Shared schedule' },
            { to: '/apartment', icon: HouseIcon, title: 'Apartment', sub: 'Unit settings' },
            { to: '/settings', icon: GearIcon, title: 'Settings', sub: 'Profile & preferences' },
          ].map((s, i, arr) => (
            <Link key={s.to} to={s.to} style={{
              display: 'grid', gridTemplateColumns: 'auto 1fr auto',
              alignItems: 'center', gap: 14, padding: '16px 0',
              borderBottom: i < arr.length - 1 ? '1px solid var(--border)' : 'none',
              textDecoration: 'none', color: 'var(--cream)',
            }}>
              <s.icon />
              <div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-lg)', lineHeight: 1.1, letterSpacing: '-0.01em' }}>{s.title}</div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--cream-faint)', marginTop: 2 }}>{s.sub}</div>
              </div>
              <ArrowRight size={16} stroke={1.7} />
            </Link>
          ))}
        </div>
      </div>

      {/* Sign out */}
      <button onClick={handleSignOut} style={{
        marginTop: 28, width: '100%',
        background: 'transparent', border: '1px solid var(--border-rule)', borderRadius: 999,
        padding: 14, color: 'var(--cream)',
        fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', fontWeight: 500, cursor: 'pointer',
      }}>
        Sign out
      </button>

      <div style={{
        fontFamily: 'var(--font-mono)', fontSize: 'var(--text-overline)', letterSpacing: '0.2em', textTransform: 'uppercase',
        color: 'var(--cream-faint)', marginTop: 28, textAlign: 'center', paddingBottom: 8,
      }}>
        Roomy · Issue 47
      </div>
    </div>
  )
}

function CalendarIcon() {
  return (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="5" width="18" height="16" rx="2"/>
      <path d="M3 9h18M8 3v4M16 3v4"/>
    </svg>
  )
}

function HouseIcon() {
  return (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 11.5 L12 4 L21 11.5 V20 a1 1 0 0 1-1 1 H4 a1 1 0 0 1-1-1 z"/>
      <path d="M10 21v-7h4v7"/>
    </svg>
  )
}

function GearIcon() {
  return (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
    </svg>
  )
}
