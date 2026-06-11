'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
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
  Upload,
  Search,
  Filter,
  FolderOpen,
  Shield,
  AlertTriangle,
  Heart,
  Loader2,
  AlertCircle,
  FolderLock
} from 'lucide-react'
import { useAuth } from '@/components/providers/auth-provider'
import { useDocuments, useUploadDocument } from '@/hooks/useDocuments'
import { documentsService } from '@/lib/services/documents'
import { DocumentCard } from '@/components/document-card'
import { Database } from '@/types/database'

type Document = Database['public']['Tables']['documents']['Row']
type DocumentCategory = Database['public']['Tables']['documents']['Row']['category']
type DocumentStatus = Database['public']['Tables']['documents']['Row']['status']

export default function DocumentsPage() {
  const { user } = useAuth()
  const { data: allDocuments = [], isLoading: loading, error } = useDocuments()
  const uploadMutation = useUploadDocument()

  const [searchTerm, setSearchTerm] = useState('')
  const [fileToUpload, setFileToUpload] = useState<File | null>(null)
  const [uploadCategory, setUploadCategory] = useState<DocumentCategory>('other')
  const [uploadStatus, setUploadStatus] = useState<DocumentStatus>('active')
  const [isModalOpen, setIsModalOpen] = useState(false)

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
      const publicUrl = await documentsService.getPublicUrl(filePath)
      window.open(publicUrl, '_blank')
    } catch (error) {
      toast.error('Error al ver el archivo: ' + (error as Error).message)
    }
  }

  const handleDownload = async (filePath: string, name: string) => {
    try {
      const blob = await documentsService.downloadFile(filePath)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = name
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
      toast.success('Descarga iniciada.')
    } catch (error) {
      toast.error('Error al descargar el archivo: ' + (error as Error).message)
    }
  }

  // --- Lógica de Subida de Archivos ---
  const ALLOWED_EXTENSIONS = ['.md', '.txt', '.pdf', '.docx', '.csv']

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0]
      const extension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase()
      
      if (!ALLOWED_EXTENSIONS.includes(extension)) {
        toast.error(`Tipo de archivo no permitido. Solo se aceptan: ${ALLOWED_EXTENSIONS.join(', ')}`)
        e.target.value = '' // Reset input
        setFileToUpload(null)
        return
      }
      
      setFileToUpload(file)
    }
  }

  const handleUpload = async () => {
    if (!fileToUpload) {
      toast.error('Por favor, selecciona un archivo.')
      return
    }

    if (!user) {
      toast.error('Debes iniciar sesión para subir archivos.')
      return
    }

    try {
      await uploadMutation.mutateAsync({
        file: fileToUpload,
        category: uploadCategory,
        status: uploadStatus,
        userId: user.id
      })

      toast.success('¡Documento subido exitosamente!')
      resetUploadModal()
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('Error al subir el archivo: ' + (error as Error).message)
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
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-4" />
          <p className="text-muted-foreground text-sm font-medium">Cargando documentos...</p>
        </div>
      )
    }

    if (error) {
      return (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error instanceof Error ? error.message : 'No se pudieron cargar los documentos.'}
          </AlertDescription>
        </Alert>
      )
    }

    const renderList = (docs: Document[]) => {
      if (docs.length === 0) {
        return (
          <Card className="p-12 text-center border-slate-200/60 bg-white">
            <div className="max-w-md mx-auto space-y-3">
              <div className="h-10 w-10 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center mx-auto text-slate-400">
                <FolderLock className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-700">Sin documentos</h3>
                <p className="text-muted-foreground text-xs">
                  No se encontraron archivos cargados en esta categoría.
                </p>
              </div>
            </div>
          </Card>
        )
      }
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
      <Tabs defaultValue="all" className="space-y-6">
        <TabsList className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 h-auto p-1 bg-slate-100/80 rounded-xl border border-slate-200/50">
          <TabsTrigger value="all" className="py-2.5 rounded-lg text-xs font-semibold transition-all data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-700">
            Todos ({documentsByTab.all.length})
          </TabsTrigger>
          <TabsTrigger value="policies" className="py-2.5 rounded-lg text-xs font-semibold transition-all data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-700">
            Políticas ({documentsByTab.policies.length})
          </TabsTrigger>
          <TabsTrigger value="procedures" className="py-2.5 rounded-lg text-xs font-semibold transition-all data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-700">
            Procedimientos ({documentsByTab.procedures.length})
          </TabsTrigger>
          <TabsTrigger value="forms" className="py-2.5 rounded-lg text-xs font-semibold transition-all data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-700">
            Formularios ({documentsByTab.forms.length})
          </TabsTrigger>
          <TabsTrigger value="training" className="py-2.5 rounded-lg text-xs font-semibold transition-all data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-700">
            Capacitación ({documentsByTab.training.length})
          </TabsTrigger>
          <TabsTrigger value="reports" className="py-2.5 rounded-lg text-xs font-semibold transition-all data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-700">
            Reportes ({documentsByTab.reports.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="pt-2 focus-visible:outline-none">{renderList(documentsByTab.all)}</TabsContent>
        <TabsContent value="policies" className="pt-2 focus-visible:outline-none">{renderList(documentsByTab.policies)}</TabsContent>
        <TabsContent value="procedures" className="pt-2 focus-visible:outline-none">{renderList(documentsByTab.procedures)}</TabsContent>
        <TabsContent value="forms" className="pt-2 focus-visible:outline-none">{renderList(documentsByTab.forms)}</TabsContent>
        <TabsContent value="training" className="pt-2 focus-visible:outline-none">{renderList(documentsByTab.training)}</TabsContent>
        <TabsContent value="reports" className="pt-2 focus-visible:outline-none">{renderList(documentsByTab.reports)}</TabsContent>
      </Tabs>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50/50 pb-12">
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-200/80 pb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              Centro de Documentos
            </h1>
            <p className="text-muted-foreground mt-1 text-sm md:text-base">
              Accede, sube y consulta todos los documentos, inducciones y formularios oficiales de SSL.
            </p>
          </div>

          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-md shadow-blue-500/10">
                <Upload className="h-4 w-4 mr-2" />
                Subir Documento
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle className="font-bold text-slate-800">Subir Nuevo Documento</DialogTitle>
                <DialogDescription className="text-xs">
                  Selecciona un archivo y clasifícalo adecuadamente para auditorías del INPSASEL.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                
                <div className="grid w-full items-center gap-1.5">
                  <Label htmlFor="file" className="text-xs font-semibold text-slate-600">Archivo</Label>
                  <Input 
                    id="file" 
                    type="file" 
                    accept=".md,.txt,.pdf,.docx,.csv"
                    onChange={handleFileChange} 
                    disabled={uploadMutation.isPending} 
                    className="bg-slate-50 border-slate-200/80 text-xs"
                  />
                </div>
                
                <div className="grid w-full items-center gap-1.5">
                  <Label htmlFor="category" className="text-xs font-semibold text-slate-600">Categoría</Label>
                  <Select
                    value={uploadCategory || 'other'}
                    onValueChange={(v) => setUploadCategory(v as DocumentCategory)}
                    disabled={uploadMutation.isPending}
                  >
                    <SelectTrigger className="bg-slate-50 border-slate-200/80 text-xs">
                      <SelectValue placeholder="Selecciona una categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="policies">Política de SSL</SelectItem>
                      <SelectItem value="procedures">Procedimientos (AST/ART)</SelectItem>
                      <SelectItem value="forms">Formulario INPSASEL</SelectItem>
                      <SelectItem value="training">Capacitación y Entrenamiento</SelectItem>
                      <SelectItem value="reports">Reporte de Morbilidad/Gestión</SelectItem>
                      <SelectItem value="other">Otro Documento</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid w-full items-center gap-1.5">
                  <Label htmlFor="status" className="text-xs font-semibold text-slate-600">Estado de Vigencia</Label>
                  <Select
                    value={uploadStatus || 'active'}
                    onValueChange={(v) => setUploadStatus(v as DocumentStatus)}
                    disabled={uploadMutation.isPending}
                  >
                    <SelectTrigger className="bg-slate-50 border-slate-200/80 text-xs">
                      <SelectValue placeholder="Selecciona un estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Vigente</SelectItem>
                      <SelectItem value="under_review">En Revisión Ocupacional</SelectItem>
                      <SelectItem value="archived">Archivado / Histórico</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

              </div>
              <DialogFooter className="gap-2 sm:gap-0">
                <DialogClose asChild>
                  <Button type="button" variant="outline" disabled={uploadMutation.isPending} className="border-slate-200 bg-white">
                    Cancelar
                  </Button>
                </DialogClose>
                <Button 
                  type="button" 
                  onClick={handleUpload} 
                  disabled={uploadMutation.isPending || !fileToUpload}
                  className="bg-blue-600 hover:bg-blue-500 text-white font-semibold"
                >
                  {uploadMutation.isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4 mr-2" />
                  )}
                  Subir Archivo
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search Bar */}
        <div className="flex gap-2">
          <div className="relative flex-1 max-w-md shadow-xs rounded-xl overflow-hidden">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400" />
            <Input
              placeholder="Buscar documentos por nombre..."
              className="pl-10 pr-4 py-5 bg-white border-slate-200/80 focus:border-blue-600 rounded-xl text-xs sm:text-sm placeholder:text-slate-400"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline" className="bg-white border-slate-200 rounded-xl text-xs font-semibold h-11 px-4">
            <Filter className="h-4 w-4 mr-2 text-slate-500" />
            Filtros
          </Button>
        </div>

        {/* Contenido (Tabs y Documentos) */}
        {renderContent()}

        {/* Quick Access Section */}
        <Card className="border-slate-200/60 shadow-xs bg-white rounded-xl overflow-hidden">
          <CardHeader className="bg-slate-50/20 border-b border-slate-100">
            <CardTitle className="flex items-center gap-2 text-sm font-bold text-slate-800">
              <FolderOpen className="h-5 w-5 text-blue-600" />
              Acceso Rápido - Documentos Importantes
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Button variant="outline" size="sm" className="justify-start border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold rounded-lg h-9">
                <FileText className="h-4 w-4 mr-2 text-blue-500" />
                LOPCYMAT Oficial
              </Button>
              <Button variant="outline" size="sm" className="justify-start border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold rounded-lg h-9">
                <Shield className="h-4 w-4 mr-2 text-indigo-500" />
                Normativas COVENIN
              </Button>
              <Button variant="outline" size="sm" className="justify-start border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold rounded-lg h-9">
                <AlertTriangle className="h-4 w-4 mr-2 text-amber-500" />
                Plan de Emergencia
              </Button>
              <Button variant="outline" size="sm" className="justify-start border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold rounded-lg h-9">
                <Heart className="h-4 w-4 mr-2 text-red-500" />
                Programa de SST
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}