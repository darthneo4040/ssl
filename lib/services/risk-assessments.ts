import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/database'

export type RiskAssessment = Database['public']['Tables']['risk_assessments']['Row']
export type RiskAssessmentWithProfile = RiskAssessment & {
  profiles: {
    full_name: string | null
  } | null
}
export type IdentifiedRisk = Database['public']['Tables']['identified_risks']['Row']

export const riskAssessmentsService = {
  async getAllAssessments(): Promise<RiskAssessmentWithProfile[]> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('risk_assessments')
      .select(`
        id,
        area,
        task,
        assessment_date,
        profiles (
          full_name
        )
      `)
      .order('assessment_date', { ascending: false })

    if (error) throw error
    return (data || []) as unknown as RiskAssessmentWithProfile[]
  },

  async getAssessmentById(id: string): Promise<RiskAssessment> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('risk_assessments')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  },

  async createAssessment(assessmentData: Database['public']['Tables']['risk_assessments']['Insert']): Promise<RiskAssessment> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('risk_assessments')
      .insert({
        ...assessmentData,
        company_id: assessmentData.company_id || '550e8400-e29b-41d4-a716-446655440000',
        assessment_date: assessmentData.assessment_date || new Date().toISOString(),
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  async getIdentifiedRisks(assessmentId: string): Promise<IdentifiedRisk[]> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('identified_risks')
      .select('*')
      .eq('assessment_id', assessmentId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  },

  async addIdentifiedRisk(riskData: Database['public']['Tables']['identified_risks']['Insert']): Promise<IdentifiedRisk> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('identified_risks')
      .insert(riskData)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async deleteIdentifiedRisk(riskId: string): Promise<void> {
    const supabase = createClient()
    const { error } = await supabase
      .from('identified_risks')
      .delete()
      .eq('id', riskId)

    if (error) throw error
  },

  async getAllIdentifiedRisks(): Promise<(IdentifiedRisk & { risk_assessments: { area: string, task: string } | null })[]> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('identified_risks')
      .select(`
        *,
        risk_assessments:assessment_id (
          area,
          task
        )
      `)
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data || []) as unknown as (IdentifiedRisk & { risk_assessments: { area: string, task: string } | null })[]
  },

  async getAllActionPlans(): Promise<(Database['public']['Tables']['action_plans']['Row'] & { profiles: { full_name: string | null } | null })[]> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('action_plans')
      .select(`
        *,
        profiles:responsible_id (
          full_name
        )
      `)
      .order('due_date', { ascending: true })

    if (error) throw error
    return (data || []) as unknown as (Database['public']['Tables']['action_plans']['Row'] & { profiles: { full_name: string | null } | null })[]
  }
}
