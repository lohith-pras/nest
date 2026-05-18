import { useEffect, useState, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { useModalAnimation } from '../hooks/useModalAnimation'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'

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
      const { error: uploadError } = await supabase.storage
        .from('receipts')
        .upload(filePath, file)
        
      if (uploadError) throw uploadError
      
      const { data: { publicUrl } } = supabase.storage.from('receipts').getPublicUrl(filePath)
      setReceiptUrl(publicUrl)
    } catch (err) {
      console.error('Error uploading receipt:', err)
      alert('Failed to upload receipt. Please check if the storage bucket "receipts" exists and has public access.')
    } finally {
      setUploading(false)
    }
  }

  function submit(e) {
    e.preventDefault()
    if (!desc || !amount) return
    const payload = { 
      description: desc, 
      amount: parseFloat(amount), 
      paid_by: initialData ? initialData.paid_by : session.user.id, 
      status: initialData ? initialData.status : 'pending',
      split_amount: splitType === 'custom' && splitAmount ? parseFloat(splitAmount) : null,
      receipt_url: receiptUrl || null
    }
    onSave(payload, initialData?.id, handleClose)
  }

  return (
    <div className="modal-overlay" onClick={handleClose} ref={overlayRef}>
      <div className="modal" onClick={e => e.stopPropagation()} ref={panelRef}>
        <h2 className="font-display" style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: 24 }}>
          {initialData ? 'Edit Expense' : 'Add Expense'}
        </h2>
        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--muted)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Description</label>
            <input className="input" value={desc} onChange={e => setDesc(e.target.value)} placeholder="e.g. Electricity bill" required />
          </div>
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--muted)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Amount ($)</label>
            <input className="input" type="number" min="0.01" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" required />
          </div>
          
          <div style={{ display: 'flex', gap: 16 }}>
            <label style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 6 }}>
              <input type="radio" checked={splitType === '5050'} onChange={() => setSplitType('5050')} /> 50/50 Split
            </label>
            <label style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 6 }}>
              <input type="radio" checked={splitType === 'custom'} onChange={() => setSplitType('custom')} /> Custom Split
            </label>
          </div>
          
          {splitType === 'custom' && (
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--muted)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Amount Owed to Payer ($)</label>
              <input className="input" type="number" min="0" step="0.01" value={splitAmount} onChange={e => setSplitAmount(e.target.value)} placeholder="0.00" required />
            </div>
          )}

          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--muted)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Receipt Image (Optional)</label>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              {receiptUrl ? (
                <a href={receiptUrl} target="_blank" rel="noreferrer" style={{ fontSize: '0.85rem', color: 'var(--primary)', textDecoration: 'underline' }}>View Receipt</a>
              ) : null}
              <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileUpload} style={{ display: 'none' }} />
              <button type="button" onClick={() => fileInputRef.current.click()} disabled={uploading} className="btn-primary" style={{ padding: '6px 12px', fontSize: '0.8rem', background: 'var(--border)', color: 'var(--fg)', border: 'none' }}>
                {uploading ? 'Uploading...' : receiptUrl ? 'Replace Image' : 'Upload Receipt'}
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
            <button type="button" className="btn-ghost" onClick={handleClose} style={{ flex: 1 }}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={loading || uploading} style={{ flex: 1, justifyContent: 'center' }}>
              {loading ? '…' : 'Save Expense'}
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
  const containerRef = useRef(null)

  useEffect(() => { load() }, [])

  useGSAP(() => {
    if (loading) return
    gsap.from('header', { autoAlpha: 0, y: -8, duration: 0.35, ease: 'expo.out' })
    gsap.from('.summary-grid > div', {
      autoAlpha: 0,
      y: 4,
      stagger: 0.03,
      duration: 0.35,
      ease: 'expo.out',
      delay: 0.05
    })
    gsap.from('.glass-card', {
      autoAlpha: 0,
      y: 8,
      stagger: 0.02,
      duration: 0.35,
      ease: 'expo.out',
      delay: 0.1,
      clearProps: 'opacity,visibility,transform',
      force3D: true
    })
  }, { scope: containerRef, dependencies: [loading] })

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
      } else {
        const { error } = await supabase.from('expenses').insert({ ...data, unit_id: profile?.unit_id || null })
        if (error) throw error
      }
      handleClose()
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

  const pending = expenses.filter(e => e.status === 'pending')
  const paid = expenses.filter(e => e.status === 'paid')
  const myId = session?.user?.id
  
  const owedToMe = pending.filter(e => e.paid_by === myId).reduce((s, e) => s + (e.split_amount != null ? e.split_amount : e.amount / 2), 0)
  const iOwe = pending.filter(e => e.paid_by !== myId).reduce((s, e) => s + (e.split_amount != null ? e.split_amount : e.amount / 2), 0)

  return (
    <div ref={containerRef}>
      {showModal && <Modal onClose={() => setShowModal(false)} onSave={saveExpense} loading={saving} initialData={editData} />}

      <header style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 36, gap: 16, flexWrap: 'wrap' }}>
        <div>
          <h1 className="font-display" style={{ fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', fontWeight: 800 }}>Expenses</h1>
          <p style={{ color: 'var(--muted)', marginTop: 4 }}>Track and split shared costs</p>
        </div>
        <button className="btn-primary" onClick={() => { setEditData(null); setSelectedDate?.(null); setShowModal(true) }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
          Add Expense
        </button>
      </header>

      {/* Summary Cards */}
      <div className="summary-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16, marginBottom: 36 }}>
        <div className="glass-card" style={{ padding: 24 }}>
          <p style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Owed to you</p>
          <p className="font-display" style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--success, #27ae60)', fontVariantNumeric: 'tabular-nums' }}>${owedToMe.toFixed(2)}</p>
        </div>
        <div className="glass-card" style={{ padding: 24 }}>
          <p style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>You owe</p>
          <p className="font-display" style={{ fontSize: '1.8rem', fontWeight: 800, color: iOwe > 0 ? 'var(--danger, #c0392b)' : 'var(--fg)', fontVariantNumeric: 'tabular-nums' }}>${iOwe.toFixed(2)}</p>
        </div>
        <div className="glass-card" style={{ padding: 24 }}>
          <p style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Pending</p>
          <p className="font-display" style={{ fontSize: '1.8rem', fontWeight: 800, fontVariantNumeric: 'tabular-nums' }}>{pending.length}</p>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
          <div className="animate-spin" style={{ width: 36, height: 36, border: '3px solid var(--secondary)', borderTopColor: 'var(--primary)', borderRadius: '50%' }} />
        </div>
      ) : (
        <>
          {/* Pending */}
          {pending.length > 0 && (
            <section style={{ marginBottom: 32 }}>
              <h2 className="section-title" style={{ marginBottom: 16 }}>Pending</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {pending.map(exp => (
                  <ExpenseRow key={exp.id} exp={exp} profiles={profiles} myId={myId} onMarkPaid={markPaid} onDelete={deleteExpense} onEdit={() => { setEditData(exp); setShowModal(true) }} />
                ))}
              </div>
            </section>
          )}

          {/* Paid */}
          {paid.length > 0 && (
            <section>
              <h2 className="section-title" style={{ marginBottom: 16, color: 'var(--muted)' }}>Settled</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, opacity: 0.65 }}>
                {paid.map(exp => (
                  <ExpenseRow key={exp.id} exp={exp} profiles={profiles} myId={myId} onMarkPaid={markPaid} onDelete={deleteExpense} onEdit={() => { setEditData(exp); setShowModal(true) }} settled />
                ))}
              </div>
            </section>
          )}

          {expenses.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--muted)' }}>
              <p style={{ fontSize: '3rem', marginBottom: 12 }}>💸</p>
              <p style={{ fontWeight: 700 }}>No expenses yet</p>
              <p style={{ fontSize: '0.9rem' }}>Add your first shared expense above</p>
            </div>
          )}
        </>
      )}
    </div>
  )
}

