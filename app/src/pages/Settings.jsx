import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'

export default function Settings() {
  const { profile, session, refreshProfile } = useAuth()
  
  const [fullName, setFullName] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '')
      setAvatarUrl(profile.avatar_url || '')
    }
  }, [profile])

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
