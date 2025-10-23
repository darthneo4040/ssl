// app/(auth)/risk-assessment/page.tsx

'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Plus,
  ClipboardList,
  Loader2,
  AlertCircle
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

// Tipo para una evaluación de riesgo (simplificado por ahora)
type Assessment = {
  id: string
  area: string
  task: string
  assessment_date: string
  profiles: { full_name: string } | null
}

export default function RiskAssessmentPage() {
  const [assessments, setAssessments] = useState<Assessment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    loadAssessments()
  }, [])

  const loadAssessments = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('risk_assessments')
        .select(`
          id,
          area,
          task,
          assessment_date,
          profiles (
            full_name
          )
        `)
        .order('assessment_date', { ascending: false })

      if (fetchError) throw fetchError
      setAssessments(data || [])

    } catch (err: any) {
      setError('No se pudieron cargar las evaluaciones de riesgo.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-VE', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    })
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Gestión de Evaluación de Riesgos
          </h1>
          <p className="text-muted-foreground mt-1">
            {assessments.length} {assessments.length === 1 ? 'evaluación registrada' : 'evaluaciones registradas'}
          </p>
        </div>
        <Link href="/risk-assessment/new">
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Nueva Evaluación
          </Button>
        </Link>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Contenido */}
      {loading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : assessments.length === 0 ? (
        <Card className="text-center p-8">
            <ClipboardList className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No hay evaluaciones de riesgo</h3>
            <p className="text-muted-foreground mb-4">
              Comienza creando la primera evaluación de riesgo para un área o tarea.
            </p>
            <Link href="/risk-assessment/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Crear Evaluación
              </Button>
            </Link>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {assessments.map((assessment) => (
            <Card key={assessment.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-base line-clamp-2">
                  {assessment.area}
                </CardTitle>
                <p className="text-sm text-muted-foreground pt-1">{assessment.task}</p>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground space-y-2">
                  <p><strong>Fecha:</strong> {formatDate(assessment.assessment_date)}</p>
                  <p><strong>Realizado por:</strong> {assessment.profiles?.full_name || 'No asignado'}</p>
                </div>
                <div className="flex gap-2 pt-4">
                  <Link href={`/risk-assessment/${assessment.id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">
                      Ver Detalles
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}