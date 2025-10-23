export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      companies: {
        Row: {
          id: string
          name: string
          rif: string | null
          address: string | null
          phone: string | null
          email: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['companies']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['companies']['Insert']>
      }
      profiles: {
        Row: {
          id: string
          company_id: string | null
          full_name: string | null
          role: 'admin' | 'supervisor' | 'inspector' | 'employee' | null
          department: string | null
          phone: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>
      }
      incidents: {
        Row: {
          id: string
          company_id: string | null
          reported_by: string | null
          title: string
          description: string | null
          type: 'accident' | 'near_miss' | 'unsafe_condition' | 'unsafe_act' | 'environmental' | null
          severity: 'critical' | 'high' | 'medium' | 'low' | null
          status: 'open' | 'in_progress' | 'resolved' | 'closed'
          location: string | null
          immediate_action: string | null
          witnesses: string | null
          occurred_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['incidents']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['incidents']['Insert']>
      }
      documents: {
        Row: {
          id: string
          company_id: string | null
          uploaded_by: string | null
          name: string
          type: string
          category: 'policies' | 'procedures' | 'forms' | 'training' | 'reports' | 'other' | null
          file_url: string | null
          file_size: number | null
          status: 'active' | 'archived' | 'under_review'
          version: number
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['documents']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['documents']['Insert']>
      }

      legislations: {
        Row: {
          id: string
          category: string
          title: string
          summary: string | null
          full_content: string | null
          tags: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['legislations']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['legislations']['Insert']>
      }
      risk_assessments: {
        Row: {
          id: string
          company_id: string | null
          area: string
          task: string
          assessment_date: string
          assessed_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['risk_assessments']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['risk_assessments']['Insert']>
      }
      identified_risks: {
        Row: {
          id: string
          assessment_id: string
          description: string
          probability: number
          severity: number
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['identified_risks']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['identified_risks']['Insert']>
      }
      action_plans: {
        Row: {
          id: string
          risk_id: string
          action_description: string
          responsible_id: string | null
          due_date: string | null
          status: ActionStatus | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['action_plans']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['action_plans']['Insert']>
      }
    }
  }
}