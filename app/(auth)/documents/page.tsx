'use client'

import { useState, useEffect, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/database'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import {
  FileText,
  Download,
  Eye,
  Upload,
  Search,
  Filter,
  FolderOpen,
  Shield,
  AlertTriangle,
  Heart,
  HardHat,
  FileCheck,
  Calendar,
  Loader2,
  AlertCircle,
  LucideIcon, // Importa LucideIcon
} from 'lucide-react'

// Define el tipo de documento basado en tu types/database.ts
type Document = Database['public']['Tables']['documents']['Row']

// Tipos para las categorías y estados
type DocumentCategory = Document['category']
type DocumentStatus = Document['status']

// Mapeo de categorías a iconos
const categoryIcons: Record<string, LucideIcon> = {
  policies: Shield,
  procedures: FileCheck,
  forms: FileText,
  training: HardHat,
  reports: AlertTriangle,
  other: FileText,
}

// Mapeo de estados
const statusMap: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' }> = {
  active: { label: 'Vigente', variant: 'default' },
  under_review: { label: 'En Revisión', variant: 'secondary' },
  archived: { label: 'Archivado', variant: 'outline' },
}

// --- Componente DocumentCard ---
// Movido dentro de la página para que sea más fácil de gestionar
function DocumentCard({
  doc,
  onView,
  onDownload,
}: {
  doc: Document
  onView: (path: string) => void
  onDownload: (path: string, name: string) => void
}) {
  const Icon = doc.category ? categoryIcons[doc.category] || FileText : FileText
  const status = doc.status ? statusMap[doc.status] || statusMap['active'] : statusMap['active']

  const formatFileSize = (bytes: number | null) => {
    if (bytes === null || bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-VE')
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <div className="p-2 bg-gray-100 rounded-lg">
              <Icon className="h-5 w-5 text-gray-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-sm line-clamp-2">{doc.name}</h4>
              <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                <span>{doc.type}</span>
                <span>{formatFileSize(doc.file_size)}</span>
                <span>{formatDate(doc.created_at)}</span>
              </div>
              <Badge variant={status.variant} className="mt-2">
                {status.label}
              </Badge>
            </div>
          </div>
        </div>
        <div className="flex gap-2 mt-4">
          <Button
            size="sm"
            variant="outline"
            className="flex-1"
            onClick={() => doc.file_url && onView(doc.file_url)}
            disabled={!doc.file_url}
          >
            <Eye className="h-3 w-3 mr-1" />
            Ver
          </Button>
          <Button
            size="sm"
            className="flex-1"
            onClick={() => doc.file_url && onDownload(doc.file_url, doc.name)}
            disabled={!doc.file_url}
          >
            <Download className="h-3 w-3 mr-1" />
            Descargar
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

// --- Componente Principal de la Página ---
export default function DocumentsPage() {
  const [allDocuments, setAllDocuments] = useState<Document[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  // --- Estados para el Modal de Subida ---
  const [isUploading, setIsUploading] = useState(false)
  const [fileToUpload, setFileToUpload] = useState<File | null>(null)
  const [uploadCategory, setUploadCategory] = useState<DocumentCategory>('other')
  const [uploadStatus, setUploadStatus] = useState<DocumentStatus>('active')
  const [isModalOpen, setIsModalOpen] = useState(false)

  // --- Cargar Documentos ---
  useEffect(() => {
    loadDocuments()
  }, [])

  const loadDocuments = async () => {
    try {
      setLoading(true)
      setError(null)
      const { data, error: fetchError } = await supabase
        .from('documents')
        .select('*')
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError
      setAllDocuments(data || [])
    } catch (err: any) {
      console.error('Error loading documents:', err)
      setError('No se pudieron cargar los documentos.')
    } finally {
      setLoading(false)
    }
  }

  // --- Lógica de Filtrado ---
  const filteredDocuments = useMemo(() => {
    return allDocuments.filter(doc =>
      doc.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [allDocuments, searchTerm])

  const documentsByTab = useMemo(() => {
    return {
      all: filteredDocuments,
      policies: filteredDocuments.filter(d => d.category === 'policies'),
      procedures: filteredDocuments.filter(d => d.category === 'procedures'),
      forms: filteredDocuments.filter(d => d.category === 'forms'),
      training: filteredDocuments.filter(d => d.category === 'training'),
      reports: filteredDocuments.filter(d => d.category === 'reports'),
    }
  }, [filteredDocuments])

  // --- Lógica de Visualización y Descarga ---
  const handleView = async (filePath: string) => {
    try {
      // Asumimos que el bucket es 'documents'
      const { data } = supabase.storage.from('documents').getPublicUrl(filePath)
      if (data.publicUrl) {
        window.open(data.publicUrl, '_blank')
      } else {
        throw new Error('No se pudo obtener la URL pública.')
      }
    } catch (error: any) {
      toast.error('Error al ver el archivo: ' + error.message)
    }
  }

  const handleDownload = async (filePath: string, name: string) => {
    try {
      const { data, error } = await supabase.storage.from('documents').download(filePath)
      if (error) throw error
      if (data) {
        const url = window.URL.createObjectURL(data)
        const a = document.createElement('a')
        a.href = url
        a.download = name
        document.body.appendChild(a)
        a.click()
        a.remove()
        window.URL.revokeObjectURL(url)
        toast.success('Descarga iniciada.')
      }
    } catch (error: any) {
      toast.error('Error al descargar el archivo: ' + error.message)
    }
  }

  // --- Lógica de Subida de Archivos ---
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFileToUpload(e.target.files[0])
    }
  }

  const handleUpload = async () => {
    if (!fileToUpload) {
      toast.error('Por favor, selecciona un archivo.')
      return
    }

    // 1. Obtener usuario actual
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      toast.error('Debes iniciar sesión para subir archivos.')
      return
    }

    setIsUploading(true)
    try {
      // 2. Crear un path único
      const fileExt = fileToUpload.name.split('.').pop()
      const fileName = `${user.id}/${Date.now()}.${fileExt}`
      
      // 3. Subir al Storage
      const { error: uploadError } = await supabase.storage
        .from('documents') // Asegúrate que tu bucket se llame 'documents'
        .upload(fileName, fileToUpload)

      if (uploadError) throw uploadError

      // 4. Guardar metadata en la base de datos
      const { error: dbError } = await supabase
        .from('documents')
        .insert({
          name: fileToUpload.name,
          type: fileToUpload.type,
          category: uploadCategory,
          status: uploadStatus,
          file_url: fileName, // Guardamos el path, no la URL pública
          file_size: fileToUpload.size,
          version: 1,
          uploaded_by: user.id,
          // company_id se puede obtener del perfil del usuario si es necesario
        })
      
      if (dbError) throw dbError

      toast.success('¡Documento subido exitosamente!')
      resetUploadModal()
      loadDocuments() // Recargar la lista

    } catch (error: any) {
      console.error('Upload error:', error)
      toast.error('Error al subir el archivo: ' + error.message)
    } finally {
      setIsUploading(false)
    }
  }

  const resetUploadModal = () => {
    setFileToUpload(null)
    setUploadCategory('other')
    setUploadStatus('active')
    setIsModalOpen(false)
  }

  // --- Renderizado ---
  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )
    }

    if (error) {
      return (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )
    }

    const renderList = (docs: Document[]) => {
      if (docs.length === 0) {
        return (
          <p className="text-sm text-center text-muted-foreground py-4">
            No se encontraron documentos.
          </p>
        )
      }
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {docs.map(doc => (
            <DocumentCard
              key={doc.id}
              doc={doc}
              onView={handleView}
              onDownload={handleDownload}
            />
          ))}
        </div>
      )
    }

    return (
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">
            Todos ({documentsByTab.all.length})
          </TabsTrigger>
          <TabsTrigger value="policies">
            Políticas ({documentsByTab.policies.length})
          </TabsTrigger>
          <TabsTrigger value="procedures">
            Procedimientos ({documentsByTab.procedures.length})
          </TabsTrigger>
          <TabsTrigger value="forms">
            Formularios ({documentsByTab.forms.length})
          </TabsTrigger>
          <TabsTrigger value="training">
            Capacitación ({documentsByTab.training.length})
          </TabsTrigger>
          <TabsTrigger value="reports">
            Reportes ({documentsByTab.reports.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all">{renderList(documentsByTab.all)}</TabsContent>
        <TabsContent value="policies">{renderList(documentsByTab.policies)}</TabsContent>
        <TabsContent value="procedures">{renderList(documentsByTab.procedures)}</TabsContent>
        <TabsContent value="forms">{renderList(documentsByTab.forms)}</TabsContent>
        <TabsContent value="training">{renderList(documentsByTab.training)}</TabsContent>
        <TabsContent value="reports">{renderList(documentsByTab.reports)}</TabsContent>
      </Tabs>
    )
  }


  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Centro de Documentos
          </h1>
          <p className="text-muted-foreground mt-1">
            Accede a todos los documentos y formularios de SSL
          </p>
        </div>

        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button>
              <Upload className="h-4 w-4 mr-2" />
              Subir Documento
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Subir Nuevo Documento</DialogTitle>
              <DialogDescription>
                Selecciona un archivo y clasifícalo.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="file">Archivo</Label>
                <Input id="file" type="file" onChange={handleFileChange} disabled={isUploading} />
              </div>
              <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="category">Categoría</Label>
                <Select
                  value={uploadCategory || 'other'}
                  onValueChange={(v) => setUploadCategory(v as DocumentCategory)}
                  disabled={isUploading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="policies">Política</SelectItem>
                    <SelectItem value="procedures">Procedimiento</SelectItem>
                    <SelectItem value="forms">Formulario</SelectItem>
                    <SelectItem value="training">Capacitación</SelectItem>
                    <SelectItem value="reports">Reporte</SelectItem>
                    <SelectItem value="other">Otro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="status">Estado</Label>
                <Select
                  value={uploadStatus || 'active'}
                  onValueChange={(v) => setUploadStatus(v as DocumentStatus)}
                  disabled={isUploading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Vigente</SelectItem>
                    <SelectItem value="under_review">En Revisión</SelectItem>
                    <SelectItem value="archived">Archivado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline" disabled={isUploading}>
                  Cancelar
                </Button>
              </DialogClose>
              <Button type="button" onClick={handleUpload} disabled={isUploading || !fileToUpload}>
                {isUploading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4 mr-2" />
                )}
                Subir
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
      </div>

      {/* Search Bar */}
      <div className="flex gap-2 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar documentos..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="outline">
          <Filter className="h-4 w-4 mr-2" />
          Filtros
        </Button>
      </div>

      {/* Contenido (Tabs y Documentos) */}
      {renderContent()}

      {/* Quick Access Section (Sin cambios) */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FolderOpen className="h-5 w-5" />
            Acceso Rápido - Documentos Importantes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <Button variant="outline" size="sm" className="justify-start">
              <FileText className="h-4 w-4 mr-2" />
              LOPCYMAT
            </Button>
            <Button variant="outline" size="sm" className="justify-start">
              <Shield className="h-4 w-4 mr-2" />
              Normas COVENIN
            </Button>
            <Button variant="outline" size="sm" className="justify-start">
              <AlertTriangle className="h-4 w-4 mr-2" />
              Plan de Emergencia
            </Button>
            <Button variant="outline" size="sm" className="justify-start">
              <Heart className="h-4 w-4 mr-2" />
              Protocolo COVID-19
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}