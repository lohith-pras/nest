import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { ArrowRight } from '../components/RoomyUI'

export default function Login() {
  const { session } = useAuth()
  const [mode, setMode] = useState('login')
  const [signupType, setSignupType] = useState('create')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [unitName, setUnitName] = useState('')
  const [inviteCode, setInviteCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [message, setMessage] = useState(null)

  if (session) return <Navigate to="/" replace />

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setMessage(null)
    setLoading(true)
    try {
      if (mode === 'signup') {
        if (signupType === 'join') {
          if (!inviteCode.trim()) throw new Error('Invite code is required')
          const { data: existingUnit, error: unitErr } = await supabase
            .rpc('get_unit_by_invite_code', { code: inviteCode.toUpperCase().trim() })
          if (unitErr || !existingUnit || existingUnit.length === 0) {
            throw new Error('Invalid invite code. Please check the code and try again.')
          }
        } else {
          if (!unitName.trim()) throw new Error('Apartment name is required')
        }

        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: name,
              signup_type: signupType,
              unit_name: signupType === 'create' ? unitName.trim() : null,
              invite_code: signupType === 'join' ? inviteCode.toUpperCase().trim() : null,
            },
          },
        })
        if (error) throw error
        if (data.session) {
          setMessage('Signed up successfully!')
        } else {
          setMessage('Account created! Please check your email to confirm your account.')
        }
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
      padding: '56px 24px 32px',
      paddingTop: 'max(56px, env(safe-area-inset-top))',
      display: 'flex', flexDirection: 'column',
      background: 'var(--bg)',
      color: 'var(--cream)',
    }}>
      {/* Masthead */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        borderBottom: '1px solid var(--border-rule)', paddingBottom: 10,
      }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', letterSpacing: '-0.01em' }}>
          Roomy
        </div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-overline)', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--cream-faint)' }}>
          № 47 · since 2024
        </div>
      </div>

      {/* Hero */}
      <div style={{ marginTop: 22 }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-overline)', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--accent-soft)', marginBottom: 10 }}>
          {mode === 'login' ? "Editor's note" : 'New edition'}
        </div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(40px, 10vw, 52px)', lineHeight: 0.95, letterSpacing: '-0.025em', margin: 0 }}>
          {mode === 'login' ? (
            <>Welcome<br /><span style={{ fontStyle: 'italic', color: 'var(--accent-soft)' }}>home</span>, friend.</>
          ) : (
            <>Start your<br /><span style={{ fontStyle: 'italic', color: 'var(--accent-soft)' }}>story</span>.</>
          )}
        </h1>
      </div>

      {mode === 'login' && (
        <>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', lineHeight: 1.5, color: 'var(--cream-dim)', marginTop: 16, maxWidth: 340 }}>
            The quiet little app that keeps you and your roommate{' '}
            <em style={{ fontFamily: 'var(--font-display)', color: 'var(--cream)' }}>squared up</em>, well-fed,
            and reminded the trash goes out on Tuesdays.
          </p>

          <div style={{ marginTop: 22, paddingLeft: 14, borderLeft: '2px solid var(--accent)' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 'var(--text-base)', lineHeight: 1.3, color: 'var(--cream)' }}>
              "Living together is mostly logistics. Roomy handles the logistics so you can get back to the living."
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-overline)', letterSpacing: '0.2em', color: 'var(--cream-faint)', marginTop: 8, textTransform: 'uppercase' }}>
              — From the README
            </div>
          </div>
        </>
      )}

      {/* Form */}
      <div style={{ marginTop: 32 }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-overline)', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--cream-faint)', paddingBottom: 8, borderBottom: '1px solid var(--border-rule)', marginBottom: 4 }}>
          01 — {mode === 'login' ? 'Sign in' : 'Create account'}
        </div>

        {error && (
          <div style={{ marginTop: 16, padding: '12px 16px', background: 'rgba(229,115,115,0.12)', border: '1px solid rgba(229,115,115,0.25)', borderRadius: 10, color: '#e57373', fontSize: 'var(--text-sm)', fontFamily: 'var(--font-body)' }}>
            {error}
          </div>
        )}
        {message && (
          <div style={{ marginTop: 16, padding: '12px 16px', background: 'rgba(129,199,132,0.12)', border: '1px solid rgba(129,199,132,0.2)', borderRadius: 10, color: '#81c784', fontSize: 'var(--text-sm)', fontFamily: 'var(--font-body)' }}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column' }}>
          {mode === 'signup' && (
            <>
              <EditorialField label="Full Name" value={name} onChange={setName} placeholder="Lohith Kumar" />
              <div style={{ marginTop: 20, display: 'flex', gap: 8 }}>
                <button type="button" onClick={() => setSignupType('create')} style={{
                  flex: 1, padding: '9px', borderRadius: 999, fontSize: 'var(--text-xs)', fontFamily: 'var(--font-body)', fontWeight: 600, cursor: 'pointer',
                  background: signupType === 'create' ? 'var(--cream)' : 'transparent',
                  color: signupType === 'create' ? 'var(--primary-fg)' : 'var(--cream-faint)',
                  border: signupType === 'create' ? 'none' : '1px solid var(--input-border)',
                }}>Create Unit</button>
                <button type="button" onClick={() => setSignupType('join')} style={{
                  flex: 1, padding: '9px', borderRadius: 999, fontSize: 'var(--text-xs)', fontFamily: 'var(--font-body)', fontWeight: 600, cursor: 'pointer',
                  background: signupType === 'join' ? 'var(--cream)' : 'transparent',
                  color: signupType === 'join' ? 'var(--primary-fg)' : 'var(--cream-faint)',
                  border: signupType === 'join' ? 'none' : '1px solid var(--input-border)',
                }}>Join Unit</button>
              </div>
              {signupType === 'create' ? (
                <EditorialField label="Apartment Name" value={unitName} onChange={setUnitName} placeholder="e.g. The Treehouse" />
              ) : (
                <EditorialField label="Invite Code" value={inviteCode} onChange={setInviteCode} placeholder="e.g. RJ3K9L" />
              )}
            </>
          )}

          <EditorialField label="Email" value={email} onChange={setEmail} type="email" placeholder="you@example.com" />
          <EditorialField label="Password" value={password} onChange={setPassword} type="password" placeholder="••••••••" />

          <button type="submit" disabled={loading} style={{
            marginTop: 28, width: '100%',
            background: 'var(--cream)', color: 'var(--primary-fg)',
            border: 'none', padding: '16px',
            borderRadius: 999,
            fontFamily: 'var(--font-body)', fontSize: 'var(--text-base)', fontWeight: 600,
            letterSpacing: '-0.01em', cursor: loading ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            opacity: loading ? 0.7 : 1,
            transition: 'opacity 200ms',
          }}>
            {loading
              ? <span className="animate-spin" style={{ width: 18, height: 18, border: '2px solid rgba(0,0,0,0.3)', borderTopColor: 'var(--primary-fg)', borderRadius: '50%', display: 'inline-block' }} />
              : <>{mode === 'login' ? 'Sign in' : 'Create Account'}<ArrowRight size={16} stroke={2.4} /></>
            }
          </button>

          <div style={{ marginTop: 18, display: 'flex', justifyContent: 'center', gap: 6, fontSize: 'var(--text-sm)', color: 'var(--cream-faint)', fontFamily: 'var(--font-body)' }}>
            <span>{mode === 'login' ? 'New to Roomy?' : 'Already have an account?'}</span>
            <button type="button" onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(null); setMessage(null) }} style={{
              color: 'var(--cream)', fontWeight: 600, background: 'none', border: 'none',
              textDecoration: 'underline', textDecorationColor: 'var(--accent)', textUnderlineOffset: 3,
              fontSize: 'var(--text-sm)', fontFamily: 'var(--font-body)', cursor: 'pointer',
            }}>
              {mode === 'login' ? 'Sign up' : 'Sign in'}
            </button>
          </div>
        </form>
      </div>

      {/* Footer trio */}
      {mode === 'login' && (
        <>
          <div style={{
            marginTop: 'auto', paddingTop: 32,
            display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14,
            borderTop: '1px solid var(--border)',
          }}>
            {[
              { k: '01', t: 'Split bills', s: 'Without the math' },
              { k: '02', t: 'Stock pantry', s: 'Synced live' },
              { k: '03', t: 'Stay in sync', s: 'With one tap' },
            ].map(f => (
              <div key={f.k}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-overline)', letterSpacing: '0.22em', color: 'var(--accent-soft)', textTransform: 'uppercase' }}>{f.k}</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-base)', lineHeight: 1.1, color: 'var(--cream)', marginTop: 4 }}>{f.t}</div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-overline)', color: 'var(--cream-faint)', marginTop: 2 }}>{f.s}</div>
              </div>
            ))}
          </div>

          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-overline)', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--cream-faint)', marginTop: 22, textAlign: 'center' }}>
            Made with care · Issue 47
          </div>
        </>
      )}
    </div>
  )
}

function EditorialField({ label, value, onChange, type = 'text', placeholder }) {
  const [focus, setFocus] = useState(false)
  return (
    <div style={{ marginTop: 22 }}>
      <div style={{
        fontFamily: 'var(--font-mono)', fontSize: 'var(--text-overline)', letterSpacing: '0.22em', textTransform: 'uppercase',
        color: focus ? 'var(--accent-soft)' : 'var(--cream-faint)', marginBottom: 6, transition: 'color 200ms',
      }}>{label}</div>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
        placeholder={placeholder}
        required
        style={{
          width: '100%', boxSizing: 'border-box',
          background: 'transparent', border: 'none',
          borderBottom: `1px solid ${focus ? 'var(--cream)' : 'var(--input-border)'}`,
          padding: '10px 0',
          fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)', color: 'var(--cream)',
          outline: 'none', letterSpacing: '-0.01em',
          transition: 'border-color 200ms',
        }}
      />
    </div>
  )
}
