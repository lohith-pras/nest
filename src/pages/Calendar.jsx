import { useEffect, useState, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
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

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h2 className="font-display" style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: 24 }}>
          {initialData ? 'Edit Event' : 'Add Event'}
        </h2>
        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {[
            { label: 'Event Title', type: 'text', val: title, set: setTitle, placeholder: 'e.g. Movie night' },
            { label: 'Date', type: 'date', val: date, set: setDate, placeholder: '' },
            { label: 'Time (optional)', type: 'time', val: time, set: setTime, placeholder: '' },
            { label: 'Note (optional)', type: 'text', val: note, set: setNote, placeholder: 'Any details…' },
          ].map(({ label, type, val, set, placeholder }) => (
            <div key={label}>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--muted)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</label>
              <input className="input" type={type} value={val} onChange={e => set(e.target.value)} placeholder={placeholder} required={!label.includes('optional')} />
            </div>
          ))}
          <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
            <button type="button" className="btn-ghost" onClick={onClose} style={{ flex: 1 }}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={loading} style={{ flex: 1, justifyContent: 'center' }}>
              {loading ? '…' : 'Save Event'}
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
  const [viewYear, setViewYear] = useState(today.getFullYear())
  const [viewMonth, setViewMonth] = useState(today.getMonth())
  const containerRef = useRef(null)

  useEffect(() => { load() }, [])

  useGSAP(() => {
    if (loading) return
    gsap.from('header', { autoAlpha: 0, y: -8, duration: 0.35, ease: 'expo.out' })
    gsap.from('.glass-card', {
      autoAlpha: 0,
      y: 8,
      stagger: 0.04,
      duration: 0.35,
      ease: 'expo.out',
      delay: 0.05,
      clearProps: 'opacity,visibility,transform',
      force3D: true
    })
  }, { scope: containerRef, dependencies: [loading] })

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

  // Calendar grid
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

  const selectedEvents = selectedDate ? (eventsByDate[selectedDate] || []) : []
  const upcomingEvents = events.filter(e => e.date >= today.toISOString().split('T')[0])

  return (
    <div ref={containerRef}>
      {showModal && <Modal onClose={() => setShowModal(false)} onSave={saveEvent} loading={adding} selected={selectedDate} initialData={editData} />}

      <header style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 32, gap: 16, flexWrap: 'wrap' }}>
        <div>
          <h1 className="font-display" style={{ fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', fontWeight: 800 }}>Calendar</h1>
          <p style={{ color: 'var(--muted)', marginTop: 4 }}>{upcomingEvents.length} upcoming event{upcomingEvents.length !== 1 ? 's' : ''}</p>
        </div>
        <button className="btn-primary" onClick={() => { setEditData(null); setSelectedDate(today.toISOString().split('T')[0]); setShowModal(true) }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
          Add Event
        </button>
      </header>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>

        {/* Month grid */}
        <div className="glass-card" style={{ padding: 24 }}>
          {/* Nav */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <button onClick={() => { if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1) } else setViewMonth(m => m - 1) }}
              style={{ width: 36, height: 36, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s' }}
              onMouseOver={e => e.currentTarget.style.background = 'rgba(0,0,0,0.05)'}
              onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            </button>
            <h2 className="font-display" style={{ fontWeight: 800, fontSize: '1.1rem' }}>{MONTHS[viewMonth]} {viewYear}</h2>
            <button onClick={() => { if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1) } else setViewMonth(m => m + 1) }}
              style={{ width: 36, height: 36, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s' }}
              onMouseOver={e => e.currentTarget.style.background = 'rgba(0,0,0,0.05)'}
              onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
            </button>
          </div>

          {/* Day headers */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: 8 }}>
            {DAYS.map(d => (
              <div key={d} style={{ textAlign: 'center', fontSize: '0.7rem', fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em', padding: '4px 0' }}>{d}</div>
            ))}
          </div>

          {/* Cells */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 3 }}>
            {cells.map((day, i) => {
              if (!day) return <div key={i} />
              const ds = dateStr(day)
              const isToday = ds === today.toISOString().split('T')[0]
              const hasEvent = !!eventsByDate[ds]
              const isSelected = selectedDate === ds
              return (
                <button key={i} onClick={() => setSelectedDate(isSelected ? null : ds)} style={{
                  padding: '8px 4px', borderRadius: 10, textAlign: 'center', fontSize: '0.9rem',
                  fontWeight: isToday ? 800 : 500,
                  background: isSelected ? 'var(--primary)' : isToday ? 'var(--secondary)' : 'transparent',
                  color: isSelected ? 'white' : isToday ? 'var(--primary)' : 'var(--fg)',
                  position: 'relative', transition: 'all 0.15s ease',
                  cursor: 'pointer',
                }}
                  onMouseOver={e => { if (!isSelected) e.currentTarget.style.background = 'rgba(0,0,0,0.05)' }}
                  onMouseOut={e => { if (!isSelected) e.currentTarget.style.background = isToday ? 'var(--secondary)' : 'transparent' }}
                >
                  {day}
                  {hasEvent && (
                    <span style={{
                      position: 'absolute', bottom: 2, left: '50%', transform: 'translateX(-50%)',
                      width: 5, height: 5, borderRadius: '50%',
                      background: isSelected ? 'white' : 'var(--primary)',
                    }} />
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Event detail / upcoming */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {selectedDate && (
            <div className="glass-card" style={{ padding: 20 }}>
              <p style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>
                {new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </p>
              {selectedEvents.length === 0
                ? (
                  <div>
                    <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: 12 }}>No events</p>
                    <button className="btn-primary" style={{ fontSize: '0.85rem', padding: '8px 16px' }} onClick={() => { setEditData(null); setShowModal(true) }}>+ Add event</button>
                  </div>
                )
                : selectedEvents.map(ev => <EventCard key={ev.id} ev={ev} onDelete={deleteEvent} onEdit={() => { setEditData(ev); setShowModal(true) }} />)
              }
            </div>
          )}

          <div className="glass-card" style={{ padding: 20 }}>
            <p style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>Upcoming</p>
            {loading ? <div className="animate-spin" style={{ width: 24, height: 24, border: '2px solid var(--secondary)', borderTopColor: 'var(--primary)', borderRadius: '50%' }} />
              : upcomingEvents.length === 0
                ? <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>Nothing scheduled</p>
                : <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {upcomingEvents.slice(0, 6).map(ev => <EventCard key={ev.id} ev={ev} onDelete={deleteEvent} onEdit={() => { setEditData(ev); setShowModal(true) }} compact />)}
                </div>
            }
          </div>
        </div>
      </div>
    </div>
  )
}

function EventCard({ ev, onDelete, onEdit, compact }) {
  const d = new Date(ev.date + 'T12:00:00')
  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: compact ? '8px 0' : 0, borderBottom: compact ? '1px solid rgba(0,0,0,0.05)' : 'none' }}>
      <div style={{ flexShrink: 0, textAlign: 'center', width: 40 }}>
        <p style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase' }}>{d.toLocaleDateString('en-US', { month: 'short' })}</p>
        <p className="font-display" style={{ fontSize: '1.2rem', fontWeight: 800, lineHeight: 1 }}>{d.getDate()}</p>
      </div>
      <div style={{ flex: 1 }}>
        <p style={{ fontWeight: 700, marginBottom: 2 }}>{ev.title}</p>
        {ev.time && <p style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>{ev.time}</p>}
        {ev.note && <p style={{ fontSize: '0.8rem', color: 'var(--muted)', marginTop: 2 }}>{ev.note}</p>}
      </div>
      
      <button onClick={onEdit} style={{ color: 'var(--muted)', flexShrink: 0, transition: 'color 0.2s', padding: 2 }}
        onMouseOver={e => e.currentTarget.style.color = 'var(--fg)'}
        onMouseOut={e => e.currentTarget.style.color = 'var(--muted)'}>
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121(0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
      </button>

      <button onClick={() => onDelete(ev.id)} style={{ color: 'var(--muted)', flexShrink: 0, transition: 'color 0.2s', padding: 2 }}
        onMouseOver={e => e.currentTarget.style.color = 'var(--danger)'}
        onMouseOut={e => e.currentTarget.style.color = 'var(--muted)'}>
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    </div>
  )
}
