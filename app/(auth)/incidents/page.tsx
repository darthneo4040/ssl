'use client'

import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
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
  AlertCircle,
  User,
  MapPin,
  CalendarDays
} from 'lucide-react'
import { useIncidents } from '@/hooks/useIncidents'

export default function IncidentsPage() {
  const { data: incidents = [], isLoading: loading, error, refetch } = useIncidents()

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-50 text-red-700 border-red-200'
      case 'high': return 'bg-orange-50 text-orange-700 border-orange-200'
      case 'medium': return 'bg-amber-50 text-amber-700 border-amber-200'
      case 'low': return 'bg-green-50 text-green-700 border-green-200'
      default: return 'bg-slate-50 text-slate-700 border-slate-200'
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
      case 'in_progress': return <Clock className="h-4 w-4 text-yellow-500 animate-spin-slow" />
      case 'resolved': return <CheckCircle className="h-4 w-4 text-emerald-500" />
      case 'closed': return <CheckCircle className="h-4 w-4 text-slate-500" />
      default: return <AlertCircle className="h-4 w-4 text-slate-500" />
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-red-50 text-red-700 border-red-100'
      case 'in_progress': return 'bg-yellow-50 text-yellow-700 border-yellow-100'
      case 'resolved': return 'bg-green-50 text-green-700 border-green-100'
      case 'closed': return 'bg-slate-50 text-slate-700 border-slate-200'
      default: return 'bg-slate-50 text-slate-700 border-slate-200'
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

    if (diffMinutes < 60) {
      return `Hace ${diffMinutes} ${diffMinutes === 1 ? 'minuto' : 'minutos'}`
    } else if (diffHours < 24) {
      return `Hace ${diffHours} ${diffHours === 1 ? 'hora' : 'horas'}`
    } else if (diffDays < 7) {
      return `Hace ${diffDays} ${diffDays === 1 ? 'día' : 'días'}`
    }

    return date.toLocaleDateString('es-VE', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-4" />
        <p className="text-muted-foreground text-sm font-medium">Cargando incidentes...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50/50 pb-12">
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-200/80 pb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              Gestión de Incidentes
            </h1>
            <p className="text-muted-foreground mt-1 text-sm md:text-base">
              {incidents.length} {incidents.length === 1 ? 'incidente registrado' : 'incidentes registrados'} en el sistema.
            </p>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button variant="outline" size="sm" onClick={() => refetch()} className="bg-white border-slate-200 flex-1 sm:flex-none">
              <RefreshCw className="h-4 w-4 mr-2 text-slate-500" />
              Actualizar
            </Button>
            <Button variant="outline" size="sm" className="bg-white border-slate-200 flex-1 sm:flex-none">
              <Filter className="h-4 w-4 mr-2 text-slate-500" />
              Filtrar
            </Button>
            <Link href="/incidents/new" className="flex-1 sm:flex-none">
              <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-md shadow-blue-500/10">
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
              Error: {error instanceof Error ? error.message : 'No se pudieron cargar los incidentes.'}
            </AlertDescription>
          </Alert>
        )}

        {/* Lista de Incidentes */}
        {incidents.length === 0 ? (
          <Card className="p-12 text-center border-slate-200/60 bg-white">
            <div className="max-w-md mx-auto space-y-4">
              <div className="h-12 w-12 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto text-amber-500 animate-pulse">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-800">No hay incidentes registrados</h3>
                <p className="text-muted-foreground text-sm">
                  La bitácora de novedades y sucesos laborales está vacía. Reporta un incidente para comenzar.
                </p>
              </div>
              <Link href="/incidents/new" className="inline-block">
                <Button className="bg-blue-600 hover:bg-blue-500 text-white font-semibold">
                  <Plus className="h-4 w-4 mr-2" />
                  Reportar Incidente
                </Button>
              </Link>
            </div>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {incidents.map((incident) => (
              <Card key={incident.id} className="hover:shadow-md hover:scale-[1.01] transition-all border-slate-200/60 bg-gradient-to-br from-white to-slate-50/50 rounded-xl overflow-hidden flex flex-col justify-between group">
                <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/30">
                  <div className="flex justify-between items-start gap-4">
                    <CardTitle className="text-base font-bold text-slate-800 line-clamp-2 flex-1 group-hover:text-blue-600 transition-colors">
                      {incident.title}
                    </CardTitle>
                    <div className="shrink-0 mt-0.5">
                      {getStatusIcon(incident.status)}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 pt-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <Badge variant="outline" className={`text-[10px] font-semibold py-0.5 px-2 rounded-full border ${getSeverityColor(incident.severity || 'medium')}`}>
                        {getSeverityLabel(incident.severity || 'medium')}
                      </Badge>
                      <Badge variant="outline" className={`text-[10px] font-semibold py-0.5 px-2 rounded-full border ${getStatusColor(incident.status)}`}>
                        {getStatusLabel(incident.status)}
                      </Badge>
                      <Badge variant="outline" className="text-[10px] font-semibold py-0.5 px-2 rounded-full border border-slate-200 bg-white text-slate-600">
                        {getTypeLabel(incident.type || 'accident')}
                      </Badge>
                    </div>
                    
                    <div className="text-[11px] text-muted-foreground space-y-1.5 font-medium">
                      {incident.location && (
                        <p className="flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5 text-slate-400" />
                          {incident.location}
                        </p>
                      )}
                      <p className="flex items-center gap-1.5">
                        <CalendarDays className="h-3.5 w-3.5 text-slate-400" />
                        {formatDate(incident.created_at)}
                      </p>
                      <p className="flex items-center gap-1.5">
                        <User className="h-3.5 w-3.5 text-slate-400" />
                        {incident.profiles?.full_name || 'Usuario ocupacional'}
                      </p>
                    </div>
     
                    {incident.description && (
                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                        {incident.description}
                      </p>
                    )}
                  </div>
   
                  <div className="flex gap-2 pt-4 border-t border-slate-100">
                    <Link href={`/incidents/${incident.id}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full text-xs font-semibold bg-white border-slate-200 hover:bg-slate-50">
                        Ver Detalles
                      </Button>
                    </Link>
                    {incident.status !== 'closed' && incident.status !== 'resolved' && (
                      <Link href={`/incidents/${incident.id}/edit`} className="flex-1">
                        <Button size="sm" className="w-full text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-xs">
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
            <Card className="p-4 border-slate-200/60 shadow-xs bg-white">
              <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Abiertos</div>
              <div className="text-2xl font-extrabold text-red-600 mt-1">
                {incidents.filter(i => i.status === 'open').length}
              </div>
            </Card>
            <Card className="p-4 border-slate-200/60 shadow-xs bg-white">
              <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">En Progreso</div>
              <div className="text-2xl font-extrabold text-yellow-600 mt-1">
                {incidents.filter(i => i.status === 'in_progress').length}
              </div>
            </Card>
            <Card className="p-4 border-slate-200/60 shadow-xs bg-white">
              <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Resueltos</div>
              <div className="text-2xl font-extrabold text-emerald-600 mt-1">
                {incidents.filter(i => i.status === 'resolved').length}
              </div>
            </Card>
            <Card className="p-4 border-slate-200/60 shadow-xs bg-white">
              <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Críticos / Altos</div>
              <div className="text-2xl font-extrabold text-red-600 mt-1">
                {incidents.filter(i => i.severity === 'critical' || i.severity === 'high').length}
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}