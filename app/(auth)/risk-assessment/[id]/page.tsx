// app/(auth)/risk-assessment/[id]/page.tsx

'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import {
  ArrowLeft,
  Plus,
  Loader2,
  AlertCircle,
  Trash2
} from 'lucide-react'
import { useRiskAssessment, useIdentifiedRisks, useAddIdentifiedRisk, useDeleteIdentifiedRisk } from '@/hooks/useRiskAssessments'

export default function RiskAssessmentDetailPage() {
  const params = useParams()
  const assessmentId = params.id as string

  const { data: assessment, isLoading: loadingAssessment, error: errorAssessment } = useRiskAssessment(assessmentId)
  const { data: risks = [], isLoading: loadingRisks } = useIdentifiedRisks(assessmentId)

  const addRiskMutation = useAddIdentifiedRisk(assessmentId)
  const deleteRiskMutation = useDeleteIdentifiedRisk(assessmentId)

  // Estado para el formulario de nuevo riesgo
  const [newRiskData, setNewRiskData] = useState({
    description: '',
    probability: '3',
    severity: '3',
  })

  const handleNewRiskChange = (field: string, value: string) => {
    setNewRiskData(prev => ({ ...prev, [field]: value }))
  }

  const handleAddNewRisk = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newRiskData.description) {
      toast.error('La descripción del riesgo es obligatoria.')
      return
    }

    try {
      await addRiskMutation.mutateAsync({
        assessment_id: assessmentId,
        description: newRiskData.description.trim(),
        probability: parseInt(newRiskData.probability, 10),
        severity: parseInt(newRiskData.severity, 10),
      })
      
      toast.success('Riesgo añadido correctamente.')
      setNewRiskData({ description: '', probability: '3', severity: '3' }) // Resetear formulario
    } catch (err) {
      toast.error('Error al guardar el riesgo: ' + (err as Error).message)
    }
  }

  const handleDeleteRisk = async (riskId: string) => {
    try {
      await deleteRiskMutation.mutateAsync(riskId)
      toast.success('Riesgo eliminado correctamente.')
    } catch (err) {
      toast.error('Error al eliminar el riesgo: ' + (err as Error).message)
    }
  }

  const getRiskLevel = (probability: number, severity: number): { label: string; color: string } => {
    const score = probability * severity;
    if (score > 15) return { label: 'Muy Alto', color: 'bg-red-600 text-white' };
    if (score > 9) return { label: 'Alto', color: 'bg-orange-500 text-white' };
    if (score > 4) return { label: 'Medio', color: 'bg-yellow-400 text-black' };
    return { label: 'Bajo', color: 'bg-green-500 text-white' };
  };

  const loading = loadingAssessment || loadingRisks

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (errorAssessment || !assessment) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>No se pudo cargar la evaluación de riesgo.</AlertDescription>
        </Alert>
        <Link href="/risk-assessment">
          <Button className="mt-4">Volver a Evaluaciones</Button>
        </Link>
      </div>
    )
  }

  const isSavingRisk = addRiskMutation.isPending

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/risk-assessment">
          <Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Detalles de la Evaluación</h1>
          <p className="text-sm text-muted-foreground">ID: {assessment.id.slice(0, 8)}...</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Columna principal */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Información General</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <p><strong>Área / Ubicación:</strong> {assessment.area}</p>
              <p><strong>Tarea / Proceso:</strong> {assessment.task}</p>
              <p><strong>Fecha:</strong> {new Date(assessment.assessment_date).toLocaleDateString('es-VE')}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Riesgos Identificados ({risks.length})</CardTitle>
              <CardDescription>
                Lista de riesgos asociados a esta área y tarea.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {risks.length > 0 ? (
                <div className="space-y-4">
                  {risks.map(risk => {
                    const level = getRiskLevel(risk.probability, risk.severity);
                    const isDeleting = deleteRiskMutation.isPending && deleteRiskMutation.variables === risk.id;
                    return (
                      <div key={risk.id} className="p-3 border rounded-md flex justify-between items-start">
                        <div>
                          <p className="font-medium">{risk.description}</p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                            <span>Prob: {risk.probability}</span>
                            <span>Sev: {risk.severity}</span>
                            <Badge className={`px-2 py-0.5 text-xs ${level.color}`}>{level.label}</Badge>
                          </div>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-7 w-7 text-red-500 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleDeleteRisk(risk.id)}
                          disabled={isDeleting}
                        >
                          {isDeleting ? (
                            <Loader2 className="h-4 w-4 animate-spin text-red-500" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <p className="text-sm text-center text-muted-foreground py-4">
                  Aún no se han añadido riesgos a esta evaluación.
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Columna lateral */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Añadir Nuevo Riesgo</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddNewRisk} className="space-y-4">
                <div>
                  <Label htmlFor="description">Descripción del Riesgo*</Label>
                  <Textarea
                    id="description"
                    placeholder="Ej: Caída de objetos desde altura"
                    value={newRiskData.description}
                    onChange={(e) => handleNewRiskChange('description', e.target.value)}
                    required
                    disabled={isSavingRisk}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="probability">Probabilidad</Label>
                    <Select value={newRiskData.probability} onValueChange={(v) => handleNewRiskChange('probability', v)} disabled={isSavingRisk}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 (Muy Baja)</SelectItem>
                        <SelectItem value="2">2 (Baja)</SelectItem>
                        <SelectItem value="3">3 (Media)</SelectItem>
                        <SelectItem value="4">4 (Alta)</SelectItem>
                        <SelectItem value="5">5 (Muy Alta)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="severity">Severidad</Label>
                    <Select value={newRiskData.severity} onValueChange={(v) => handleNewRiskChange('severity', v)} disabled={isSavingRisk}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 (Insignificante)</SelectItem>
                        <SelectItem value="2">2 (Menor)</SelectItem>
                        <SelectItem value="3">3 (Moderada)</SelectItem>
                        <SelectItem value="4">4 (Crítica)</SelectItem>
                        <SelectItem value="5">5 (Catastrófica)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button type="submit" disabled={isSavingRisk} className="w-full">
                  {isSavingRisk ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
                  Añadir Riesgo
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}