import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { incidentsService } from '@/lib/services/incidents'
import { Database } from '@/types/database'

export function useIncidents() {
  return useQuery({
    queryKey: ['incidents'],
    queryFn: () => incidentsService.getAllIncidents()
  })
}

export function useIncident(id: string) {
  return useQuery({
    queryKey: ['incidents', id],
    queryFn: () => incidentsService.getIncidentById(id),
    enabled: !!id
  })
}

export function useCreateIncident() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (incidentData: Database['public']['Tables']['incidents']['Insert']) => 
      incidentsService.createIncident(incidentData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incidents'] })
    }
  })
}

export function useUpdateIncident(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (incidentData: Partial<Database['public']['Tables']['incidents']['Update']>) => 
      incidentsService.updateIncident(id, incidentData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incidents'] })
      queryClient.invalidateQueries({ queryKey: ['incidents', id] })
    }
  })
}

export function useUploadEvidence(incidentId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ file, userId }: { file: File; userId: string }) =>
      incidentsService.uploadEvidence(file, incidentId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incidents', incidentId] })
    }
  })
}

export function useDeleteEvidence(incidentId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (evidenceId: string) =>
      incidentsService.deleteEvidence(evidenceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incidents', incidentId] })
    }
  })
}
