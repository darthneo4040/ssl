'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
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
  Loader2
} from 'lucide-react'
import Link from 'next/link'
import { useEmployee, useUpdateEmployee } from '@/hooks/useEmployees'
import { Database } from '@/types/database'

export default function EditEmployeePage() {
  const params = useParams()
  const router = useRouter()
  const employeeId = params.id as string

  const { data: employee, isLoading } = useEmployee(employeeId)
  const updateMutation = useUpdateEmployee(employeeId)

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
    status: 'active' as string,
    notes: ''
  })

  useEffect(() => {
    if (employee) {
      setFormData({
        full_name: employee.full_name || '',
        cedula: employee.cedula || '',
        date_of_birth: employee.date_of_birth || '',
        gender: employee.gender || '',
        phone: employee.phone || '',
        personal_email: employee.personal_email || '',
        address: employee.address || '',
        blood_type: employee.blood_type || '',
        emergency_contact_name: employee.emergency_contact_name || '',
        emergency_contact_phone: employee.emergency_contact_phone || '',
        position: employee.position || '',
        department: employee.department || '',
        hire_date: employee.hire_date || '',
        contract_type: employee.contract_type || '',
        shift: employee.shift || '',
        status: employee.status,
        notes: employee.notes || ''
      })
    }
  }, [employee])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.full_name) { toast.error('El nombre es obligatorio'); return }

    try {
      await updateMutation.mutateAsync({
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
        contract_type: formData.contract_type as Database['public']['Tables']['employees']['Insert']['contract_type'] || null,
        shift: formData.shift as Database['public']['Tables']['employees']['Insert']['shift'] || null,
        status: formData.status as Database['public']['Tables']['employees']['Insert']['status'],
        notes: formData.notes.trim() || null
      })
      toast.success('Datos actualizados')
      router.push(`/employees/${employeeId}`)
    } catch (err) {
      toast.error('Error: ' + (err as Error).message)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin mb-4" />
        <p className="text-muted-foreground">Cargando...</p>
      </div>
    )
  }

  if (!employee) {
    return (
      <div className="p-6">
        <Card className="p-6 border-red-200 bg-red-50">
          <p className="text-red-600">Trabajador no encontrado</p>
        </Card>
        <Link href="/employees"><Button className="mt-4">Volver</Button></Link>
      </div>
    )
  }

  const saving = updateMutation.isPending

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Link href={`/employees/${employeeId}`}>
          <Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Editar Trabajador</h1>
          <p className="text-muted-foreground">Modificar datos de {employee.full_name}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6">
          <Card>
            <CardHeader><CardTitle>Datos Personales</CardTitle><CardDescription>Información personal del trabajador</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Nombre Completo *</Label>
                  <Input value={formData.full_name} onChange={(e) => handleChange('full_name', e.target.value)} required disabled={saving} />
                </div>
                <div>
                  <Label>Cédula</Label>
                  <Input value={formData.cedula} onChange={(e) => handleChange('cedula', e.target.value)} disabled={saving} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Fecha de Nacimiento</Label>
                  <Input type="date" value={formData.date_of_birth} onChange={(e) => handleChange('date_of_birth', e.target.value)} disabled={saving} />
                </div>
                <div>
                  <Label>Género</Label>
                  <Select value={formData.gender} onValueChange={(v) => handleChange('gender', v)} disabled={saving}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Masculino</SelectItem>
                      <SelectItem value="female">Femenino</SelectItem>
                      <SelectItem value="other">Otro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Tipo de Sangre</Label>
                  <Select value={formData.blood_type} onValueChange={(v) => handleChange('blood_type', v)} disabled={saving}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A+">A+</SelectItem><SelectItem value="A-">A-</SelectItem>
                      <SelectItem value="B+">B+</SelectItem><SelectItem value="B-">B-</SelectItem>
                      <SelectItem value="AB+">AB+</SelectItem><SelectItem value="AB-">AB-</SelectItem>
                      <SelectItem value="O+">O+</SelectItem><SelectItem value="O-">O-</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><Label>Teléfono</Label><Input value={formData.phone} onChange={(e) => handleChange('phone', e.target.value)} disabled={saving} /></div>
                <div><Label>Email</Label><Input type="email" value={formData.personal_email} onChange={(e) => handleChange('personal_email', e.target.value)} disabled={saving} /></div>
              </div>
              <div>
                <Label>Dirección</Label>
                <Textarea rows={2} value={formData.address} onChange={(e) => handleChange('address', e.target.value)} disabled={saving} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Contacto de Emergencia</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><Label>Nombre</Label><Input value={formData.emergency_contact_name} onChange={(e) => handleChange('emergency_contact_name', e.target.value)} disabled={saving} /></div>
                <div><Label>Teléfono</Label><Input value={formData.emergency_contact_phone} onChange={(e) => handleChange('emergency_contact_phone', e.target.value)} disabled={saving} /></div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Datos Laborales</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><Label>Cargo</Label><Input value={formData.position} onChange={(e) => handleChange('position', e.target.value)} disabled={saving} /></div>
                <div><Label>Departamento</Label><Input value={formData.department} onChange={(e) => handleChange('department', e.target.value)} disabled={saving} /></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div><Label>Fecha Ingreso</Label><Input type="date" value={formData.hire_date} onChange={(e) => handleChange('hire_date', e.target.value)} disabled={saving} /></div>
                <div>
                  <Label>Contrato</Label>
                  <Select value={formData.contract_type} onValueChange={(v) => handleChange('contract_type', v)} disabled={saving}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="permanent">Fijo</SelectItem>
                      <SelectItem value="temporary">Temporal</SelectItem>
                      <SelectItem value="outsourced">Tercerizado</SelectItem>
                      <SelectItem value="intern">Pasantía</SelectItem>
                      <SelectItem value="freelance">Freelance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Turno</Label>
                  <Select value={formData.shift} onValueChange={(v) => handleChange('shift', v)} disabled={saving}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="morning">Matutino</SelectItem>
                      <SelectItem value="afternoon">Vespertino</SelectItem>
                      <SelectItem value="night">Nocturno</SelectItem>
                      <SelectItem value="rotating">Rotativo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Status</Label>
                  <Select value={formData.status} onValueChange={(v) => handleChange('status', v)} disabled={saving}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Activo</SelectItem>
                      <SelectItem value="inactive">Inactivo</SelectItem>
                      <SelectItem value="suspended">Suspendido</SelectItem>
                      <SelectItem value="retired">Jubilado</SelectItem>
                      <SelectItem value="discharged">Retirado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Notas</Label>
                <Textarea rows={3} value={formData.notes} onChange={(e) => handleChange('notes', e.target.value)} disabled={saving} />
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-3 justify-end">
            <Link href={`/employees/${employeeId}`}>
              <Button type="button" variant="outline" disabled={saving}>Cancelar</Button>
            </Link>
            <Button type="submit" disabled={saving}>
              {saving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Guardando...</> : <><Save className="h-4 w-4 mr-2" />Guardar Cambios</>}
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}
