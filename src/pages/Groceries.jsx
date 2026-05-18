import { useEffect, useState, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'

export default function Groceries() {
  const { session, profile } = useAuth()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [newItem, setNewItem] = useState('')
  const [newQty, setNewQty] = useState('')
  const [adding, setAdding] = useState(false)
  const containerRef = useRef(null)

  useGSAP(() => {
    if (loading) return
    gsap.from('header', { autoAlpha: 0, y: -8, duration: 0.35, ease: 'expo.out' })
    gsap.from('form', { autoAlpha: 0, y: 4, duration: 0.35, delay: 0.04, ease: 'expo.out' })
    gsap.from('.glass-card', {
      autoAlpha: 0,
      y: 8,
      stagger: 0.025,
      duration: 0.35,
      ease: 'expo.out',
      clearProps: 'opacity,visibility,transform',
      force3D: true
    })
  }, { scope: containerRef, dependencies: [loading] })

  useEffect(() => {
    load()

    // Real-time subscription
    const channel = supabase
      .channel('groceries-room')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'groceries' }, () => load())
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [])

  async function load() {
    const { data } = await supabase
      .from('groceries')
      .select('*')
      .order('updated_at', { ascending: false })
    setItems(data || [])
    setLoading(false)
  }

  const [editingId, setEditingId] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!newItem.trim()) return
    setAdding(true)

    if (editingId) {
      await supabase.from('groceries').update({
        item_name: newItem.trim(),
        quantity: newQty.trim() || null,
        updated_at: new Date().toISOString()
      }).eq('id', editingId)
      setEditingId(null)
    } else {
      await supabase.from('groceries').insert({
        item_name: newItem.trim(),
        quantity: newQty.trim() || null,
        is_checked: false,
        added_by: session.user.id,
        unit_id: profile?.unit_id || null
      })
    }
    
    setNewItem('')
    setNewQty('')
    setAdding(false)
    load()
  }

  function handleEdit(item) {
    setNewItem(item.item_name)
    setNewQty(item.quantity || '')
    setEditingId(item.id)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function toggleItem(id, current) {
    setItems(prev => prev.map(i => i.id === id ? { ...i, is_checked: !current } : i))
    await supabase.from('groceries').update({ is_checked: !current, updated_at: new Date().toISOString() }).eq('id', id)
  }

  async function deleteItem(id) {
    if (editingId === id) { setEditingId(null); setNewItem(''); setNewQty('') }
    await supabase.from('groceries').delete().eq('id', id)
    setItems(prev => prev.filter(i => i.id !== id))
  }

  async function clearChecked() {
    const ids = items.filter(i => i.is_checked).map(i => i.id)
    if (ids.length === 0) return
    await supabase.from('groceries').delete().in('id', ids)
    setItems(prev => prev.filter(i => !i.is_checked))
  }

  const unchecked = items.filter(i => !i.is_checked)
  const checked = items.filter(i => i.is_checked)

  return (
    <div ref={containerRef}>
      <header style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 32, gap: 16, flexWrap: 'wrap' }}>
        <div>
          <h1 className="font-display" style={{ fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', fontWeight: 800 }}>Groceries</h1>
          <p style={{ color: 'var(--muted)', marginTop: 4 }}>
            {unchecked.length} item{unchecked.length !== 1 ? 's' : ''} left
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, marginLeft: 8 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', display: 'inline-block' }} className="animate-pulse" />
              <span style={{ fontSize: '0.75rem' }}>Live sync</span>
            </span>
          </p>
        </div>
        {checked.length > 0 && (
          <button className="btn-ghost" onClick={clearChecked} style={{ fontSize: '0.85rem' }}>
            Clear checked ({checked.length})
          </button>
        )}
      </header>

      {/* Add Item Form */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 10, marginBottom: 32, flexWrap: 'wrap' }}>
        <input
          className="input"
          style={{ flex: 2, minWidth: 160 }}
          value={newItem}
          onChange={e => setNewItem(e.target.value)}
          placeholder="Item name…"
        />
        <input
          className="input"
          style={{ flex: 1, minWidth: 100, maxWidth: 140 }}
          value={newQty}
          onChange={e => setNewQty(e.target.value)}
          placeholder="Qty (optional)"
        />
        <button type="submit" className="btn-primary" disabled={adding || !newItem.trim()}>
          {adding ? '…' : editingId ? 'Save' : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
              Add
            </>
          )}
        </button>
        {editingId && (
          <button type="button" className="btn-ghost" onClick={() => { setEditingId(null); setNewItem(''); setNewQty('') }}>Cancel</button>
        )}
      </form>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
          <div className="animate-spin" style={{ width: 36, height: 36, border: '3px solid var(--secondary)', borderTopColor: 'var(--primary)', borderRadius: '50%' }} />
        </div>
      ) : (
        <>
          {items.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--muted)' }}>
              <p style={{ fontSize: '3rem', marginBottom: 12 }}>🛒</p>
              <p style={{ fontWeight: 700 }}>List is empty</p>
              <p style={{ fontSize: '0.9rem' }}>Add items above</p>
            </div>
          )}

          {unchecked.length > 0 && (
            <section style={{ marginBottom: 28 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {unchecked.map(item => (
                  <GroceryRow key={item.id} item={item} onToggle={toggleItem} onDelete={deleteItem} onEdit={() => handleEdit(item)} />
                ))}
              </div>
            </section>
          )}

          {/* Checked */}
          {checked.length > 0 && (
            <section style={{ opacity: 0.5 }}>
              <p style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>In cart</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {checked.map(item => (
                  <GroceryRow key={item.id} item={item} onToggle={toggleItem} onDelete={deleteItem} onEdit={() => handleEdit(item)} />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  )
}

function GroceryRow({ item, onToggle, onDelete, onEdit }) {
  return (
    <div className="glass-card" style={{
      padding: '14px 18px',
      display: 'flex', alignItems: 'center', gap: 14,
      textDecoration: item.is_checked ? 'line-through' : 'none',
    }}>
      <button
        onClick={() => onToggle(item.id, item.is_checked)}
        style={{
          width: 24, height: 24, borderRadius: 8, flexShrink: 0,
          border: `2px solid ${item.is_checked ? 'var(--primary)' : 'var(--border)'}`,
          background: item.is_checked ? 'var(--primary)' : 'transparent',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.2s ease',
        }}
      >
        {item.is_checked && (
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
        )}
      </button>
      <span style={{ flex: 1, fontWeight: 500 }}>{item.item_name}</span>
      {item.quantity && (
        <span style={{ fontSize: '0.8rem', color: 'var(--muted)', fontWeight: 600 }}>{item.quantity}</span>
      )}
      
      <button
        onClick={onEdit}
        style={{ color: 'var(--muted)', padding: 4, borderRadius: 8, transition: 'color 0.2s', flexShrink: 0 }}
        onMouseOver={e => e.currentTarget.style.color = 'var(--fg)'}
        onMouseOut={e => e.currentTarget.style.color = 'var(--muted)'}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
      </button>

      <button
        onClick={() => onDelete(item.id)}
        style={{ color: 'var(--muted)', padding: 4, borderRadius: 8, transition: 'color 0.2s', flexShrink: 0 }}
        onMouseOver={e => e.currentTarget.style.color = 'var(--danger)'}
        onMouseOut={e => e.currentTarget.style.color = 'var(--muted)'}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    </div>
  )
}
