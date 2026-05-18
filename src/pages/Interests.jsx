import { useEffect, useState, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { useModalAnimation } from '../hooks/useModalAnimation'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'

const TABS = [
  { key: 'watchlist', label: '🎬 Watchlist' },
  { key: 'places', label: '📍 Places' },
]

function Modal({ onClose, onSave, loading, defaultCategory, initialData = null }) {
  const overlayRef = useRef(null)
  const panelRef = useRef(null)
  const { handleClose } = useModalAnimation(overlayRef, panelRef, onClose)

  const [category, setCategory] = useState(initialData?.category || defaultCategory)
  const [title, setTitle] = useState(initialData?.title || '')
  const [description, setDescription] = useState(initialData?.description || '')
  const [link, setLink] = useState(initialData?.link || '')

  function submit(e) {
    e.preventDefault()
    if (!title) return
    onSave({ category, title, description: description || null, link: link || null }, initialData?.id, handleClose)
  }

  return (
    <div className="modal-overlay" onClick={handleClose} ref={overlayRef}>
      <div className="modal" onClick={e => e.stopPropagation()} ref={panelRef}>
        <h2 className="font-display" style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: 24 }}>
          {initialData ? 'Edit' : 'Add to'} {category === 'watchlist' ? 'Watchlist' : 'Places'}
        </h2>
        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--muted)', display: 'block', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Category</label>
            <div style={{ display: 'flex', gap: 10 }}>
              {TABS.map(t => (
                <button type="button" key={t.key} onClick={() => setCategory(t.key)} className={category === t.key ? 'btn-primary' : 'btn-ghost'} style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
                  {t.label}
                </button>
              ))}
            </div>
          </div>
          {[
            { label: 'Title', val: title, set: setTitle, placeholder: category === 'watchlist' ? 'e.g. Dune: Part Two' : 'e.g. Balthazar Restaurant', req: true },
            { label: 'Description (optional)', val: description, set: setDescription, placeholder: 'Genre, vibe, notes…', req: false },
            { label: 'Link (optional)', val: link, set: setLink, placeholder: 'https://…', req: false },
          ].map(({ label, val, set, placeholder, req }) => (
            <div key={label}>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--muted)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</label>
              <input className="input" value={val} onChange={e => set(e.target.value)} placeholder={placeholder} required={req} />
            </div>
          ))}
          <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
            <button type="button" className="btn-ghost" onClick={handleClose} style={{ flex: 1 }}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={loading} style={{ flex: 1, justifyContent: 'center' }}>
              {loading ? '…' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function Interests() {
  const { session, profile } = useAuth()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('watchlist')
  const [showModal, setShowModal] = useState(false)
  const [editData, setEditData] = useState(null)
  const [adding, setAdding] = useState(false)
  const [profiles, setProfiles] = useState({})
  const containerRef = useRef(null)

  useEffect(() => { load() }, [])

  useGSAP(() => {
    if (loading) return
    gsap.from('header', { autoAlpha: 0, y: -8, duration: 0.35, ease: 'expo.out' })
    gsap.from('.glass-card', {
      autoAlpha: 0,
      y: 8,
      stagger: 0.025,
      duration: 0.35,
      ease: 'expo.out',
      delay: 0.05,
      clearProps: 'opacity,visibility,transform',
      force3D: true
    })
  }, { scope: containerRef, dependencies: [loading, tab] })

  async function load() {
    try {
      setLoading(true)
      const [intRes, profRes] = await Promise.all([
        supabase.from('interests').select('*').order('created_at', { ascending: false }),
        supabase.from('profiles').select('id, full_name'),
      ])
      if (intRes.error) throw intRes.error
      if (profRes.error) throw profRes.error

      setItems(intRes.data || [])
      const map = {}
      ;(profRes.data || []).forEach(p => { map[p.id] = p.full_name })
      setProfiles(map)
    } catch (err) {
      console.error('Error loading interests:', err)
    } finally {
      setLoading(false)
    }
  }

  async function saveItem(data, id, handleClose) {
    try {
      setAdding(true)
      if (id) {
        const { error } = await supabase.from('interests').update(data).eq('id', id)
        if (error) throw error
      } else {
        const { error } = await supabase.from('interests').insert({ ...data, added_by: session.user.id, unit_id: profile?.unit_id || null })
        if (error) throw error
      }
      handleClose()
      load()
    } catch (err) {
      console.error('Error saving interest:', err)
      alert(`Failed to save: ${err.message}`)
    } finally {
      setAdding(false)
    }
  }

  async function deleteItem(id) {
    await supabase.from('interests').delete().eq('id', id)
    setItems(prev => prev.filter(i => i.id !== id))
  }

  const filtered = items.filter(i => i.category === tab)

  return (
    <div ref={containerRef}>
      {showModal && <Modal onClose={() => setShowModal(false)} onSave={saveItem} loading={adding} defaultCategory={tab} initialData={editData} />}

      <header style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 32, gap: 16, flexWrap: 'wrap' }}>
        <div>
          <h1 className="font-display" style={{ fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', fontWeight: 800 }}>Interests</h1>
          <p style={{ color: 'var(--muted)', marginTop: 4 }}>Your shared watchlist &amp; bucket list</p>
        </div>
        <button className="btn-primary" onClick={() => { setEditData(null); setShowModal(true) }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
          Add
        </button>
      </header>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 28 }}>
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{
            padding: '10px 20px', borderRadius: 50, fontWeight: 700, fontSize: '0.9rem',
            background: tab === t.key ? 'var(--primary)' : 'rgba(255,255,255,0.5)',
            color: tab === t.key ? 'white' : 'var(--muted)',
            border: '1px solid', borderColor: tab === t.key ? 'transparent' : 'var(--border)',
            transition: 'all 0.2s var(--ease-out)', cursor: 'pointer',
          }}>
            {t.label} <span style={{ opacity: 0.7 }}>({items.filter(i => i.category === t.key).length})</span>
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
          <div className="animate-spin" style={{ width: 36, height: 36, border: '3px solid var(--secondary)', borderTopColor: 'var(--primary)', borderRadius: '50%' }} />
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--muted)' }}>
          <p style={{ fontSize: '3rem', marginBottom: 12 }}>{tab === 'watchlist' ? '🎬' : '📍'}</p>
          <p style={{ fontWeight: 700 }}>Nothing here yet</p>
          <p style={{ fontSize: '0.9rem', marginBottom: 20 }}>Add your first {tab === 'watchlist' ? 'movie or show' : 'place to visit'}</p>
          <button className="btn-primary" onClick={() => { setEditData(null); setShowModal(true) }}>Add one now</button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
          {filtered.map(item => (
            <div key={item.id} className="glass-card" style={{ padding: 22 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <h3 style={{ fontWeight: 800, fontSize: '1rem', flex: 1, marginRight: 8 }}>{item.title}</h3>
                
                <div style={{ display: 'flex', gap: 4 }}>
                  <button onClick={() => { setEditData(item); setShowModal(true) }} style={{ color: 'var(--muted)', transition: 'color 0.2s', flexShrink: 0, padding: 4 }}
                    onMouseOver={e => e.currentTarget.style.color = 'var(--fg)'}
                    onMouseOut={e => e.currentTarget.style.color = 'var(--muted)'}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                  </button>

                  <button onClick={() => deleteItem(item.id)} style={{ color: 'var(--muted)', transition: 'color 0.2s', flexShrink: 0, padding: 4 }}
                    onMouseOver={e => e.currentTarget.style.color = 'var(--danger)'}
                    onMouseOut={e => e.currentTarget.style.color = 'var(--muted)'}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </button>
                </div>
              </div>
              {item.description && (
                <p style={{ fontSize: '0.85rem', color: 'var(--muted)', marginBottom: 10, lineHeight: 1.5 }}>{item.description}</p>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <span className="badge badge-sage">
                  {profiles[item.added_by] === profile?.full_name ? 'Added by you' : `Added by ${profiles[item.added_by] || 'roommate'}`}
                </span>
                {item.link && (
                  <a href={item.link} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                    Link
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
