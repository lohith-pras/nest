import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

export default function Apartment() {
  const { profile } = useAuth()
  const [roommates, setRoomates] = useState([])
  const [unit, setUnit] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      if (!profile?.unit_id) {
        setLoading(false)
        return
      }

      const [{ data: rmData }, { data: unitData }] = await Promise.all([
        supabase.from('profiles').select('*').eq('unit_id', profile.unit_id),
        supabase.from('units').select('*').eq('id', profile.unit_id).single()
      ])

      setRoomates(rmData || [])
      setUnit(unitData || null)
      setLoading(false)
    }
    if (profile) loadData()
  }, [profile])

  const initials = (name) => name?.split(' ').filter(Boolean).map(n => n[0]).join('').slice(0, 2).toUpperCase() || '?'

  return (
    <div>
      <header style={{ marginBottom: 36 }}>
        <h1 className="font-display" style={{ fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', fontWeight: 800 }}>Apartment</h1>
        <p style={{ color: 'var(--muted)', marginTop: 4 }}>Your shared home details</p>
      </header>

      {/* Unit Info */}
      <section style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h2 className="section-title">Your Unit</h2>
          {unit?.invite_code && (
            <div className="glass" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px', borderRadius: 16 }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary)', letterSpacing: '0.05em' }}>INVITE: {unit.invite_code}</span>
            </div>
          )}
        </div>

        {unit ? (
          <div className="glass-card" style={{ padding: 28, display: 'flex', alignItems: 'center', gap: 20 }}>
            <div style={{
              width: 64, height: 64, borderRadius: 20,
              background: 'var(--primary)', display: 'flex',
              alignItems: 'center', justifyContent: 'center', color: 'white', flexShrink: 0,
              boxShadow: '0 8px 24px rgba(27,67,50,0.2)'
            }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            </div>
            <div>
              <p className="font-display" style={{ fontSize: '1.5rem', fontWeight: 800 }}>
                {unit.name}
              </p>
              <p style={{ color: 'var(--muted)', marginTop: 2 }}>
                {roommates.length > 1 
                  ? `Shared with ${roommates.filter(r => r.id !== profile?.id).map(r => r.full_name?.split(' ')[0]).join(', ')}`
                  : 'No other roommates yet'}
              </p>
            </div>
          </div>
        ) : (
          <NoUnitView profile={profile} />
        )}
      </section>

      {/* Roommates */}
      {unit && (
        <>
          <section style={{ marginBottom: 32 }}>
            <h2 className="section-title" style={{ marginBottom: 16 }}>Roommates</h2>
            {loading ? (
              <div className="animate-spin" style={{ width: 36, height: 36, border: '3px solid var(--secondary)', borderTopColor: 'var(--primary)', borderRadius: '50%' }} />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {roommates.length === 0 && <p style={{ color: 'var(--muted)' }}>Loading roommates...</p>}
                {roommates.map(rm => (
                  <div key={rm.id} className="glass-card" style={{ padding: '18px 22px', display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{
                      width: 48, height: 48, borderRadius: 16, flexShrink: 0,
                      background: 'linear-gradient(135deg, var(--primary), var(--tertiary))',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'white', fontWeight: 800, fontSize: '0.95rem',
                      border: '2px solid white',
                    }}>{initials(rm.full_name)}</div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontWeight: 700 }}>{rm.full_name || 'Roommate'}</p>
                    </div>
                    {rm.id === profile?.id && <span className="badge badge-sage">You</span>}
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* House Rules placeholder */}
          <section>
            <h2 className="section-title" style={{ marginBottom: 16 }}>House Notes</h2>
            <div className="glass-card" style={{ padding: 24 }}>
              <p style={{ color: 'var(--muted)', lineHeight: 1.7, fontSize: '0.95rem' }}>
                🔒 Front door code: <strong style={{ color: 'var(--fg)' }}>Ask your roommate</strong><br />
                🗑️ Trash day: <strong style={{ color: 'var(--fg)' }}>Wednesday &amp; Saturday</strong><br />
                📦 Packages: <strong style={{ color: 'var(--fg)' }}>Left at door or mailroom</strong>
              </p>
            </div>
          </section>
        </>
      )}
    </div>
  )
}

function NoUnitView({ profile }) {
  const [mode, setMode] = useState('create')
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  function generateInviteCode() {
    return Math.random().toString(36).substring(2, 8).toUpperCase()
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      let finalUnitId = null;
      if (mode === 'create') {
        if (!name.trim()) throw new Error('Apartment name required')
        const invite = generateInviteCode()
        const newUnitId = typeof crypto !== 'undefined' && crypto.randomUUID 
          ? crypto.randomUUID() 
          : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
              const r = Math.random() * 16 | 0
              const v = c === 'x' ? r : (r & 0x3 | 0x8)
              return v.toString(16)
            })

        const { error: uErr } = await supabase.from('units').insert({ id: newUnitId, name: name.trim(), invite_code: invite })
        if (uErr) throw uErr
        finalUnitId = newUnitId
      } else {
        if (!code.trim()) throw new Error('Invite code required')
        const { data: existingUnit, error: uErr } = await supabase.rpc('get_unit_by_invite_code', { code: code.trim().toUpperCase() }).single()
        if (uErr || !existingUnit) throw new Error('Invalid invite code.')
        finalUnitId = existingUnit.id
      }

      const { error: pErr } = await supabase.from('profiles').update({ unit_id: finalUnitId }).eq('id', profile.id)
      if (pErr) throw pErr

      // Reload window to refresh all auth context and states
      window.location.reload()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="glass-card" style={{ padding: 32 }}>
      <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: 16 }}>You are not in an apartment</h3>
      <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: 24 }}>
        To use Nest, you need to create a new apartment unit or join an existing one using an invite code from your roommate.
      </p>

      {error && <div style={{ background: '#fef2f2', color: '#dc2626', padding: 12, borderRadius: 8, fontSize: '0.85rem', marginBottom: 16 }}>{error}</div>}

      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        <button onClick={() => setMode('create')} className="btn-ghost" style={{ flex: 1, background: mode === 'create' ? 'var(--primary)' : 'transparent', color: mode === 'create' ? 'var(--primary-fg)' : 'var(--muted)' }}>Create Unit</button>
        <button onClick={() => setMode('join')} className="btn-ghost" style={{ flex: 1, background: mode === 'join' ? 'var(--primary)' : 'transparent', color: mode === 'join' ? 'var(--primary-fg)' : 'var(--muted)' }}>Join Unit</button>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {mode === 'create' ? (
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--muted)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Apartment Name</label>
            <input className="input" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. The Treehouse" required />
          </div>
        ) : (
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--muted)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Invite Code</label>
            <input className="input" value={code} onChange={e => setCode(e.target.value)} placeholder="e.g. RJ3K9L" required />
          </div>
        )}
        <button type="submit" className="btn-primary" disabled={loading} style={{ justifyContent: 'center', marginTop: 8 }}>
          {loading ? '...' : mode === 'create' ? 'Create Apartment' : 'Join Apartment'}
        </button>
      </form>
    </div>
  )
}
