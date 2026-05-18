import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { session } = useAuth()
  const [mode, setMode] = useState('login') // 'login' | 'signup'
  const [signupType, setSignupType] = useState('create') // 'create' | 'join'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [unitName, setUnitName] = useState('')
  const [inviteCode, setInviteCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [message, setMessage] = useState(null)

  if (session) return <Navigate to="/" replace />

  function generateInviteCode() {
    return Math.random().toString(36).substring(2, 8).toUpperCase()
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setMessage(null)
    setLoading(true)
    try {
      if (mode === 'signup') {
        let finalUnitId = null;

        if (signupType === 'join') {
          // Verify invite code first without auth (since units table must be publicly readable or readable with anon key... wait, units is readable by authenticated only! If they are signing up, they are NOT authenticated yet. This is a chicken-egg problem if units requires auth to read. Wait! We can verify after signup or use a proxy. Let's just create the account first, then check/link the unit.)
        }

        const { data, error } = await supabase.auth.signUp({ 
          email, 
          password,
          options: {
            data: {
              full_name: name,
            }
          }
        })
        if (error) throw error
        
        if (data.user && data.session) {
          // Now they are authenticated, they can read/write units
          if (signupType === 'create') {
            const code = generateInviteCode();
            const { data: newUnit, error: unitErr } = await supabase.from('units').insert({
              name: unitName,
              invite_code: code
            }).select().single()
            if (unitErr) throw unitErr
            finalUnitId = newUnit.id
          } else {
            const { data: existingUnit, error: unitErr } = await supabase.rpc('get_unit_by_invite_code', { code: inviteCode.toUpperCase() }).single()
            if (unitErr || !existingUnit) {
              throw new Error('Invalid invite code.')
            }
            finalUnitId = existingUnit.id
          }

          await supabase.from('profiles').insert({
            id: data.user.id,
            full_name: name,
            unit_id: finalUnitId,
          }).select()
        }
        setMessage('Check your email to confirm your account!')
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      paddingTop: 'max(24px, env(safe-area-inset-top))',
    }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{
            width: 64, height: 64, borderRadius: 20,
            background: 'var(--primary)', display: 'inline-flex',
            alignItems: 'center', justifyContent: 'center',
            color: 'white', marginBottom: 16,
            boxShadow: '0 8px 32px rgba(27,67,50,0.25)'
          }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          </div>
          <h1 className="font-display" style={{ fontSize: '2rem', fontWeight: 800, marginBottom: 6 }}>Roomy</h1>
          <p style={{ color: 'var(--muted)', fontSize: '0.95rem' }}>
            {mode === 'login' ? 'Welcome back 👋' : 'Create your account'}
          </p>
        </div>

        {/* Card */}
        <div className="glass-card" style={{ padding: 32 }}>
          {error && (
            <div style={{
              background: '#fef2f2', border: '1px solid #fecaca',
              borderRadius: 12, padding: '12px 16px', marginBottom: 20,
              color: '#dc2626', fontSize: '0.875rem',
            }}>{error}</div>
          )}
          {message && (
            <div style={{
              background: '#f0fdf4', border: '1px solid #bbf7d0',
              borderRadius: 12, padding: '12px 16px', marginBottom: 20,
              color: '#15803d', fontSize: '0.875rem',
            }}>{message}</div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {mode === 'signup' && (
              <>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--muted)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Full Name</label>
                  <input className="input" type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Lohith Kumar" required />
                </div>
                
                <div style={{ display: 'flex', gap: 8, marginBottom: 4 }}>
                  <button type="button" onClick={() => setSignupType('create')} className={`btn-primary`} style={{ flex: 1, padding: '8px', fontSize: '0.8rem', background: signupType === 'create' ? 'var(--primary)' : 'transparent', color: signupType === 'create' ? 'white' : 'var(--muted)', border: signupType === 'create' ? 'none' : '1px solid var(--border)' }}>Create Unit</button>
                  <button type="button" onClick={() => setSignupType('join')} className={`btn-primary`} style={{ flex: 1, padding: '8px', fontSize: '0.8rem', background: signupType === 'join' ? 'var(--primary)' : 'transparent', color: signupType === 'join' ? 'white' : 'var(--muted)', border: signupType === 'join' ? 'none' : '1px solid var(--border)' }}>Join Unit</button>
                </div>

                {signupType === 'create' ? (
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--muted)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Apartment Name</label>
                    <input className="input" type="text" value={unitName} onChange={e => setUnitName(e.target.value)} placeholder="e.g. The Treehouse" required />
                  </div>
                ) : (
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--muted)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Invite Code</label>
                    <input className="input" type="text" value={inviteCode} onChange={e => setInviteCode(e.target.value)} placeholder="e.g. RJ3K9L" required />
                  </div>
                )}
              </>
            )}
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--muted)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Email</label>
              <input className="input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required />
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--muted)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Password</label>
              <input className="input" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required minLength={6} />
            </div>

            <button type="submit" className="btn-primary" disabled={loading} style={{ justifyContent: 'center', marginTop: 8 }}>
              {loading
                ? <span className="animate-spin" style={{ display: 'inline-block', width: 18, height: 18, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: 'white', borderRadius: '50%' }} />
                : mode === 'login' ? 'Sign In' : 'Create Account'
              }
            </button>
          </form>

          <p style={{ marginTop: 24, textAlign: 'center', fontSize: '0.875rem', color: 'var(--muted)' }}>
            {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
            <button
              onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(null); setMessage(null) }}
              style={{ color: 'var(--primary)', fontWeight: 700 }}
            >
              {mode === 'login' ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
