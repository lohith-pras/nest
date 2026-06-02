import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { InitialsAvatar } from '../components/RoomyUI'

// ── Nav pill config ──────────────────────────────────────────────────────────
const NAV_PILLS = [
  { label: 'Overview', to: null },       // active state = current page
  { label: 'Balance',  to: '/expenses' },
  { label: 'Groceries', to: '/groceries' },
  { label: 'Calendar', to: '/calendar' },
  { label: 'Interests', to: '/interests' },
  { label: 'More',     to: '/more' },
]

// ── Icons ────────────────────────────────────────────────────────────────────
function StarIcon() {
  return (
    <svg width={28} height={28} viewBox="0 0 24 24" fill="none"
      stroke="var(--accent)" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3v6M12 15v6M3 12h6M15 12h6M5.5 5.5l3.5 3.5M14.5 14.5l3.5 3.5M18.5 5.5l-3.5 3.5M9.5 14.5l-3.5 3.5"/>
    </svg>
  )
}

function GridIcon() {
  return (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1.5"/>
      <rect x="14" y="3" width="7" height="7" rx="1.5"/>
      <rect x="3" y="14" width="7" height="7" rx="1.5"/>
      <rect x="14" y="14" width="7" height="7" rx="1.5"/>
    </svg>
  )
}

function CheckCircleIcon({ checked }) {
  return (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none"
      stroke={checked ? 'var(--accent)' : 'rgba(255,255,255,0.3)'}
      strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9"/>
      {checked && <path d="M8 12.5l3 3 5-5"/>}
    </svg>
  )
}

