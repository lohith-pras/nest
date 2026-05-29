import { useEffect, useState, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { useModalAnimation } from '../hooks/useModalAnimation'
import { Masthead, SectionRule, Kicker, InitialsAvatar, PlusIcon, CheckIcon, XIcon } from '../components/RoomyUI'

// ─── Emoji dictionary ────────────────────────────────────────────────────────

const EMOJI_MAP = [
  { keys: ['milk','oat milk','almond milk','soy milk','cream','yogurt','kefir'], emoji: '🥛' },
  { keys: ['egg','eggs'], emoji: '🥚' },
  { keys: ['butter','margarine'], emoji: '🧈' },
  { keys: ['cheese','cheddar','mozzarella','parmesan','brie','feta'], emoji: '🧀' },
  { keys: ['bread','baguette','sourdough','toast','bun','roll','bagel','pita'], emoji: '🍞' },
  { keys: ['chicken','poultry','turkey','hen'], emoji: '🍗' },
  { keys: ['beef','steak','mince','ground beef','burger','brisket'], emoji: '🥩' },
  { keys: ['pork','bacon','ham','sausage','salami','pepperoni'], emoji: '🥓' },
  { keys: ['fish','salmon','tuna','cod','shrimp','prawn','seafood'], emoji: '🐟' },
  { keys: ['apple','apples'], emoji: '🍎' },
  { keys: ['banana','bananas'], emoji: '🍌' },
  { keys: ['orange','oranges','clementine','mandarin'], emoji: '🍊' },
  { keys: ['lemon','lime'], emoji: '🍋' },
  { keys: ['strawberry','strawberries','blueberry','blueberries','raspberry','raspberries','berry','berries'], emoji: '🍓' },
  { keys: ['grape','grapes'], emoji: '🍇' },
  { keys: ['watermelon'], emoji: '🍉' },
  { keys: ['mango'], emoji: '🥭' },
  { keys: ['avocado'], emoji: '🥑' },
  { keys: ['tomato','tomatoes','cherry tomato'], emoji: '🍅' },
  { keys: ['carrot','carrots'], emoji: '🥕' },
  { keys: ['broccoli'], emoji: '🥦' },
  { keys: ['lettuce','spinach','kale','arugula','salad','greens'], emoji: '🥬' },
  { keys: ['pepper','bell pepper','capsicum','chili','chilli'], emoji: '🫑' },
  { keys: ['onion','onions','shallot','spring onion','leek'], emoji: '🧅' },
  { keys: ['garlic'], emoji: '🧄' },
  { keys: ['potato','potatoes','sweet potato'], emoji: '🥔' },
  { keys: ['corn','maize'], emoji: '🌽' },
  { keys: ['mushroom','mushrooms'], emoji: '🍄' },
  { keys: ['cucumber'], emoji: '🥒' },
  { keys: ['rice'], emoji: '🍚' },
  { keys: ['pasta','spaghetti','noodle','noodles','penne','fusilli'], emoji: '🍝' },
  { keys: ['flour','baking'], emoji: '🌾' },
  { keys: ['sugar','honey','syrup','jam'], emoji: '🍯' },
  { keys: ['oil','olive oil','coconut oil','vegetable oil'], emoji: '🫙' },
  { keys: ['coffee','espresso','latte','cappuccino'], emoji: '☕' },
  { keys: ['tea','green tea','herbal'], emoji: '🍵' },
  { keys: ['juice','orange juice','apple juice'], emoji: '🧃' },
  { keys: ['water','sparkling water','soda water'], emoji: '💧' },
  { keys: ['beer','ale','lager'], emoji: '🍺' },
  { keys: ['wine','rosé','champagne','prosecco'], emoji: '🍷' },
  { keys: ['chocolate','cocoa','nutella'], emoji: '🍫' },
  { keys: ['ice cream','gelato','sorbet'], emoji: '🍦' },
  { keys: ['cookie','biscuit','crackers'], emoji: '🍪' },
  { keys: ['chips','crisps','popcorn'], emoji: '🍿' },
  { keys: ['nuts','almonds','cashews','peanuts','walnuts'], emoji: '🥜' },
  { keys: ['soap','detergent','washing','laundry'], emoji: '🧼' },
  { keys: ['toilet paper','tissue','paper towel'], emoji: '🧻' },
  { keys: ['toothpaste','toothbrush'], emoji: '🪥' },
  { keys: ['shampoo','conditioner','body wash'], emoji: '🧴' },
]

function getGroceryEmoji(name = '') {
  const lower = name.toLowerCase()
  for (const { keys, emoji } of EMOJI_MAP) {
    if (keys.some(k => lower.includes(k))) return emoji
  }
  return '🛒'
}

// ─── Modals ──────────────────────────────────────────────────────────────────

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
    fontSize: 'var(--text-xl)', color: 'var(--cream)', outline: 'none',
    letterSpacing: '-0.01em', width: '100%',
  }

  return (
    <div className="modal-overlay" onClick={handleClose} ref={overlayRef}>
      <div className="modal" onClick={e => e.stopPropagation()} ref={panelRef}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', letterSpacing: '-0.02em', color: 'var(--cream)', marginBottom: 24 }}>
          {initialData ? 'Edit item.' : 'Add to pantry.'}
        </div>
        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-overline)', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--cream-faint)', marginBottom: 6 }}>Item</div>
            <input ref={itemRef} style={fieldStyle} value={item} onChange={e => setItem(e.target.value)} placeholder="e.g. Oat milk" required />
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-overline)', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--cream-faint)', marginBottom: 6 }}>Quantity (optional)</div>
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

