import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'

export default function Settings() {
  const { profile, session, refreshProfile } = useAuth()
  
  const [fullName, setFullName] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [isDarkMode, setIsDarkMode] = useState(false)

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '')
      setAvatarUrl(profile.avatar_url || '')
    }
    setIsDarkMode(document.documentElement.classList.contains('dark'))
  }, [profile])

  function toggleDarkMode() {
    const isDark = document.documentElement.classList.contains('dark')
    if (isDark) {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
      setIsDarkMode(false)
    } else {
      document.documentElement.classList.add('dark')
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

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderTop: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={{ fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer' }} onClick={toggleDarkMode}>Dark Mode</label>
              <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>Toggle dark theme</span>
            </div>
            <button 
              type="button"
              onClick={toggleDarkMode}
              style={{
                width: 44, height: 24, borderRadius: 12,
                background: isDarkMode ? 'var(--primary)' : 'var(--border)',
                position: 'relative', transition: 'background 0.2s',
                border: 'none', cursor: 'pointer'
              }}
            >
              <div style={{
                position: 'absolute', top: 2, left: isDarkMode ? 22 : 2,
                width: 20, height: 20, borderRadius: '50%', background: isDarkMode ? 'oklch(24% 0.038 145)' : 'white',
                transition: 'left 0.2s, background 0.2s', boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
              }} />
            </button>
          </div>

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
