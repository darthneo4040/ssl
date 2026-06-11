import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'
import { Database } from '@/types/database'

export type Profile = Database['public']['Tables']['profiles']['Row']

export const authService = {
  async getSession() {
    const supabase = createClient()
    const { data: { session }, error } = await supabase.auth.getSession()
    if (error) throw error
    return session
  },

  async getUser(): Promise<User | null> {
    const supabase = createClient()
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) throw error
    return user
  },

  async signIn(email: string, password: string) {
    const supabase = createClient()
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) throw error
    return data
  },

  async signUp(email: string, password: string) {
    const supabase = createClient()
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })
    if (error) throw error
    return data
  },

  async signOut() {
    const supabase = createClient()
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },

  async getProfile(userId: string): Promise<Profile | null> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle()
    if (error) throw error
    return data
  },

  async createProfile(profileData: Partial<Database['public']['Tables']['profiles']['Insert']> & { id: string }) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('profiles')
      .insert({
        company_id: '550e8400-e29b-41d4-a716-446655440000', // Default demo company
        role: 'inspector',
        ...profileData
      })
      .select()
      .single()
    if (error) throw error
    return data
  }
}