function AddInventoryModal({ onClose, onSave, loading }) {
  const overlayRef = useRef(null)
  const panelRef = useRef(null)
  const { handleClose } = useModalAnimation(overlayRef, panelRef, onClose)
  const [item, setItem] = useState('')
  const [count, setCount] = useState(1)

  function submit(e) {
    e.preventDefault()
    if (!item.trim()) return
    onSave({ item_name: item.trim(), stock_count: count }, handleClose)
  }

  const fieldStyle = {
    background: 'transparent', border: 'none',
    borderBottom: '1px solid var(--input-border)',
    padding: '10px 0', fontFamily: 'var(--font-display)',
    fontSize: 'var(--text-xl)', color: 'var(--cream)', outline: 'none',
    letterSpacing: '-0.01em', width: '100%',
  }

  return (
    <div className="modal-overlay" onClick={handleClose} ref={overlayRef}>
      <div className="modal" onClick={e => e.stopPropagation()} ref={panelRef}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', letterSpacing: '-0.02em', color: 'var(--cream)', marginBottom: 24 }}>
          Add to inventory.
        </div>
        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-overline)', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--cream-faint)', marginBottom: 6 }}>Item</div>
            <input style={fieldStyle} value={item} onChange={e => setItem(e.target.value)} placeholder="e.g. Oat milk" autoFocus required />
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-overline)', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--cream-faint)', marginBottom: 10 }}>Quantity in stock</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <button type="button" onClick={() => setCount(c => Math.max(1, c - 1))}
                style={{ width: 36, height: 36, borderRadius: 999, border: '1px solid var(--border-rule)', background: 'transparent', color: 'var(--cream)', fontSize: 'var(--text-xl)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', color: 'var(--cream)', minWidth: 32, textAlign: 'center' }}>{count}</span>
              <button type="button" onClick={() => setCount(c => c + 1)}
                style={{ width: 36, height: 36, borderRadius: 999, border: '1px solid var(--border-rule)', background: 'transparent', color: 'var(--cream)', fontSize: 'var(--text-xl)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
            <button type="button" className="btn-ghost" onClick={handleClose} style={{ flex: 1 }}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={loading || !item.trim()} style={{ flex: 1, justifyContent: 'center' }}>
              {loading ? '…' : 'Add'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function Groceries() {
  const { session, profile } = useAuth()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [showInventoryModal, setShowInventoryModal] = useState(false)
  const [editData, setEditData] = useState(null)
  const [activeSection, setActiveSection] = useState('shopping')
  const [restocking, setRestocking] = useState({}) // { [id]: qty }

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
        is_inventory: false,
        added_by: session.user.id,
        unit_id: profile?.unit_id || null,
      })
    }
    setAdding(false)
    handleClose()
    load()
  }

  async function saveInventoryItem({ item_name, stock_count }, handleClose) {
    setAdding(true)
    await supabase.from('groceries').insert({
      item_name,
      quantity: null,
      is_checked: false,
      is_inventory: true,
      stock_count: stock_count || 1,
      added_by: session.user.id,
      unit_id: profile?.unit_id || null,
    })
    setAdding(false)
    handleClose()
    load()
  }

  async function adjustStock(id, currentCount, delta) {
    const newCount = Math.max(0, currentCount + delta)
    setItems(prev => prev.map(i => i.id === id ? { ...i, stock_count: newCount } : i))
    await supabase.from('groceries').update({
      stock_count: newCount,
      updated_at: new Date().toISOString(),
    }).eq('id', id)
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
    const ids = shoppingItems.filter(i => i.is_checked).map(i => i.id)
    if (ids.length === 0) return
    await supabase.from('groceries').delete().in('id', ids)
    setItems(prev => prev.filter(i => !i.is_checked || i.is_inventory))
  }

  async function restockFromCart(item, qty) {
    const { data: existing } = await supabase
      .from('groceries')
      .select('id, stock_count')
      .eq('item_name', item.item_name)
      .eq('unit_id', profile?.unit_id || null)
      .eq('is_inventory', true)
      .maybeSingle()

    if (existing) {
      await supabase.from('groceries').update({
        stock_count: (existing.stock_count || 0) + qty,
        updated_at: new Date().toISOString(),
      }).eq('id', existing.id)
    } else {
      await supabase.from('groceries').insert({
        item_name: item.item_name,
        quantity: null,
        is_checked: false,
        is_inventory: true,
        stock_count: qty,
        added_by: session.user.id,
        unit_id: profile?.unit_id || null,
      })
    }
    setRestocking(prev => { const n = { ...prev }; delete n[item.id]; return n })
    load()
  }

  function handleEdit(item) {
    setEditData(item)
    setShowModal(true)
  }

  // Derived lists
  const shoppingItems = items.filter(i => !i.is_inventory)
  const inventoryItems = items.filter(i => i.is_inventory)

  // GROC-05: inventory items with stock_count <= 1 surface in shopping list
  const lowStockItems = inventoryItems.filter(i => (i.stock_count ?? 1) <= 1 && !i.is_checked)

  const unchecked = shoppingItems.filter(i => !i.is_checked)
  const checked = shoppingItems.filter(i => i.is_checked)

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
      {showInventoryModal && (
        <AddInventoryModal
          onClose={() => setShowInventoryModal(false)}
          onSave={saveInventoryItem}
          loading={adding}
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

      {/* Section tabs */}
      <div style={{ display: 'flex', gap: 8, marginTop: 22 }}>
        {[
          { id: 'shopping', label: 'Shopping List' },
          { id: 'inventory', label: 'Inventory' },
        ].map(s => (
          <button key={s.id} onClick={() => setActiveSection(s.id)} style={{
            padding: '8px 16px', borderRadius: 999,
            fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', fontWeight: 600,
            cursor: 'pointer', letterSpacing: '-0.01em',
            border: activeSection === s.id ? 'none' : '1px solid var(--border-rule)',
            background: activeSection === s.id ? 'var(--cream)' : 'transparent',
            color: activeSection === s.id ? 'var(--primary-fg)' : 'var(--cream)',
          }}>
            {s.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
          <div className="animate-spin" style={{ width: 28, height: 28, border: '1.5px solid var(--border-rule)', borderTopColor: 'var(--cream)', borderRadius: '50%' }} />
        </div>
      ) : activeSection === 'shopping' ? (
        <>
          {/* To grab */}
          <div style={{ marginTop: 24 }}>
            <SectionRule label="01 — To grab" right={`${unchecked.length + lowStockItems.length} items`} />
            <div style={{ marginTop: 12 }}>
              <AnimatePresence initial={false}>
                {unchecked.map((item, i) => (
                  <GroceryRow
                    key={item.id} item={item}
                    isMe={item.added_by === session?.user?.id}
                    onToggle={() => toggleItem(item.id, item.is_checked)}
                    onDelete={() => deleteItem(item.id)}
                    onEdit={() => handleEdit(item)}
                    isLast={i === unchecked.length - 1 && lowStockItems.length === 0}
                  />
                ))}
              </AnimatePresence>

              {/* GROC-05: low-stock inventory items appear here */}
              {lowStockItems.map((item, i) => (
                <GroceryRow
                  key={`ls-${item.id}`}
                  item={item}
                  isMe={item.added_by === session?.user?.id}
                  onToggle={() => {}}
                  onDelete={() => {}}
                  onEdit={() => {}}
                  isLast={i === lowStockItems.length - 1}
                  isLowStock={true}
                />
              ))}

              {unchecked.length === 0 && lowStockItems.length === 0 && (
                <div style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 'var(--text-lg)', color: 'var(--cream-faint)', padding: '24px 0', textAlign: 'center' }}>
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
                    <>
                      <GroceryRow
                        key={item.id} item={item}
                        isMe={item.added_by === session?.user?.id}
                        onToggle={() => toggleItem(item.id, item.is_checked)}
                        onDelete={() => deleteItem(item.id)}
                        onEdit={() => handleEdit(item)}
                        isLast={false}
                      />
                      {/* GROC-06: restock affordance on checked items */}
                      {restocking[item.id] !== undefined ? (
                        <div key={`rs-${item.id}`} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0 10px', paddingLeft: 36, borderBottom: i < checked.length - 1 ? '1px solid var(--border)' : 'none' }}>
                          <button onClick={() => setRestocking(p => ({ ...p, [item.id]: Math.max(1, (p[item.id] || 1) - 1) }))}
                            style={{ width: 26, height: 26, borderRadius: 999, border: '1px solid var(--border-rule)', background: 'transparent', color: 'var(--cream)', fontSize: 'var(--text-base)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
                          <span style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-lg)', color: 'var(--cream)', minWidth: 20, textAlign: 'center' }}>{restocking[item.id] || 1}</span>
                          <button onClick={() => setRestocking(p => ({ ...p, [item.id]: (p[item.id] || 1) + 1 }))}
                            style={{ width: 26, height: 26, borderRadius: 999, border: '1px solid var(--border-rule)', background: 'transparent', color: 'var(--cream)', fontSize: 'var(--text-base)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
                          <button onClick={() => restockFromCart(item, restocking[item.id] || 1)} className="btn-primary"
                            style={{ padding: '5px 14px', fontSize: 'var(--text-xs)' }}>Restock</button>
                          <button onClick={() => setRestocking(p => { const n = { ...p }; delete n[item.id]; return n })}
                            style={{ background: 'none', border: 'none', color: 'var(--cream-faint)', cursor: 'pointer', fontSize: 'var(--text-xs)', fontFamily: 'var(--font-body)' }}>✕</button>
                        </div>
                      ) : (
                        <div key={`rsbtn-${item.id}`} style={{ paddingLeft: 36, paddingBottom: 8, borderBottom: i < checked.length - 1 ? '1px solid var(--border)' : 'none', marginTop: -4 }}>
                          <button onClick={() => setRestocking(p => ({ ...p, [item.id]: 1 }))}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: 'var(--text-overline)', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--cream-faint)', padding: 0 }}>
                            Restock →
                          </button>
                        </div>
                      )}
                    </>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          )}

          <div style={{
            fontFamily: 'var(--font-mono)', fontSize: 'var(--text-overline)', letterSpacing: '0.2em', textTransform: 'uppercase',
            color: 'var(--cream-faint)', marginTop: 28, paddingTop: 18,
            borderTop: '1px solid var(--border)', textAlign: 'center',
          }}>
            Live-synced · shared list
          </div>
        </>
      ) : (
        /* Inventory section */
        <div style={{ marginTop: 24 }}>
          <SectionRule label="01 — Pantry stock" right={`${inventoryItems.length} items`} />
          <div style={{ marginTop: 12 }}>
            {inventoryItems.map((item, i) => (
              <InventoryRow
                key={item.id}
                item={item}
                isLast={i === inventoryItems.length - 1}
                onIncrement={() => adjustStock(item.id, item.stock_count ?? 1, 1)}
                onDecrement={() => adjustStock(item.id, item.stock_count ?? 1, -1)}
                onDelete={() => deleteItem(item.id)}
              />
            ))}
            {inventoryItems.length === 0 && (
              <div style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 'var(--text-lg)', color: 'var(--cream-faint)', padding: '24px 0', textAlign: 'center' }}>
                No inventory yet. Add pantry stock.
              </div>
            )}
          </div>
        </div>
      )}

      {/* FAB */}
      <button
        onClick={() => {
          if (activeSection === 'inventory') {
            setShowInventoryModal(true)
          } else {
            setEditData(null)
            setShowModal(true)
          }
        }}
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

// ─── Row components ───────────────────────────────────────────────────────────

function GroceryRow({ item, isMe, onToggle, onDelete, onEdit, isLast, isLowStock }) {
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
        opacity: isLowStock ? 0.7 : 1,
      }}
    >
      <button onClick={isLowStock ? undefined : onToggle} style={{
        width: 22, height: 22,
        border: `1.5px solid ${checked ? 'var(--accent)' : 'var(--cream-faint)'}`,
        background: checked ? 'var(--accent)' : 'transparent',
        borderRadius: 6, cursor: isLowStock ? 'default' : 'pointer', padding: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'border-color 180ms ease, background 180ms ease', flexShrink: 0,
      }}>
        {checked && <CheckIcon size={12} stroke={3} />}
      </button>

      <div>
        <div style={{
          fontFamily: 'var(--font-display)', fontSize: 'var(--text-lg)', color: 'var(--cream)',
          lineHeight: 1.1, letterSpacing: '-0.01em',
          textDecoration: checked ? 'line-through' : 'none',
          opacity: checked ? 0.45 : 1, transition: 'opacity 180ms ease',
        }}>
          <span style={{ marginRight: 6, fontSize: 'var(--text-base)' }}>{getGroceryEmoji(item.item_name)}</span>
          {item.item_name}
        </div>
        {item.quantity && (
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-overline)', color: 'var(--cream-faint)', marginTop: 2, letterSpacing: '0.1em' }}>
            ×{item.quantity}
          </div>
        )}
        {isLowStock && (
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-overline)', letterSpacing: '0.14em', color: 'var(--accent-soft)' }}>· reorder</span>
        )}
      </div>

      <div style={{ width: 20, height: 20, borderRadius: 999, background: isMe ? '#3B3B3B' : 'var(--accent)', flexShrink: 0, opacity: isLowStock ? 0 : 1 }} />

      <button onClick={isLowStock ? undefined : onEdit} style={{ color: 'var(--cream-faint)', background: 'none', border: 'none', cursor: isLowStock ? 'default' : 'pointer', padding: 2, flexShrink: 0, opacity: isLowStock ? 0 : 0.7 }}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 4l6 6L9 21H3v-6L14 4z"/></svg>
      </button>

      <button onClick={isLowStock ? undefined : onDelete} style={{ color: 'var(--cream-faint)', background: 'none', border: 'none', cursor: isLowStock ? 'default' : 'pointer', padding: 2, flexShrink: 0, opacity: isLowStock ? 0 : 0.6 }}>
        <XIcon size={14} />
      </button>
    </motion.div>
  )
}

