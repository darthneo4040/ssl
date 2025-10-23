'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'  // ← IMPORTANTE: Agregar esta importación
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Plus,
  AlertTriangle,
  Clock,
  CheckCircle,
  Filter,
  Loader2,
  RefreshCw,
  AlertCircle
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

export default function IncidentsPage() {
  const [incidents, setIncidents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    loadIncidents()
  }, [])

  const loadIncidents = async () => {
    try {
      setLoading(true)
      setError(null)

      // Verificar sesión
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        setError('No hay sesión activa')
        setLoading(false)
        return
      }

      console.log('Cargando incidentes...')

      // Obtener incidentes con información del reportador
      const { data, error: fetchError } = await supabase
        .from('incidents')
        .select(`
          *,
          profiles!incidents_reported_by_fkey (
            full_name
          )
        `)
        .order('created_at', { ascending: false })

      if (fetchError) {
        console.error('Error al cargar incidentes:', fetchError)
        setError(fetchError.message)
        toast.error('Error al cargar incidentes')
      } else {
        console.log('Incidentes cargados:', data)
        setIncidents(data || [])
        
        if (data && data.length === 0) {
          toast.info('No hay incidentes registrados aún')
        }
      }
    } catch (err: any) {
      console.error('Error inesperado:', err)
      setError(err.message)
    } finally {
      setLoading(false)
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

  const getSeverityLabel = (severity: string) => {
    switch (severity) {
      case 'critical': return 'Crítico'
      case 'high': return 'Alto'
      case 'medium': return 'Medio'
      case 'low': return 'Bajo'
      default: return severity || 'Sin definir'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return <AlertTriangle className="h-4 w-4 text-red-500" />
      case 'in_progress': return <Clock className="h-4 w-4 text-yellow-500" />
      case 'resolved': return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'closed': return <CheckCircle className="h-4 w-4 text-gray-500" />
      default: return <AlertCircle className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'open': return 'Abierto'
      case 'in_progress': return 'En Progreso'
      case 'resolved': return 'Resuelto'
      case 'closed': return 'Cerrado'
      default: return status || 'Sin estado'
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'accident': return 'Accidente'
      case 'near_miss': return 'Casi Accidente'
      case 'unsafe_condition': return 'Condición Insegura'
      case 'unsafe_act': return 'Acto Inseguro'
      case 'environmental': return 'Ambiental'
      default: return type || 'Sin tipo'
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Fecha no disponible'
    
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60))
    const diffMinutes = Math.floor(diffTime / (1000 * 60))

    // Si es de hoy, mostrar hace cuánto
    if (diffMinutes < 60) {
      return `Hace ${diffMinutes} ${diffMinutes === 1 ? 'minuto' : 'minutos'}`
    } else if (diffHours < 24) {
      return `Hace ${diffHours} ${diffHours === 1 ? 'hora' : 'horas'}`
    } else if (diffDays < 7) {
      return `Hace ${diffDays} ${diffDays === 1 ? 'día' : 'días'}`
    }

    // Si es más antiguo, mostrar fecha
    return date.toLocaleDateString('es-VE', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Cargando incidentes...</p>
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Gestión de Incidentes
          </h1>
          <p className="text-muted-foreground mt-1">
            {incidents.length} {incidents.length === 1 ? 'incidente registrado' : 'incidentes registrados'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={loadIncidents}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualizar
          </Button>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filtrar
          </Button>
          <Link href="/incidents/new">
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Incidente
            </Button>
          </Link>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Error: {error}
          </AlertDescription>
        </Alert>
      )}

      {/* Lista de Incidentes */}
      {incidents.length === 0 ? (
        <Card className="p-8">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No hay incidentes registrados</h3>
            <p className="text-muted-foreground mb-4">
              Comienza reportando el primer incidente
            </p>
            <Link href="/incidents/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Reportar Incidente
              </Button>
            </Link>
          </div>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {incidents.map((incident) => (
            <Card key={incident.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start gap-2">
                  <CardTitle className="text-base line-clamp-2 flex-1">
                    {incident.title}
                  </CardTitle>
                  <div className="flex items-center gap-1">
                    {getStatusIcon(incident.status)}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge className={getSeverityColor(incident.severity)}>
                    {getSeverityLabel(incident.severity)}
                  </Badge>
                  <Badge variant="outline">
                    {getStatusLabel(incident.status)}
                  </Badge>
                  <Badge variant="secondary">
                    {getTypeLabel(incident.type)}
                  </Badge>
                </div>
                
                <div className="text-sm text-muted-foreground space-y-1">
                  {incident.location && (
                    <p className="flex items-center gap-1">
                      📍 {incident.location}
                    </p>
                  )}
                  <p className="flex items-center gap-1">
                    🕒 {formatDate(incident.created_at)}
                  </p>
                  <p className="flex items-center gap-1">
                    👤 {incident.profiles?.full_name || 'Usuario desconocido'}
                  </p>
                </div>

                {incident.description && (
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {incident.description}
                  </p>
                )}

                {/* BOTONES CORREGIDOS - Esta es la parte importante */}
                <div className="flex gap-2 pt-2">
                  <Link href={`/incidents/${incident.id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">
                      Ver Detalles
                    </Button>
                  </Link>
                  {incident.status !== 'closed' && incident.status !== 'resolved' && (
                    <Link href={`/incidents/${incident.id}/edit`} className="flex-1">
                      <Button size="sm" className="w-full">
                        Actualizar
                      </Button>
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Resumen de estadísticas */}
      {incidents.length > 0 && (
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="text-sm text-muted-foreground">Abiertos</div>
            <div className="text-2xl font-bold text-red-600">
              {incidents.filter(i => i.status === 'open').length}
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-muted-foreground">En Progreso</div>
            <div className="text-2xl font-bold text-yellow-600">
              {incidents.filter(i => i.status === 'in_progress').length}
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-muted-foreground">Resueltos</div>
            <div className="text-2xl font-bold text-green-600">
              {incidents.filter(i => i.status === 'resolved').length}
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-muted-foreground">Críticos</div>
            <div className="text-2xl font-bold text-red-600">
              {incidents.filter(i => i.severity === 'critical').length}
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}