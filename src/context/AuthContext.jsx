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
      if (session) fetchProfile(session.user.id, session)
    }).catch(() => {
      clearTimeout(timeout)
      setSession(null)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session) fetchProfile(session.user.id, session)
      else setProfile(null)
    })

    return () => { subscription.unsubscribe(); clearTimeout(timeout) }
  }, [])

  async function fetchProfile(userId, currentSession = null) {
    try {
      // 1. Fetch existing profile from database
      const { data: dbProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()
      
      // 2. Fetch session details if not provided to get user metadata
      let sessionObj = currentSession
      if (!sessionObj) {
        const { data: { session: fetchedSession } } = await supabase.auth.getSession()
        sessionObj = fetchedSession
      }
      
      const user = sessionObj?.user
      const meta = user?.user_metadata || {}

      // If the profile already exists and has a unit_id, we are ready
      if (dbProfile && dbProfile.unit_id) {
        setProfile(dbProfile)
        return
      }

      // Profile does not exist or lacks unit_id. Check if we have signup intent in user_metadata
      let unitId = dbProfile?.unit_id || null
      
      if (!unitId && (meta.signup_type || meta.unit_name || meta.invite_code)) {
        console.log("Self-healing: Found signup intent in user_metadata", meta)
        try {
          if (meta.signup_type === 'create' && meta.unit_name) {
            // Generate a secure, clean 6-character uppercase invite code
            const code = Math.random().toString(36).substring(2, 8).toUpperCase()
            const newUnitId = typeof crypto !== 'undefined' && crypto.randomUUID 
              ? crypto.randomUUID() 
              : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                  const r = Math.random() * 16 | 0
                  const v = c === 'x' ? r : (r & 0x3 | 0x8)
                  return v.toString(16)
                })

            const { error: uErr } = await supabase
              .from('units')
              .insert({ id: newUnitId, name: meta.unit_name.trim(), invite_code: code })
            
            if (uErr) {
              console.error("Self-healing error creating unit:", uErr)
            } else {
              unitId = newUnitId
              console.log("Self-healing: Created unit successfully with ID:", newUnitId)
            }
          } else if (meta.signup_type === 'join' && meta.invite_code) {
            // Look up the existing unit by code
            const { data: existingUnit, error: uErr } = await supabase
              .rpc('get_unit_by_invite_code', { code: meta.invite_code.toUpperCase().trim() })
              .single()
            
            if (uErr || !existingUnit) {
              console.error("Self-healing error joining unit by code:", uErr || "Unit not found")
            } else {
              unitId = existingUnit.id
              console.log("Self-healing: Joined unit successfully:", existingUnit)
            }
          }
        } catch (e) {
          console.error("Self-healing unit association failed:", e)
        }
      }

      // Construct profile data
      const profileData = {
        id: userId,
        full_name: dbProfile?.full_name || meta.full_name || 'Roommate',
        avatar_url: dbProfile?.avatar_url || null,
        unit_id: unitId
      }

      if (dbProfile) {
        // Profile exists, but unit_id needs updating
        if (unitId && unitId !== dbProfile.unit_id) {
          const { data: updatedProfile, error: pErr } = await supabase
            .from('profiles')
            .update({ unit_id: unitId })
            .eq('id', userId)
            .select()
            .single()
          
          if (!pErr && updatedProfile) {
            setProfile(updatedProfile)
            return
          }
        }
        setProfile(dbProfile)
      } else {
        // Profile doesn't exist, create it
        const { data: newProfile, error: pErr } = await supabase
          .from('profiles')
          .insert(profileData)
          .select()
          .single()
        
        if (!pErr && newProfile) {
          setProfile(newProfile)
        } else {
          // If inserting failed (e.g. race condition created it in parallel), try selecting again
          const { data: reFetchedProfile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single()
          
          setProfile(reFetchedProfile || profileData)
        }
      }
    } catch (err) {
      console.error("Error in fetchProfile self-healing flow:", err)
      // Fallback state if database has transient errors
      setProfile({
        id: userId,
        full_name: 'Roommate',
        unit_id: null
      })
    }
  }

  const value = { session, profile, loading: session === undefined, refreshProfile: () => { if (session?.user?.id) fetchProfile(session.user.id, session) } }
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
