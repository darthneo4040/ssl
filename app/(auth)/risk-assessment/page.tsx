// app/(auth)/risk-assessment/page.tsx

'use client'

import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Plus,
  ClipboardList,
  Loader2,
  AlertCircle,
  CalendarDays,
  User,
  ShieldCheck,
  TrendingUp
} from 'lucide-react'
import { useRiskAssessments } from '@/hooks/useRiskAssessments'

export default function RiskAssessmentPage() {
  const { data: assessments = [], isLoading: loading, error } = useRiskAssessments()

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-VE', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    })
  }

  return (
    <div className="min-h-screen bg-gray-50/50 pb-12">
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-200/80 pb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              Gestión de Evaluación de Riesgos
            </h1>
            <p className="text-muted-foreground mt-1 text-sm md:text-base">
              {assessments.length} {assessments.length === 1 ? 'evaluación registrada' : 'evaluaciones registradas'} para áreas y puestos de trabajo.
            </p>
          </div>
          <Link href="/risk-assessment/new" className="w-full sm:w-auto">
            <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-md shadow-blue-500/10">
              <Plus className="h-4 w-4 mr-2" />
              Nueva Evaluación
            </Button>
          </Link>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error instanceof Error ? error.message : 'No se pudieron cargar las evaluaciones de riesgo.'}
            </AlertDescription>
          </Alert>
        )}

        {/* Contenido */}
        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[400px]">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-4" />
            <p className="text-muted-foreground text-sm font-medium">Cargando evaluaciones...</p>
          </div>
        ) : assessments.length === 0 ? (
          <Card className="p-12 text-center border-slate-200/60 bg-white">
            <div className="max-w-md mx-auto space-y-4">
              <div className="h-12 w-12 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center mx-auto text-blue-500 animate-pulse">
                <ClipboardList className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-800">No hay evaluaciones registradas</h3>
                <p className="text-muted-foreground text-sm">
                  Aún no has registrado ninguna evaluación de riesgo o ART (Análisis de Riesgo de Tarea) para tus áreas de trabajo.
                </p>
              </div>
              <Link href="/risk-assessment/new" className="inline-block">
                <Button className="bg-blue-600 hover:bg-blue-500 text-white font-semibold">
                  <Plus className="h-4 w-4 mr-2" />
                  Crear Evaluación
                </Button>
              </Link>
            </div>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {assessments.map((assessment) => (
              <Card key={assessment.id} className="hover:shadow-md hover:scale-[1.01] transition-all border-slate-200/60 bg-gradient-to-br from-white to-slate-50/50 rounded-xl overflow-hidden flex flex-col justify-between group">
                <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/30 flex flex-row gap-3 items-center">
                  <div className="h-9 w-9 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0 group-hover:bg-blue-100 transition-colors">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base font-bold text-slate-800 truncate">
                      {assessment.area}
                    </CardTitle>
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mt-0.5 truncate">{assessment.task}</p>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 pt-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-2 text-xs text-slate-600 font-medium">
                    <p className="flex items-center gap-1.5">
                      <CalendarDays className="h-3.5 w-3.5 text-slate-400" />
                      <strong>Fecha:</strong> {formatDate(assessment.assessment_date)}
                    </p>
                    <p className="flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5 text-slate-400" />
                      <strong>Evaluador:</strong> {assessment.profiles?.full_name || 'No asignado'}
                    </p>
                  </div>
                  
                  <div className="pt-4 border-t border-slate-100">
                    <Link href={`/risk-assessment/${assessment.id}`}>
                      <Button variant="outline" size="sm" className="w-full text-xs font-semibold bg-white border-slate-200 hover:bg-slate-50">
                        Ver Detalles e IPER
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}