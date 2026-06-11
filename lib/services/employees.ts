import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/database'

export type Employee = Database['public']['Tables']['employees']['Row']
export type MedicalExam = Database['public']['Tables']['medical_exams']['Row']
export type OccupationalDisease = Database['public']['Tables']['occupational_diseases']['Row']
export type Absenteeism = Database['public']['Tables']['absenteeism']['Row']

export const employeesService = {
  async getAllEmployees(): Promise<Employee[]> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  },

  async getEmployeeById(id: string): Promise<Employee> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  },

  async createEmployee(employeeData: Database['public']['Tables']['employees']['Insert']): Promise<Employee> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('employees')
      .insert(employeeData)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async updateEmployee(id: string, employeeData: Partial<Database['public']['Tables']['employees']['Update']>): Promise<Employee> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('employees')
      .update(employeeData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async uploadPhoto(file: File, employeeId: string): Promise<string> {
    const supabase = createClient()
    const fileExt = file.name.split('.').pop()
    const fileName = `employees/${employeeId}/photo.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from('employees')
      .upload(fileName, file, { upsert: true })

    if (uploadError) throw uploadError

    const { data } = supabase.storage.from('employees').getPublicUrl(fileName)
    return data.publicUrl
  },

  // Medical Exams
  async getMedicalExams(employeeId: string): Promise<MedicalExam[]> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('medical_exams')
      .select('*')
      .eq('employee_id', employeeId)
      .order('exam_date', { ascending: false })

    if (error) throw error
    return data || []
  },

  async createMedicalExam(examData: Database['public']['Tables']['medical_exams']['Insert']): Promise<MedicalExam> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('medical_exams')
      .insert(examData)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Occupational Diseases
  async getOccupationalDiseases(employeeId: string): Promise<OccupationalDisease[]> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('occupational_diseases')
      .select('*')
      .eq('employee_id', employeeId)
      .order('diagnosis_date', { ascending: false })

    if (error) throw error
    return data || []
  },

  async createOccupationalDisease(diseaseData: Database['public']['Tables']['occupational_diseases']['Insert']): Promise<OccupationalDisease> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('occupational_diseases')
      .insert(diseaseData)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Absenteeism
  async getAbsenteeism(employeeId: string): Promise<Absenteeism[]> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('absenteeism')
      .select('*')
      .eq('employee_id', employeeId)
      .order('start_date', { ascending: false })

    if (error) throw error
    return data || []
  },

  async createAbsenteeism(record: Database['public']['Tables']['absenteeism']['Insert']): Promise<Absenteeism> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('absenteeism')
      .insert(record)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Epidemiology dashboard data
  async getEpidemiologyStats(): Promise<{
    totalEmployees: number
    activeEmployees: number
    diseasesByArea: { area: string; count: number }[]
    absenteeismRate: number
    monthlyAbsenteeism: { month: string; count: number; days: number }[]
  }> {
    const supabase = createClient()

    const { data: employees } = await supabase
      .from('employees')
      .select('id, department, status')

    const { data: diseases } = await supabase
      .from('occupational_diseases')
      .select('id, employee_id')
      .eq('status', 'active')

    const { data: absenteeism } = await supabase
      .from('absenteeism')
      .select('start_date, days_count')
      .gte('start_date', new Date(new Date().getFullYear(), new Date().getMonth() - 6, 1).toISOString())

    const totalEmployees = employees?.length || 0
    const activeEmployees = employees?.filter(e => e.status === 'active').length || 0

    const areaMap = new Map<string, number>()
    employees?.forEach(e => {
      if (e.department) {
        areaMap.set(e.department, (areaMap.get(e.department) || 0) + 1)
      }
    })

    const diseasesByArea = employees
      ?.filter(e => diseases?.some(d => d.employee_id === e.id))
      .reduce((acc, e) => {
        if (e.department) acc.set(e.department, (acc.get(e.department) || 0) + 1)
        return acc
      }, new Map<string, number>())

    const absenteeismDays = absenteeism?.reduce((sum, a) => sum + (a.days_count || 0), 0) || 0
    const monthlyAbsenteeism = Array.from({ length: 6 }, (_, i) => {
      const d = new Date()
      d.setMonth(d.getMonth() - 5 + i)
      const month = d.toLocaleDateString('es-VE', { month: 'short', year: '2-digit' })
      const records = absenteeism?.filter(a => {
        const ad = new Date(a.start_date)
        return ad.getMonth() === d.getMonth() && ad.getFullYear() === d.getFullYear()
      }) || []
      return {
        month,
        count: records.length,
        days: records.reduce((s, r) => s + (r.days_count || 0), 0)
      }
    })

    return {
      totalEmployees,
      activeEmployees,
      diseasesByArea: Array.from(diseasesByArea?.entries() || []).map(([area, count]) => ({ area, count })),
      absenteeismRate: totalEmployees > 0 ? (absenteeismDays / (totalEmployees * 180)) * 100 : 0,
      monthlyAbsenteeism
    }
  }
}
