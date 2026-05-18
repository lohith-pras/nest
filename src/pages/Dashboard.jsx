import { useEffect, useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

export default function Dashboard() {
  const { profile } = useAuth()
  const [stats, setStats] = useState({ owedToMe: 0, totalSpend: 0, uncheckedGroceries: 0, upcomingEvents: 0 })
  const [groceries, setGroceries] = useState([])
  const [recentInterests, setRecentInterests] = useState([])
  const [loading, setLoading] = useState(true)

  const containerRef = useRef(null)
  const owedRef = useRef(null)

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  const firstName = profile?.full_name?.split(' ')[0] || ''
  const greetingText = `${greeting}${firstName ? `, ${firstName}` : ''}.`
  const greetingWords = greetingText.split(' ')

  useEffect(() => {
    async function load() {
      setLoading(true)
      const userId = (await supabase.auth.getUser()).data.user?.id

      const [expRes, grocRes, calRes, intRes] = await Promise.all([
        supabase.from('expenses').select('amount, paid_by, status').eq('status', 'pending'),
        supabase.from('groceries').select('id, item_name, is_checked').eq('is_checked', false).limit(4),
        supabase.from('events').select('id').gte('date', new Date().toISOString().split('T')[0]),
        supabase.from('interests').select('id, category, title, added_by').order('created_at', { ascending: false }).limit(4),
      ])

      const owedToMe = (expRes.data || [])
        .filter(e => e.paid_by === userId)
        .reduce((sum, e) => sum + (e.amount / 2), 0)

      setStats({
        owedToMe,
        uncheckedGroceries: grocRes.data?.length || 0,
        upcomingEvents: calRes.data?.length || 0,
      })
      setGroceries(grocRes.data || [])
      setRecentInterests((intRes.data || []).filter(i => i.category === 'watchlist').slice(0, 2))
      setLoading(false)
    }
    load()
  }, [])

  useGSAP(() => {
    if (loading) return

    // Greeting stagger - Sharper and faster
    gsap.fromTo('.dashboard-greeting span', 
      { y: 12, autoAlpha: 0 },
      { y: 0, autoAlpha: 1, stagger: 0.03, ease: 'expo.out', duration: 0.5 }
    )

    // Date fade
    gsap.fromTo('.dashboard-date', 
      { y: -6, autoAlpha: 0 },
      { y: 0, autoAlpha: 1, duration: 0.4, delay: 0.05, ease: 'expo.out' }
    )

    // Count up for Owed - Snappier
    if (owedRef.current) {
      const obj = { val: 0 }
      gsap.to(obj, {
        val: stats.owedToMe,
        duration: 0.8,
        ease: 'expo.out',
        onUpdate: () => {
          owedRef.current.textContent = `€${obj.val.toFixed(2)}`
        }
      })
    }

    // Batch cards - Waterfall effect
    gsap.set('.glass-card', { autoAlpha: 0, y: 8 })
    ScrollTrigger.batch('.glass-card', {
      start: 'top 94%',
      onEnter: (batch) => gsap.to(batch, { 
        autoAlpha: 1, 
        y: 0, 
        stagger: 0.03, 
        duration: 0.35,
        ease: 'expo.out',
        overwrite: true,
        force3D: true
      }),
    })

    return () => ScrollTrigger.getAll().forEach(t => t.kill())
  }, { scope: containerRef, dependencies: [loading, stats] })

  return (
    <div ref={containerRef}>
      {/* Header */}
      <header style={{ marginBottom: 40 }}>
        <p className="dashboard-date" style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
        <h1 className="font-display dashboard-greeting" style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 800, lineHeight: 1.1, marginBottom: 6 }}>
          {greetingWords.map((word, i) => (
            <span key={i} style={{ display: 'inline-block', marginRight: '0.25em' }}>{word}</span>
          ))}
        </h1>
        <p style={{ color: 'var(--muted)', fontWeight: 500 }}>Here's what's happening at your place today.</p>
      </header>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
          <div className="animate-spin" style={{ width: 32, height: 32, border: '2px solid var(--secondary)', borderTopColor: 'var(--primary)', borderRadius: '50%' }} />
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

          {/* Finance Snapshot */}
          <section>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <h2 className="section-title">Financial Snapshot</h2>
              <Link to="/expenses" style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary)', transition: 'opacity 0.2s' }}>View all →</Link>
            </div>
            <div className="glass-card" style={{ padding: '28px 24px' }}>
              <p style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>{stats.owedToMe >= 0 ? 'You are owed' : 'You owe'}</p>
              <h3 ref={owedRef} className="font-display" style={{ fontSize: '2.4rem', fontWeight: 800, marginBottom: 8, fontVariantNumeric: 'tabular-nums' }}>€0.00</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className="badge badge-green">Pending settlement</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>• {stats.uncheckedGroceries} groceries left</span>
              </div>
            </div>
          </section>

          {/* Upcoming Events */}
          <section>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <h2 className="section-title">Calendar</h2>
              <Link to="/calendar" style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary)' }}>Open →</Link>
            </div>
            <div className="glass-card" style={{ padding: 24, display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ width: 48, height: 48, borderRadius: 14, background: 'var(--secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', flexShrink: 0 }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
              </div>
              <div>
                <p style={{ fontWeight: 700, marginBottom: 2 }}>{stats.upcomingEvents} upcoming event{stats.upcomingEvents !== 1 ? 's' : ''}</p>
                <p style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>Check shared calendar</p>
              </div>
            </div>
          </section>

          {/* Grocery preview */}
          <section>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <h2 className="section-title">Grocery List</h2>
              <Link to="/groceries" style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary)' }}>Shop →</Link>
            </div>
            <div className="glass-card" style={{ padding: '20px 24px' }}>
              {groceries.length === 0
                ? <p style={{ color: 'var(--muted)', fontSize: '0.9rem', padding: '8px 0' }}>All stocked up! 🎉</p>
                : (
                  <ul style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {groceries.map(g => (
                      <li key={g.id} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--primary)', opacity: 0.4 }} />
                        <span style={{ fontWeight: 500, fontSize: '0.95rem' }}>{g.item_name}</span>
                      </li>
                    ))}
                  </ul>
                )
              }
            </div>
          </section>

          {/* Watchlist preview */}
          {recentInterests.length > 0 && (
            <section>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <h2 className="section-title">Watchlist</h2>
                <Link to="/interests" style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary)' }}>See all →</Link>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {recentInterests.map(item => (
                  <div key={item.id} className="glass-card" style={{ padding: 18, minHeight: 80, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <p style={{ fontWeight: 700, marginBottom: 4, fontSize: '0.9rem', lineHeight: 1.2 }}>{item.title}</p>
                    <span className="badge badge-sage" style={{ alignSelf: 'flex-start' }}>Watchlist</span>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  )
}
