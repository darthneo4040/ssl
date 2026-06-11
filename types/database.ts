export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type ActionStatus = 'pending' | 'in_progress' | 'completed' | 'overdue'

// --- companies ---
export type CompanyRow = {
  id: string
  name: string
  rif: string | null
  address: string | null
  phone: string | null
  email: string | null
  created_at: string
  updated_at: string
}

export type CompanyInsert = {
  name: string
  rif?: string | null
  address?: string | null
  phone?: string | null
  email?: string | null
}

// --- profiles ---
export type ProfileRow = {
  id: string
  company_id: string | null
  full_name: string | null
  role: 'admin' | 'supervisor' | 'inspector' | 'employee' | null
  department: string | null
  phone: string | null
  created_at: string
  updated_at: string
}

export type ProfileInsert = {
  id: string
  company_id?: string | null
  full_name?: string | null
  role?: 'admin' | 'supervisor' | 'inspector' | 'employee' | null
  department?: string | null
  phone?: string | null
}

// --- incidents ---
export type IncidentRow = {
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

export type IncidentInsert = {
  company_id?: string | null
  reported_by?: string | null
  title: string
  description?: string | null
  type?: 'accident' | 'near_miss' | 'unsafe_condition' | 'unsafe_act' | 'environmental' | null
  severity?: 'critical' | 'high' | 'medium' | 'low' | null
  status?: 'open' | 'in_progress' | 'resolved' | 'closed'
  location?: string | null
  immediate_action?: string | null
  witnesses?: string | null
  occurred_at?: string | null
}

// --- documents ---
export type DocumentRow = {
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

export type DocumentInsert = {
  company_id?: string | null
  uploaded_by?: string | null
  name: string
  type: string
  category?: 'policies' | 'procedures' | 'forms' | 'training' | 'reports' | 'other' | null
  file_url?: string | null
  file_size?: number | null
  status?: 'active' | 'archived' | 'under_review'
  version?: number
}

// --- legislations ---
export type LegislationRow = {
  id: string
  category: string
  title: string
  summary: string | null
  full_content: string | null
  tags: string[] | null
  created_at: string
  updated_at: string
}

export type LegislationInsert = {
  category: string
  title: string
  summary?: string | null
  full_content?: string | null
  tags?: string[] | null
}

// --- risk_assessments ---
export type RiskAssessmentRow = {
  id: string
  company_id: string | null
  area: string
  task: string
  assessment_date: string
  assessed_by: string | null
  created_at: string
  updated_at: string
}

export type RiskAssessmentInsert = {
  company_id?: string | null
  area: string
  task: string
  assessment_date?: string
  assessed_by?: string | null
}

// --- identified_risks ---
export type IdentifiedRiskRow = {
  id: string
  assessment_id: string
  description: string
  probability: number
  severity: number
  created_at: string
  updated_at: string
}

export type IdentifiedRiskInsert = {
  assessment_id: string
  description: string
  probability: number
  severity: number
}

// --- action_plans ---
export type ActionPlanRow = {
  id: string
  risk_id: string
  action_description: string
  responsible_id: string | null
  due_date: string | null
  status: ActionStatus | null
  created_at: string
  updated_at: string
}

export type ActionPlanInsert = {
  risk_id: string
  action_description: string
  responsible_id?: string | null
  due_date?: string | null
  status?: ActionStatus | null
}

// --- employees ---
export type EmployeeStatus = 'active' | 'inactive' | 'suspended' | 'retired' | 'discharged'
export type ContractType = 'permanent' | 'temporary' | 'outsourced' | 'intern' | 'freelance'
export type ShiftType = 'morning' | 'afternoon' | 'night' | 'rotating'

export type EmployeeRow = {
  id: string
  company_id: string | null
  full_name: string
  cedula: string | null
  date_of_birth: string | null
  gender: string | null
  phone: string | null
  personal_email: string | null
  address: string | null
  blood_type: string | null
  emergency_contact_name: string | null
  emergency_contact_phone: string | null
  position: string | null
  department: string | null
  hire_date: string | null
  contract_type: ContractType | null
  shift: ShiftType | null
  status: EmployeeStatus
  photo_url: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export type EmployeeInsert = {
  company_id?: string | null
  full_name: string
  cedula?: string | null
  date_of_birth?: string | null
  gender?: string | null
  phone?: string | null
  personal_email?: string | null
  address?: string | null
  blood_type?: string | null
  emergency_contact_name?: string | null
  emergency_contact_phone?: string | null
  position?: string | null
  department?: string | null
  hire_date?: string | null
  contract_type?: ContractType | null
  shift?: ShiftType | null
  status?: EmployeeStatus
  photo_url?: string | null
  notes?: string | null
}

// --- medical_exams ---
export type MedicalExamRow = {
  id: string
  employee_id: string
  exam_type: 'entry' | 'periodic' | 'exit' | 'special' | 'return_to_work'
  exam_date: string
  doctor: string | null
  center: string | null
  results: string | null
  file_url: string | null
  next_exam_date: string | null
  observations: string | null
  created_at: string
  updated_at: string
}

export type MedicalExamInsert = {
  employee_id: string
  exam_type: 'entry' | 'periodic' | 'exit' | 'special' | 'return_to_work'
  exam_date: string
  doctor?: string | null
  center?: string | null
  results?: string | null
  file_url?: string | null
  next_exam_date?: string | null
  observations?: string | null
}

// --- occupational_diseases ---
export type OccupationalDiseaseRow = {
  id: string
  employee_id: string
  disease_name: string
  diagnosis_date: string
  causal_agent: string | null
  affected_area: string | null
  severity: 'mild' | 'moderate' | 'severe' | 'critical' | null
  status: 'active' | 'resolved' | 'monitoring'
  recommendations: string | null
  file_url: string | null
  created_at: string
  updated_at: string
}

export type OccupationalDiseaseInsert = {
  employee_id: string
  disease_name: string
  diagnosis_date: string
  causal_agent?: string | null
  affected_area?: string | null
  severity?: 'mild' | 'moderate' | 'severe' | 'critical' | null
  status?: 'active' | 'resolved' | 'monitoring'
  recommendations?: string | null
  file_url?: string | null
}

// --- absenteeism ---
export type AbsenteeismType = 'medical' | 'personal' | 'maternity' | 'accident' | 'other'

export type AbsenteeismRow = {
  id: string
  employee_id: string
  start_date: string
  end_date: string | null
  type: AbsenteeismType
  reason: string | null
  diagnosis: string | null
  days_count: number | null
  medical_certificate_url: string | null
  status: 'active' | 'resolved'
  created_at: string
  updated_at: string
}

export type AbsenteeismInsert = {
  employee_id: string
  start_date: string
  end_date?: string | null
  type: AbsenteeismType
  reason?: string | null
  diagnosis?: string | null
  days_count?: number | null
  medical_certificate_url?: string | null
  status?: 'active' | 'resolved'
}

// --- incident_evidence ---
export type IncidentEvidenceRow = {
  id: string
  incident_id: string
  file_name: string
  file_url: string
  file_type: string
  file_size: number | null
  uploaded_by: string | null
  description: string | null
  created_at: string
}

export type IncidentEvidenceInsert = {
  incident_id: string
  file_name: string
  file_url: string
  file_type: string
  file_size?: number | null
  uploaded_by?: string | null
  description?: string | null
}

// --- cindynic_items ---
export type CindynicItemRow = {
  id: string
  category: 'deficit_cindinico' | 'falla_cindinica' | 'disonancia_cognitiva'
  name: string
  description: string | null
  sort_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export type CindynicItemInsert = {
  category: 'deficit_cindinico' | 'falla_cindinica' | 'disonancia_cognitiva'
  name: string
  description?: string | null
  sort_order?: number
  is_active?: boolean
}

// --- cindynic_actions ---
export type CindynicActionRow = {
  id: string
  name: string
  description: string | null
  is_active: boolean
  created_at: string
}

export type CindynicActionInsert = {
  name: string
  description?: string | null
  is_active?: boolean
}

// --- cindynic_responsibles ---
export type CindynicResponsibleRow = {
  id: string
  name: string
  email: string | null
  is_active: boolean
  created_at: string
}

export type CindynicResponsibleInsert = {
  name: string
  email?: string | null
  is_active?: boolean
}

// --- cindynic_evaluations ---
export type CindynicEvaluationRow = {
  id: string
  company_id: string | null
  name: string
  evaluation_date: string
  notes: string | null
  status: 'draft' | 'in_progress' | 'completed'
  created_at: string
  updated_at: string
}

export type CindynicEvaluationInsert = {
  company_id?: string | null
  name: string
  evaluation_date?: string
  notes?: string | null
  status?: 'draft' | 'in_progress' | 'completed'
}

// --- cindynic_responses ---
export type CindynicResponseRow = {
  id: string
  evaluation_id: string
  item_id: string
  detected: boolean
  action_id: string | null
  responsible_id: string | null
  start_date: string | null
  due_date: string | null
  status: 'pending' | 'in_progress' | 'completed'
  comments: string | null
  updated_at: string
}

export type CindynicResponseInsert = {
  evaluation_id: string
  item_id: string
  detected?: boolean
  action_id?: string | null
  responsible_id?: string | null
  start_date?: string | null
  due_date?: string | null
  status?: 'pending' | 'in_progress' | 'completed'
  comments?: string | null
}

// --- Database Schema ---
export type Database = {
  public: {
    Tables: {
      companies: {
        Row: CompanyRow
        Insert: CompanyInsert
        Update: Partial<CompanyInsert>
        Relationships: []
      }
      profiles: {
        Row: ProfileRow
        Insert: ProfileInsert
        Update: Partial<ProfileInsert>
        Relationships: []
      }
      incidents: {
        Row: IncidentRow
        Insert: IncidentInsert
        Update: Partial<IncidentInsert>
        Relationships: []
      }
      documents: {
        Row: DocumentRow
        Insert: DocumentInsert
        Update: Partial<DocumentInsert>
        Relationships: []
      }
      legislations: {
        Row: LegislationRow
        Insert: LegislationInsert
        Update: Partial<LegislationInsert>
        Relationships: []
      }
      risk_assessments: {
        Row: RiskAssessmentRow
        Insert: RiskAssessmentInsert
        Update: Partial<RiskAssessmentInsert>
        Relationships: []
      }
      identified_risks: {
        Row: IdentifiedRiskRow
        Insert: IdentifiedRiskInsert
        Update: Partial<IdentifiedRiskInsert>
        Relationships: []
      }
      action_plans: {
        Row: ActionPlanRow
        Insert: ActionPlanInsert
        Update: Partial<ActionPlanInsert>
        Relationships: []
      }
      employees: {
        Row: EmployeeRow
        Insert: EmployeeInsert
        Update: Partial<EmployeeInsert>
        Relationships: []
      }
      medical_exams: {
        Row: MedicalExamRow
        Insert: MedicalExamInsert
        Update: Partial<MedicalExamInsert>
        Relationships: []
      }
      occupational_diseases: {
        Row: OccupationalDiseaseRow
        Insert: OccupationalDiseaseInsert
        Update: Partial<OccupationalDiseaseInsert>
        Relationships: []
      }
      absenteeism: {
        Row: AbsenteeismRow
        Insert: AbsenteeismInsert
        Update: Partial<AbsenteeismInsert>
        Relationships: []
      }
      incident_evidence: {
        Row: IncidentEvidenceRow
        Insert: IncidentEvidenceInsert
        Update: Partial<IncidentEvidenceInsert>
        Relationships: []
      }
      cindynic_items: {
        Row: CindynicItemRow
        Insert: CindynicItemInsert
        Update: Partial<CindynicItemInsert>
        Relationships: []
      }
      cindynic_actions: {
        Row: CindynicActionRow
        Insert: CindynicActionInsert
        Update: Partial<CindynicActionInsert>
        Relationships: []
      }
      cindynic_responsibles: {
        Row: CindynicResponsibleRow
        Insert: CindynicResponsibleInsert
        Update: Partial<CindynicResponsibleInsert>
        Relationships: []
      }
      cindynic_evaluations: {
        Row: CindynicEvaluationRow
        Insert: CindynicEvaluationInsert
        Update: Partial<CindynicEvaluationInsert>
        Relationships: []
      }
      cindynic_responses: {
        Row: CindynicResponseRow
        Insert: CindynicResponseInsert
        Update: Partial<CindynicResponseInsert>
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}