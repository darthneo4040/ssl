'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { toast } from 'sonner'
import { 
  ArrowLeft,
  Save,
  AlertTriangle,
  MapPin,
  Loader2,
  AlertCircle,
  Upload,
  X,
  FileIcon,
  ImageIcon
} from 'lucide-react'
import Link from 'next/link'
import { useIncident, useUpdateIncident } from '@/hooks/useIncidents'
import { useAuth } from '@/components/providers/auth-provider'
import { incidentsService } from '@/lib/services/incidents'

export default function EditIncidentPage() {
  const params = useParams()
  const router = useRouter()
  const incidentId = params.id as string

  const { data: incident, isLoading: loading, error } = useIncident(incidentId)
  const updateMutation = useUpdateIncident(incidentId)
  const { user } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    severity: '',
    type: '',
    status: '',
    immediateAction: '',
    witnesses: ''
  })

  const [evidenceFiles, setEvidenceFiles] = useState<File[]>([])

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

  // Sincronizar estado local con datos cargados
  useEffect(() => {
    if (incident) {
      setFormData({
        title: incident.title || '',
        description: incident.description || '',
        location: incident.location || '',
        severity: incident.severity || 'medium',
        type: incident.type || 'accident',
        status: incident.status || 'open',
        immediateAction: incident.immediate_action || '',
        witnesses: incident.witnesses || ''
      })
    }
  }, [incident])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title || !formData.description || !formData.location) {
      toast.error('Por favor completa los campos requeridos')
      return
    }

    try {
      await updateMutation.mutateAsync({
        title: formData.title.trim(),
        description: formData.description.trim(),
        location: formData.location.trim(),
        severity: formData.severity as 'critical' | 'high' | 'medium' | 'low',
        type: formData.type as 'accident' | 'near_miss' | 'unsafe_condition' | 'unsafe_act' | 'environmental',
        status: formData.status as 'open' | 'in_progress' | 'resolved' | 'closed',
        immediate_action: formData.immediateAction.trim() || null,
        witnesses: formData.witnesses.trim() || null
      })

      // Upload new evidence files
      if (evidenceFiles.length > 0 && user) {
        await Promise.all(
          evidenceFiles.map(file =>
            incidentsService.uploadEvidence(file, incidentId, user.id)
          )
        )
      }

      toast.success('✅ Incidente actualizado exitosamente')
      router.push(`/incidents/${incidentId}`)
    } catch (error) {
      console.error('Error updating incident:', error)
      toast.error('Error al actualizar el incidente: ' + (error as Error).message)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin mb-4" />
        <p className="text-muted-foreground">Cargando incidente...</p>
      </div>
    )
  }

  if (error || !incident) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error instanceof Error ? error.message : 'Incidente no encontrado'}
          </AlertDescription>
        </Alert>
        <Link href="/incidents">
          <Button className="mt-4">Volver a Incidentes</Button>
        </Link>
      </div>
    )
  }

  const saving = updateMutation.isPending

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href={`/incidents/${incidentId}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            Editar Incidente
          </h1>
          <p className="text-muted-foreground">
            Modifica la información del incidente
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
                <Label htmlFor="title">
                  Título del Incidente <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="title"
                  placeholder="Describa brevemente lo ocurrido"
                  value={formData.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  required
                  disabled={saving}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="type">Tipo de Incidente</Label>
                  <Select 
                    value={formData.type}
                    onValueChange={(value) => handleChange('type', value)}
                    disabled={saving}
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
                  <Label htmlFor="severity">Severidad</Label>
                  <Select 
                    value={formData.severity}
                    onValueChange={(value) => handleChange('severity', value)}
                    disabled={saving}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Nivel de severidad" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="critical">Crítico</SelectItem>
                      <SelectItem value="high">Alto</SelectItem>
                      <SelectItem value="medium">Medio</SelectItem>
                      <SelectItem value="low">Bajo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="status">Estado</Label>
                  <Select 
                    value={formData.status}
                    onValueChange={(value) => handleChange('status', value)}
                    disabled={saving}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Estado actual" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open">Abierto</SelectItem>
                      <SelectItem value="in_progress">En Progreso</SelectItem>
                      <SelectItem value="resolved">Resuelto</SelectItem>
                      <SelectItem value="closed">Cerrado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="description">
                  Descripción Detallada <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="description"
                  placeholder="Proporcione todos los detalles relevantes..."
                  rows={4}
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  required
                  disabled={saving}
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
                <Label htmlFor="location">
                  Ubicación Exacta <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="location"
                  placeholder="Ej: Almacén B, Sección 3"
                  value={formData.location}
                  onChange={(e) => handleChange('location', e.target.value)}
                  required
                  disabled={saving}
                />
              </div>

              <div>
                <Label htmlFor="witnesses">Testigos (opcional)</Label>
                <Textarea
                  id="witnesses"
                  placeholder="Nombres y cargos..."
                  rows={2}
                  value={formData.witnesses}
                  onChange={(e) => handleChange('witnesses', e.target.value)}
                  disabled={saving}
                />
              </div>

              <div>
                <Label htmlFor="immediateAction">Acciones Inmediatas Tomadas</Label>
                <Textarea
                  id="immediateAction"
                  placeholder="¿Qué medidas se tomaron?"
                  rows={3}
                  value={formData.immediateAction}
                  onChange={(e) => handleChange('immediateAction', e.target.value)}
                  disabled={saving}
                />
              </div>
            </CardContent>
          </Card>

          {/* Evidencia */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Agregar Evidencia
              </CardTitle>
              <CardDescription>
                Sube nuevas fotos o documentos como evidencia adicional
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Archivos</Label>
                <div className="mt-1 flex items-center gap-2">
                  <Input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*,.pdf,.doc,.docx,.mp4,.mov"
                    onChange={handleFileSelect}
                    disabled={saving}
                    className="flex-1"
                  />
                </div>
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
                        disabled={saving}
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
            <Link href={`/incidents/${incidentId}`}>
              <Button type="button" variant="outline" disabled={saving}>
                Cancelar
              </Button>
            </Link>
            <Button type="submit" disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Guardar Cambios
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}