function ExpenseRow({ exp, profiles, myId, onMarkPaid, onDelete, onEdit, settled }) {
  const paidByMe = exp.paid_by === myId
  const payer = profiles[exp.paid_by] || 'Someone'
  const each = exp.split_amount != null ? exp.split_amount.toFixed(2) : (exp.amount / 2).toFixed(2)
  const date = new Date(exp.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

  return (
    <div className="glass-card" style={{ padding: '18px 22px', display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
      <div style={{ flex: 1, minWidth: 160 }}>
        <p style={{ fontWeight: 700, marginBottom: 3 }}>
          {exp.description} 
          {exp.receipt_url && <a href={exp.receipt_url} target="_blank" rel="noreferrer" style={{ marginLeft: 6, fontSize: '0.8rem', color: 'var(--primary)' }}>[Receipt]</a>}
        </p>
        <p style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>
          Paid by <strong>{paidByMe ? 'you' : payer}</strong> · {date}
        </p>
      </div>
      <div style={{ textAlign: 'right' }}>
        <p className="font-display" style={{ fontSize: '1.2rem', fontWeight: 800 }}>${exp.amount.toFixed(2)}</p>
        <p style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>${each} owed</p>
      </div>
      <span className={`badge ${settled ? 'badge-green' : paidByMe ? 'badge-blue' : 'badge-orange'}`}>
        {settled ? 'Settled' : paidByMe ? 'You paid' : 'You owe'}
      </span>
      {!settled && (
        <button
          className="btn-primary"
          style={{ padding: '8px 14px', fontSize: '0.8rem' }}
          onClick={() => onMarkPaid(exp.id)}
        >Mark paid</button>
      )}
      
      <button
        onClick={() => onEdit(exp)}
        style={{ color: 'var(--muted)', padding: 4, borderRadius: 8, transition: 'color 0.2s' }}
        onMouseOver={e => e.currentTarget.style.color = 'var(--fg)'}
        onMouseOut={e => e.currentTarget.style.color = 'var(--muted)'}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
      </button>

      <button
        onClick={() => onDelete(exp.id)}
        style={{ color: 'var(--muted)', padding: 4, borderRadius: 8, transition: 'color 0.2s' }}
        onMouseOver={e => e.currentTarget.style.color = 'var(--danger)'}
        onMouseOut={e => e.currentTarget.style.color = 'var(--muted)'}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>
      </button>
    </div>
  )
}
