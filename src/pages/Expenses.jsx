import { useEffect, useState, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { useModalAnimation } from '../hooks/useModalAnimation'
import { SectionRule, Kicker, InitialsAvatar, PlusIcon, ArrowRight } from '../components/RoomyUI'
import { SuccessOverlay } from '../components/SuccessOverlay'
import PillNav from '../components/PillNav'

// ─── Expense category detector ────────────────────────────────────────────────

const CATEGORY_PATTERNS = [
  { pattern: /grocer|food|market|supermarket|walmart|aldi|lidl|trader|whole food|costco/i, label: 'Groceries', emoji: '🛒' },
  { pattern: /restaurant|café|cafe|bar|pub|pizza|sushi|burger|kebab|takeaway|takeout|delivery|uber eat|doordash|just eat/i, label: 'Dining', emoji: '🍽️' },
  { pattern: /netflix|spotify|disney|apple tv|hbo|prime|hulu|youtube|streaming|subscription/i, label: 'Subscriptions', emoji: '📺' },
  { pattern: /electric|gas|water|internet|wifi|broadband|utility|utilities|bill|energy/i, label: 'Utilities', emoji: '⚡' },
  { pattern: /rent|mortgage|lease/i, label: 'Rent', emoji: '🏠' },
  { pattern: /uber|lyft|taxi|bus|train|metro|transit|transport|fuel|petrol|gas station|parking/i, label: 'Transport', emoji: '🚗' },
  { pattern: /gym|fitness|sport|yoga|pilates|health/i, label: 'Health', emoji: '💪' },
  { pattern: /amazon|shop|store|ikea|h&m|zara|clothing|clothes|shoes|fashion/i, label: 'Shopping', emoji: '🛍️' },
  { pattern: /cinema|movie|ticket|concert|event|theatre|entertainment/i, label: 'Entertainment', emoji: '🎭' },
  { pattern: /holiday|hotel|flight|airbnb|vacation|travel/i, label: 'Travel', emoji: '✈️' },
  { pattern: /cleaning|laundry|household|home/i, label: 'Household', emoji: '🧹' },
]

function getExpenseCategory(description) {
  for (const { pattern, label, emoji } of CATEGORY_PATTERNS) {
    if (pattern.test(description)) return { label, emoji }
  }
  return { label: 'Other', emoji: '📦' }
}

// ─── Add / Edit Modal ─────────────────────────────────────────────────────────

function Modal({ onClose, onSave, loading, initialData = null }) {
  const overlayRef = useRef(null)
  const panelRef = useRef(null)
  const { handleClose } = useModalAnimation(overlayRef, panelRef, onClose)

  const [desc, setDesc] = useState(initialData?.description || '')
  const [amount, setAmount] = useState(initialData?.amount || '')
  const [splitType, setSplitType] = useState(initialData?.split_amount != null ? 'custom' : '5050')
  const [splitAmount, setSplitAmount] = useState(initialData?.split_amount || '')
  const [receiptUrl, setReceiptUrl] = useState(initialData?.receipt_url || '')
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef(null)
  const { session } = useAuth()

  async function handleFileUpload(e) {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)
    const fileExt = file.name.split('.').pop()
    const fileName = `${Math.random()}.${fileExt}`
    const filePath = `${session.user.id}/${fileName}`
    try {
      const { error: uploadError } = await supabase.storage.from('receipts').upload(filePath, file)
      if (uploadError) throw uploadError
      const { data: { publicUrl } } = supabase.storage.from('receipts').getPublicUrl(filePath)
      setReceiptUrl(publicUrl)
    } catch (err) {
      console.error('Error uploading receipt:', err)
      alert('Failed to upload receipt.')
    } finally {
      setUploading(false)
    }
  }

  function submit(e) {
    e.preventDefault()
    if (!desc || !amount) return
    const payload = {
      description: desc, amount: parseFloat(amount),
      paid_by: initialData ? initialData.paid_by : session.user.id,
      status: initialData ? initialData.status : 'pending',
      split_amount: splitType === 'custom' && splitAmount ? parseFloat(splitAmount) : null,
      receipt_url: receiptUrl || null,
    }
    onSave(payload, initialData?.id, handleClose)
  }

  const fieldStyle = {
    background: 'transparent', border: 'none',
    borderBottom: '1px solid var(--border-rule)',
    padding: '10px 0', fontFamily: 'var(--font-display)',
    fontSize: 'var(--text-xl)', color: 'var(--cream)', outline: 'none',
    letterSpacing: '-0.01em', width: '100%',
    transition: 'border-color 200ms',
  }
  const labelStyle = {
    fontFamily: 'var(--font-mono)', fontSize: 'var(--text-overline)', letterSpacing: '0.22em',
    textTransform: 'uppercase', color: 'var(--cream-faint)', display: 'block', marginBottom: 6,
  }

  return (
    <div className="modal-overlay" onClick={handleClose} ref={overlayRef}>
      <div className="modal" onClick={e => e.stopPropagation()} ref={panelRef}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', letterSpacing: '-0.02em', color: 'var(--cream)', marginBottom: 24 }}>
          {initialData ? 'Edit expense.' : 'New expense.'}
        </div>
        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div>
            <label style={labelStyle}>Description</label>
            <input style={fieldStyle} value={desc} onChange={e => setDesc(e.target.value)} placeholder="e.g. Electricity bill" required />
          </div>
          <div>
            <label style={labelStyle}>Total Amount (€)</label>
            <input style={fieldStyle} type="number" min="0.01" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" required />
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {['5050', 'custom'].map(s => (
              <button key={s} type="button" onClick={() => setSplitType(s)} style={{
                flex: 1, padding: '8px', borderRadius: 999, fontSize: 'var(--text-xs)',
                fontFamily: 'var(--font-body)', fontWeight: 600, cursor: 'pointer',
                background: splitType === s ? 'var(--cream)' : 'transparent',
                color: splitType === s ? 'var(--primary-fg)' : 'var(--cream-faint)',
                border: splitType === s ? 'none' : '1px solid var(--border-rule)',
              }}>
                {s === '5050' ? '50 / 50 Split' : 'Custom Split'}
              </button>
            ))}
          </div>
          {splitType === 'custom' && (
            <div>
              <label style={labelStyle}>Amount owed to payer (€)</label>
              <input style={fieldStyle} type="number" min="0" step="0.01" value={splitAmount} onChange={e => setSplitAmount(e.target.value)} placeholder="0.00" required />
            </div>
          )}
          <div>
            <label style={labelStyle}>Receipt (optional)</label>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              {receiptUrl && <a href={receiptUrl} target="_blank" rel="noreferrer" style={{ fontSize: 'var(--text-xs)', color: 'var(--accent-soft)', textDecoration: 'underline' }}>View receipt</a>}
              <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileUpload} style={{ display: 'none' }} />
              <button type="button" onClick={() => fileInputRef.current.click()} disabled={uploading} className="btn-ghost" style={{ padding: '6px 14px', fontSize: 'var(--text-xs)' }}>
                {uploading ? 'Uploading…' : receiptUrl ? 'Replace' : 'Upload'}
              </button>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
            <button type="button" className="btn-ghost" onClick={handleClose} style={{ flex: 1 }}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={loading || uploading} style={{ flex: 1, justifyContent: 'center' }}>
              {loading ? '…' : 'Save expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function Expenses() {
  const { session, profile } = useAuth()
  const [expenses, setExpenses] = useState([])
  const [profiles, setProfiles] = useState({})
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editData, setEditData] = useState(null)
  const [saving, setSaving] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  useEffect(() => { load() }, [])

  async function load() {
    try {
      setLoading(true)
      const [expRes, profRes] = await Promise.all([
        supabase.from('expenses').select('*').order('created_at', { ascending: false }),
        supabase.from('profiles').select('id, full_name'),
      ])
      if (expRes.error) throw expRes.error
      if (profRes.error) throw profRes.error
      setExpenses(expRes.data || [])
      const map = {}
      ;(profRes.data || []).forEach(p => { map[p.id] = p.full_name })
      setProfiles(map)
    } catch (err) {
      console.error('Error loading expenses:', err)
    } finally {
      setLoading(false)
    }
  }

  async function saveExpense(data, id, handleClose) {
    try {
      setSaving(true)
      if (id) {
        const { error } = await supabase.from('expenses').update(data).eq('id', id)
        if (error) throw error
        handleClose()
      } else {
        const { error } = await supabase.from('expenses').insert({ ...data, unit_id: profile?.unit_id || null })
        if (error) throw error
        handleClose()
        setShowSuccess(true)
      }
      load()
    } catch (err) {
      console.error('Error saving expense:', err)
      alert(`Failed to save: ${err.message}`)
    } finally {
      setSaving(false)
    }
  }

  async function markPaid(id) {
    await supabase.from('expenses').update({ status: 'paid' }).eq('id', id)
    setExpenses(prev => prev.map(e => e.id === id ? { ...e, status: 'paid' } : e))
  }

  async function deleteExpense(id) {
    await supabase.from('expenses').delete().eq('id', id)
    setExpenses(prev => prev.filter(e => e.id !== id))
  }

  const myId = session?.user?.id
  const pending = expenses.filter(e => e.status === 'pending')
  const paid = expenses.filter(e => e.status === 'paid')
  const owedToMe = pending.filter(e => e.paid_by === myId).reduce((s, e) => s + (e.split_amount != null ? e.split_amount : e.amount / 2), 0)
  const iOwe = pending.filter(e => e.paid_by !== myId).reduce((s, e) => s + (e.split_amount != null ? e.split_amount : e.amount / 2), 0)
  const net = owedToMe - iOwe

  const wholeStr = Math.floor(Math.abs(net)).toString()
  const centsStr = (Math.abs(net) % 1).toFixed(2).slice(1)

  // ── EXPN-01: Per-user spending totals ─────────────────────────────────────
  const now = new Date()
  const thisMonth = now.getMonth()
  const thisYear = now.getFullYear()

  const monthlyExpenses = expenses.filter(e => {
    const d = new Date(e.created_at)
    return d.getMonth() === thisMonth && d.getFullYear() === thisYear
  })

  // Per-user totals: amount paid by each user
  const spendingByUser = {}
  const monthlySpendingByUser = {}
  expenses.forEach(e => {
    spendingByUser[e.paid_by] = (spendingByUser[e.paid_by] || 0) + e.amount
  })
  monthlyExpenses.forEach(e => {
    monthlySpendingByUser[e.paid_by] = (monthlySpendingByUser[e.paid_by] || 0) + e.amount
  })

  // ── EXPN-02: Category breakdown ───────────────────────────────────────────
  const categoryTotals = {}
  expenses.forEach(e => {
    const { label, emoji } = getExpenseCategory(e.description)
    if (!categoryTotals[label]) categoryTotals[label] = { label, emoji, total: 0, count: 0 }
    categoryTotals[label].total += e.amount
    categoryTotals[label].count += 1
  })
  const categoryList = Object.values(categoryTotals).sort((a, b) => b.total - a.total)
  const totalSpend = expenses.reduce((s, e) => s + e.amount, 0)

  // ── EXPN-03: Monthly summary card ────────────────────────────────────────
  // Show if we have data from the just-closed previous month and we're in
  // the first 7 days of the new month
  const prevMonth = thisMonth === 0 ? 11 : thisMonth - 1
  const prevYear = thisMonth === 0 ? thisYear - 1 : thisYear
  const prevMonthName = new Date(prevYear, prevMonth, 1).toLocaleString('default', { month: 'long' })

  const prevMonthExpenses = expenses.filter(e => {
    const d = new Date(e.created_at)
    return d.getMonth() === prevMonth && d.getFullYear() === prevYear
  })
  const showMonthlySummary = now.getDate() <= 7 && prevMonthExpenses.length > 0

  const prevMonthTotal = prevMonthExpenses.reduce((s, e) => s + e.amount, 0)
  const prevMonthByUser = {}
  prevMonthExpenses.forEach(e => {
    prevMonthByUser[e.paid_by] = (prevMonthByUser[e.paid_by] || 0) + e.amount
  })
  const prevMonthCats = {}
  prevMonthExpenses.forEach(e => {
    const { label, emoji } = getExpenseCategory(e.description)
    prevMonthCats[label] = (prevMonthCats[label] || 0) + e.amount
  })
  const topPrevCat = Object.entries(prevMonthCats).sort((a, b) => b[1] - a[1])[0]

  // Group activity by date
  const groups = {}
  const dayOrder = []
  expenses.forEach(e => {
    const d = new Date(e.created_at)
    const today = new Date()
    const isToday = d.toDateString() === today.toDateString()
    const dayKey = isToday
      ? 'Today'
      : d.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' })
    if (!groups[dayKey]) { groups[dayKey] = []; dayOrder.push(dayKey) }
    groups[dayKey].push(e)
  })

  const uniqueSpenders = Object.keys(spendingByUser)

  return (
    <div style={{ paddingTop: 16 }}>
      <SuccessOverlay show={showSuccess} onComplete={() => setShowSuccess(false)} />
      {showModal && <Modal onClose={() => setShowModal(false)} onSave={saveExpense} loading={saving} initialData={editData} />}


      <div style={{ marginTop: 18 }}>
        <Kicker>The ledger</Kicker>
        <h1 style={{
          fontFamily: 'var(--font-display)', fontSize: 'clamp(34px, 10vw, 44px)',
          lineHeight: 0.95, margin: '8px 0 0', letterSpacing: '-0.025em', color: 'var(--cream)',
        }}>
          {net >= 0 ? "You're " : "You owe "}
          <span style={{ fontStyle: 'italic', color: 'var(--accent-soft)' }}>
            {net >= 0 ? 'up' : ''} €{wholeStr}{centsStr}
          </span>
          {net >= 0 ? ' ahead.' : '.'}
        </h1>
      </div>

      <PillNav />

      {/* Stat row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6, marginTop: 22, borderTop: '1px solid var(--border-rule)', paddingTop: 14 }}>
        <StatCell kicker="Owed to you" amount={`€${owedToMe.toFixed(2)}`} />
        <StatCell kicker="You owe" amount={`€${iOwe.toFixed(2)}`} />
        <StatCell kicker="Pending" amount={String(pending.length)} />
      </div>

      {/* FAB */}
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

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
          <div className="animate-spin" style={{ width: 28, height: 28, border: '1.5px solid var(--border-rule)', borderTopColor: 'var(--cream)', borderRadius: '50%' }} />
        </div>
      ) : (
        <div style={{ marginTop: 26 }}>

          {/* EXPN-03: Monthly summary card */}
          {showMonthlySummary && (
            <div style={{ marginBottom: 28 }}>
              <SectionRule label={`00 — ${prevMonthName} recap`} />
              <div style={{
                marginTop: 12, padding: '16px', borderRadius: 12,
                background: 'var(--surface-raised)', border: '1px solid var(--border)',
              }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-overline)', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--accent-soft)', marginBottom: 8 }}>
                  {prevMonthName} {prevYear} · Month wrapped
                </div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', color: 'var(--cream)', letterSpacing: '-0.025em', lineHeight: 1 }}>
                  €{prevMonthTotal.toFixed(2)}
                </div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--cream-faint)', marginTop: 4 }}>
                  Total unit spend
                </div>
                <div style={{ display: 'flex', gap: 16, marginTop: 14, flexWrap: 'wrap' }}>
                  {Object.entries(prevMonthByUser).map(([uid, amt]) => (
                    <div key={uid}>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-overline)', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--cream-faint)' }}>
                        {profiles[uid]?.split(' ')[0] || 'User'}
                      </div>
                      <div style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)', color: 'var(--cream)', letterSpacing: '-0.02em', marginTop: 2 }}>
                        €{amt.toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
                {topPrevCat && (
                  <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 'var(--text-lg)' }}>{getExpenseCategory(topPrevCat[0]).emoji}</span>
                    <div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-overline)', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--cream-faint)' }}>Top category</div>
                      <div style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-sm)', color: 'var(--cream)', marginTop: 1 }}>{topPrevCat[0]} · €{topPrevCat[1].toFixed(2)}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* EXPN-01: Per-user spending totals */}
          {expenses.length > 0 && uniqueSpenders.length > 0 && (
            <div style={{ marginBottom: 28 }}>
              <SectionRule label="00 — Spending" />
              <div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: `repeat(${Math.min(uniqueSpenders.length, 2)}, 1fr)`, gap: 8 }}>
                {uniqueSpenders.map(uid => {
                  const name = profiles[uid]?.split(' ')[0] || 'User'
                  const initials = (profiles[uid] || 'U').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
                  const isMe = uid === myId
                  const monthlyAmt = monthlySpendingByUser[uid] || 0
                  const lifetimeAmt = spendingByUser[uid] || 0
                  return (
                    <div key={uid} style={{
                      padding: '12px', borderRadius: 10,
                      background: 'var(--surface-raised)', border: '1px solid var(--border)',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                        <div style={{
                          width: 26, height: 26, borderRadius: 999,
                          background: isMe ? '#3B3B3B' : 'var(--accent)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontFamily: 'var(--font-body)', fontSize: 'var(--text-overline)', fontWeight: 700, color: 'var(--cream)',
                        }}>{initials}</div>
                        <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--cream)', fontWeight: 600 }}>
                          {isMe ? 'You' : name}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-overline)', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--cream-faint)' }}>This month</div>
                        <div style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)', color: 'var(--cream)', letterSpacing: '-0.02em', lineHeight: 1.1, marginTop: 2 }}>€{monthlyAmt.toFixed(2)}</div>
                      </div>
                      <div style={{ marginTop: 8 }}>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-overline)', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--cream-faint)' }}>All time</div>
                        <div style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-base)', color: 'var(--cream-faint)', letterSpacing: '-0.02em', lineHeight: 1.1, marginTop: 2 }}>€{lifetimeAmt.toFixed(2)}</div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* EXPN-02: Category breakdown */}
          {categoryList.length > 0 && (
            <div style={{ marginBottom: 28 }}>
              <SectionRule label="00 — By category" />
              <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 0 }}>
                {categoryList.map((cat, i) => {
                  const pct = totalSpend > 0 ? (cat.total / totalSpend) * 100 : 0
                  return (
                    <div key={cat.label} style={{
                      display: 'grid', gridTemplateColumns: '24px 1fr auto',
                      alignItems: 'center', gap: 10,
                      padding: '10px 0',
                      borderBottom: i === categoryList.length - 1 ? 'none' : '1px solid var(--border)',
                    }}>
                      <span style={{ fontSize: 'var(--text-base)' }}>{cat.emoji}</span>
                      <div>
                        <div style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-base)', color: 'var(--cream)', lineHeight: 1.2 }}>{cat.label}</div>
                        <div style={{ marginTop: 4, height: 3, borderRadius: 999, background: 'var(--border)', overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${pct}%`, background: 'var(--accent-soft)', borderRadius: 999 }} />
                        </div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-overline)', color: 'var(--cream-faint)', letterSpacing: '0.12em', marginTop: 3 }}>
                          {cat.count} expense{cat.count !== 1 ? 's' : ''} · {pct.toFixed(0)}%
                        </div>
                      </div>
                      <div style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-base)', color: 'var(--cream)', letterSpacing: '-0.02em', textAlign: 'right' }}>
                        €{cat.total.toFixed(2)}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Activity feed */}
          <SectionRule label="01 — Activity" right="Filter" />

          {dayOrder.map(day => (
            <div key={day} style={{ marginTop: 16 }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-overline)', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--cream-faint)', marginBottom: 8 }}>
                {day}
              </div>
              <AnimatePresence initial={false}>
                {groups[day].map((e, i) => (
                  <ExpenseRow
                    key={e.id} exp={e} profiles={profiles} myId={myId}
                    onMarkPaid={markPaid} onDelete={deleteExpense}
                    onEdit={() => { setEditData(e); setShowModal(true) }}
                    isLast={i === groups[day].length - 1}
                  />
                ))}
              </AnimatePresence>
            </div>
          ))}

          {expenses.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--cream-faint)' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 'var(--text-xl)', marginBottom: 12 }}>No expenses yet.</div>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)' }}>Add your first shared expense above.</p>
            </div>
          )}

          {paid.length > 0 && dayOrder.filter(d => groups[d].every(e => e.status === 'paid')).length > 0 && (
            <div style={{
              fontFamily: 'var(--font-display)', fontStyle: 'italic',
              fontSize: 'var(--text-base)', color: 'var(--cream-faint)', textAlign: 'center', lineHeight: 1.3,
              padding: '18px 24px 8px', borderTop: '1px solid var(--border)', marginTop: 24,
            }}>
              &ldquo;Money rules ruin friendships. Clear receipts save them.&rdquo;
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCell({ kicker, amount }) {
  return (
    <div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-overline)', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--cream-faint)' }}>{kicker}</div>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', color: 'var(--cream)', lineHeight: 1, marginTop: 4, letterSpacing: '-0.02em' }}>{amount}</div>
    </div>
  )
}

function ExpenseRow({ exp, profiles, myId, onMarkPaid, onDelete, onEdit, isLast }) {
  const paidByMe = exp.paid_by === myId
  const payer = profiles[exp.paid_by] || 'Someone'
  const payerInitials = payer.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
  const each = exp.split_amount != null ? exp.split_amount.toFixed(2) : (exp.amount / 2).toFixed(2)
  const youGet = paidByMe ? parseFloat(each) : -parseFloat(each)
  const { emoji } = getExpenseCategory(exp.description)

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -16 }}
      transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
      style={{
        display: 'grid', gridTemplateColumns: 'auto 1fr auto', alignItems: 'center', gap: 12,
        padding: '12px 0',
        borderBottom: isLast ? 'none' : '1px solid var(--border)',
      }}
    >
      <div style={{ position: 'relative' }}>
        <InitialsAvatar initials={payerInitials} isMe={paidByMe} size={34} />
        <span style={{ position: 'absolute', bottom: -2, right: -4, fontSize: 'var(--text-xs)' }}>{emoji}</span>
      </div>
      <div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-base)', color: 'var(--cream)', lineHeight: 1.15, letterSpacing: '-0.01em' }}>
          {exp.description}
          {exp.receipt_url && (
            <a href={exp.receipt_url} target="_blank" rel="noreferrer" style={{ marginLeft: 8, fontSize: 'var(--text-overline)', color: 'var(--accent-soft)', fontFamily: 'var(--font-mono)', letterSpacing: '0.1em' }}>
              RECEIPT ↗
            </a>
          )}
        </div>
        <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--cream-faint)', marginTop: 3, display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          {paidByMe ? 'You paid' : `${payer.split(' ')[0]} paid`} · split 50/50
          {exp.status === 'paid' && (
            <span style={{ padding: '1px 6px', borderRadius: 999, background: 'rgba(129,199,132,0.15)', fontFamily: 'var(--font-mono)', fontSize: 'var(--text-overline)', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#81c784' }}>Settled</span>
          )}
        </div>
      </div>
      <div style={{ textAlign: 'right' }}>
        <div style={{
          fontFamily: 'var(--font-display)', fontSize: 'var(--text-lg)',
          color: youGet > 0 ? 'var(--accent-soft)' : 'var(--cream)',
          lineHeight: 1, letterSpacing: '-0.02em',
        }}>
          {youGet > 0 ? '+' : youGet < 0 ? '−' : ''}€{Math.abs(youGet).toFixed(2)}
        </div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-overline)', letterSpacing: '0.14em', color: 'var(--cream-faint)', marginTop: 2, textTransform: 'uppercase' }}>
          €{exp.amount.toFixed(2)} total
        </div>
        {exp.status === 'pending' && (
          <div style={{ display: 'flex', gap: 6, marginTop: 6, justifyContent: 'flex-end' }}>
            <button onClick={() => onMarkPaid(exp.id)} style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-overline)', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--accent-soft)', background: 'none', border: '1px solid var(--accent)', borderRadius: 999, padding: '3px 8px', cursor: 'pointer' }}>
              Mark paid
            </button>
            <button onClick={onEdit} style={{ color: 'var(--cream-faint)', background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 4l6 6L9 21H3v-6L14 4z"/></svg>
            </button>
            <button onClick={() => onDelete(exp.id)} style={{ color: 'var(--cream-faint)', background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
        )}
      </div>
    </motion.div>
  )
}
