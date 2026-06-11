import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/database'

export type Document = Database['public']['Tables']['documents']['Row']

export const documentsService = {
  async getAllDocuments(): Promise<Document[]> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  },

  async uploadFile(file: File, userId: string): Promise<string> {
    const supabase = createClient()
    const fileExt = file.name.split('.').pop()
    const fileName = `${userId}/${Date.now()}.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(fileName, file)

    if (uploadError) throw uploadError
    return fileName
  },

  async createDocument(docData: Database['public']['Tables']['documents']['Insert']): Promise<Document> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('documents')
      .insert(docData)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async getPublicUrl(filePath: string): Promise<string> {
    const supabase = createClient()
    const { data } = supabase.storage.from('documents').getPublicUrl(filePath)
    if (!data || !data.publicUrl) throw new Error('No se pudo obtener la URL pública.')
    return data.publicUrl
  },

  async downloadFile(filePath: string): Promise<Blob> {
    const supabase = createClient()
    const { data, error } = await supabase.storage.from('documents').download(filePath)
    if (error) throw error
    if (!data) throw new Error('El archivo no tiene contenido.')
    return data
  }
}
