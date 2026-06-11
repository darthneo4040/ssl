'use client'

import { useState } from 'react'
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
  User,
  Loader2
} from 'lucide-react'
import Link from 'next/link'
import { useCreateEmployee } from '@/hooks/useEmployees'
import { Database } from '@/types/database'

export default function NewEmployeePage() {
  const router = useRouter()
  const createMutation = useCreateEmployee()

  const [formData, setFormData] = useState({
    full_name: '',
    cedula: '',
    date_of_birth: '',
    gender: '',
    phone: '',
    personal_email: '',
    address: '',
    blood_type: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    position: '',
    department: '',
    hire_date: '',
    contract_type: '',
    shift: '',
    notes: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.full_name) {
      toast.error('El nombre del trabajador es obligatorio')
      return
    }

    try {
      await createMutation.mutateAsync({
        company_id: '550e8400-e29b-41d4-a716-446655440000',
        full_name: formData.full_name.trim(),
        cedula: formData.cedula.trim() || null,
        date_of_birth: formData.date_of_birth || null,
        gender: formData.gender || null,
        phone: formData.phone.trim() || null,
        personal_email: formData.personal_email.trim() || null,
        address: formData.address.trim() || null,
        blood_type: formData.blood_type || null,
        emergency_contact_name: formData.emergency_contact_name.trim() || null,
        emergency_contact_phone: formData.emergency_contact_phone.trim() || null,
        position: formData.position.trim() || null,
        department: formData.department.trim() || null,
        hire_date: formData.hire_date || null,
        contract_type: (formData.contract_type as Database['public']['Tables']['employees']['Insert']['contract_type']) || null,
        shift: (formData.shift as Database['public']['Tables']['employees']['Insert']['shift']) || null,
        notes: formData.notes.trim() || null,
        status: 'active'
      })

      toast.success('Trabajador registrado exitosamente')
      router.push('/employees')
    } catch (error) {
      toast.error('Error al registrar: ' + (error as Error).message)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const loading = createMutation.isPending

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/employees">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            Registrar Nuevo Trabajador
          </h1>
          <p className="text-muted-foreground">
            Complete los datos del trabajador
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6">
          {/* Datos Personales */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Datos Personales
              </CardTitle>
              <CardDescription>
                Información personal del trabajador
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="full_name">Nombre Completo *</Label>
                  <Input
                    id="full_name"
                    placeholder="Nombres y apellidos"
                    value={formData.full_name}
                    onChange={(e) => handleChange('full_name', e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
                <div>
                  <Label htmlFor="cedula">Cédula de Identidad</Label>
                  <Input
                    id="cedula"
                    placeholder="V-12345678"
                    value={formData.cedula}
                    onChange={(e) => handleChange('cedula', e.target.value)}
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="date_of_birth">Fecha de Nacimiento</Label>
                  <Input
                    id="date_of_birth"
                    type="date"
                    value={formData.date_of_birth}
                    onChange={(e) => handleChange('date_of_birth', e.target.value)}
                    disabled={loading}
                  />
                </div>
                <div>
                  <Label htmlFor="gender">Género</Label>
                  <Select
                    value={formData.gender}
                    onValueChange={(value) => handleChange('gender', value)}
                    disabled={loading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Masculino</SelectItem>
                      <SelectItem value="female">Femenino</SelectItem>
                      <SelectItem value="other">Otro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="blood_type">Tipo de Sangre</Label>
                  <Select
                    value={formData.blood_type}
                    onValueChange={(value) => handleChange('blood_type', value)}
                    disabled={loading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A+">A+</SelectItem>
                      <SelectItem value="A-">A-</SelectItem>
                      <SelectItem value="B+">B+</SelectItem>
                      <SelectItem value="B-">B-</SelectItem>
                      <SelectItem value="AB+">AB+</SelectItem>
                      <SelectItem value="AB-">AB-</SelectItem>
                      <SelectItem value="O+">O+</SelectItem>
                      <SelectItem value="O-">O-</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">Teléfono</Label>
                  <Input
                    id="phone"
                    placeholder="0412-1234567"
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    disabled={loading}
                  />
                </div>
                <div>
                  <Label htmlFor="personal_email">Correo Electrónico</Label>
                  <Input
                    id="personal_email"
                    type="email"
                    placeholder="correo@ejemplo.com"
                    value={formData.personal_email}
                    onChange={(e) => handleChange('personal_email', e.target.value)}
                    disabled={loading}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="address">Dirección</Label>
                <Textarea
                  id="address"
                  placeholder="Dirección de habitación"
                  rows={2}
                  value={formData.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                  disabled={loading}
                />
              </div>
            </CardContent>
          </Card>

          {/* Contacto de Emergencia */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Contacto de Emergencia
              </CardTitle>
              <CardDescription>
                Persona a contactar en caso de emergencia
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="emergency_contact_name">Nombre</Label>
                  <Input
                    id="emergency_contact_name"
                    placeholder="Nombre completo"
                    value={formData.emergency_contact_name}
                    onChange={(e) => handleChange('emergency_contact_name', e.target.value)}
                    disabled={loading}
                  />
                </div>
                <div>
                  <Label htmlFor="emergency_contact_phone">Teléfono</Label>
                  <Input
                    id="emergency_contact_phone"
                    placeholder="0412-1234567"
                    value={formData.emergency_contact_phone}
                    onChange={(e) => handleChange('emergency_contact_phone', e.target.value)}
                    disabled={loading}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Datos Laborales */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Datos Laborales
              </CardTitle>
              <CardDescription>
                Información del puesto y condiciones de trabajo
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="position">Cargo / Puesto</Label>
                  <Input
                    id="position"
                    placeholder="Ej: Operador de producción"
                    value={formData.position}
                    onChange={(e) => handleChange('position', e.target.value)}
                    disabled={loading}
                  />
                </div>
                <div>
                  <Label htmlFor="department">Departamento / Área</Label>
                  <Input
                    id="department"
                    placeholder="Ej: Producción"
                    value={formData.department}
                    onChange={(e) => handleChange('department', e.target.value)}
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="hire_date">Fecha de Ingreso</Label>
                  <Input
                    id="hire_date"
                    type="date"
                    value={formData.hire_date}
                    onChange={(e) => handleChange('hire_date', e.target.value)}
                    disabled={loading}
                  />
                </div>
                <div>
                  <Label htmlFor="contract_type">Tipo de Contrato</Label>
                  <Select
                    value={formData.contract_type}
                    onValueChange={(value) => handleChange('contract_type', value)}
                    disabled={loading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="permanent">Fijo / Indefinido</SelectItem>
                      <SelectItem value="temporary">Temporal</SelectItem>
                      <SelectItem value="outsourced">Tercerizado</SelectItem>
                      <SelectItem value="intern">Pasantía</SelectItem>
                      <SelectItem value="freelance">Freelance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="shift">Turno</Label>
                  <Select
                    value={formData.shift}
                    onValueChange={(value) => handleChange('shift', value)}
                    disabled={loading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="morning">Matutino</SelectItem>
                      <SelectItem value="afternoon">Vespertino</SelectItem>
                      <SelectItem value="night">Nocturno</SelectItem>
                      <SelectItem value="rotating">Rotativo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="notes">Notas / Observaciones</Label>
                <Textarea
                  id="notes"
                  placeholder="Información adicional relevante"
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => handleChange('notes', e.target.value)}
                  disabled={loading}
                />
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-3 justify-end">
            <Link href="/employees">
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
                  Registrar Trabajador
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}
