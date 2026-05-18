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
  const spendRef = useRef(null)

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
      const totalSpend = (expRes.data || []).reduce((sum, e) => sum + e.amount, 0)

      setStats({
        owedToMe,
        totalSpend,
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

    // Greeting stagger
    gsap.fromTo('.dashboard-greeting span', 
      { y: 20, autoAlpha: 0 },
      { y: 0, autoAlpha: 1, stagger: 0.05, ease: 'back.out(1.7)', duration: 0.6 }
    )

    // Date fade
    gsap.fromTo('.dashboard-date', 
      { y: -10, autoAlpha: 0 },
      { y: 0, autoAlpha: 1, duration: 0.5, delay: 0.1 }
    )

    // Count up for Owed
    if (owedRef.current) {
      const obj = { val: 0 }
      gsap.to(obj, {
        val: stats.owedToMe,
        duration: 1.2,
        ease: 'power2.out',
        onUpdate: () => {
          owedRef.current.textContent = `$${obj.val.toFixed(2)}`
        }
      })
    }

    // Count up for Spend
    if (spendRef.current) {
      const obj = { val: 0 }
      gsap.to(obj, {
        val: stats.totalSpend,
        duration: 1.2,
        ease: 'power2.out',
        onUpdate: () => {
          spendRef.current.textContent = `$${obj.val.toFixed(2)}`
        }
      })
    }

    // Batch cards
    gsap.set('.glass-card', { autoAlpha: 0, y: 30 })
    ScrollTrigger.batch('.glass-card', {
      start: 'top 88%',
      onEnter: (batch) => gsap.to(batch, { autoAlpha: 1, y: 0, stagger: 0.1, overwrite: true }),
      onLeaveBack: (batch) => gsap.set(batch, { autoAlpha: 0, y: 30, overwrite: true }),
    })

    return () => ScrollTrigger.getAll().forEach(t => t.kill())
  }, { scope: containerRef, dependencies: [loading, stats] })

  return (
    <div ref={containerRef}>
      {/* Header */}
      <header style={{ marginBottom: 40 }}>
        <p className="dashboard-date" style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
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
          <div className="animate-spin" style={{ width: 36, height: 36, border: '3px solid var(--secondary)', borderTopColor: 'var(--primary)', borderRadius: '50%' }} />
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

          {/* Finance Snapshot */}
          <section>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <h2 className="section-title">Financial Snapshot</h2>
              <Link to="/expenses" style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary)' }}>View all →</Link>
            </div>
            <div className="glass-card" style={{ padding: 28 }}>
              <p style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>You are owed</p>
              <h3 ref={owedRef} className="font-display" style={{ fontSize: '2rem', fontWeight: 800, marginBottom: 8 }}>$0.00</h3>
              <span className="badge badge-green">Pending settlement</span>
            </div>
          </section>

          {/* Upcoming Events */}
          <section>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <h2 className="section-title">Calendar</h2>
              <Link to="/calendar" style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary)' }}>Open →</Link>
            </div>
            <div className="glass-card" style={{ padding: 24, display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ width: 56, height: 56, borderRadius: 16, background: 'var(--secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', flexShrink: 0 }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
              </div>
              <div>
                <p style={{ fontWeight: 700, marginBottom: 4 }}>{stats.upcomingEvents} upcoming event{stats.upcomingEvents !== 1 ? 's' : ''}</p>
                <p style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>Check your shared calendar</p>
              </div>
            </div>
          </section>

          {/* Grocery preview */}
          <section>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <h2 className="section-title">Grocery List</h2>
              <Link to="/groceries" style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary)' }}>Shop →</Link>
            </div>
            <div className="glass-card" style={{ padding: 20 }}>
              {groceries.length === 0
                ? <p style={{ color: 'var(--muted)', fontSize: '0.9rem', padding: '8px 0' }}>All stocked up! 🎉</p>
                : (
                  <ul style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {groceries.map(g => (
                      <li key={g.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontWeight: 500 }}>{g.item_name}</span>
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
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
                {recentInterests.map(item => (
                  <div key={item.id} className="glass-card" style={{ padding: 18 }}>
                    <p style={{ fontWeight: 700, marginBottom: 4 }}>{item.title}</p>
                    <span className="badge badge-sage">Watchlist</span>
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
