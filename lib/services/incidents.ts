import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/database'

export type Incident = Database['public']['Tables']['incidents']['Row']
export type IncidentWithProfile = Incident & {
  profiles: {
    full_name: string | null
    role: string | null
  } | null
}
export type IncidentEvidence = Database['public']['Tables']['incident_evidence']['Row']
export type IncidentWithEvidence = IncidentWithProfile & {
  incident_evidence: IncidentEvidence[]
}

export const incidentsService = {
  async getAllIncidents(): Promise<IncidentWithProfile[]> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('incidents')
      .select(`
        *,
        profiles!incidents_reported_by_fkey (
          full_name,
          role
        )
      `)
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data || []) as unknown as IncidentWithProfile[]
  },

  async getIncidentById(id: string): Promise<IncidentWithEvidence> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('incidents')
      .select(`
        *,
        profiles!incidents_reported_by_fkey (
          full_name,
          role
        ),
        incident_evidence (
          id,
          file_name,
          file_url,
          file_type,
          file_size,
          description,
          created_at
        )
      `)
      .eq('id', id)
      .single()

    if (error) throw error
    return data as unknown as IncidentWithEvidence
  },

  async createIncident(incidentData: Database['public']['Tables']['incidents']['Insert']): Promise<Incident> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('incidents')
      .insert({
        ...incidentData,
        occurred_at: incidentData.occurred_at || new Date().toISOString(),
        status: incidentData.status || 'open'
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  async updateIncident(id: string, incidentData: Partial<Database['public']['Tables']['incidents']['Update']>): Promise<Incident> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('incidents')
      .update({
        ...incidentData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Evidence
  async getIncidentEvidence(incidentId: string): Promise<IncidentEvidence[]> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('incident_evidence')
      .select('*')
      .eq('incident_id', incidentId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  },

  async uploadEvidence(file: File, incidentId: string, userId: string): Promise<IncidentEvidence> {
    const supabase = createClient()
    const fileName = `incidents/${incidentId}/${Date.now()}_${file.name}`

    const { error: uploadError } = await supabase.storage
      .from('incident_evidence')
      .upload(fileName, file)

    if (uploadError) throw uploadError

    const { data: urlData } = supabase.storage.from('incident_evidence').getPublicUrl(fileName)
    const fileUrl = urlData.publicUrl

    let fileType = 'other'
    if (file.type.startsWith('image/')) fileType = 'image'
    else if (file.type === 'application/pdf') fileType = 'pdf'
    else if (file.type.startsWith('video/')) fileType = 'video'

    const { data, error } = await supabase
      .from('incident_evidence')
      .insert({
        incident_id: incidentId,
        file_name: file.name,
        file_url: fileUrl,
        file_type: fileType,
        file_size: file.size,
        uploaded_by: userId
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  async deleteEvidence(evidenceId: string): Promise<void> {
    const supabase = createClient()
    const { error } = await supabase
      .from('incident_evidence')
      .delete()
      .eq('id', evidenceId)

    if (error) throw error
  }
}
