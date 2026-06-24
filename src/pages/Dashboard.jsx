import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { useModalAnimation } from '../hooks/useModalAnimation'
import { InitialsAvatar } from '../components/RoomyUI'
import PillNav from '../components/PillNav'


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
      stroke={checked ? 'var(--accent)' : 'var(--cream-faint)'}
      strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9"/>
      <motion.path 
        d="M8 12.5l3 3 5-5"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: checked ? 1 : 0, opacity: checked ? 1 : 0 }}
        transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
      />
    </svg>
  )
}

// ── Modals ───────────────────────────────────────────────────────────────────
function GroceriesModal({ onClose, groceries, onToggle }) {
  const overlayRef = useRef(null)
  const panelRef = useRef(null)
  const { handleClose } = useModalAnimation(overlayRef, panelRef, onClose)

  return (
    <motion.div 
      className="modal-overlay" 
      onClick={handleClose} 
      ref={overlayRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <motion.div 
        className="modal" 
        onClick={e => e.stopPropagation()} 
        ref={panelRef} 
        style={{ padding: '24px 20px', maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}
        initial={{ opacity: 0, y: 16, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 12, scale: 0.98 }}
        transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexShrink: 0 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', letterSpacing: '-0.02em', color: 'var(--cream)' }}>
            Shopping List
          </div>
          <button onClick={handleClose} style={{ background: 'none', border: 'none', color: 'var(--cream-faint)', cursor: 'pointer', padding: 4 }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        
        <div style={{ overflowY: 'auto', flex: 1, paddingRight: 8, margin: '0 -8px', paddingLeft: 8 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {groceries.length === 0 && (
              <p style={{ fontFamily: 'var(--font-body)', fontStyle: 'italic', fontSize: 'var(--text-sm)', color: 'var(--cream-faint)' }}>All clear!</p>
            )}
            {groceries.map(g => (
              <button
                key={g.id}
                onClick={() => onToggle(g.id, g.is_checked)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12, width: '100%',
                  background: 'none', border: 'none', cursor: 'pointer', padding: '6px 0', textAlign: 'left'
                }}
              >
                <CheckCircleIcon checked={g.is_checked} />
                <span style={{
                  fontFamily: 'var(--font-body)', fontSize: 'var(--text-lg)',
                  color: g.is_checked ? 'var(--cream-faint)' : 'var(--cream)',
                  textDecoration: g.is_checked ? 'line-through' : 'none',
                  letterSpacing: '-0.01em',
                }}>
                  {g.item_name}
                </span>
              </button>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
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
        supabase.from('groceries').select('id, item_name, is_checked').eq('is_inventory', false).order('updated_at', { ascending: false }).limit(30),
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

  async function toggleGrocery(id, currentStatus) {
    setGroceries(prev => prev.map(g => g.id === id ? { ...g, is_checked: !currentStatus } : g))
    await supabase.from('groceries').update({ is_checked: !currentStatus }).eq('id', id)
  }

  const [showGroceriesModal, setShowGroceriesModal] = useState(false)

  const wholeStr = Math.floor(Math.abs(owedToMe)).toString()
  const centsStr = (Math.abs(owedToMe) % 1).toFixed(2).slice(1)
  const roomateName = roommateProfile?.full_name?.split(' ')[0] || 'roommate'
  const roommateInitials = roommateProfile?.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '?'

  const nextEvent = events[0] || null

  return (
    <div style={{ paddingTop: 4, paddingBottom: 24, position: 'relative' }}>

      <div className="page-content">

      <AnimatePresence>
        {showGroceriesModal && (
          <GroceriesModal
            onClose={() => setShowGroceriesModal(false)}
            groceries={groceries}
            onToggle={toggleGrocery}
          />
        )}
      </AnimatePresence>

      {/* ── Header row ─────────────────────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <StarIcon />
          <span style={{
            fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)',
            fontWeight: 600, letterSpacing: '-0.03em', color: 'var(--cream)',
          }}>Nest.</span>
        </div>
        <button
          onClick={() => navigate('/more')}
          aria-label="More"
          style={{
            width: 40, height: 40, borderRadius: 999,
            background: 'var(--input-bg)',
            border: '1px solid var(--border-rule)',
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
          fontFamily: 'var(--font-mono)', fontSize: 'var(--text-overline)',
          color: 'var(--cream-faint)', margin: 0, letterSpacing: '0.2em', textTransform: 'uppercase',
        }}>
          Welcome home
        </p>
        <h1 style={{
          fontFamily: 'var(--font-display)', fontSize: 'clamp(40px, 12vw, 56px)',
          fontWeight: 600, lineHeight: 1, margin: '6px 0 0',
          color: 'var(--cream)', letterSpacing: '-0.03em',
        }}>
          {firstName}
        </h1>
      </div>

      <PillNav />

      {/* ── Balance card ───────────────────────────────────────── */}
      <motion.div
        className="glass-card"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
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

        <div className="led-numeric" style={{
          fontSize: 'clamp(46px, 14vw, 64px)',
          color: 'var(--cream)',
          marginBottom: 6, display: 'flex', alignItems: 'center',
        }}>
          <AnimatePresence mode="popLayout">
            {loading ? (
              <motion.span key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>—</motion.span>
            ) : (
              <motion.div
                key={`${wholeStr}-${centsStr}`}
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
                style={{ display: 'flex', alignItems: 'baseline' }}
              >
                €{wholeStr}<span style={{ fontSize: '0.5em', color: 'var(--cream-dim)', verticalAlign: 'super', lineHeight: 0, marginLeft: 2 }}>{centsStr}</span>
              </motion.div>
            )}
          </AnimatePresence>
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
        <motion.div
          className="glass-card"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.08, ease: [0.23, 1, 0.32, 1] }}
          style={{
            padding: '16px 14px', borderRadius: 20, textAlign: 'left',
            display: 'flex', flexDirection: 'column',
            minHeight: 200, color: 'var(--cream)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', margin: '0 0 14px' }}>
            <p style={{
              fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)',
              fontWeight: 600, lineHeight: 1.15, letterSpacing: '-0.025em',
              color: 'var(--cream)', margin: 0,
            }}>
              Shopping<br />List
            </p>
            {groceries.length > 4 && (
              <button 
                onClick={() => setShowGroceriesModal(true)}
                style={{ 
                  background: 'var(--input-bg)', border: 'none', borderRadius: 999, 
                  padding: '4px 8px', color: 'var(--cream)', fontSize: 'var(--text-xs)', 
                  cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 500 
                }}
              >
                Expand
              </button>
            )}
          </div>

          <motion.div 
            initial="hidden" 
            animate="show" 
            variants={{ show: { transition: { staggerChildren: 0.05 } } }} 
            style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}
          >
            <AnimatePresence mode="wait">
              {loading
                ? <motion.p key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--cream-faint)', margin: 0 }}>Loading…</motion.p>
                : groceries.length === 0
                  ? <motion.p key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} style={{ fontFamily: 'var(--font-body)', fontStyle: 'italic', fontSize: 'var(--text-xs)', color: 'var(--cream-faint)', margin: 0 }}>All clear!</motion.p>
                  : groceries.slice(0, 4).map(g => (
                    <motion.button
                      key={g.id}
                      variants={{ hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0, transition: { duration: 0.2 } } }}
                      onClick={() => toggleGrocery(g.id, g.is_checked)}
                      style={{ 
                        display: 'flex', alignItems: 'center', gap: 8, 
                        background: 'none', border: 'none', cursor: 'pointer', padding: '2px 0', textAlign: 'left'
                      }}
                    >
                      <CheckCircleIcon checked={g.is_checked} />
                      <span style={{
                        fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)',
                        color: g.is_checked ? 'var(--cream-faint)' : 'var(--cream)',
                        textDecoration: g.is_checked ? 'line-through' : 'none',
                        letterSpacing: '-0.01em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 100
                      }}>
                        {g.item_name}
                      </span>
                    </motion.button>
                  ))
              }
            </AnimatePresence>
          </motion.div>

          <button
            onClick={() => navigate('/groceries')}
            style={{
              fontFamily: 'var(--font-mono)', fontSize: 'var(--text-overline)',
              letterSpacing: '0.14em', textTransform: 'uppercase',
              color: 'var(--cream-faint)', margin: '12px 0 0',
              background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', padding: 0
            }}
          >
            {groceries.filter(g => !g.is_checked).length} of {groceries.length} left →
          </button>
        </motion.div>

        {/* Next event card */}
        <motion.button
          className="glass-card"
          onClick={() => navigate('/calendar')}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.14, ease: [0.23, 1, 0.32, 1] }}
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
            <div style={{
              fontFamily: 'var(--font-display)', fontStyle: 'italic',
              fontSize: 'var(--text-lg)', color: 'var(--cream-faint)',
              margin: 0, flex: 1,
            }}>
              <AnimatePresence mode="popLayout">
                {loading ? (
                  <motion.span key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>…</motion.span>
                ) : (
                  <motion.span key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>Nothing yet.</motion.span>
                )}
              </AnimatePresence>
            </div>
          )}
        </motion.button>

      </div>
      </div>
    </div>
  )
}
