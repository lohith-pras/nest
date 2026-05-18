import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'

export default function More() {
  const { profile } = useAuth()
  const initials = profile?.full_name
    ? profile.full_name.split(' ').filter(Boolean).map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : '?'

  async function handleSignOut() {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    } catch (err) {
      console.error('Error signing out:', err)
      alert('Failed to sign out: ' + err.message)
    }
  }

  return (
    <div>
      <header style={{ marginBottom: 32 }}>
        <h1 className="font-display" style={{ fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', fontWeight: 800 }}>More</h1>
      </header>

      {/* Profile Section */}
      <div className="glass-card" style={{ padding: 24, display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
        {profile?.avatar_url ? (
          <img src={profile.avatar_url} alt="Avatar" style={{ width: 56, height: 56, borderRadius: '50%', objectFit: 'cover' }} />
        ) : (
          <div style={{
            width: 56, height: 56, borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--primary), var(--tertiary))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontWeight: 800, fontSize: '1.2rem'
          }}>{initials}</div>
        )}
        <div>
          <p className="font-display" style={{ fontSize: '1.2rem', fontWeight: 800 }}>{profile?.full_name || 'Loading…'}</p>
          <p style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>Roommate</p>
        </div>
      </div>

      {/* Navigation Links */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 40 }}>
        <Link to="/interests" className="glass-card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', textDecoration: 'none' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M7 3v18"/><path d="M17 3v18"/><path d="M3 7h4"/><path d="M3 17h4"/><path d="M17 7h4"/><path d="M17 17h4"/></svg>
            </div>
            <span style={{ fontWeight: 700, color: 'var(--fg)' }}>Interests</span>
          </div>
          <span style={{ color: 'var(--muted)' }}>→</span>
        </Link>
        
        <Link to="/apartment" className="glass-card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', textDecoration: 'none' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            </div>
            <span style={{ fontWeight: 700, color: 'var(--fg)' }}>Apartment</span>
          </div>
          <span style={{ color: 'var(--muted)' }}>→</span>
        </Link>

        <Link to="/settings" className="glass-card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', textDecoration: 'none' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
            </div>
            <span style={{ fontWeight: 700, color: 'var(--fg)' }}>Settings</span>
          </div>
          <span style={{ color: 'var(--muted)' }}>→</span>
        </Link>
      </div>

      {/* Sign Out */}
      <button 
        className="glass-card" 
        onClick={handleSignOut}
        style={{ width: '100%', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, color: 'var(--danger)', fontWeight: 700 }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
        Sign Out
      </button>
    </div>
  )
}