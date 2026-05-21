import { useEffect, useState, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { useModalAnimation } from '../hooks/useModalAnimation'
import { Masthead, SectionRule, Kicker, InitialsAvatar, PlusIcon, CheckIcon, XIcon } from '../components/RoomyUI'

function AddItemModal({ onClose, onSave, loading, initialData = null }) {
  const overlayRef = useRef(null)
  const panelRef = useRef(null)
  const { handleClose } = useModalAnimation(overlayRef, panelRef, onClose)
  const [item, setItem] = useState(initialData?.item_name || '')
  const [qty, setQty] = useState(initialData?.quantity || '')
  const itemRef = useRef(null)

  useEffect(() => { itemRef.current?.focus() }, [])

  function submit(e) {
    e.preventDefault()
    if (!item.trim()) return
    onSave({ item_name: item.trim(), quantity: qty.trim() || null }, initialData?.id, handleClose)
  }

  const fieldStyle = {
    background: 'transparent', border: 'none',
    borderBottom: '1px solid var(--input-border)',
    padding: '10px 0', fontFamily: 'var(--font-display)',
    fontSize: 20, color: 'var(--cream)', outline: 'none',
    letterSpacing: '-0.01em', width: '100%',
  }

  return (
    <div className="modal-overlay" onClick={handleClose} ref={overlayRef}>
      <div className="modal" onClick={e => e.stopPropagation()} ref={panelRef}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 26, letterSpacing: '-0.02em', color: 'var(--cream)', marginBottom: 24 }}>
          {initialData ? 'Edit item.' : 'Add to pantry.'}
        </div>
        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--cream-faint)', marginBottom: 6 }}>Item</div>
            <input ref={itemRef} style={fieldStyle} value={item} onChange={e => setItem(e.target.value)} placeholder="e.g. Oat milk" required />
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--cream-faint)', marginBottom: 6 }}>Quantity (optional)</div>
            <input style={fieldStyle} value={qty} onChange={e => setQty(e.target.value)} placeholder="e.g. ×2, 500g" />
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
            <button type="button" className="btn-ghost" onClick={handleClose} style={{ flex: 1 }}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={loading || !item.trim()} style={{ flex: 1, justifyContent: 'center' }}>
              {loading ? '…' : initialData ? 'Save' : 'Add'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function Groceries() {
  const { session, profile } = useAuth()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [editData, setEditData] = useState(null)

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

  async function saveItem({ item_name, quantity }, id, handleClose) {
    setAdding(true)
    if (id) {
      await supabase.from('groceries').update({
        item_name, quantity,
        updated_at: new Date().toISOString(),
      }).eq('id', id)
    } else {
      await supabase.from('groceries').insert({
        item_name, quantity,
        is_checked: false,
        added_by: session.user.id,
        unit_id: profile?.unit_id || null,
      })
    }
    setAdding(false)
    handleClose()
    load()
  }

  async function toggleItem(id, current) {
    setItems(prev => prev.map(i => i.id === id ? { ...i, is_checked: !current } : i))
    await supabase.from('groceries').update({ is_checked: !current, updated_at: new Date().toISOString() }).eq('id', id)
  }

  async function deleteItem(id) {
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
    setEditData(item)
    setShowModal(true)
  }

  const unchecked = items.filter(i => !i.is_checked)
  const checked = items.filter(i => i.is_checked)

  return (
    <div style={{ paddingTop: 16 }}>
      {showModal && (
        <AddItemModal
          onClose={() => { setShowModal(false); setEditData(null) }}
          onSave={saveItem}
          loading={adding}
          initialData={editData}
        />
      )}

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


      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
          <div className="animate-spin" style={{ width: 28, height: 28, border: '1.5px solid var(--border-rule)', borderTopColor: 'var(--cream)', borderRadius: '50%' }} />
        </div>
      ) : (
        <>
          {/* To grab */}
          <div style={{ marginTop: 24 }}>
            <SectionRule label="01 — To grab" right={`${unchecked.length} items`} />
            <div style={{ marginTop: 12 }}>
              <AnimatePresence initial={false}>
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
              </AnimatePresence>
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
                right={<button onClick={clearChecked} style={{ cursor: 'pointer', background: 'none', border: 'none', color: 'inherit', fontFamily: 'inherit', fontSize: 'inherit', padding: 0 }}>Clear all</button>}
              />
              <div style={{ marginTop: 12 }}>
                <AnimatePresence initial={false}>
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
                </AnimatePresence>
              </div>
            </div>
          )}

          <div style={{
            fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase',
            color: 'var(--cream-faint)', marginTop: 28, paddingTop: 18,
            borderTop: '1px solid var(--border)', textAlign: 'center',
          }}>
            Live-synced · shared list
          </div>
        </>
      )}

      {/* FAB — add to pantry */}
      <button
        onClick={() => { setEditData(null); setShowModal(true) }}
        onMouseDown={e => { e.currentTarget.style.transform = 'scale(0.90)' }}
        onMouseUp={e => { e.currentTarget.style.transform = 'scale(1)' }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)' }}
        onTouchStart={e => { e.currentTarget.style.transform = 'scale(0.90)' }}
        onTouchEnd={e => { e.currentTarget.style.transform = 'scale(1)' }}
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

function GroceryRow({ item, isMe, onToggle, onDelete, onEdit, isLast }) {
  const checked = item.is_checked

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -16 }}
      transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
      style={{
        display: 'grid', gridTemplateColumns: '26px 1fr auto auto auto',
        alignItems: 'center', gap: 10,
        padding: '12px 0',
        borderBottom: isLast ? 'none' : '1px solid var(--border)',
        overflow: 'hidden',
      }}
    >
      <button onClick={onToggle} style={{
        width: 22, height: 22,
        border: `1.5px solid ${checked ? 'var(--accent)' : 'var(--cream-faint)'}`,
        background: checked ? 'var(--accent)' : 'transparent',
        borderRadius: 6, cursor: 'pointer', padding: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'border-color 180ms ease, background 180ms ease', flexShrink: 0,
      }}>
        {checked && <CheckIcon size={12} stroke={3} />}
      </button>

      <div>
        <div style={{
          fontFamily: 'var(--font-display)', fontSize: 18, color: 'var(--cream)',
          lineHeight: 1.1, letterSpacing: '-0.01em',
          textDecoration: checked ? 'line-through' : 'none',
          opacity: checked ? 0.45 : 1, transition: 'opacity 180ms ease',
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
    </motion.div>
  )
}
