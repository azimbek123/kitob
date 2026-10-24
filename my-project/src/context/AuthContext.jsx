import { createContext, useContext, useState, useEffect } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check local storage session first
    const savedAdminSession = localStorage.getItem('kitobhon_admin_session')
    if (savedAdminSession === 'true') {
      setIsAdmin(true)
      setUser({ email: 'kitob@kitobhon.uz', role: 'admin' })
    }

    // Also listen to Supabase auth if configured
    if (isSupabaseConfigured() && supabase) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          setUser(session.user)
          if (session.user.email === 'kitob@kitobhon.uz' || session.user.user_metadata?.role === 'admin') {
            setIsAdmin(true)
            localStorage.setItem('kitobhon_admin_session', 'true')
          }
        }
        setLoading(false)
      })

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          setUser(session.user)
          if (session.user.email === 'kitob@kitobhon.uz' || session.user.user_metadata?.role === 'admin') {
            setIsAdmin(true)
            localStorage.setItem('kitobhon_admin_session', 'true')
          }
        } else {
          // If explicitly signed out from Supabase
          if (!localStorage.getItem('kitobhon_admin_session')) {
            setUser(null)
            setIsAdmin(false)
          }
        }
      })

      return () => subscription.unsubscribe()
    } else {
      setLoading(false)
    }
  }, [])

  const loginAdmin = async (email, password) => {
    const cleanEmail = email.trim().toLowerCase()
    const cleanPass = password.trim()

    // 1. Try Supabase Auth first if available
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password: cleanPass,
        })

        if (!error && data?.user) {
          if (data.user.email === 'kitob@kitobhon.uz' || data.user.user_metadata?.role === 'admin') {
            setUser(data.user)
            setIsAdmin(true)
            localStorage.setItem('kitobhon_admin_session', 'true')
            return { success: true }
          } else {
            return { success: false, error: "Ushbu foydalanuvchida admin huquqi yo'q!" }
          }
        }
      } catch (err) {
        console.warn('Supabase auth attempt:', err)
      }
    }

    // 2. Verified admin credentials check
    if (cleanEmail === 'kitob@kitobhon.uz' && cleanPass === 'kitobhon1') {
      const adminUser = { email: 'kitob@kitobhon.uz', role: 'admin' }
      setUser(adminUser)
      setIsAdmin(true)
      localStorage.setItem('kitobhon_admin_session', 'true')
      return { success: true }
    }

    return {
      success: false,
      error: "Noto'g'ri email yoki parol! Faqat administrator kirishi mumkin.",
    }
  }

  const logoutAdmin = async () => {
    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.auth.signOut()
      } catch (e) {
        console.error(e)
      }
    }
    localStorage.removeItem('kitobhon_admin_session')
    setUser(null)
    setIsAdmin(false)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAdmin,
        loading,
        loginAdmin,
        logoutAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
