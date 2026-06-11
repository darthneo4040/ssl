'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import {
  ArrowLeft,
  Edit,
  User,
  Stethoscope,
  AlertTriangle,
  Loader2,
  Plus,
  Clock
} from 'lucide-react'
import { toast } from 'sonner'
import {
  useEmployee,
  useMedicalExams,
  useCreateMedicalExam,
  useOccupationalDiseases,
  useCreateOccupationalDisease,
  useAbsenteeism,
  useCreateAbsenteeism
} from '@/hooks/useEmployees'
import { Database } from '@/types/database'

export default function EmployeeDetailPage() {
  const params = useParams()
  const employeeId = params.id as string

  const { data: employee, isLoading, error } = useEmployee(employeeId)
  const { data: medicalExams = [] } = useMedicalExams(employeeId)
  const { data: diseases = [] } = useOccupationalDiseases(employeeId)
  const { data: absenteeism = [] } = useAbsenteeism(employeeId)

  const createExam = useCreateMedicalExam()
  const createDisease = useCreateOccupationalDisease()
  const createAbsence = useCreateAbsenteeism()

  // New exam form
  const [examForm, setExamForm] = useState({ exam_type: 'periodic', exam_date: '', doctor: '', center: '', results: '', observations: '' })
  // New disease form
  const [diseaseForm, setDiseaseForm] = useState({ disease_name: '', diagnosis_date: '', causal_agent: '', affected_area: '', severity: 'moderate', recommendations: '' })
  // New absenteeism form
  const [absenceForm, setAbsenceForm] = useState({ start_date: '', end_date: '', type: 'medical', reason: '', diagnosis: '', days_count: '0' })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active': return <Badge className="bg-green-100 text-green-700">Activo</Badge>
      case 'inactive': return <Badge className="bg-gray-100 text-gray-600">Inactivo</Badge>
      case 'suspended': return <Badge className="bg-yellow-100 text-yellow-700">Suspendido</Badge>
      case 'retired': return <Badge className="bg-blue-100 text-blue-700">Jubilado</Badge>
      case 'discharged': return <Badge className="bg-red-100 text-red-700">Retirado</Badge>
      default: return <Badge>{status}</Badge>
    }
  }

  const handleAddExam = async () => {
    if (!examForm.exam_date) { toast.error('Fecha del examen es obligatoria'); return }
    try {
      await createExam.mutateAsync({
        employee_id: employeeId,
        exam_type: examForm.exam_type as Database['public']['Tables']['medical_exams']['Insert']['exam_type'],
        exam_date: examForm.exam_date,
        doctor: examForm.doctor || null,
        center: examForm.center || null,
        results: examForm.results || null,
        observations: examForm.observations || null
      })
      toast.success('Examen registrado')
      setExamForm({ exam_type: 'periodic', exam_date: '', doctor: '', center: '', results: '', observations: '' })
    } catch (err) { toast.error('Error: ' + (err as Error).message) }
  }

  const handleAddDisease = async () => {
    if (!diseaseForm.disease_name || !diseaseForm.diagnosis_date) { toast.error('Nombre y fecha son obligatorios'); return }
    try {
      await createDisease.mutateAsync({
        employee_id: employeeId,
        disease_name: diseaseForm.disease_name,
        diagnosis_date: diseaseForm.diagnosis_date,
        causal_agent: diseaseForm.causal_agent || null,
        affected_area: diseaseForm.affected_area || null,
        severity: diseaseForm.severity as Database['public']['Tables']['occupational_diseases']['Insert']['severity'],
        recommendations: diseaseForm.recommendations || null
      })
      toast.success('Enfermedad registrada')
      setDiseaseForm({ disease_name: '', diagnosis_date: '', causal_agent: '', affected_area: '', severity: 'moderate', recommendations: '' })
    } catch (err) { toast.error('Error: ' + (err as Error).message) }
  }

  const handleAddAbsence = async () => {
    if (!absenceForm.start_date) { toast.error('Fecha de inicio es obligatoria'); return }
    try {
      await createAbsence.mutateAsync({
        employee_id: employeeId,
        start_date: absenceForm.start_date,
        end_date: absenceForm.end_date || null,
        type: absenceForm.type as Database['public']['Tables']['absenteeism']['Insert']['type'],
        reason: absenceForm.reason || null,
        diagnosis: absenceForm.diagnosis || null,
        days_count: parseInt(absenceForm.days_count) || 0
      })
      toast.success('Ausentismo registrado')
      setAbsenceForm({ start_date: '', end_date: '', type: 'medical', reason: '', diagnosis: '', days_count: '0' })
    } catch (err) { toast.error('Error: ' + (err as Error).message) }
  }

  const formatDate = (d: string | null | undefined) => d ? new Date(d).toLocaleDateString('es-VE') : '-'

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-4" />
        <p className="text-muted-foreground">Cargando trabajador...</p>
      </div>
    )
  }

  if (error || !employee) {
    return (
      <div className="p-6">
        <Card className="p-6 border-red-200 bg-red-50">
          <p className="text-red-600">Trabajador no encontrado</p>
        </Card>
        <Link href="/employees"><Button className="mt-4">Volver</Button></Link>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href="/employees">
            <Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{employee.full_name}</h1>
            <p className="text-sm text-muted-foreground">{employee.cedula || 'Sin cédula'} • {employee.position || 'Sin cargo'}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {getStatusBadge(employee.status)}
          <Link href={`/employees/${employeeId}/edit`}>
            <Button variant="outline" size="sm"><Edit className="h-4 w-4 mr-2" />Editar</Button>
          </Link>
        </div>
      </div>

      <Tabs defaultValue="info" className="space-y-6">
        <TabsList>
          <TabsTrigger value="info"><User className="h-4 w-4 mr-2" />Información</TabsTrigger>
          <TabsTrigger value="medical"><Stethoscope className="h-4 w-4 mr-2" />Exámenes Médicos</TabsTrigger>
          <TabsTrigger value="diseases"><AlertTriangle className="h-4 w-4 mr-2" />Enfermedades Ocupacionales</TabsTrigger>
          <TabsTrigger value="absenteeism"><Clock className="h-4 w-4 mr-2" />Ausentismo</TabsTrigger>
        </TabsList>

        {/* Tab: Información */}
        <TabsContent value="info">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader><CardTitle className="text-base">Datos Personales</CardTitle></CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Nombre</span><span className="font-medium">{employee.full_name}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Cédula</span><span className="font-medium">{employee.cedula || '-'}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Fecha de Nacimiento</span><span className="font-medium">{formatDate(employee.date_of_birth)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Género</span><span className="font-medium">{employee.gender === 'male' ? 'Masculino' : employee.gender === 'female' ? 'Femenino' : employee.gender || '-'}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Tipo de Sangre</span><span className="font-medium">{employee.blood_type || '-'}</span></div>
                <Separator />
                <div className="flex justify-between"><span className="text-muted-foreground">Teléfono</span><span className="font-medium">{employee.phone || '-'}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Email</span><span className="font-medium">{employee.personal_email || '-'}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Dirección</span><span className="font-medium text-right max-w-[250px]">{employee.address || '-'}</span></div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-base">Datos Laborales</CardTitle></CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Cargo</span><span className="font-medium">{employee.position || '-'}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Departamento</span><span className="font-medium">{employee.department || '-'}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Fecha de Ingreso</span><span className="font-medium">{formatDate(employee.hire_date)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Contrato</span><span className="font-medium capitalize">{employee.contract_type === 'permanent' ? 'Fijo' : employee.contract_type === 'temporary' ? 'Temporal' : employee.contract_type === 'outsourced' ? 'Tercerizado' : employee.contract_type === 'intern' ? 'Pasantía' : employee.contract_type === 'freelance' ? 'Freelance' : '-'}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Turno</span><span className="font-medium capitalize">{employee.shift === 'morning' ? 'Matutino' : employee.shift === 'afternoon' ? 'Vespertino' : employee.shift === 'night' ? 'Nocturno' : employee.shift === 'rotating' ? 'Rotativo' : '-'}</span></div>
                <Separator />
                <div className="flex justify-between"><span className="text-muted-foreground">Contacto Emergencia</span><span className="font-medium">{employee.emergency_contact_name || '-'}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Tel. Emergencia</span><span className="font-medium">{employee.emergency_contact_phone || '-'}</span></div>
              </CardContent>
            </Card>

            {employee.notes && (
              <Card className="md:col-span-2">
                <CardHeader><CardTitle className="text-base">Notas</CardTitle></CardHeader>
                <CardContent><p className="text-sm text-gray-600 whitespace-pre-wrap">{employee.notes}</p></CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Tab: Exámenes Médicos */}
        <TabsContent value="medical">
          <div className="grid gap-6 md:grid-cols-3">
            <div className="md:col-span-2 space-y-4">
              {medicalExams.length === 0 ? (
                <Card className="p-8 text-center">
                  <Stethoscope className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">No hay exámenes médicos registrados</p>
                </Card>
              ) : (
                medicalExams.map((exam) => (
                  <Card key={exam.id} className="border-slate-200/60">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 capitalize">
                          {exam.exam_type === 'entry' ? 'Ingreso' : exam.exam_type === 'periodic' ? 'Periódico' : exam.exam_type === 'exit' ? 'Egreso' : exam.exam_type === 'special' ? 'Especial' : 'Reintegro'}
                        </Badge>
                        <span className="text-xs text-muted-foreground">{formatDate(exam.exam_date)}</span>
                      </div>
                      {exam.doctor && <p className="text-sm"><span className="text-muted-foreground">Médico:</span> {exam.doctor}</p>}
                      {exam.center && <p className="text-sm"><span className="text-muted-foreground">Centro:</span> {exam.center}</p>}
                      {exam.results && <p className="text-sm mt-1"><span className="text-muted-foreground">Resultados:</span> {exam.results}</p>}
                      {exam.observations && <p className="text-sm mt-1 text-gray-500">{exam.observations}</p>}
                      {exam.next_exam_date && <p className="text-xs text-amber-600 mt-1">Próximo: {formatDate(exam.next_exam_date)}</p>}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>

            <Card>
              <CardHeader><CardTitle className="text-sm">Registrar Examen</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-xs">Tipo</Label>
                  <Select value={examForm.exam_type} onValueChange={(v) => setExamForm(f => ({ ...f, exam_type: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="entry">Ingreso</SelectItem>
                      <SelectItem value="periodic">Periódico</SelectItem>
                      <SelectItem value="exit">Egreso</SelectItem>
                      <SelectItem value="special">Especial</SelectItem>
                      <SelectItem value="return_to_work">Reintegro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Fecha</Label>
                  <Input type="date" value={examForm.exam_date} onChange={(e) => setExamForm(f => ({ ...f, exam_date: e.target.value }))} />
                </div>
                <div>
                  <Label className="text-xs">Médico</Label>
                  <Input value={examForm.doctor} onChange={(e) => setExamForm(f => ({ ...f, doctor: e.target.value }))} />
                </div>
                <div>
                  <Label className="text-xs">Centro</Label>
                  <Input value={examForm.center} onChange={(e) => setExamForm(f => ({ ...f, center: e.target.value }))} />
                </div>
                <div>
                  <Label className="text-xs">Resultados</Label>
                  <Textarea rows={2} value={examForm.results} onChange={(e) => setExamForm(f => ({ ...f, results: e.target.value }))} />
                </div>
                <div>
                  <Label className="text-xs">Observaciones</Label>
                  <Textarea rows={2} value={examForm.observations} onChange={(e) => setExamForm(f => ({ ...f, observations: e.target.value }))} />
                </div>
                <Button size="sm" className="w-full" onClick={handleAddExam} disabled={createExam.isPending}>
                  {createExam.isPending ? <Loader2 className="h-3 w-3 animate-spin mr-2" /> : <Plus className="h-3 w-3 mr-2" />}
                  Agregar
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab: Enfermedades Ocupacionales */}
        <TabsContent value="diseases">
          <div className="grid gap-6 md:grid-cols-3">
            <div className="md:col-span-2 space-y-4">
              {diseases.length === 0 ? (
                <Card className="p-8 text-center">
                  <AlertTriangle className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">No hay enfermedades ocupacionales registradas</p>
                </Card>
              ) : (
                diseases.map((d) => (
                  <Card key={d.id} className="border-slate-200/60">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-sm">{d.disease_name}</h3>
                        <Badge variant="outline" className={
                          d.status === 'active' ? 'bg-red-50 text-red-700 border-red-200' :
                          d.status === 'monitoring' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                          'bg-green-50 text-green-700 border-green-200'
                        }>
                          {d.status === 'active' ? 'Activo' : d.status === 'monitoring' ? 'Monitoreo' : 'Resuelto'}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">Diagnosticado: {formatDate(d.diagnosis_date)}</p>
                      {d.causal_agent && <p className="text-sm"><span className="text-muted-foreground">Agente causal:</span> {d.causal_agent}</p>}
                      {d.affected_area && <p className="text-sm"><span className="text-muted-foreground">Área afectada:</span> {d.affected_area}</p>}
                      {d.recommendations && <p className="text-sm mt-1 text-gray-500">{d.recommendations}</p>}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>

            <Card>
              <CardHeader><CardTitle className="text-sm">Registrar Enfermedad</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-xs">Nombre / Diagnóstico *</Label>
                  <Input value={diseaseForm.disease_name} onChange={(e) => setDiseaseForm(f => ({ ...f, disease_name: e.target.value }))} />
                </div>
                <div>
                  <Label className="text-xs">Fecha de Diagnóstico *</Label>
                  <Input type="date" value={diseaseForm.diagnosis_date} onChange={(e) => setDiseaseForm(f => ({ ...f, diagnosis_date: e.target.value }))} />
                </div>
                <div>
                  <Label className="text-xs">Agente Causal</Label>
                  <Input value={diseaseForm.causal_agent} onChange={(e) => setDiseaseForm(f => ({ ...f, causal_agent: e.target.value }))} />
                </div>
                <div>
                  <Label className="text-xs">Área Afectada</Label>
                  <Input value={diseaseForm.affected_area} onChange={(e) => setDiseaseForm(f => ({ ...f, affected_area: e.target.value }))} />
                </div>
                <div>
                  <Label className="text-xs">Severidad</Label>
                  <Select value={diseaseForm.severity} onValueChange={(v) => setDiseaseForm(f => ({ ...f, severity: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mild">Leve</SelectItem>
                      <SelectItem value="moderate">Moderado</SelectItem>
                      <SelectItem value="severe">Grave</SelectItem>
                      <SelectItem value="critical">Crítico</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Recomendaciones</Label>
                  <Textarea rows={2} value={diseaseForm.recommendations} onChange={(e) => setDiseaseForm(f => ({ ...f, recommendations: e.target.value }))} />
                </div>
                <Button size="sm" className="w-full" onClick={handleAddDisease} disabled={createDisease.isPending}>
                  {createDisease.isPending ? <Loader2 className="h-3 w-3 animate-spin mr-2" /> : <Plus className="h-3 w-3 mr-2" />}
                  Agregar
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab: Ausentismo */}
        <TabsContent value="absenteeism">
          <div className="grid gap-6 md:grid-cols-3">
            <div className="md:col-span-2 space-y-4">
              {absenteeism.length === 0 ? (
                <Card className="p-8 text-center">
                  <Clock className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">No hay registros de ausentismo</p>
                </Card>
              ) : (
                absenteeism.map((a) => (
                  <Card key={a.id} className="border-slate-200/60">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <Badge variant="outline" className={
                          a.type === 'medical' ? 'bg-red-50 text-red-700 border-red-200' :
                          a.type === 'accident' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                          a.type === 'maternity' ? 'bg-pink-50 text-pink-700 border-pink-200' :
                          'bg-gray-50 text-gray-700 border-gray-200'
                        }>
                          {a.type === 'medical' ? 'Médico' : a.type === 'personal' ? 'Personal' : a.type === 'maternity' ? 'Maternidad' : a.type === 'accident' ? 'Accidente' : 'Otro'}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(a.start_date)} - {a.end_date ? formatDate(a.end_date) : '...'} ({a.days_count || 0} días)
                        </span>
                      </div>
                      {a.reason && <p className="text-sm"><span className="text-muted-foreground">Motivo:</span> {a.reason}</p>}
                      {a.diagnosis && <p className="text-sm"><span className="text-muted-foreground">Diagnóstico:</span> {a.diagnosis}</p>}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>

            <Card>
              <CardHeader><CardTitle className="text-sm">Registrar Ausentismo</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-xs">Tipo</Label>
                  <Select value={absenceForm.type} onValueChange={(v) => setAbsenceForm(f => ({ ...f, type: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="medical">Médico</SelectItem>
                      <SelectItem value="personal">Personal</SelectItem>
                      <SelectItem value="maternity">Maternidad</SelectItem>
                      <SelectItem value="accident">Accidente</SelectItem>
                      <SelectItem value="other">Otro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">Fecha Inicio *</Label>
                    <Input type="date" value={absenceForm.start_date} onChange={(e) => setAbsenceForm(f => ({ ...f, start_date: e.target.value }))} />
                  </div>
                  <div>
                    <Label className="text-xs">Fecha Fin</Label>
                    <Input type="date" value={absenceForm.end_date} onChange={(e) => setAbsenceForm(f => ({ ...f, end_date: e.target.value }))} />
                  </div>
                </div>
                <div>
                  <Label className="text-xs">Días (estimado)</Label>
                  <Input type="number" min="0" value={absenceForm.days_count} onChange={(e) => setAbsenceForm(f => ({ ...f, days_count: e.target.value }))} />
                </div>
                <div>
                  <Label className="text-xs">Motivo</Label>
                  <Input value={absenceForm.reason} onChange={(e) => setAbsenceForm(f => ({ ...f, reason: e.target.value }))} />
                </div>
                <div>
                  <Label className="text-xs">Diagnóstico</Label>
                  <Textarea rows={2} value={absenceForm.diagnosis} onChange={(e) => setAbsenceForm(f => ({ ...f, diagnosis: e.target.value }))} />
                </div>
                <Button size="sm" className="w-full" onClick={handleAddAbsence} disabled={createAbsence.isPending}>
                  {createAbsence.isPending ? <Loader2 className="h-3 w-3 animate-spin mr-2" /> : <Plus className="h-3 w-3 mr-2" />}
                  Agregar
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
