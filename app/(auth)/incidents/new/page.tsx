'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { 
  ArrowLeft,
  Save,
  MapPin,
  AlertTriangle,
  Loader2,
  Upload,
  X,
  FileIcon,
  ImageIcon
} from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/components/providers/auth-provider'
import { useCreateIncident } from '@/hooks/useIncidents'
import { incidentsService } from '@/lib/services/incidents'

export default function NewIncidentPage() {
  const router = useRouter()
  const { user } = useAuth()
  const createIncidentMutation = useCreateIncident()
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    severity: 'medium',
    type: 'accident',
    immediateAction: '',
    witnesses: ''
  })

  const [evidenceFiles, setEvidenceFiles] = useState<File[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      setEvidenceFiles(prev => [...prev, ...Array.from(files)])
    }
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const removeFile = (index: number) => {
    setEvidenceFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user) {
      toast.error('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.')
      router.push('/login')
      return
    }

    try {
      const incident = await createIncidentMutation.mutateAsync({
        company_id: '550e8400-e29b-41d4-a716-446655440000',
        reported_by: user.id,
        title: formData.title.trim(),
        description: formData.description.trim(),
        location: formData.location.trim(),
        severity: formData.severity as 'critical' | 'high' | 'medium' | 'low',
        type: formData.type as 'accident' | 'near_miss' | 'unsafe_condition' | 'unsafe_act' | 'environmental',
        immediate_action: formData.immediateAction.trim() || null,
        witnesses: formData.witnesses.trim() || null,
        status: 'open'
      })

      // Upload evidence files if any
      if (evidenceFiles.length > 0) {
        await Promise.all(
          evidenceFiles.map(file =>
            incidentsService.uploadEvidence(file, incident.id, user.id)
          )
        )
      }

      toast.success('✅ Incidente reportado exitosamente')
      router.push('/incidents')
    } catch (error) {
      console.error('Error reporting incident:', error)
      toast.error((error as Error).message || 'Error al guardar el incidente')
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const loading = createIncidentMutation.isPending

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/incidents">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            Reportar Nuevo Incidente
          </h1>
          <p className="text-muted-foreground">
            Complete el formulario para registrar el incidente
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6">
          {/* Información Básica */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Información del Incidente
              </CardTitle>
              <CardDescription>
                Datos principales del evento ocurrido
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Título del Incidente*</Label>
                <Input
                  id="title"
                  placeholder="Describa brevemente lo ocurrido"
                  value={formData.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="type">Tipo de Incidente*</Label>
                  <Select 
                    value={formData.type}
                    onValueChange={(value) => handleChange('type', value)}
                    disabled={loading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione el tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="accident">Accidente</SelectItem>
                      <SelectItem value="near_miss">Casi Accidente</SelectItem>
                      <SelectItem value="unsafe_condition">Condición Insegura</SelectItem>
                      <SelectItem value="unsafe_act">Acto Inseguro</SelectItem>
                      <SelectItem value="environmental">Incidente Ambiental</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="severity">Severidad*</Label>
                  <Select 
                    value={formData.severity}
                    onValueChange={(value) => handleChange('severity', value)}
                    disabled={loading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Nivel de severidad" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="critical">Crítico - Requiere acción inmediata</SelectItem>
                      <SelectItem value="high">Alto - Muy urgente</SelectItem>
                      <SelectItem value="medium">Medio - Urgente</SelectItem>
                      <SelectItem value="low">Bajo - No urgente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Descripción Detallada*</Label>
                <Textarea
                  id="description"
                  placeholder="Proporcione todos los detalles relevantes del incidente..."
                  rows={4}
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
            </CardContent>
          </Card>

          {/* Ubicación y Testigos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Ubicación y Testigos
              </CardTitle>
              <CardDescription>
                Información sobre dónde ocurrió y quién estuvo presente
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="location">Ubicación Exacta*</Label>
                <Input
                  id="location"
                  placeholder="Ej: Almacén B, Sección 3, cerca del montacargas"
                  value={formData.location}
                  onChange={(e) => handleChange('location', e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <Label htmlFor="witnesses">Testigos (opcional)</Label>
                <Textarea
                  id="witnesses"
                  placeholder="Nombre y cargo de las personas que presenciaron el incidente"
                  rows={2}
                  value={formData.witnesses}
                  onChange={(e) => handleChange('witnesses', e.target.value)}
                  disabled={loading}
                />
              </div>

              <div>
                <Label htmlFor="immediateAction">Acciones Inmediatas Tomadas</Label>
                <Textarea
                  id="immediateAction"
                  placeholder="¿Qué medidas se tomaron inmediatamente después del incidente?"
                  rows={3}
                  value={formData.immediateAction}
                  onChange={(e) => handleChange('immediateAction', e.target.value)}
                  disabled={loading}
                />
              </div>
            </CardContent>
          </Card>

          {/* Evidencia */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Evidencia
              </CardTitle>
              <CardDescription>
                Fotos, documentos u otros archivos como evidencia del incidente
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Archivos de Evidencia</Label>
                <div className="mt-1 flex items-center gap-2">
                  <Input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*,.pdf,.doc,.docx,.mp4,.mov"
                    onChange={handleFileSelect}
                    disabled={loading}
                    className="flex-1"
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Formatos aceptados: imágenes, PDF, documentos, videos
                </p>
              </div>

              {evidenceFiles.length > 0 && (
                <div className="space-y-2">
                  {evidenceFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 rounded-md bg-slate-50 border border-slate-200">
                      <div className="flex items-center gap-2 min-w-0">
                        {file.type.startsWith('image/') ? (
                          <ImageIcon className="h-4 w-4 shrink-0 text-blue-500" />
                        ) : (
                          <FileIcon className="h-4 w-4 shrink-0 text-amber-500" />
                        )}
                        <span className="text-sm truncate">{file.name}</span>
                        <span className="text-xs text-muted-foreground shrink-0">
                          ({(file.size / 1024).toFixed(1)} KB)
                        </span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 shrink-0"
                        onClick={() => removeFile(index)}
                        disabled={loading}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-3 justify-end">
            <Link href="/incidents">
              <Button type="button" variant="outline" disabled={loading}>
                Cancelar
              </Button>
            </Link>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Reportar Incidente
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}