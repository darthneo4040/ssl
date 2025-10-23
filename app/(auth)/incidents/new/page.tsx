'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { 
  ArrowLeft,
  Save,
  Camera,
  MapPin,
  AlertTriangle,
  Loader2
} from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function NewIncidentPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [checkingAuth, setCheckingAuth] = useState(true)
  const [user, setUser] = useState<any>(null)
  const supabase = createClient()
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    severity: '',
    type: '',
    immediateAction: '',
    witnesses: ''
  })

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    try {
      // Obtener sesión actual
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        toast.error('Debes iniciar sesión')
        router.push('/login')
        return
      }

      setUser(session.user)
      
      // Verificar si el perfil existe
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single()

      if (error || !profile) {
        // Si no hay perfil, crearlo
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: session.user.id,
            company_id: '550e8400-e29b-41d4-a716-446655440000',
            full_name: session.user.email?.split('@')[0] || 'Usuario',
            role: 'inspector'
          })
        
        if (insertError) {
          console.error('Error creando perfil:', insertError)
        }
      }
    } catch (error) {
      console.error('Error verificando usuario:', error)
      toast.error('Error de autenticación')
      router.push('/login')
    } finally {
      setCheckingAuth(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Verificar sesión antes de guardar
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      toast.error('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.')
      router.push('/login')
      return
    }

    setLoading(true)

    try {
      // Obtener el perfil actualizado
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single()

      if (!profile) {
        throw new Error('No se encontró el perfil del usuario')
      }

      // Guardar el incidente
      const { data, error } = await supabase
        .from('incidents')
        .insert({
          company_id: profile.company_id || '550e8400-e29b-41d4-a716-446655440000',
          reported_by: session.user.id,
          title: formData.title,
          description: formData.description,
          location: formData.location,
          severity: formData.severity || 'medium',
          type: formData.type || 'accident',
          immediate_action: formData.immediateAction || null,
          witnesses: formData.witnesses || null,
          occurred_at: new Date().toISOString(),
          status: 'open'
        })
        .select()

      if (error) {
        console.error('Error de Supabase:', error)
        throw error
      }

      toast.success('✅ Incidente reportado exitosamente')
      
      // Pequeña espera antes de redirigir
      setTimeout(() => {
        router.push('/incidents')
      }, 1000)
      
    } catch (error: any) {
      console.error('Error completo:', error)
      toast.error(error.message || 'Error al guardar el incidente')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // Mostrar loading mientras verifica autenticación
  if (checkingAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/incidents">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            Reportar Nuevo Incidente
          </h1>
          <p className="text-muted-foreground">
            Complete el formulario para registrar el incidente
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
                <Label htmlFor="title">Título del Incidente*</Label>
                <Input
                  id="title"
                  placeholder="Describa brevemente lo ocurrido"
                  value={formData.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="type">Tipo de Incidente*</Label>
                  <Select 
                    value={formData.type}
                    onValueChange={(value) => handleChange('type', value)}
                    disabled={loading}
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
                  <Label htmlFor="severity">Severidad*</Label>
                  <Select 
                    value={formData.severity}
                    onValueChange={(value) => handleChange('severity', value)}
                    disabled={loading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Nivel de severidad" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="critical">Crítico - Requiere acción inmediata</SelectItem>
                      <SelectItem value="high">Alto - Muy urgente</SelectItem>
                      <SelectItem value="medium">Medio - Urgente</SelectItem>
                      <SelectItem value="low">Bajo - No urgente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Descripción Detallada*</Label>
                <Textarea
                  id="description"
                  placeholder="Proporcione todos los detalles relevantes del incidente..."
                  rows={4}
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  required
                  disabled={loading}
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
                <Label htmlFor="location">Ubicación Exacta*</Label>
                <Input
                  id="location"
                  placeholder="Ej: Almacén B, Sección 3, cerca del montacargas"
                  value={formData.location}
                  onChange={(e) => handleChange('location', e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <Label htmlFor="witnesses">Testigos (opcional)</Label>
                <Textarea
                  id="witnesses"
                  placeholder="Nombre y cargo de las personas que presenciaron el incidente"
                  rows={2}
                  value={formData.witnesses}
                  onChange={(e) => handleChange('witnesses', e.target.value)}
                  disabled={loading}
                />
              </div>

              <div>
                <Label htmlFor="immediateAction">Acciones Inmediatas Tomadas</Label>
                <Textarea
                  id="immediateAction"
                  placeholder="¿Qué medidas se tomaron inmediatamente después del incidente?"
                  rows={3}
                  value={formData.immediateAction}
                  onChange={(e) => handleChange('immediateAction', e.target.value)}
                  disabled={loading}
                />
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-3 justify-end">
            <Link href="/incidents">
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
                  Reportar Incidente
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}