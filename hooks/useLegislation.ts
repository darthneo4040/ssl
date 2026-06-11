import { useQuery } from '@tanstack/react-query'
import { legislationService } from '@/lib/services/legislation'

export function useLegislation() {
  return useQuery({
    queryKey: ['legislation'],
    queryFn: () => legislationService.getAllLegislation()
  })
}
