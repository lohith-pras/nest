import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'

export default function Settings() {
  const { profile, session, refreshProfile } = useAuth()
  
  const [fullName, setFullName] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [isDarkMode, setIsDarkMode] = useState(() => !document.documentElement.classList.contains('light'))

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '')
      setAvatarUrl(profile.avatar_url || '')
    }
  }, [profile])

  function toggleDarkMode() {
    const isDark = !document.documentElement.classList.contains('light')
    if (isDark) {
      document.documentElement.classList.add('light')
      localStorage.setItem('theme', 'light')
      setIsDarkMode(false)
    } else {
      document.documentElement.classList.remove('light')
      localStorage.setItem('theme', 'dark')
      setIsDarkMode(true)
    }
  }

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    setMessage('')
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          avatar_url: avatarUrl
        })
        .eq('id', session.user.id)
        
      if (error) throw error
      
      setMessage('Settings saved successfully!')
      refreshProfile()
    } catch (err) {
      console.error('Error saving settings:', err)
      setMessage('Failed to save settings.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fade-in">
      <header style={{ marginBottom: 32 }}>
        <h1 className="font-display" style={{ fontSize: '2rem', fontWeight: 800 }}>Settings</h1>
        <p style={{ color: 'var(--muted)' }}>Manage your profile</p>
      </header>
      
      <div className="glass-card" style={{ padding: 32 }}>
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>Full Name</label>
            <input 
              type="text" 
              className="input" 
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              placeholder="Your Name"
              required
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>Avatar URL</label>
            <input 
              type="url" 
              className="input" 
              value={avatarUrl}
              onChange={e => setAvatarUrl(e.target.value)}
              placeholder="https://example.com/avatar.png"
            />
          </div>

          {/* Appearance toggle — full-row tappable */}
          <button
            type="button"
            onClick={toggleDarkMode}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '14px 16px', borderRadius: 'var(--radius-md)',
              background: 'var(--surface-mid)', border: '1px solid var(--border)',
              cursor: 'pointer', width: '100%', marginTop: 4,
              transition: 'background 150ms',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: isDarkMode ? 'var(--surface-hover)' : 'var(--accent)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: isDarkMode ? 'var(--cream-dim)' : '#fff', flexShrink: 0,
                transition: 'background 250ms',
              }}>
                {isDarkMode ? (
                  <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                  </svg>
                ) : (
                  <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="5"/>
                    <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                    <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
                  </svg>
                )}
              </div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--cream)' }}>Appearance</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: 1 }}>{isDarkMode ? 'Dark mode' : 'Light mode'}</div>
              </div>
            </div>
            {/* Toggle pill */}
            <div style={{
              width: 52, height: 30, borderRadius: 999, flexShrink: 0,
              background: isDarkMode ? 'var(--accent)' : 'var(--border-rule)',
              position: 'relative', transition: 'background 0.25s',
            }}>
              <div style={{
                position: 'absolute', top: 3, left: isDarkMode ? 25 : 3,
                width: 24, height: 24, borderRadius: '50%',
                background: '#fff',
                transition: 'left 0.25s var(--ease-spring)',
                boxShadow: '0 2px 6px rgba(0,0,0,0.28)',
              }} />
            </div>
          </button>

          {message && (
            <p style={{ 
              fontSize: '0.875rem', 
              color: message.includes('success') ? 'var(--primary)' : 'var(--danger)' 
            }}>
              {message}
            </p>
          )}

          <button 
            type="submit" 
            className="btn-primary" 
            disabled={saving}
            style={{ alignSelf: 'flex-start', marginTop: 8 }}
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
          
        </form>
      </div>
    </div>
  )
}
