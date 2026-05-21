import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { usePageEntrance } from '../hooks/usePageEntrance'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { InitialsAvatar, AvatarStack, SectionRule, Masthead, Kicker, ArrowRight } from '../components/RoomyUI'
import lohithAnim from '../assets/lohith_anim.png'

function getTimeOfDay() {
  const h = new Date().getHours()
  if (h < 12) return 'Morning'
  if (h < 17) return 'Afternoon'
  return 'Evening'
}

function formatTime() {
  return new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
}

function formatDate() {
  return new Date().toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' })
    .replace(',', ' ·')
}

export default function Dashboard() {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const containerRef = usePageEntrance()
  const [owedToMe, setOwedToMe] = useState(0)
  const [groceries, setGroceries] = useState([])
  const [watchlist, setWatchlist] = useState([])
  const [events, setEvents] = useState([])
  const [roommateProfile, setRoommateProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  const firstName = profile?.full_name?.split(' ')[0] || 'there'
  const greeting = `Good ${getTimeOfDay()}`

  useEffect(() => {
    async function load() {
      setLoading(true)
      const userId = (await supabase.auth.getUser()).data.user?.id

      const [expRes, grocRes, intRes, evtRes, profRes] = await Promise.all([
        supabase.from('expenses').select('amount, paid_by, split_amount, status').eq('status', 'pending'),
        supabase.from('groceries').select('id, item_name, quantity, is_checked').eq('is_checked', false).limit(5),
        supabase.from('interests').select('id, title, category').eq('category', 'watchlist').order('created_at', { ascending: false }).limit(3),
        supabase.from('events').select('id, title, date, time').gte('date', new Date().toISOString().split('T')[0]).order('date').limit(3),
        supabase.from('profiles').select('id, full_name'),
      ])

      const owed = (expRes.data || [])
        .filter(e => e.paid_by === userId)
        .reduce((sum, e) => sum + (e.split_amount != null ? e.split_amount : e.amount / 2), 0)

      setOwedToMe(owed)
      setGroceries(grocRes.data || [])
      setWatchlist(intRes.data || [])
      setEvents(evtRes.data || [])

      const roommate = (profRes.data || []).find(p => p.id !== userId)
      setRoommateProfile(roommate || null)
      setLoading(false)
    }
    load()
  }, [])

  const wholeStr = Math.floor(Math.abs(owedToMe)).toString()
  const centsStr = (Math.abs(owedToMe) % 1).toFixed(2).slice(1)
  const roomateName = roommateProfile?.full_name?.split(' ')[0] || 'your roommate'
  const myInitials = profile?.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '?'
  const roommateInitials = roommateProfile?.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '?'

  const meAvatar = { initials: myInitials, isMe: true }
  const roommateAvatar = { initials: roommateInitials, isMe: false }

  if (loading) return (
    <div style={{ paddingTop: 16 }}>
      <Masthead title="Roomy" meta={formatDate()} />
      <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 80 }}>
        <div className="animate-spin" style={{ width: 28, height: 28, border: '1.5px solid var(--border-rule)', borderTopColor: 'var(--cream)', borderRadius: '50%' }} />
      </div>
    </div>
  )

  return (
    <div ref={containerRef} style={{ paddingTop: 16, paddingBottom: 8 }}>
      {/* Masthead */}
      <div className="enter-item"><Masthead title="Roomy" meta={`№ 47 · ${formatDate()}`} /></div>

      {/* Hero */}
      <div className="enter-item" style={{ display: 'flex', alignItems: 'flex-start', gap: 16, paddingTop: 18, paddingBottom: 20 }}>
        <div style={{ flex: 1 }}>
          <Kicker>{getTimeOfDay()} Edition · {formatTime()}</Kicker>
          <h1 style={{
            fontFamily: 'var(--font-display)', fontSize: 'clamp(42px, 12vw, 52px)',
            lineHeight: 0.92, margin: '10px 0 0', letterSpacing: '-0.025em', color: 'var(--cream)',
          }}>
            {greeting},<br />
            <span style={{ fontStyle: 'italic', color: 'var(--accent-soft)' }}>{firstName}</span>.
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 14 }}>
            <AvatarStack items={[meAvatar, roommateAvatar]} size={26} />
            <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--cream-dim)' }}>
              with <strong style={{ color: 'var(--cream)' }}>{roomateName}</strong>
            </span>
          </div>
        </div>
        <motion.div
          initial={{ x: 24 }}
          animate={{ x: 0 }}
          transition={{ duration: 0.5, delay: 0.15, ease: 'easeOut' }}
          style={{ flexShrink: 0, width: 110, height: 170, overflow: 'hidden' }}
        >
          <img
            src={lohithAnim}
            alt=""
            style={{ height: '100%', width: 'auto', position: 'relative', left: '50%', transform: 'translateX(-50%)' }}
          />
        </motion.div>
      </div>

      {/* 01 — Ledger */}
      <div className="enter-item">
        <SectionRule
          label="01 — Ledger"
          right={<span onClick={() => navigate('/expenses')} style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4 }}>View all <ArrowRight size={11} /></span>}
        />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'flex-end', gap: 12, marginTop: 14 }}>
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.22em', color: 'var(--cream-faint)', textTransform: 'uppercase', marginBottom: 4 }}>
              {owedToMe >= 0 ? 'Owed to you' : 'You owe'}
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(44px, 14vw, 58px)', lineHeight: 1, color: 'var(--cream)', letterSpacing: '-0.035em' }}>
              €{wholeStr}<span style={{ color: 'var(--accent-soft)' }}>{centsStr}</span>
            </div>
          </div>
          {roommateProfile && (
            <div style={{ textAlign: 'right', paddingBottom: 6 }}>
              <InitialsAvatar initials={roommateInitials} isMe={false} size={28} />
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.18em', color: 'var(--cream-dim)', marginTop: 4, textTransform: 'uppercase' }}>
                from {roomateName}
              </div>
            </div>
          )}
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
          <button onClick={() => navigate('/expenses')} className="btn-primary">Settle up</button>
          <button className="btn-ghost">Remind {roomateName}</button>
        </div>
      </div>

      {/* 02/03 — Quick access cards */}
      <div className="enter-item" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 24 }}>
        <PantryCard groceries={groceries} onOpen={() => navigate('/groceries')} />
        <InterestsCard watchlist={watchlist} onOpen={() => navigate('/interests')} />
      </div>

      {/* 04 — Agenda */}
      <div className="enter-item">
        {events.length > 0 && (
          <div style={{ marginTop: 26 }}>
            <SectionRule label="04 — On the agenda" right={<span onClick={() => navigate('/calendar')} style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4 }}>{events.length} ahead</span>} />
            <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {events.map((e, i) => {
                const d = new Date(e.date + 'T12:00:00')
                const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase()
                return (
                  <div key={e.id} style={{
                    display: 'grid', gridTemplateColumns: '54px 1fr',
                    alignItems: 'center', gap: 12, paddingBottom: 10,
                    borderBottom: i < events.length - 1 ? '1px solid var(--border)' : 'none',
                  }}>
                    <div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.16em', color: 'var(--cream-faint)', textTransform: 'uppercase' }}>{dayLabel}</div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--cream)', marginTop: 1 }}>{e.time || '—'}</div>
                    </div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 19, color: 'var(--cream)', lineHeight: 1.1, letterSpacing: '-0.01em' }}>{e.title}</div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="enter-item" style={{
        fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase',
        color: 'var(--cream-faint)', padding: '20px 0 8px',
        textAlign: 'center', borderTop: '1px solid var(--border)', marginTop: 24,
      }}>
        End of edition · pull to refresh ↓
      </div>
    </div>
  )
}

