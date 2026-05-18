import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Fallback to a placeholder so the app renders even without env vars configured
const url = supabaseUrl && supabaseUrl !== 'your_supabase_project_url'
  ? supabaseUrl
  : 'https://placeholder.supabase.co'
const key = supabaseAnonKey && supabaseAnonKey !== 'your_supabase_anon_key'
  ? supabaseAnonKey
  : 'placeholder-key'

export const supabase = createClient(url, key)
