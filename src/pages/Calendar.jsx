import { useEffect, useState, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { Masthead, SectionRule, Kicker, PlusIcon, XIcon } from '../components/RoomyUI'

const DAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']

function Modal({ onClose, onSave, loading, selected, initialData = null }) {
  const [title, setTitle] = useState(initialData?.title || '')
  const [date, setDate] = useState(initialData?.date || selected || '')
  const [time, setTime] = useState(initialData?.time || '')
  const [note, setNote] = useState(initialData?.note || '')

  function submit(e) {
    e.preventDefault()
    if (!title || !date) return
    onSave({ title, date, time: time || null, note: note || null }, initialData?.id)
  }

  const fieldStyle = {
    background: 'transparent', border: 'none',
    borderBottom: '1px solid var(--border-rule)',
    padding: '10px 0', fontFamily: 'var(--font-display)',
    fontSize: 'var(--text-xl)', color: 'var(--cream)', outline: 'none',
    letterSpacing: '-0.01em', width: '100%',
  }
  const labelStyle = {
    fontFamily: 'var(--font-mono)', fontSize: 'var(--text-overline)', letterSpacing: '0.22em',
    textTransform: 'uppercase', color: 'var(--cream-faint)', display: 'block', marginBottom: 6,
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', letterSpacing: '-0.02em', color: 'var(--cream)', marginBottom: 22 }}>
          {initialData ? 'Edit event.' : 'New event.'}
        </div>
        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {[
            { label: 'Event title', type: 'text', val: title, set: setTitle, placeholder: 'e.g. Movie night', req: true },
            { label: 'Date', type: 'date', val: date, set: setDate, placeholder: '', req: true },
            { label: 'Time (optional)', type: 'time', val: time, set: setTime, placeholder: '', req: false },
            { label: 'Note (optional)', type: 'text', val: note, set: setNote, placeholder: 'Any details…', req: false },
          ].map(({ label, type, val, set, placeholder, req }) => (
            <div key={label}>
              <label style={labelStyle}>{label}</label>
              <input style={fieldStyle} type={type} value={val} onChange={e => set(e.target.value)} placeholder={placeholder} required={req} />
            </div>
          ))}
          <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
            <button type="button" className="btn-ghost" onClick={onClose} style={{ flex: 1 }}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={loading} style={{ flex: 1, justifyContent: 'center' }}>
              {loading ? '…' : 'Save event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function Calendar() {
  const { session, profile } = useAuth()
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editData, setEditData] = useState(null)
  const [adding, setAdding] = useState(false)
  const [selectedDate, setSelectedDate] = useState(null)

  const today = new Date()
  const [viewYear, setViewYear] = useState(() => today.getFullYear())
  const [viewMonth, setViewMonth] = useState(() => today.getMonth())

  useEffect(() => { load() }, [])

  async function load() {
    const { data } = await supabase.from('events').select('*').order('date', { ascending: true })
    setEvents(data || [])
    setLoading(false)
  }

  async function saveEvent(data, id) {
    setAdding(true)
    if (id) {
      await supabase.from('events').update(data).eq('id', id)
    } else {
      await supabase.from('events').insert({ ...data, added_by: session.user.id, unit_id: profile?.unit_id || null })
    }
    setShowModal(false)
    load()
    setAdding(false)
  }

  async function deleteEvent(id) {
    await supabase.from('events').delete().eq('id', id)
    setEvents(prev => prev.filter(e => e.id !== id))
  }

  const firstDay = new Date(viewYear, viewMonth, 1).getDay()
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
  const cells = Array.from({ length: firstDay + daysInMonth }, (_, i) =>
    i < firstDay ? null : i - firstDay + 1
  )

  const eventsByDate = {}
  events.forEach(ev => {
    if (!eventsByDate[ev.date]) eventsByDate[ev.date] = []
    eventsByDate[ev.date].push(ev)
  })

  function dateStr(day) {
    return `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  }

  const todayStr = today.toISOString().split('T')[0]
  const selectedEvents = selectedDate ? (eventsByDate[selectedDate] || []) : []
  const upcomingEvents = events.filter(e => e.date >= todayStr)
  const monthLabel = `${MONTHS[viewMonth]} ${viewYear}`

  return (
    <div style={{ paddingTop: 16 }}>
      {showModal && <Modal onClose={() => setShowModal(false)} onSave={saveEvent} loading={adding} selected={selectedDate} initialData={editData} />}

      <Masthead title="Calendar" meta={`${upcomingEvents.length} events`} />

      <div style={{ marginTop: 18 }}>
        <Kicker>The agenda</Kicker>
        <h1 style={{
          fontFamily: 'var(--font-display)', fontSize: 'clamp(34px, 10vw, 44px)',
          lineHeight: 0.95, margin: '8px 0 0', letterSpacing: '-0.025em', color: 'var(--cream)',
        }}>
          {MONTHS[viewMonth].slice(0, 3)}{' '}
          <span style={{ fontStyle: 'italic', color: 'var(--accent-soft)' }}>{viewYear}</span>
        </h1>
      </div>

      {/* Month nav + grid */}
      <div style={{ marginTop: 22 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <button
            onClick={() => { if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1) } else setViewMonth(m => m - 1) }}
            style={{ width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--cream-faint)', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          </button>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-overline)', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--cream-faint)' }}>{monthLabel}</div>
          <button
            onClick={() => { if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1) } else setViewMonth(m => m + 1) }}
            style={{ width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--cream-faint)', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
          </button>
        </div>

        {/* Day headers */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', rowGap: 4 }}>
          {DAYS.map((d, i) => (
            <div key={i} style={{
              fontFamily: 'var(--font-mono)', fontSize: 'var(--text-overline)', letterSpacing: '0.16em',
              color: 'var(--cream-faint)', textAlign: 'center', paddingBottom: 6,
              borderBottom: '1px solid var(--border)',
            }}>{d}</div>
          ))}
          {cells.map((d, i) => {
            if (!d) return <div key={`empty-${i}`} />
            const ds = dateStr(d)
            const isToday = ds === todayStr
            const hasDot = !!eventsByDate[ds]
            const isSelected = selectedDate === ds
            return (
              <button key={ds} onClick={() => setSelectedDate(isSelected ? null : ds)} style={{
                aspectRatio: '1', display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                position: 'relative', padding: 2,
                background: 'none', border: 'none', cursor: 'pointer',
              }}>
                <div style={{
                  width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  borderRadius: 999,
                  background: isSelected ? 'var(--cream)' : isToday ? 'rgba(154,129,116,0.2)' : 'transparent',
                  border: isToday && !isSelected ? '1px solid rgba(154,129,116,0.5)' : 'none',
                }}>
                  <span style={{
                    fontFamily: isToday ? 'var(--font-display)' : 'var(--font-body)',
                    fontSize: isToday ? 18 : 13,
                    color: isSelected ? 'var(--primary-fg)' : isToday ? 'var(--cream)' : 'var(--cream-dim)',
                    fontWeight: isToday ? 400 : 500, lineHeight: 1,
                  }}>{d}</span>
                </div>
                {hasDot && (
                  <span style={{
                    position: 'absolute', bottom: 2, left: '50%', transform: 'translateX(-50%)',
                    width: 3, height: 3, borderRadius: 999,
                    background: isSelected ? 'var(--primary-fg)' : 'var(--accent)',
                  }} />
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Selected date events */}
      {selectedDate && (
        <div style={{ marginTop: 22 }}>
          <SectionRule
            label={new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            right={<button onClick={() => { setEditData(null); setShowModal(true) }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--cream-faint)', display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'var(--font-mono)', fontSize: 'var(--text-overline)', letterSpacing: '0.18em', textTransform: 'uppercase' }}><PlusIcon size={10} stroke={2} /> Add</button>}
          />
          {selectedEvents.length === 0 ? (
            <div style={{ padding: '16px 0', fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--cream-faint)' }}>
              No events — <button onClick={() => { setEditData(null); setShowModal(true) }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent-soft)', fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)' }}>add one</button>
            </div>
          ) : (
            <div style={{ marginTop: 12 }}>
              {selectedEvents.map((ev, i) => (
                <EventRow key={ev.id} ev={ev} onDelete={deleteEvent} onEdit={() => { setEditData(ev); setShowModal(true) }} isLast={i === selectedEvents.length - 1} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Upcoming */}
      <div style={{ marginTop: 26 }}>
        <SectionRule
          label="01 — Coming up"
          right={<button onClick={() => { setEditData(null); setSelectedDate(todayStr); setShowModal(true) }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--cream-faint)', display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'var(--font-mono)', fontSize: 'var(--text-overline)', letterSpacing: '0.18em', textTransform: 'uppercase' }}><PlusIcon size={10} stroke={2} /> Add event</button>}
        />

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
            <div className="animate-spin" style={{ width: 28, height: 28, border: '1.5px solid var(--border-rule)', borderTopColor: 'var(--cream)', borderRadius: '50%' }} />
          </div>
        ) : upcomingEvents.length === 0 ? (
          <div style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 'var(--text-lg)', color: 'var(--cream-faint)', padding: '24px 0' }}>
            Nothing scheduled yet.
          </div>
        ) : (
          <div style={{ marginTop: 12 }}>
            {upcomingEvents.slice(0, 8).map((ev, i) => (
              <EventRow key={ev.id} ev={ev} onDelete={deleteEvent} onEdit={() => { setEditData(ev); setShowModal(true) }} isLast={i === Math.min(upcomingEvents.length, 8) - 1} />
            ))}
          </div>
        )}
      </div>

      <div style={{
        fontFamily: 'var(--font-mono)', fontSize: 'var(--text-overline)', letterSpacing: '0.2em', textTransform: 'uppercase',
        color: 'var(--cream-faint)', marginTop: 28, paddingTop: 18,
        borderTop: '1px solid var(--border)', textAlign: 'center',
      }}>
        Synced · shared calendar
      </div>

      {/* FAB — add event */}
      <button
        onClick={() => { setEditData(null); setShowModal(true) }}
        style={{
          position: 'fixed',
          bottom: 'calc(92px + env(safe-area-inset-bottom))',
          right: 20,
          width: 52, height: 52,
          borderRadius: '50%',
          background: 'var(--accent)',
          color: '#fff',
          border: 'none',
          cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 20px rgba(154,129,116,0.35)',
          transition: 'transform 150ms var(--ease-spring)',
          zIndex: 40,
        }}
      >
        <PlusIcon size={22} stroke={2} />
      </button>
    </div>
  )
}

function EventRow({ ev, onDelete, onEdit, isLast }) {
  const d = new Date(ev.date + 'T12:00:00')
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '54px 1fr auto auto',
      alignItems: 'center', gap: 12, padding: '10px 0',
      borderBottom: isLast ? 'none' : '1px solid var(--border)',
    }}>
      <div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-overline)', letterSpacing: '0.16em', color: 'var(--cream-faint)', textTransform: 'uppercase' }}>
          {d.toLocaleDateString('en-US', { weekday: 'short' })}
        </div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)', color: 'var(--cream)', marginTop: 1 }}>
          {ev.time || '—'}
        </div>
      </div>
      <div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-lg)', color: 'var(--cream)', lineHeight: 1.1, letterSpacing: '-0.01em' }}>{ev.title}</div>
        {ev.note && <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--cream-faint)', marginTop: 2 }}>{ev.note}</div>}
      </div>
      <button onClick={onEdit} style={{ color: 'var(--cream-faint)', background: 'none', border: 'none', cursor: 'pointer', padding: 2, opacity: 0.7 }}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 4l6 6L9 21H3v-6L14 4z"/></svg>
      </button>
      <button onClick={() => onDelete(ev.id)} style={{ color: 'var(--cream-faint)', background: 'none', border: 'none', cursor: 'pointer', padding: 2, opacity: 0.6 }}>
        <XIcon size={13} />
      </button>
    </div>
  )
}
