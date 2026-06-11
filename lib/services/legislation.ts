import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/database'

export type Legislation = Database['public']['Tables']['legislations']['Row']

export const legislationService = {
  async getAllLegislation(): Promise<Legislation[]> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('legislations')
      .select('id, category, title, summary, tags, full_content, created_at, updated_at')
      .order('category', { ascending: true })
      .order('title', { ascending: true })

    if (error) throw error
    return data || []
  }
}
