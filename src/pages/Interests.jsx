import { useEffect, useState, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { useModalAnimation } from '../hooks/useModalAnimation'
import { Masthead, SectionRule, Kicker, InitialsAvatar, PlusIcon, XIcon, posterColor } from '../components/RoomyUI'

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

  const fieldStyle = {
    background: 'transparent', border: 'none',
    borderBottom: '1px solid rgba(255,255,255,0.18)',
    padding: '10px 0', fontFamily: 'var(--font-display)',
    fontSize: 20, color: 'var(--cream)', outline: 'none',
    letterSpacing: '-0.01em', width: '100%',
  }
  const labelStyle = {
    fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.22em',
    textTransform: 'uppercase', color: 'var(--cream-faint)', display: 'block', marginBottom: 6,
  }

  return (
    <div className="modal-overlay" onClick={handleClose} ref={overlayRef}>
      <div className="modal" onClick={e => e.stopPropagation()} ref={panelRef}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 26, letterSpacing: '-0.02em', color: 'var(--cream)', marginBottom: 20 }}>
          {initialData ? 'Edit entry.' : `Add to ${category === 'watchlist' ? 'watchlist' : 'places'}.`}
        </div>
        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div style={{ display: 'flex', gap: 8 }}>
            {['watchlist', 'places'].map(c => (
              <button key={c} type="button" onClick={() => setCategory(c)} style={{
                flex: 1, padding: '8px', borderRadius: 999, fontSize: 12,
                fontFamily: 'var(--font-body)', fontWeight: 600, cursor: 'pointer',
                background: category === c ? 'var(--cream)' : 'transparent',
                color: category === c ? 'var(--primary-fg)' : 'var(--cream-faint)',
                border: category === c ? 'none' : '1px solid rgba(255,255,255,0.2)',
                textTransform: 'capitalize',
              }}>{c}</button>
            ))}
          </div>
          <div>
            <label style={labelStyle}>Title</label>
            <input style={fieldStyle} value={title} onChange={e => setTitle(e.target.value)} placeholder={category === 'watchlist' ? 'e.g. Dune: Part Two' : 'e.g. Balthazar'} required />
          </div>
          <div>
            <label style={labelStyle}>Description (optional)</label>
            <input style={fieldStyle} value={description} onChange={e => setDescription(e.target.value)} placeholder="Genre, vibe, notes…" />
          </div>
          <div>
            <label style={labelStyle}>Link (optional)</label>
            <input style={fieldStyle} value={link} onChange={e => setLink(e.target.value)} placeholder="https://…" />
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
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

  useEffect(() => { load() }, [])

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
    <div style={{ paddingTop: 16 }}>
      {showModal && <Modal onClose={() => setShowModal(false)} onSave={saveItem} loading={adding} defaultCategory={tab} initialData={editData} />}

      <Masthead title="Interests" meta="Shared · 2 hosts" />

      <div style={{ marginTop: 18 }}>
        <Kicker>The list</Kicker>
        <h1 style={{
          fontFamily: 'var(--font-display)', fontSize: 'clamp(34px, 10vw, 44px)',
          lineHeight: 0.95, margin: '8px 0 0', letterSpacing: '-0.025em', color: 'var(--cream)',
        }}>
          Things to <span style={{ fontStyle: 'italic', color: 'var(--accent-soft)' }}>watch</span> and<br />
          places to <span style={{ fontStyle: 'italic', color: 'var(--accent-soft)' }}>go.</span>
        </h1>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginTop: 22 }}>
        {[
          { id: 'watchlist', label: 'Watchlist', count: items.filter(i => i.category === 'watchlist').length },
          { id: 'places', label: 'Places', count: items.filter(i => i.category === 'places').length },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            padding: '8px 16px', borderRadius: 999,
            fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 600,
            cursor: 'pointer', letterSpacing: '-0.01em',
            border: tab === t.id ? 'none' : '1px solid rgba(255,255,255,0.18)',
            background: tab === t.id ? 'var(--cream)' : 'transparent',
            color: tab === t.id ? 'var(--primary-fg)' : 'var(--cream)',
          }}>
            {t.label}{' '}
            <span style={{ fontFamily: 'var(--font-mono)', opacity: 0.5, fontSize: 10 }}>({t.count})</span>
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
          <div className="animate-spin" style={{ width: 28, height: 28, border: '1.5px solid rgba(255,255,255,0.12)', borderTopColor: 'var(--cream)', borderRadius: '50%' }} />
        </div>
      ) : (
        <div style={{ marginTop: 24 }}>
          <SectionRule
            label={`01 — ${tab === 'watchlist' ? 'On the watchlist' : 'On the map'}`}
            right={
              <button onClick={() => { setEditData(null); setShowModal(true) }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--cream-faint)', display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.18em', textTransform: 'uppercase' }}>
                <PlusIcon size={10} stroke={2} /> Add
              </button>
            }
          />

          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '50px 0' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 20, color: 'var(--cream-faint)', marginBottom: 16 }}>
                Nothing here yet.
              </div>
              <button className="btn-primary" onClick={() => { setEditData(null); setShowModal(true) }}>
                Add one now
              </button>
            </div>
          ) : (
            <div style={{ marginTop: 14 }}>
              {filtered.map((item, i) => (
                tab === 'watchlist'
                  ? <WatchRow key={item.id} item={item} profiles={profiles} myId={session?.user?.id} isLast={i === filtered.length - 1}
                      onEdit={() => { setEditData(item); setShowModal(true) }} onDelete={() => deleteItem(item.id)} />
                  : <PlaceRow key={item.id} item={item} profiles={profiles} myId={session?.user?.id} isLast={i === filtered.length - 1}
                      onEdit={() => { setEditData(item); setShowModal(true) }} onDelete={() => deleteItem(item.id)} />
              ))}
            </div>
          )}

          <div style={{
            fontFamily: 'var(--font-display)', fontStyle: 'italic',
            fontSize: 15, color: 'var(--cream-faint)', textAlign: 'center', lineHeight: 1.3,
            padding: '18px 24px 8px', borderTop: '1px solid rgba(255,255,255,0.10)', marginTop: 28,
          }}>
            "A shared list is a quiet promise."
          </div>
        </div>
      )}
    </div>
  )
}

