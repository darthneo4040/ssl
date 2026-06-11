'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  FileText,
  TrendingUp,
  Activity,
  Loader2,
  Calendar,
  Sparkles,
  ArrowUpRight,
  ClipboardList
} from 'lucide-react'
import { useIncidents } from '@/hooks/useIncidents'
import { useDocuments } from '@/hooks/useDocuments'
import { useRiskAssessments } from '@/hooks/useRiskAssessments'
import Link from 'next/link'

export default function DashboardPage() {
  const { data: incidents = [], isLoading: loadingIncidents } = useIncidents()
  const { data: documents = [], isLoading: loadingDocs } = useDocuments()
  const { data: assessments = [], isLoading: loadingAssessments } = useRiskAssessments()

  const loading = loadingIncidents || loadingDocs || loadingAssessments

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-4" />
        <p className="text-muted-foreground text-sm font-medium">Cargando panel de control...</p>
      </div>
    )
  }

  // Calcular estadísticas dinámicas
  const activeIncidents = incidents.filter(i => i.status === 'open' || i.status === 'in_progress')
  const criticalOrHighIncidents = activeIncidents.filter(i => i.severity === 'critical' || i.severity === 'high')
  const documentsUnderReview = documents.filter(d => d.status === 'under_review')
  const totalAssessments = assessments.length

  const stats = [
    {
      title: "Días sin Accidentes",
      value: "127", // Simulado / Constante para demo
      description: "Último accidente: 15/06/2024",
      icon: CheckCircle,
      color: "text-emerald-600",
      bgBubble: "bg-emerald-50",
      badge: "Excelente"
    },
    {
      title: "Incidentes Activos",
      value: activeIncidents.length.toString(),
      description: `${criticalOrHighIncidents.length} de alta criticidad`,
      icon: AlertTriangle,
      color: "text-amber-600",
      bgBubble: "bg-amber-50",
      badge: activeIncidents.length > 3 ? "Atención" : "Bajo Control"
    },
    {
      title: "Evaluaciones de Riesgo",
      value: totalAssessments.toString(),
      description: "Inspecciones en áreas de planta",
      icon: ClipboardList,
      color: "text-blue-600",
      bgBubble: "bg-blue-50",
      badge: "Al Día"
    },
    {
      title: "Documentos por Revisar",
      value: documentsUnderReview.length.toString(),
      description: "Políticas / Procedimientos pdt.",
      icon: FileText,
      color: "text-purple-600",
      bgBubble: "bg-purple-50",
      badge: "Auditable"
    }
  ]

  // Últimas actividades basadas en la base de datos
  const recentActivities = [
    ...incidents.slice(0, 3).map(inc => ({
      status: inc.status === 'resolved' || inc.status === 'closed' ? 'success' as const : 'warning' as const,
      text: `${inc.status === 'resolved' ? 'Incidente cerrado' : 'Incidente reportado'} - ${inc.title}`,
      time: new Date(inc.created_at).toLocaleDateString('es-VE'),
      location: inc.location || 'Planta'
    })),
    ...assessments.slice(0, 2).map(ass => ({
      status: 'info' as const,
      text: `Inspección de riesgos finalizada - ${ass.area}`,
      time: new Date(ass.assessment_date).toLocaleDateString('es-VE'),
      location: ass.area
    }))
  ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 5)

  return (
    <div className="min-h-screen bg-gray-50/50 pb-12">
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-200/85 pb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
              Panel de Control SSL
            </h1>
            <p className="text-muted-foreground mt-1 text-sm md:text-base">
              Métricas clave de prevención, incidentes en planta y cumplimiento legal.
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/reports">
              <Button size="sm" className="bg-blue-600 hover:bg-blue-500 text-white font-semibold flex items-center gap-1.5 shadow-md shadow-blue-500/10">
                <TrendingUp className="h-4 w-4" />
                Ver Reportes Completos
              </Button>
            </Link>
          </div>
        </div>
        
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <Card key={index} className="border-slate-200/60 shadow-xs hover:shadow-md hover:scale-[1.01] transition-all relative overflow-hidden bg-gradient-to-br from-white to-slate-50/50 group">
                <div className={`absolute top-0 right-0 w-24 h-24 ${stat.bgBubble} rounded-full -mr-8 -mt-8 -z-10 group-hover:scale-110 transition-transform`} />
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    {stat.title}
                  </CardTitle>
                  <Icon className={`h-4.5 w-4.5 ${stat.color} animate-pulse`} />
                </CardHeader>
                <CardContent className="space-y-1">
                  <div className="text-3xl font-extrabold text-slate-800">{stat.value}</div>
                  <div className="flex justify-between items-center pt-1.5">
                    <p className="text-[10px] text-muted-foreground line-clamp-1">
                      {stat.description}
                    </p>
                    <Badge variant="outline" className={`text-[9px] px-1.5 py-0 rounded-full font-semibold border-slate-200 bg-white ${stat.color}`}>
                      {stat.badge}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Dynamic Activity and metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Recent Activity */}
          <Card className="lg:col-span-7 border-slate-200/60 shadow-sm bg-gradient-to-br from-white to-slate-50/50">
            <CardHeader className="border-b border-slate-100/80">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-base font-bold text-slate-800 flex items-center gap-2">
                    <Activity className="h-5 w-5 text-blue-600" />
                    Bitácora de Actividad Reciente
                  </CardTitle>
                  <CardDescription className="text-xs">Monitoreo de inspecciones y reportes de seguridad en tiempo real.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-3.5">
                {recentActivities.length > 0 ? (
                  recentActivities.map((item, index) => (
                    <div key={index} className="flex items-start gap-3 text-xs p-3 bg-white border border-slate-100 rounded-xl hover:shadow-xs transition-shadow">
                      <div className={`w-2.5 h-2.5 mt-1 rounded-full shrink-0 ${
                        item.status === 'success' ? 'bg-green-500 animate-pulse' :
                        item.status === 'warning' ? 'bg-amber-500 animate-pulse' : 'bg-blue-500'
                      }`} />
                      <div className="flex-1 space-y-1">
                        <p className="font-semibold text-slate-800">{item.text}</p>
                        <div className="flex items-center gap-3 text-[10px] text-muted-foreground font-medium">
                          <span className="flex items-center gap-1">🕒 {item.time}</span>
                          <span className="flex items-center gap-1">📍 {item.location}</span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground py-6 text-center">
                    No se registran eventos ni inspecciones recientes.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Monthly Metrics Summary */}
          <Card className="lg:col-span-5 border-slate-200/60 shadow-sm bg-gradient-to-br from-white to-slate-50/50">
            <CardHeader className="border-b border-slate-100/80">
              <div>
                <CardTitle className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-indigo-600" />
                  Resumen de Indicadores
                </CardTitle>
                <CardDescription className="text-xs">Estadísticas consolidadas de la base de datos.</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-5">
              
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-semibold text-slate-600">
                  <span>Incidentes Totales</span>
                  <span>{incidents.length}</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden flex">
                  <div className="bg-red-500 h-full rounded-full" style={{ width: `${Math.min(100, incidents.length * 10)}%` }} />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs font-semibold text-slate-600">
                  <span>Evaluaciones de Área</span>
                  <span>{totalAssessments}</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden flex">
                  <div className="bg-blue-500 h-full rounded-full" style={{ width: `${Math.min(100, totalAssessments * 15)}%` }} />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs font-semibold text-slate-600">
                  <span>Documentos Registrados</span>
                  <span>{documents.length}</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden flex">
                  <div className="bg-purple-500 h-full rounded-full" style={{ width: `${Math.min(100, documents.length * 8)}%` }} />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <Link href="/reports?tab=predictive">
                  <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-between text-xs text-blue-700 font-bold hover:bg-blue-100/80 transition-colors cursor-pointer group">
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="h-4 w-4 text-blue-600 animate-spin" />
                      Recomendaciones de IA Disponibles
                    </span>
                    <ArrowUpRight className="h-4 w-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </div>
                </Link>
              </div>

            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  )
}