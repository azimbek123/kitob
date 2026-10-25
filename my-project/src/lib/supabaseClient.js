import { createClient } from '@supabase/supabase-js'

const envUrl = import.meta.env.VITE_SUPABASE_URL || ''
const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

// Allow runtime override via localStorage if needed
const storedUrl = typeof window !== 'undefined' ? localStorage.getItem('kitobhon_supabase_url') : null
const storedKey = typeof window !== 'undefined' ? localStorage.getItem('kitobhon_supabase_key') : null

export const supabaseUrl = storedUrl || envUrl
export const supabaseKey = storedKey || envKey

// Check if valid URL is provided
export const isSupabaseConfigured = () => {
  return Boolean(
    supabaseUrl &&
    supabaseUrl.startsWith('https://') &&
    !supabaseUrl.includes('your-project-id') &&
    supabaseKey
  )
}

export const supabase = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : null

export const saveSupabaseCredentials = (url, key) => {
  if (url) localStorage.setItem('kitobhon_supabase_url', url.trim())
  if (key) localStorage.setItem('kitobhon_supabase_key', key.trim())
  window.location.reload()
}
