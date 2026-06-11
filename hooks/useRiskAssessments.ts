import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { riskAssessmentsService } from '@/lib/services/risk-assessments'
import { Database } from '@/types/database'

export function useRiskAssessments() {
  return useQuery({
    queryKey: ['risk-assessments'],
    queryFn: () => riskAssessmentsService.getAllAssessments()
  })
}

export function useRiskAssessment(id: string) {
  return useQuery({
    queryKey: ['risk-assessments', id],
    queryFn: () => riskAssessmentsService.getAssessmentById(id),
    enabled: !!id
  })
}

export function useCreateRiskAssessment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (assessmentData: Database['public']['Tables']['risk_assessments']['Insert']) => 
      riskAssessmentsService.createAssessment(assessmentData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['risk-assessments'] })
    }
  })
}

export function useIdentifiedRisks(assessmentId: string) {
  return useQuery({
    queryKey: ['identified-risks', assessmentId],
    queryFn: () => riskAssessmentsService.getIdentifiedRisks(assessmentId),
    enabled: !!assessmentId
  })
}

export function useAddIdentifiedRisk(assessmentId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (riskData: Database['public']['Tables']['identified_risks']['Insert']) => 
      riskAssessmentsService.addIdentifiedRisk(riskData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['identified-risks', assessmentId] })
    }
  })
}

export function useDeleteIdentifiedRisk(assessmentId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (riskId: string) => 
      riskAssessmentsService.deleteIdentifiedRisk(riskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['identified-risks', assessmentId] })
    }
  })
}

export function useAllIdentifiedRisks() {
  return useQuery({
    queryKey: ['all-identified-risks'],
    queryFn: () => riskAssessmentsService.getAllIdentifiedRisks()
  })
}

export function useAllActionPlans() {
  return useQuery({
    queryKey: ['all-action-plans'],
    queryFn: () => riskAssessmentsService.getAllActionPlans()
  })
}
