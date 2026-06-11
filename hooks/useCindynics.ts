import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { cindynicsService } from '@/lib/services/cindynics'
import { Database } from '@/types/database'

// Items
export function useCindynicItems() {
  return useQuery({
    queryKey: ['cindynic_items'],
    queryFn: () => cindynicsService.getItems()
  })
}

export function useUpdateCindynicItem() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Database['public']['Tables']['cindynic_items']['Update']> }) =>
      cindynicsService.updateItem(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['cindynic_items'] })
  })
}

export function useDeleteCindynicItem() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => cindynicsService.deleteItem(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['cindynic_items'] })
  })
}

// Actions
export function useCindynicActions() {
  return useQuery({
    queryKey: ['cindynic_actions'],
    queryFn: () => cindynicsService.getActions()
  })
}

export function useCreateCindynicAction() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Database['public']['Tables']['cindynic_actions']['Insert']) =>
      cindynicsService.createAction(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['cindynic_actions'] })
  })
}

export function useUpdateCindynicAction() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Database['public']['Tables']['cindynic_actions']['Update']> }) =>
      cindynicsService.updateAction(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['cindynic_actions'] })
  })
}

export function useDeleteCindynicAction() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => cindynicsService.deleteAction(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['cindynic_actions'] })
  })
}

// Responsibles
export function useCindynicResponsibles() {
  return useQuery({
    queryKey: ['cindynic_responsibles'],
    queryFn: () => cindynicsService.getResponsibles()
  })
}

export function useCreateCindynicResponsible() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Database['public']['Tables']['cindynic_responsibles']['Insert']) =>
      cindynicsService.createResponsible(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['cindynic_responsibles'] })
  })
}

export function useUpdateCindynicResponsible() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Database['public']['Tables']['cindynic_responsibles']['Update']> }) =>
      cindynicsService.updateResponsible(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['cindynic_responsibles'] })
  })
}

export function useDeleteCindynicResponsible() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => cindynicsService.deleteResponsible(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['cindynic_responsibles'] })
  })
}

// Evaluations
export function useCindynicEvaluations() {
  return useQuery({
    queryKey: ['cindynic_evaluations'],
    queryFn: () => cindynicsService.getEvaluations()
  })
}

export function useCindynicEvaluation(id: string) {
  return useQuery({
    queryKey: ['cindynic_evaluation', id],
    queryFn: () => cindynicsService.getEvaluation(id),
    enabled: !!id
  })
}

export function useCreateCindynicEvaluation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Database['public']['Tables']['cindynic_evaluations']['Insert']) =>
      cindynicsService.createEvaluation(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['cindynic_evaluations'] })
  })
}

export function useUpdateCindynicEvaluation(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<Database['public']['Tables']['cindynic_evaluations']['Update']>) =>
      cindynicsService.updateEvaluation(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['cindynic_evaluations'] })
      qc.invalidateQueries({ queryKey: ['cindynic_evaluation', id] })
    }
  })
}

export function useDeleteCindynicEvaluation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => cindynicsService.deleteEvaluation(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['cindynic_evaluations'] })
  })
}

// Responses
export function useCindynicResponses(evaluationId: string) {
  return useQuery({
    queryKey: ['cindynic_responses', evaluationId],
    queryFn: () => cindynicsService.getResponses(evaluationId),
    enabled: !!evaluationId
  })
}

export function useUpdateCindynicResponse(evaluationId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Database['public']['Tables']['cindynic_responses']['Update']> }) =>
      cindynicsService.updateResponse(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['cindynic_responses', evaluationId] })
      qc.invalidateQueries({ queryKey: ['cindynic_dashboard', evaluationId] })
    }
  })
}

// Dashboard
export function useCindynicDashboard(evaluationId: string) {
  return useQuery({
    queryKey: ['cindynic_dashboard', evaluationId],
    queryFn: () => cindynicsService.getDashboard(evaluationId),
    enabled: !!evaluationId
  })
}

export function useInitializeResponses() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (evaluationId: string) => cindynicsService.initializeResponses(evaluationId),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['cindynic_responses'] })
      if (data.length > 0) {
        qc.invalidateQueries({ queryKey: ['cindynic_responses', data[0].evaluation_id] })
      }
    }
  })
}
