import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { Masthead, SectionRule, Kicker, InitialsAvatar, PlusIcon, CheckIcon, XIcon } from '../components/RoomyUI'

export default function Groceries() {
  const { session, profile } = useAuth()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [newItem, setNewItem] = useState('')
  const [newQty, setNewQty] = useState('')
  const [adding, setAdding] = useState(false)
  const [editingId, setEditingId] = useState(null)

  useEffect(() => {
    load()
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

  async function handleSubmit(e) {
    e.preventDefault()
    if (!newItem.trim()) return
    setAdding(true)
    if (editingId) {
      await supabase.from('groceries').update({
        item_name: newItem.trim(),
        quantity: newQty.trim() || null,
        updated_at: new Date().toISOString(),
      }).eq('id', editingId)
      setEditingId(null)
    } else {
      await supabase.from('groceries').insert({
        item_name: newItem.trim(),
        quantity: newQty.trim() || null,
        is_checked: false,
        added_by: session.user.id,
        unit_id: profile?.unit_id || null,
      })
    }
    setNewItem('')
    setNewQty('')
    setAdding(false)
    load()
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

  function handleEdit(item) {
    setNewItem(item.item_name)
    setNewQty(item.quantity || '')
    setEditingId(item.id)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const unchecked = items.filter(i => !i.is_checked)
  const checked = items.filter(i => i.is_checked)

  return (
    <div style={{ paddingTop: 16 }}>
      <Masthead
        title="Pantry"
        meta={
          <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ width: 6, height: 6, borderRadius: 999, background: '#7AC57E' }} />
            Live · {unchecked.length} left
          </span>
        }
      />

      <div style={{ marginTop: 18 }}>
        <Kicker>The pantry</Kicker>
        <h1 style={{
          fontFamily: 'var(--font-display)', fontSize: 'clamp(34px, 10vw, 44px)',
          lineHeight: 0.95, margin: '8px 0 0', letterSpacing: '-0.025em', color: 'var(--cream)',
        }}>
          Things you<br />
          <span style={{ fontStyle: 'italic', color: 'var(--accent-soft)' }}>still need.</span>
        </h1>
      </div>

      {/* Add row */}
      <form onSubmit={handleSubmit} style={{
        display: 'grid', gridTemplateColumns: '1fr 70px 60px', gap: 6, marginTop: 22,
        padding: '10px 12px', background: 'var(--surface-raised)', borderRadius: 14,
        border: '1px solid rgba(255,255,255,0.06)',
        alignItems: 'center',
      }}>
        <input
          value={newItem}
          onChange={e => setNewItem(e.target.value)}
          placeholder="Add something…"
          style={{
            background: 'transparent', border: 'none', outline: 'none',
            fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--cream)', padding: '6px 4px',
          }}
        />
        <input
          value={newQty}
          onChange={e => setNewQty(e.target.value)}
          placeholder="Qty"
          style={{
            background: 'transparent', border: 'none', outline: 'none',
            fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--cream)', padding: '6px 4px',
          }}
        />
        <button type="submit" disabled={adding || !newItem.trim()} style={{
          background: 'var(--cream)', color: 'var(--primary-fg)',
          border: 'none', borderRadius: 999,
          fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 600,
          cursor: 'pointer', padding: '8px 4px',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3,
          opacity: adding || !newItem.trim() ? 0.5 : 1,
        }}>
          <PlusIcon size={13} stroke={2.5} />
          {editingId ? 'Save' : 'Add'}
        </button>
      </form>
      {editingId && (
        <button onClick={() => { setEditingId(null); setNewItem(''); setNewQty('') }} className="btn-ghost" style={{ marginTop: 8, fontSize: 12, padding: '6px 14px' }}>
          Cancel edit
        </button>
      )}

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
          <div className="animate-spin" style={{ width: 28, height: 28, border: '1.5px solid rgba(255,255,255,0.12)', borderTopColor: 'var(--cream)', borderRadius: '50%' }} />
        </div>
      ) : (
        <>
          {/* To grab */}
          <div style={{ marginTop: 24 }}>
            <SectionRule label="01 — To grab" right={`${unchecked.length} items`} />
            <div style={{ marginTop: 12 }}>
              {unchecked.map((item, i) => (
                <GroceryRow
                  key={item.id} item={item}
                  isMe={item.added_by === session?.user?.id}
                  onToggle={() => toggleItem(item.id, item.is_checked)}
                  onDelete={() => deleteItem(item.id)}
                  onEdit={() => handleEdit(item)}
                  isLast={i === unchecked.length - 1}
                />
              ))}
              {unchecked.length === 0 && (
                <div style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 18, color: 'var(--cream-faint)', padding: '24px 0', textAlign: 'center' }}>
                  Pantry's full. Nice work, you two.
                </div>
              )}
            </div>
          </div>

          {/* In cart */}
          {checked.length > 0 && (
            <div style={{ marginTop: 28 }}>
              <SectionRule
                label={`02 — In cart · ${checked.length}`}
                right={<span onClick={clearChecked} style={{ cursor: 'pointer' }}>Clear all</span>}
              />
              <div style={{ marginTop: 12 }}>
                {checked.map((item, i) => (
                  <GroceryRow
                    key={item.id} item={item}
                    isMe={item.added_by === session?.user?.id}
                    onToggle={() => toggleItem(item.id, item.is_checked)}
                    onDelete={() => deleteItem(item.id)}
                    onEdit={() => handleEdit(item)}
                    isLast={i === checked.length - 1}
                  />
                ))}
              </div>
            </div>
          )}

          <div style={{
            fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase',
            color: 'var(--cream-faint)', marginTop: 28, paddingTop: 18,
            borderTop: '1px solid rgba(255,255,255,0.10)', textAlign: 'center',
          }}>
            Live-synced · shared list
          </div>
        </>
      )}
    </div>
  )
}

