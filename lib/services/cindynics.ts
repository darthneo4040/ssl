import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/database'

export type Evaluation = Database['public']['Tables']['cindynic_evaluations']['Row']
export type Response = Database['public']['Tables']['cindynic_responses']['Row']
export type Item = Database['public']['Tables']['cindynic_items']['Row']
export type Action = Database['public']['Tables']['cindynic_actions']['Row']
export type Responsible = Database['public']['Tables']['cindynic_responsibles']['Row']

export interface EvaluationDashboard {
  evaluation: Evaluation
  responses: (Response & { item?: Item; action?: Action; responsible?: Responsible })[]
  stats: {
    totalItems: number
    detectedItems: number
    completedItems: number
    pendingItems: number
    inProgressItems: number
    completionPct: number
    byCategory: { category: string; total: number; detected: number; completed: number; pct: number }[]
  }
}

export const cindynicsService = {
  // Items
  async getItems(): Promise<Item[]> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('cindynic_items')
      .select('*')
      .order('sort_order', { ascending: true })

    if (error) throw error
    return data || []
  },

  async createItems(items: Database['public']['Tables']['cindynic_items']['Insert'][]): Promise<Item[]> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('cindynic_items')
      .insert(items)
      .select()

    if (error) throw error
    return data || []
  },

  async updateItem(id: string, item: Partial<Database['public']['Tables']['cindynic_items']['Update']>): Promise<Item> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('cindynic_items')
      .update(item)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async deleteItem(id: string): Promise<void> {
    const supabase = createClient()
    const { error } = await supabase.from('cindynic_items').delete().eq('id', id)
    if (error) throw error
  },

  // Actions
  async getActions(): Promise<Action[]> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('cindynic_actions')
      .select('*')
      .order('name', { ascending: true })

    if (error) throw error
    return data || []
  },

  async createAction(action: Database['public']['Tables']['cindynic_actions']['Insert']): Promise<Action> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('cindynic_actions')
      .insert(action)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async updateAction(id: string, action: Partial<Database['public']['Tables']['cindynic_actions']['Update']>): Promise<Action> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('cindynic_actions')
      .update(action)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async deleteAction(id: string): Promise<void> {
    const supabase = createClient()
    const { error } = await supabase.from('cindynic_actions').delete().eq('id', id)
    if (error) throw error
  },

  // Responsibles
  async getResponsibles(): Promise<Responsible[]> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('cindynic_responsibles')
      .select('*')
      .order('name', { ascending: true })

    if (error) throw error
    return data || []
  },

  async createResponsible(resp: Database['public']['Tables']['cindynic_responsibles']['Insert']): Promise<Responsible> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('cindynic_responsibles')
      .insert(resp)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async updateResponsible(id: string, resp: Partial<Database['public']['Tables']['cindynic_responsibles']['Update']>): Promise<Responsible> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('cindynic_responsibles')
      .update(resp)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async deleteResponsible(id: string): Promise<void> {
    const supabase = createClient()
    const { error } = await supabase.from('cindynic_responsibles').delete().eq('id', id)
    if (error) throw error
  },

  // Evaluations
  async getEvaluations(): Promise<Evaluation[]> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('cindynic_evaluations')
      .select('*')
      .order('evaluation_date', { ascending: false })

    if (error) throw error
    return data || []
  },

  async getEvaluation(id: string): Promise<Evaluation> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('cindynic_evaluations')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  },

  async createEvaluation(ev: Database['public']['Tables']['cindynic_evaluations']['Insert']): Promise<Evaluation> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('cindynic_evaluations')
      .insert(ev)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async updateEvaluation(id: string, ev: Partial<Database['public']['Tables']['cindynic_evaluations']['Update']>): Promise<Evaluation> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('cindynic_evaluations')
      .update(ev)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async deleteEvaluation(id: string): Promise<void> {
    const supabase = createClient()
    const { error } = await supabase.from('cindynic_evaluations').delete().eq('id', id)
    if (error) throw error
  },

  // Responses
  async getResponses(evaluationId: string): Promise<(Response & { item?: Item; action?: Action; responsible?: Responsible })[]> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('cindynic_responses')
      .select(`
        *,
        item:cindynic_items(*),
        action:cindynic_actions(*),
        responsible:cindynic_responsibles(*)
      `)
      .eq('evaluation_id', evaluationId)
      .order('updated_at', { ascending: false })

    if (error) throw error
    return (data || []) as unknown as (Response & { item?: Item; action?: Action; responsible?: Responsible })[]
  },

  async createResponse(resp: Database['public']['Tables']['cindynic_responses']['Insert']): Promise<Response> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('cindynic_responses')
      .insert(resp)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async updateResponse(id: string, resp: Partial<Database['public']['Tables']['cindynic_responses']['Update']>): Promise<Response> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('cindynic_responses')
      .update(resp)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Initialize a new evaluation by copying all active items as responses
  async initializeResponses(evaluationId: string): Promise<Response[]> {
    const supabase = createClient()
    const items = await this.getItems()
    const activeItems = items.filter(i => i.is_active)

    const responseData = activeItems.map(item => ({
      evaluation_id: evaluationId,
      item_id: item.id,
      detected: false,
      status: 'pending' as const
    }))

    const { data, error } = await supabase
      .from('cindynic_responses')
      .insert(responseData)
      .select()

    if (error) throw error
    return data || []
  },

  // Dashboard data
  async getDashboard(evaluationId: string): Promise<EvaluationDashboard> {
    const [evaluation, responses] = await Promise.all([
      this.getEvaluation(evaluationId),
      this.getResponses(evaluationId),
    ])

    const totalItems = responses.length
    const detectedItems = responses.filter(r => r.detected).length
    const completedItems = responses.filter(r => r.status === 'completed').length
    const pendingItems = responses.filter(r => r.status === 'pending').length
    const inProgressItems = responses.filter(r => r.status === 'in_progress').length
    const completionPct = totalItems > 0 ? completedItems / totalItems : 0

    const categories = ['deficit_cindinico', 'falla_cindinica', 'disonancia_cognitiva']
    const byCategory = categories.map(cat => {
      const catItems = responses.filter(r => r.item?.category === cat)
      const total = catItems.length
      const detected = catItems.filter(r => r.detected).length
      const completed = catItems.filter(r => r.status === 'completed').length
      return {
        category: cat,
        total,
        detected,
        completed,
        pct: total > 0 ? completed / total : 0
      }
    })

    return {
      evaluation,
      responses,
      stats: {
        totalItems,
        detectedItems,
        completedItems,
        pendingItems,
        inProgressItems,
        completionPct,
        byCategory
      }
    }
  }
}
