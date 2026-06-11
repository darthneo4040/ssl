'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { authService } from '@/lib/services/auth'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type AuthContextType = {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, fullName: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkSession = async () => {
      try {
        const currentUser = await authService.getUser()
        setUser(currentUser)
      } catch (err) {
        console.error('Error al comprobar sesión activa:', err)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    checkSession()

    // Suscribirse a cambios de estado de autenticación (evento reactivo)
    const supabase = createClient()
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    await authService.signIn(email, password)
    router.push('/dashboard')
  }

  const signUp = async (email: string, password: string, fullName: string) => {
    const data = await authService.signUp(email, password)
    if (data.user) {
      await authService.createProfile({
        id: data.user.id,
        full_name: fullName,
      })
    }
    router.push('/dashboard')
  }

  const signOut = async () => {
    await authService.signOut()
    router.push('/login')
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}