function GroceryRow({ item, isMe, onToggle, onDelete, onEdit, isLast }) {
  const checked = item.is_checked

  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '26px 1fr auto auto auto',
      alignItems: 'center', gap: 10,
      padding: '12px 0',
      borderBottom: isLast ? 'none' : '1px solid rgba(255,255,255,0.06)',
    }}>
      <button onClick={onToggle} style={{
        width: 22, height: 22,
        border: `1.5px solid ${checked ? 'var(--accent)' : 'rgba(255,255,255,0.38)'}`,
        background: checked ? 'var(--accent)' : 'transparent',
        borderRadius: 6, cursor: 'pointer', padding: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all 180ms ease', flexShrink: 0,
      }}>
        {checked && <CheckIcon size={12} stroke={3} />}
      </button>

      <div>
        <div style={{
          fontFamily: 'var(--font-display)', fontSize: 18, color: 'var(--cream)',
          lineHeight: 1.1, letterSpacing: '-0.01em',
          textDecoration: checked ? 'line-through' : 'none',
          opacity: checked ? 0.45 : 1, transition: 'all 180ms ease',
        }}>
          {item.item_name}
        </div>
        {item.quantity && (
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--cream-faint)', marginTop: 2, letterSpacing: '0.1em' }}>
            ×{item.quantity}
          </div>
        )}
      </div>

      <div style={{ width: 20, height: 20, borderRadius: 999, background: isMe ? '#3B3B3B' : 'var(--accent)', flexShrink: 0 }} />

      <button onClick={onEdit} style={{ color: 'var(--cream-faint)', background: 'none', border: 'none', cursor: 'pointer', padding: 2, flexShrink: 0, opacity: 0.7 }}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 4l6 6L9 21H3v-6L14 4z"/></svg>
      </button>

      <button onClick={onDelete} style={{ color: 'var(--cream-faint)', background: 'none', border: 'none', cursor: 'pointer', padding: 2, flexShrink: 0, opacity: 0.6 }}>
        <XIcon size={14} />
      </button>
    </div>
  )
}
