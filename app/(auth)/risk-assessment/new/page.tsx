// app/(auth)/risk-assessment/new/page.tsx

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea' // Aunque no la usemos de inmediato, es útil tenerla
import { toast } from 'sonner'
import {
  ArrowLeft,
  Save,
  Loader2,
  ClipboardList
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'

export default function NewRiskAssessmentPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const supabase = createClient()

  // Form state
  const [formData, setFormData] = useState({
    area: '',
    task: ''
  })

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error('Debes iniciar sesión para crear una evaluación.')
        router.push('/login')
      } else {
        setUser(user)
      }
    }
    fetchUser()
  }, [])

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

    setLoading(true)

    try {
      const { data, error } = await supabase
        .from('risk_assessments')
        .insert({
          area: formData.area.trim(),
          task: formData.task.trim(),
          assessed_by: user.id,
          // company_id se podría obtener del perfil del usuario si fuera necesario
        })
        .select()
        .single() // Para obtener el objeto insertado

      if (error) throw error

      toast.success('✅ Evaluación de riesgo creada exitosamente.')
      // Redirigir a la página de detalles para añadir riesgos específicos
      router.push(`/risk-assessment/${data.id}`)

    } catch (error: any) {
      toast.error('Error al guardar la evaluación: ' + error.message)
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

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