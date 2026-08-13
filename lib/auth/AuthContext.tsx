"use client"

import * as React from "react"
import { User, Session } from "@supabase/supabase-js"
import { getSupabaseClient } from "@/lib/supabase/client"

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signOut: () => Promise<void>
  isSupabaseConfigured: boolean
}

const AuthContext = React.createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  signOut: async () => {},
  isSupabaseConfigured: false,
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null)
  const [session, setSession] = React.useState<Session | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [isSupabaseConfigured, setIsSupabaseConfigured] = React.useState(false)

  React.useEffect(() => {
    const supabase = getSupabaseClient()

    if (!supabase) {
      setIsSupabaseConfigured(false)
      setLoading(false)
      return
    }

    setIsSupabaseConfigured(true)

    // Fetch initial session from Supabase
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    }).catch((err) => {
      console.error("Error retrieving Supabase session:", err)
      setLoading(false)
    })

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const signOut = async () => {
    const supabase = getSupabaseClient()
    if (supabase) {
      try {
        await supabase.auth.signOut()
      } catch (err) {
        console.error("Error signing out:", err)
      }
    }
    setUser(null)
    setSession(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        signOut,
        isSupabaseConfigured,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = React.useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
