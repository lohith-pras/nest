import { useEffect, useState, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { useModalAnimation } from '../hooks/useModalAnimation'
import { Masthead, SectionRule, Kicker, InitialsAvatar, PlusIcon, ArrowRight } from '../components/RoomyUI'
import { SuccessOverlay } from '../components/SuccessOverlay'

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
    fontSize: 20, color: 'var(--cream)', outline: 'none',
    letterSpacing: '-0.01em', width: '100%',
    transition: 'border-color 200ms',
  }
  const labelStyle = {
    fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.22em',
    textTransform: 'uppercase', color: 'var(--cream-faint)', display: 'block', marginBottom: 6,
  }

  return (
    <div className="modal-overlay" onClick={handleClose} ref={overlayRef}>
      <div className="modal" onClick={e => e.stopPropagation()} ref={panelRef}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 26, letterSpacing: '-0.02em', color: 'var(--cream)', marginBottom: 24 }}>
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
                flex: 1, padding: '8px', borderRadius: 999, fontSize: 12,
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
              {receiptUrl && <a href={receiptUrl} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: 'var(--accent-soft)', textDecoration: 'underline' }}>View receipt</a>}
              <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileUpload} style={{ display: 'none' }} />
              <button type="button" onClick={() => fileInputRef.current.click()} disabled={uploading} className="btn-ghost" style={{ padding: '6px 14px', fontSize: 12 }}>
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

  // Group by date
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

  return (
    <div style={{ paddingTop: 16 }}>
      <SuccessOverlay show={showSuccess} onComplete={() => setShowSuccess(false)} />
      {showModal && <Modal onClose={() => setShowModal(false)} onSave={saveExpense} loading={saving} initialData={editData} />}

      <Masthead title="Ledger" meta="May 2026" />

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

      {/* Stat row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6, marginTop: 22, borderTop: '1px solid var(--border-rule)', paddingTop: 14 }}>
        <StatCell kicker="Owed to you" amount={`€${owedToMe.toFixed(2)}`} />
        <StatCell kicker="You owe" amount={`€${iOwe.toFixed(2)}`} />
        <StatCell kicker="Pending" amount={String(pending.length)} />
      </div>

      {/* FAB — add expense */}
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

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
          <div className="animate-spin" style={{ width: 28, height: 28, border: '1.5px solid var(--border-rule)', borderTopColor: 'var(--cream)', borderRadius: '50%' }} />
        </div>
      ) : (
        <div style={{ marginTop: 26 }}>
          <SectionRule label="01 — Activity" right="Filter" />

          {dayOrder.map(day => (
            <div key={day} style={{ marginTop: 16 }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--cream-faint)', marginBottom: 8 }}>
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
              <div style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 20, marginBottom: 12 }}>No expenses yet.</div>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 13 }}>Add your first shared expense above.</p>
            </div>
          )}

          {paid.length > 0 && dayOrder.filter(d => groups[d].every(e => e.status === 'paid')).length > 0 && (
            <div style={{
              fontFamily: 'var(--font-display)', fontStyle: 'italic',
              fontSize: 15, color: 'var(--cream-faint)', textAlign: 'center', lineHeight: 1.3,
              padding: '18px 24px 8px', borderTop: '1px solid var(--border)', marginTop: 24,
            }}>
              "Money rules ruin friendships. Clear receipts save them."
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function StatCell({ kicker, amount }) {
  return (
    <div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--cream-faint)' }}>{kicker}</div>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 26, color: 'var(--cream)', lineHeight: 1, marginTop: 4, letterSpacing: '-0.02em' }}>{amount}</div>
    </div>
  )
}

function ExpenseRow({ exp, profiles, myId, onMarkPaid, onDelete, onEdit, isLast }) {
  const paidByMe = exp.paid_by === myId
  const payer = profiles[exp.paid_by] || 'Someone'
  const payerInitials = payer.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
  const each = exp.split_amount != null ? exp.split_amount.toFixed(2) : (exp.amount / 2).toFixed(2)
  const youGet = paidByMe ? parseFloat(each) : -parseFloat(each)

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
      <InitialsAvatar initials={payerInitials} isMe={paidByMe} size={34} />
      <div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 17, color: 'var(--cream)', lineHeight: 1.15, letterSpacing: '-0.01em' }}>
          {exp.description}
          {exp.receipt_url && (
            <a href={exp.receipt_url} target="_blank" rel="noreferrer" style={{ marginLeft: 8, fontSize: 10, color: 'var(--accent-soft)', fontFamily: 'var(--font-mono)', letterSpacing: '0.1em' }}>
              RECEIPT ↗
            </a>
          )}
        </div>
        <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--cream-faint)', marginTop: 3, display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          {paidByMe ? 'You paid' : `${payer.split(' ')[0]} paid`} · split 50/50
          {exp.status === 'paid' && (
            <span style={{ padding: '1px 6px', borderRadius: 999, background: 'rgba(129,199,132,0.15)', fontFamily: 'var(--font-mono)', fontSize: 8, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#81c784' }}>Settled</span>
          )}
        </div>
      </div>
      <div style={{ textAlign: 'right' }}>
        <div style={{
          fontFamily: 'var(--font-display)', fontSize: 18,
          color: youGet > 0 ? 'var(--accent-soft)' : 'var(--cream)',
          lineHeight: 1, letterSpacing: '-0.02em',
        }}>
          {youGet > 0 ? '+' : youGet < 0 ? '−' : ''}€{Math.abs(youGet).toFixed(2)}
        </div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8, letterSpacing: '0.14em', color: 'var(--cream-faint)', marginTop: 2, textTransform: 'uppercase' }}>
          €{exp.amount.toFixed(2)} total
        </div>
        {exp.status === 'pending' && (
          <div style={{ display: 'flex', gap: 6, marginTop: 6, justifyContent: 'flex-end' }}>
            <button onClick={() => onMarkPaid(exp.id)} style={{ fontFamily: 'var(--font-mono)', fontSize: 8, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--accent-soft)', background: 'none', border: '1px solid var(--accent)', borderRadius: 999, padding: '3px 8px', cursor: 'pointer' }}>
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
