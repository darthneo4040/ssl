'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  ArrowLeft, 
  Edit, 
  Calendar,
  MapPin,
  User,
  AlertTriangle,
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
  Save
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

export default function IncidentDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [incident, setIncident] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [newStatus, setNewStatus] = useState('')
  const supabase = createClient()

  useEffect(() => {
    if (params.id) {
      loadIncident()
    }
  }, [params.id])

  const loadIncident = async () => {
    try {
      setLoading(true)
      
      const { data, error } = await supabase
        .from('incidents')
        .select(`
          *,
          profiles!incidents_reported_by_fkey (
            full_name,
            role
          )
        `)
        .eq('id', params.id)
        .single()

      if (error) {
        console.error('Error:', error)
        toast.error('Error al cargar el incidente')
        router.push('/incidents')
      } else {
        setIncident(data)
        setNewStatus(data.status)
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error inesperado')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async () => {
    if (!incident || newStatus === incident.status) return

    setUpdating(true)
    try {
      const { error } = await supabase
        .from('incidents')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', incident.id)

      if (error) {
        toast.error('Error al actualizar el estado')
      } else {
        toast.success('Estado actualizado correctamente')
        setIncident({ ...incident, status: newStatus })
      }
    } catch (error) {
      toast.error('Error inesperado')
    } finally {
      setUpdating(false)
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200'
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return <AlertTriangle className="h-5 w-5 text-red-500" />
      case 'in_progress': return <Clock className="h-5 w-5 text-yellow-500" />
      case 'resolved': return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'closed': return <CheckCircle className="h-5 w-5 text-gray-500" />
      default: return <AlertCircle className="h-5 w-5 text-gray-500" />
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return 'No disponible'
    return new Date(dateString).toLocaleString('es-VE', {
      dateStyle: 'medium',
      timeStyle: 'short'
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!incident) {
    return (
      <div className="p-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Incidente no encontrado
          </AlertDescription>
        </Alert>
        <Link href="/incidents">
          <Button className="mt-4">Volver a Incidentes</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href="/incidents">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Detalles del Incidente
            </h1>
            <p className="text-sm text-muted-foreground">
              ID: {incident.id.slice(0, 8)}...
            </p>
          </div>
        </div>
        <Link href={`/incidents/${incident.id}/edit`}>
          <Button>
            <Edit className="h-4 w-4 mr-2" />
            Editar
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Información Principal - 2 columnas */}
        <div className="md:col-span-2 space-y-6">
          {/* Información Básica */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Información del Incidente
                </span>
                <div className="flex items-center gap-2">
                  {getStatusIcon(incident.status)}
                  <Badge className={getSeverityColor(incident.severity)}>
                    {incident.severity?.toUpperCase()}
                  </Badge>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg mb-2">{incident.title}</h3>
                <p className="text-gray-600">{incident.description}</p>
              </div>
              
              <Separator />

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground mb-1">Tipo de Incidente</p>
                  <p className="font-medium">
                    {incident.type === 'accident' && 'Accidente'}
                    {incident.type === 'near_miss' && 'Casi Accidente'}
                    {incident.type === 'unsafe_condition' && 'Condición Insegura'}
                    {incident.type === 'unsafe_act' && 'Acto Inseguro'}
                    {incident.type === 'environmental' && 'Incidente Ambiental'}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">Severidad</p>
                  <Badge className={getSeverityColor(incident.severity)}>
                    {incident.severity === 'critical' && 'Crítico'}
                    {incident.severity === 'high' && 'Alto'}
                    {incident.severity === 'medium' && 'Medio'}
                    {incident.severity === 'low' && 'Bajo'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Ubicación y Contexto */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Ubicación y Contexto
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Ubicación</p>
                <p className="font-medium">{incident.location}</p>
              </div>

              {incident.immediate_action && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Acciones Inmediatas Tomadas</p>
                  <p className="text-gray-600">{incident.immediate_action}</p>
                </div>
              )}

              {incident.witnesses && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Testigos</p>
                  <p className="text-gray-600">{incident.witnesses}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - 1 columna */}
        <div className="space-y-6">
          {/* Estado y Acciones */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Estado del Incidente</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Estado Actual
                </label>
                <Select
                  value={newStatus}
                  onValueChange={setNewStatus}
                  disabled={updating}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">
                      <span className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                        Abierto
                      </span>
                    </SelectItem>
                    <SelectItem value="in_progress">
                      <span className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-yellow-500" />
                        En Progreso
                      </span>
                    </SelectItem>
                    <SelectItem value="resolved">
                      <span className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        Resuelto
                      </span>
                    </SelectItem>
                    <SelectItem value="closed">
                      <span className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-gray-500" />
                        Cerrado
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {newStatus !== incident.status && (
                <Button 
                  onClick={handleStatusChange}
                  disabled={updating}
                  className="w-full"
                >
                  {updating ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Guardar Cambio
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Información de Registro */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Información de Registro</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-muted-foreground">Reportado por</p>
                  <p className="font-medium">
                    {incident.profiles?.full_name || 'Usuario'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-muted-foreground">Fecha del Incidente</p>
                  <p className="font-medium">
                    {formatDate(incident.occurred_at || incident.created_at)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-muted-foreground">Registrado</p>
                  <p className="font-medium">
                    {formatDate(incident.created_at)}
                  </p>
                </div>
              </div>

              {incident.updated_at && incident.updated_at !== incident.created_at && (
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-muted-foreground">Última actualización</p>
                    <p className="font-medium">
                      {formatDate(incident.updated_at)}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}