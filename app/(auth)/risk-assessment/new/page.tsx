// app/(auth)/risk-assessment/new/page.tsx

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import {
  ArrowLeft,
  Save,
  Loader2,
  ClipboardList
} from 'lucide-react'
import { useAuth } from '@/components/providers/auth-provider'
import { useCreateRiskAssessment } from '@/hooks/useRiskAssessments'

export default function NewRiskAssessmentPage() {
  const router = useRouter()
  const { user } = useAuth()
  const createAssessmentMutation = useCreateRiskAssessment()

  // Form state
  const [formData, setFormData] = useState({
    area: '',
    task: ''
  })

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      toast.error('Sesión no encontrada. Por favor, inicia sesión de nuevo.')
      return
    }

    if (!formData.area || !formData.task) {
        toast.error('Por favor, completa todos los campos requeridos.')
        return
    }

    try {
      const data = await createAssessmentMutation.mutateAsync({
        area: formData.area.trim(),
        task: formData.task.trim(),
        assessed_by: user.id,
        company_id: '550e8400-e29b-41d4-a716-446655440000', // Demo company
      })

      toast.success('✅ Evaluación de riesgo creada exitosamente.')
      router.push(`/risk-assessment/${data.id}`)
    } catch (error) {
      toast.error('Error al guardar la evaluación: ' + (error as Error).message)
      console.error(error)
    }
  }

  const loading = createAssessmentMutation.isPending

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/risk-assessment">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Nueva Evaluación de Riesgos
          </h1>
          <p className="text-muted-foreground">
            Completa los datos iniciales para comenzar la evaluación.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5" />
              Información General
            </CardTitle>
            <CardDescription>
              Define el área y la tarea que serán evaluadas. Los riesgos específicos se añadirán en el siguiente paso.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="area">Área / Ubicación*</Label>
              <Input
                id="area"
                placeholder="Ej: Taller de soldadura, Almacén principal"
                value={formData.area}
                onChange={(e) => handleChange('area', e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div>
              <Label htmlFor="task">Tarea / Proceso*</Label>
              <Input
                id="task"
                placeholder="Ej: Manejo de montacargas, Limpieza de tanques"
                value={formData.task}
                onChange={(e) => handleChange('task', e.target.value)}
                required
                disabled={loading}
              />
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-3 justify-end mt-6">
          <Link href="/risk-assessment">
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
                Guardar y Continuar
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}