function InventoryRow({ item, isLast, onIncrement, onDecrement, onDelete }) {
  const count = item.stock_count ?? 1
  const isLow = count <= 1

  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '1fr auto auto auto',
      alignItems: 'center', gap: 10,
      padding: '12px 0',
      borderBottom: isLast ? 'none' : '1px solid var(--border)',
    }}>
      <div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-lg)', color: 'var(--cream)', lineHeight: 1.1, letterSpacing: '-0.01em' }}>
          <span style={{ marginRight: 6, fontSize: 'var(--text-base)' }}>{getGroceryEmoji(item.item_name)}</span>
          {item.item_name}
        </div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-overline)', color: isLow ? 'var(--accent-soft)' : 'var(--cream-faint)', marginTop: 2, letterSpacing: '0.1em' }}>
          {isLow ? 'Low stock — ' : ''}{count} in stock
        </div>
      </div>
      <button onClick={onDecrement} disabled={count <= 0}
        style={{ width: 30, height: 30, borderRadius: 999, border: '1px solid var(--border-rule)', background: 'transparent', color: 'var(--cream)', fontSize: 'var(--text-lg)', cursor: count <= 0 ? 'not-allowed' : 'pointer', opacity: count <= 0 ? 0.3 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
      <button onClick={onIncrement}
        style={{ width: 30, height: 30, borderRadius: 999, border: '1px solid var(--border-rule)', background: 'transparent', color: 'var(--cream)', fontSize: 'var(--text-lg)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
      <button onClick={onDelete}
        style={{ color: 'var(--cream-faint)', background: 'none', border: 'none', cursor: 'pointer', padding: 2, opacity: 0.6 }}>
        <XIcon size={14} />
      </button>
    </div>
  )
}
