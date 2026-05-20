import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { Masthead, SectionRule, InitialsAvatar, ArrowRight } from '../components/RoomyUI'

export default function More() {
  const { profile } = useAuth()
  const initials = profile?.full_name
    ? profile.full_name.split(' ').filter(Boolean).map(n => n[0]).join('').slice(0, 2).toUpperCase()
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
        borderBottom: '1px solid rgba(255,255,255,0.10)',
      }}>
        <InitialsAvatar initials={initials} isMe size={56} />
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 26, color: 'var(--cream)', lineHeight: 1.05, letterSpacing: '-0.02em' }}>
            {profile?.full_name || 'Loading…'}
          </div>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--cream-faint)', marginTop: 3 }}>
            Roommate
          </div>
        </div>
      </div>

      {/* Shortcuts */}
      <div style={{ marginTop: 18 }}>
        <SectionRule label="01 — Shortcuts" />
        <div style={{ display: 'flex', flexDirection: 'column', marginTop: 4 }}>
          {[
            { to: '/interests', icon: SparkleIcon, title: 'Interests', sub: 'Watchlist & places' },
            { to: '/calendar', icon: CalendarIcon, title: 'Calendar', sub: 'Events & reminders' },
            { to: '/expenses', icon: DollarIcon, title: 'Expenses', sub: 'Shared ledger' },
            { to: '/apartment', icon: HouseIcon, title: 'Apartment', sub: 'Unit settings' },
          ].map((s, i, arr) => (
            <Link key={s.to} to={s.to} style={{
              display: 'grid', gridTemplateColumns: 'auto 1fr auto',
              alignItems: 'center', gap: 14, padding: '16px 0',
              borderBottom: i < arr.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none',
              textDecoration: 'none', color: 'var(--cream)',
            }}>
              <s.icon />
              <div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, lineHeight: 1.1, letterSpacing: '-0.01em' }}>{s.title}</div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--cream-faint)', marginTop: 2 }}>{s.sub}</div>
              </div>
              <ArrowRight size={16} stroke={1.7} />
            </Link>
          ))}
        </div>
      </div>

      {/* Sign out */}
      <button onClick={handleSignOut} style={{
        marginTop: 28, width: '100%',
        background: 'transparent', border: '1px solid rgba(255,255,255,0.18)', borderRadius: 999,
        padding: 14, color: 'var(--cream)',
        fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 500, cursor: 'pointer',
      }}>
        Sign out
      </button>

      <div style={{
        fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase',
        color: 'var(--cream-faint)', marginTop: 28, textAlign: 'center', paddingBottom: 8,
      }}>
        Roomy · Issue 47
      </div>
    </div>
  )
}

function SparkleIcon() {
  return (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3v6M12 15v6M3 12h6M15 12h6M5.5 5.5l4 4M14.5 14.5l4 4M18.5 5.5l-4 4M9.5 14.5l-4 4"/>
    </svg>
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

function DollarIcon() {
  return (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3v18M16 6.5c0-1.4-1.8-2.5-4-2.5s-4 1.1-4 2.5 1.8 2.5 4 2.5 4 1.1 4 2.5-1.8 2.5-4 2.5-4-1.1-4-2.5"/>
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
