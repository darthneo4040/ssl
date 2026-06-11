import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { employeesService } from '@/lib/services/employees'
import { Database } from '@/types/database'

export function useEmployees() {
  return useQuery({
    queryKey: ['employees'],
    queryFn: () => employeesService.getAllEmployees()
  })
}

export function useEmployee(id: string) {
  return useQuery({
    queryKey: ['employee', id],
    queryFn: () => employeesService.getEmployeeById(id),
    enabled: !!id
  })
}

export function useCreateEmployee() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Database['public']['Tables']['employees']['Insert']) =>
      employeesService.createEmployee(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] })
    }
  })
}

export function useUpdateEmployee(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<Database['public']['Tables']['employees']['Update']>) =>
      employeesService.updateEmployee(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] })
      queryClient.invalidateQueries({ queryKey: ['employee', id] })
    }
  })
}

export function useMedicalExams(employeeId: string) {
  return useQuery({
    queryKey: ['medicalExams', employeeId],
    queryFn: () => employeesService.getMedicalExams(employeeId),
    enabled: !!employeeId
  })
}

export function useCreateMedicalExam() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Database['public']['Tables']['medical_exams']['Insert']) =>
      employeesService.createMedicalExam(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['medicalExams', data.employee_id] })
    }
  })
}

export function useOccupationalDiseases(employeeId: string) {
  return useQuery({
    queryKey: ['occupationalDiseases', employeeId],
    queryFn: () => employeesService.getOccupationalDiseases(employeeId),
    enabled: !!employeeId
  })
}

export function useCreateOccupationalDisease() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Database['public']['Tables']['occupational_diseases']['Insert']) =>
      employeesService.createOccupationalDisease(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['occupationalDiseases', data.employee_id] })
    }
  })
}

export function useAbsenteeism(employeeId: string) {
  return useQuery({
    queryKey: ['absenteeism', employeeId],
    queryFn: () => employeesService.getAbsenteeism(employeeId),
    enabled: !!employeeId
  })
}

export function useCreateAbsenteeism() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Database['public']['Tables']['absenteeism']['Insert']) =>
      employeesService.createAbsenteeism(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['absenteeism', data.employee_id] })
    }
  })
}

export function useEpidemiologyStats() {
  return useQuery({
    queryKey: ['epidemiologyStats'],
    queryFn: () => employeesService.getEpidemiologyStats()
  })
}