function WatchRow({ item, profiles, myId, isLast, onEdit, onDelete }) {
  const addedByMe = item.added_by === myId
  const adderName = profiles[item.added_by]?.split(' ')[0] || '?'
  const initials = adderName[0]?.toUpperCase() || '?'
  const color = posterColor(item.title || '')

  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '52px 1fr auto auto auto', gap: 12, alignItems: 'center',
      padding: '10px 0', borderBottom: isLast ? 'none' : '1px solid rgba(255,255,255,0.06)',
    }}>
      <div style={{
        width: 52, aspectRatio: '2 / 3',
        background: color, borderRadius: 4,
        display: 'flex', alignItems: 'flex-end', padding: 4,
        color: 'rgba(255,255,255,0.85)', fontFamily: 'var(--font-display)', fontSize: 10,
        letterSpacing: '-0.01em', lineHeight: 1,
        boxShadow: '0 4px 10px -4px rgba(0,0,0,0.5)',
      }}>
        {item.title?.slice(0, 2).toUpperCase()}
      </div>
      <div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, color: 'var(--cream)', lineHeight: 1.15, letterSpacing: '-0.01em' }}>
          {item.title}
        </div>
        <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--cream-faint)', marginTop: 3, display: 'flex', alignItems: 'center', gap: 8 }}>
          {item.description && <span>{item.description}</span>}
          {item.link && <a href={item.link} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-soft)', fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Link ↗</a>}
        </div>
      </div>
      <InitialsAvatar initials={initials} isMe={addedByMe} size={22} />
      <button onClick={onEdit} style={{ color: 'var(--cream-faint)', background: 'none', border: 'none', cursor: 'pointer', padding: 2, opacity: 0.7 }}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 4l6 6L9 21H3v-6L14 4z"/></svg>
      </button>
      <button onClick={onDelete} style={{ color: 'var(--cream-faint)', background: 'none', border: 'none', cursor: 'pointer', padding: 2, opacity: 0.6 }}>
        <XIcon size={13} />
      </button>
    </div>
  )
}

function PlaceRow({ item, profiles, myId, isLast, onEdit, onDelete }) {
  const addedByMe = item.added_by === myId
  const adderName = profiles[item.added_by]?.split(' ')[0] || '?'
  const initials = adderName[0]?.toUpperCase() || '?'

  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '44px 1fr auto auto auto', gap: 12, alignItems: 'center',
      padding: '12px 0', borderBottom: isLast ? 'none' : '1px solid rgba(255,255,255,0.06)',
    }}>
      <div style={{
        width: 44, height: 44, borderRadius: 999,
        background: 'var(--surface-raised)',
        border: '1px solid rgba(255,255,255,0.10)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'var(--accent-soft)',
      }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s7-7.5 7-13a7 7 0 1 0-14 0c0 5.5 7 13 7 13z"/>
          <circle cx="12" cy="9" r="2.5"/>
        </svg>
      </div>
      <div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, color: 'var(--cream)', lineHeight: 1.15, letterSpacing: '-0.01em' }}>
          {item.title}
        </div>
        <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--cream-faint)', marginTop: 2 }}>
          {item.description || 'Place to visit'}
          {item.link && <a href={item.link} target="_blank" rel="noopener noreferrer" style={{ marginLeft: 8, color: 'var(--accent-soft)', fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Link ↗</a>}
        </div>
      </div>
      <InitialsAvatar initials={initials} isMe={addedByMe} size={22} />
      <button onClick={onEdit} style={{ color: 'var(--cream-faint)', background: 'none', border: 'none', cursor: 'pointer', padding: 2, opacity: 0.7 }}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 4l6 6L9 21H3v-6L14 4z"/></svg>
      </button>
      <button onClick={onDelete} style={{ color: 'var(--cream-faint)', background: 'none', border: 'none', cursor: 'pointer', padding: 2, opacity: 0.6 }}>
        <XIcon size={13} />
      </button>
    </div>
  )
}
