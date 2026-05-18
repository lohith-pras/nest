import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(undefined) // undefined = loading
  const [profile, setProfile] = useState(null)

  useEffect(() => {
    // Safety timeout: if Supabase doesn't respond (e.g. missing env vars), resolve to logged-out after 3s
    const timeout = setTimeout(() => {
      setSession(prev => prev === undefined ? null : prev)
    }, 3000)

    supabase.auth.getSession().then(({ data: { session } }) => {
      clearTimeout(timeout)
      setSession(session)
      if (session) fetchProfile(session.user.id)
    }).catch(() => {
      clearTimeout(timeout)
      setSession(null)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session) fetchProfile(session.user.id)
      else setProfile(null)
    })

    return () => { subscription.unsubscribe(); clearTimeout(timeout) }
  }, [])

  async function fetchProfile(userId) {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
      
    if (data) {
      setProfile(data)
    } else {
      // Get from auth metadata if available (this covers the gap!)
      const { data: { user } } = await supabase.auth.getUser()
      const meta = user?.user_metadata || {}
      
      const fallback = { 
        id: userId, 
        full_name: meta.full_name || 'Roommate'
      }
      setProfile(fallback)
      // Attempt to self-heal by inserting
      supabase.from('profiles').insert(fallback).then()
    }
  }

  const value = { session, profile, loading: session === undefined, refreshProfile: () => { if (session?.user?.id) fetchProfile(session.user.id) } }
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