// ── Main component ───────────────────────────────────────────────────────────
export default function Dashboard() {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const [owedToMe, setOwedToMe] = useState(0)
  const [groceries, setGroceries] = useState([])
  const [events, setEvents] = useState([])
  const [roommateProfile, setRoommateProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  const firstName = profile?.full_name?.split(' ')[0] || 'there'

  useEffect(() => {
    async function load() {
      setLoading(true)
      const userId = (await supabase.auth.getUser()).data.user?.id

      const [expRes, grocRes, evtRes, profRes] = await Promise.all([
        supabase.from('expenses').select('amount, paid_by, split_amount, status').eq('status', 'pending'),
        supabase.from('groceries').select('id, item_name, is_checked').eq('is_inventory', false).order('updated_at', { ascending: false }).limit(4),
        supabase.from('events').select('id, title, date, time').gte('date', new Date().toISOString().split('T')[0]).order('date').limit(1),
        supabase.from('profiles').select('id, full_name'),
      ])

      const owed = (expRes.data || [])
        .filter(e => e.paid_by === userId)
        .reduce((sum, e) => sum + (e.split_amount != null ? e.split_amount : e.amount / 2), 0)

      setOwedToMe(owed)
      setGroceries(grocRes.data || [])
      setEvents(evtRes.data || [])
      const roommate = (profRes.data || []).find(p => p.id !== userId)
      setRoommateProfile(roommate || null)
      setLoading(false)
    }
    load()
  }, [])

  const wholeStr = Math.floor(Math.abs(owedToMe)).toString()
  const centsStr = (Math.abs(owedToMe) % 1).toFixed(2).slice(1)
  const roomateName = roommateProfile?.full_name?.split(' ')[0] || 'roommate'
  const roommateInitials = roommateProfile?.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '?'

  const nextEvent = events[0] || null

  return (
    <div style={{ paddingTop: 4, paddingBottom: 24 }}>

      {/* ── Header row ─────────────────────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <StarIcon />
        <button
          onClick={() => navigate('/more')}
          style={{
            width: 40, height: 40, borderRadius: 999,
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.12)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--cream)', cursor: 'pointer',
          }}
        >
          <GridIcon />
        </button>
      </div>

      {/* ── Greeting ───────────────────────────────────────────── */}
      <div style={{ marginBottom: 22 }}>
        <p style={{
          fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)',
          color: 'var(--cream-dim)', margin: 0, letterSpacing: '0.01em',
        }}>
          Welcome home,
        </p>
        <h1 style={{
          fontFamily: 'var(--font-display)', fontSize: 'clamp(40px, 12vw, 56px)',
          fontWeight: 600, lineHeight: 1, margin: '4px 0 0',
          color: 'var(--cream)', letterSpacing: '-0.03em',
        }}>
          {firstName}
        </h1>
      </div>

      {/* ── Pill nav bar ───────────────────────────────────────── */}
      <div style={{
        display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4, marginBottom: 20,
        scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch',
      }}>
        {NAV_PILLS.map((pill) => {
          const isActive = pill.to === null
          return (
            <button
              key={pill.label}
              onClick={() => pill.to && navigate(pill.to)}
              style={{
                flexShrink: 0,
                padding: '9px 18px',
                borderRadius: 999,
                border: isActive ? 'none' : '1px solid rgba(255,255,255,0.18)',
                background: isActive ? 'var(--accent)' : 'transparent',
                color: isActive ? '#fff' : 'var(--cream-dim)',
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--text-sm)',
                fontWeight: isActive ? 600 : 400,
                cursor: pill.to ? 'pointer' : 'default',
                letterSpacing: '-0.01em',
                transition: 'all 200ms ease',
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              {pill.label}
            </button>
          )
        })}
      </div>

      {/* ── Balance card ───────────────────────────────────────── */}
      <motion.div
        className="glass-card"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
        style={{ padding: '20px 20px 18px', marginBottom: 14, position: 'relative', borderRadius: 20 }}
      >
        {/* Roommate avatar */}
        {roommateProfile && (
          <div style={{ position: 'absolute', top: 18, right: 18 }}>
            <InitialsAvatar initials={roommateInitials} isMe={false} size={42} />
          </div>
        )}

        <p style={{
          fontFamily: 'var(--font-mono)', fontSize: 'var(--text-overline)',
          letterSpacing: '0.2em', textTransform: 'uppercase',
          color: 'var(--cream-faint)', margin: '0 0 10px',
        }}>
          {owedToMe >= 0 ? 'Owed to you' : 'You owe'}
        </p>

        <div style={{
          fontFamily: 'var(--font-display)', fontSize: 'clamp(44px, 13vw, 60px)',
          fontWeight: 600, lineHeight: 1, color: 'var(--cream)', letterSpacing: '-0.04em',
          marginBottom: 6,
        }}>
          {loading ? '—' : <>€{wholeStr}<span style={{ fontSize: '0.55em', color: 'var(--cream-dim)', verticalAlign: 'super', lineHeight: 0 }}>{centsStr}</span></>}
        </div>

        <p style={{
          fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)',
          color: 'var(--cream-dim)', margin: '0 0 18px',
        }}>
          {roomateName} owes you · settled weekly
        </p>

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={() => navigate('/expenses')}
            className="btn-primary"
            style={{ flex: 1, justifyContent: 'center', borderRadius: 999, padding: '11px 16px' }}
          >
            Settle up
          </button>
          <button
            className="btn-ghost"
            style={{ flex: 1, justifyContent: 'center', borderRadius: 999, padding: '11px 16px' }}
          >
            Remind {roomateName}
          </button>
        </div>
      </motion.div>

      {/* ── Two-col cards ──────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.15fr', gap: 14 }}>

        {/* Shopping list card */}
        <motion.button
          className="glass-card"
          onClick={() => navigate('/groceries')}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.08, ease: [0.23, 1, 0.32, 1] }}
          style={{
            padding: '16px 14px', borderRadius: 20, textAlign: 'left',
            cursor: 'pointer', display: 'flex', flexDirection: 'column',
            minHeight: 200, color: 'var(--cream)',
          }}
        >
          <p style={{
            fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)',
            fontWeight: 600, lineHeight: 1.15, letterSpacing: '-0.025em',
            color: 'var(--cream)', margin: '0 0 14px',
          }}>
            Shopping<br />List
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
            {loading
              ? <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--cream-faint)' }}>Loading…</p>
              : groceries.length === 0
                ? <p style={{ fontFamily: 'var(--font-body)', fontStyle: 'italic', fontSize: 'var(--text-xs)', color: 'var(--cream-faint)' }}>All clear!</p>
                : groceries.map(g => (
                  <div key={g.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <CheckCircleIcon checked={g.is_checked} />
                    <span style={{
                      fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)',
                      color: g.is_checked ? 'var(--cream-faint)' : 'var(--cream)',
                      textDecoration: g.is_checked ? 'line-through' : 'none',
                      letterSpacing: '-0.01em',
                    }}>
                      {g.item_name}
                    </span>
                  </div>
                ))
            }
          </div>

          <p style={{
            fontFamily: 'var(--font-mono)', fontSize: 'var(--text-overline)',
            letterSpacing: '0.14em', textTransform: 'uppercase',
            color: 'var(--cream-faint)', margin: '12px 0 0',
          }}>
            {groceries.filter(g => !g.is_checked).length} of {groceries.length} left
          </p>
        </motion.button>

        {/* Next event card */}
        <motion.button
          className="glass-card"
          onClick={() => navigate('/calendar')}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.14, ease: [0.23, 1, 0.32, 1] }}
          style={{
            padding: '16px 14px', borderRadius: 20, textAlign: 'left',
            cursor: 'pointer', display: 'flex', flexDirection: 'column',
            minHeight: 200, color: 'var(--cream)',
          }}
        >
          <p style={{
            fontFamily: 'var(--font-mono)', fontSize: 'var(--text-overline)',
            letterSpacing: '0.2em', textTransform: 'uppercase',
            color: 'var(--cream-faint)', margin: '0 0 10px',
          }}>
            {nextEvent ? 'On tonight' : 'Calendar'}
          </p>

          {nextEvent ? (
            <>
              <p style={{
                fontFamily: 'var(--font-display)', fontSize: 'clamp(22px, 6vw, 30px)',
                fontWeight: 600, lineHeight: 1.1, letterSpacing: '-0.025em',
                color: 'var(--accent)', margin: '0 0 12px', flex: 1,
              }}>
                {nextEvent.title}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 6, height: 6, borderRadius: 999, background: 'var(--accent)', flexShrink: 0 }} />
                <span style={{
                  fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)',
                  color: 'var(--cream-dim)',
                }}>
                  {nextEvent.time || 'All day'} · your turn
                </span>
              </div>
            </>
          ) : (
            <p style={{
              fontFamily: 'var(--font-display)', fontStyle: 'italic',
              fontSize: 'var(--text-lg)', color: 'var(--cream-faint)',
              margin: 0, flex: 1,
            }}>
              {loading ? '…' : 'Nothing yet.'}
            </p>
          )}
        </motion.button>

      </div>
    </div>
  )
}
