import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { documentsService } from '@/lib/services/documents'
import { Database } from '@/types/database'

export function useDocuments() {
  return useQuery({
    queryKey: ['documents'],
    queryFn: () => documentsService.getAllDocuments()
  })
}

export function useUploadDocument() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ 
      file, 
      category, 
      status, 
      userId 
    }: { 
      file: File; 
      category: Database['public']['Tables']['documents']['Row']['category']; 
      status: Database['public']['Tables']['documents']['Row']['status']; 
      userId: string 
    }) => {
      // 1. Subir archivo al Storage
      const filePath = await documentsService.uploadFile(file, userId)
      
      // 2. Guardar registro en la base de datos
      const newDoc = await documentsService.createDocument({
        name: file.name,
        type: file.type,
        category: category,
        status: status,
        file_url: filePath,
        file_size: file.size,
        version: 1,
        uploaded_by: userId
      })

      // 3. Llamar al servicio de ingesta (RAG vectorization) en segundo plano
      fetch('/api/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentId: newDoc.id })
      }).catch(err => console.error('Error al iniciar ingesta:', err))

      return newDoc;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] })
    }
  })
}