function PantryCard({ groceries, onOpen }) {
  const shown = groceries.slice(0, 3)
  const total = groceries.length
  return (
    <button onClick={onOpen} style={cardStyle}>
      <div style={cardKickerStyle}>02 — Pantry</div>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, lineHeight: 1.05, color: 'var(--cream)', marginTop: 6, letterSpacing: '-0.02em' }}>
        {total} things<br />
        <span style={{ fontStyle: 'italic', color: 'var(--cream-faint)' }}>left to grab.</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 12 }}>
        {shown.map((g, i) => (
          <div key={i} style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--cream-faint)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 4, height: 4, borderRadius: 999, background: 'var(--accent)', flexShrink: 0 }} />
            {g.item_name}
            {g.quantity && <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--cream-faint)', marginLeft: 2 }}>×{g.quantity}</span>}
          </div>
        ))}
        {total > 3 && <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--cream-faint)', marginLeft: 10 }}>+ {total - 3} more</div>}
      </div>
      <div style={cardLinkStyle}>Open list <ArrowRight size={11} stroke={2} /></div>
    </button>
  )
}

function InterestsCard({ watchlist, onOpen }) {
  return (
    <button onClick={onOpen} style={cardStyle}>
      <div style={cardKickerStyle}>03 — Interests</div>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, lineHeight: 1.05, color: 'var(--cream)', marginTop: 6, letterSpacing: '-0.02em' }}>
        {watchlist.length} picks<br />
        <span style={{ fontStyle: 'italic', color: 'var(--cream-faint)' }}>on the list.</span>
      </div>
      <div style={{ display: 'flex', gap: 4, marginTop: 12 }}>
        {watchlist.slice(0, 3).map((w, i) => {
          const colors = ['#5a3e2b', '#2b3a4a', '#4a3a2b']
          return (
            <div key={i} style={{
              flex: 1, aspectRatio: '2 / 3',
              background: colors[i % colors.length],
              borderRadius: 4,
              display: 'flex', alignItems: 'flex-end', padding: 4,
              color: 'var(--cream-dim)',
              fontFamily: 'var(--font-display)', fontSize: 9,
              lineHeight: 1, letterSpacing: '-0.01em',
              boxShadow: '0 4px 10px -4px rgba(0,0,0,0.6)',
            }}>
              {w.title?.slice(0, 2).toUpperCase()}
            </div>
          )
        })}
      </div>
      <div style={cardLinkStyle}>Open list <ArrowRight size={11} stroke={2} /></div>
    </button>
  )
}

const cardStyle = {
  background: 'var(--surface-raised)',
  border: '1px solid var(--border)',
  borderRadius: 16, padding: '14px 14px 12px',
  textAlign: 'left', color: 'inherit', cursor: 'pointer',
  display: 'flex', flexDirection: 'column',
  minHeight: 190,
  fontFamily: 'var(--font-body)',
  transition: 'transform 150ms ease, background 200ms',
  width: '100%',
}

const cardKickerStyle = {
  fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.22em',
  textTransform: 'uppercase', color: 'var(--accent-soft)',
}

const cardLinkStyle = {
  marginTop: 'auto', paddingTop: 12,
  fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap', fontSize: 10,
  letterSpacing: '0.16em', textTransform: 'uppercase',
  color: 'var(--cream)', display: 'inline-flex', alignItems: 'center', gap: 6,
}
