'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  GraduationCap, 
  Plus, 
  Trash2, 
  Edit3, 
  BookOpen, 
  CalendarDays, 
  UserCheck, 
  Layers, 
  Clock, 
  FileCheck,
  AlertCircle,
  HelpCircle,
  Users
} from 'lucide-react'
import { useTrainingStore, TrainingSession } from '@/lib/store/training'
import { toast } from 'sonner'

export default function TrainingCRUDPage() {
  const { sessions, addTraining, updateTraining, deleteTraining, resetTrainings } = useTrainingStore()
  
  // --- Form & Modal State ---
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingSession, setEditingSession] = useState<TrainingSession | null>(null)
  
  // Form values
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState<TrainingSession['category']>('epp')
  const [type, setType] = useState<TrainingSession['type']>('teorico')
  const [date, setDate] = useState('')
  const [durationHours, setDurationHours] = useState<number>(2)
  const [attendeesCount, setAttendeesCount] = useState<number>(10)
  const [attendeesMale, setAttendeesMale] = useState<number>(5)
  const [attendeesFemale, setAttendeesFemale] = useState<number>(5)
  const [department, setDepartment] = useState<TrainingSession['department']>('Operaciones')
  const [facilitator, setFacilitator] = useState('')
  const [facilitatorDoc, setFacilitatorDoc] = useState('')
  const [content, setContent] = useState('')
  const [status, setStatus] = useState<TrainingSession['status']>('realizada')
  const [evidenceUrl, setEvidenceUrl] = useState('')

  // --- Translation Helpers ---
  const getCategoryLabel = (cat: string) => {
    const map: Record<string, string> = {
      prevencion_incendios: 'Control de Incendios',
      primeros_auxilios: 'Primeros Auxilios',
      epp: 'Uso de EPP',
      ergonomia: 'Ergonomía Postural',
      riesgo_quimico: 'Riesgos Químicos',
      orden_limpieza: '5S / Orden y Limpieza',
      trabajo_altura: 'Trabajos en Altura',
      seguridad_vial: 'Seguridad Vial',
      otros: 'Otros Temas PSST'
    }
    return map[cat] || cat
  }

  const getTypeLabel = (t: string) => {
    const map: Record<string, string> = {
      charla_5min: 'Charla de 5 Min',
      induccion_lopcymat: 'Inducción LOPCYMAT',
      teorico: 'Curso Teórico',
      practico: 'Curso Práctico',
      simulacro: 'Simulacro General'
    }
    return map[t] || t
  }

  // --- Open Modal Helpers ---
  const openAddModal = () => {
    setEditingSession(null)
    setTitle('')
    setCategory('epp')
    setType('teorico')
    setDate(new Date().toISOString().split('T')[0])
    setDurationHours(2)
    setAttendeesCount(10)
    setAttendeesMale(5)
    setAttendeesFemale(5)
    setDepartment('Operaciones')
    setFacilitator('')
    setFacilitatorDoc('')
    setContent('')
    setStatus('realizada')
    setEvidenceUrl('')
    setIsModalOpen(true)
  }

  const openEditModal = (session: TrainingSession) => {
    setEditingSession(session)
    setTitle(session.title)
    setCategory(session.category)
    setType(session.type)
    setDate(session.date)
    setDurationHours(session.durationHours)
    setAttendeesCount(session.attendeesCount)
    setAttendeesMale(session.attendeesMale)
    setAttendeesFemale(session.attendeesFemale)
    setDepartment(session.department)
    setFacilitator(session.facilitator)
    setFacilitatorDoc(session.facilitatorDoc)
    setContent(session.content)
    setStatus(session.status)
    setEvidenceUrl(session.evidenceUrl || '')
    setIsModalOpen(true)
  }

  // --- Handle CRUD Submit ---
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim()) {
      toast.error('Por favor, ingresa el título/tema de la capacitación.')
      return
    }

    if (!facilitator.trim()) {
      toast.error('Por favor, ingresa el nombre del facilitador.')
      return
    }

    // Validar sumas de género
    const sumGender = Number(attendeesMale) + Number(attendeesFemale)
    if (sumGender !== Number(attendeesCount)) {
      toast.warning('Nota: El desglose de hombres y mujeres no coincide con el total de asistentes.')
    }

    const sessionData: TrainingSession = {
      id: editingSession ? editingSession.id : `training-${Date.now()}`,
      title,
      category,
      type,
      date,
      durationHours: Number(durationHours),
      attendeesCount: Number(attendeesCount),
      attendeesMale: Number(attendeesMale),
      attendeesFemale: Number(attendeesFemale),
      department,
      facilitator,
      facilitatorDoc,
      content,
      status,
      evidenceUrl: evidenceUrl.trim() || undefined
    }

    if (editingSession) {
      updateTraining(editingSession.id, sessionData)
      toast.success('Capacitación actualizada exitosamente.')
    } else {
      addTraining(sessionData)
      toast.success('Capacitación registrada exitosamente en la bitácora.')
    }

    setIsModalOpen(false)
  }

  const handleDelete = (id: string) => {
    if (confirm('¿Está seguro de eliminar este registro de capacitación? Esto afectará los reportes HHC del trimestre.')) {
      deleteTraining(id)
      toast.success('Registro eliminado.')
    }
  }

  // --- Statistics calculations ---
  const stats = useMemo(() => {
    const realizadaSessions = sessions.filter(s => s.status === 'realizada')
    const totalSessions = realizadaSessions.length
    
    // HHC = Suma de (Duración × Participantes) de las realizadas
    const totalHHC = realizadaSessions.reduce((acc, curr) => {
      return acc + (curr.durationHours * curr.attendeesCount)
    }, 0)

    const totalHours = realizadaSessions.reduce((acc, curr) => acc + curr.durationHours, 0)
    const totalAttendees = realizadaSessions.reduce((acc, curr) => acc + curr.attendeesCount, 0)
    const avgAttendees = totalSessions > 0 ? Math.round(totalAttendees / totalSessions) : 0

    // Meta trimestral de horas hombre en base al PSST (ej. 800 HHC meta)
    const hhcMeta = 1000
    const pctHhc = Math.min(100, Math.round((totalHHC / hhcMeta) * 100))

    return { totalSessions, totalHHC, avgAttendees, pctHhc, hhcMeta, totalHours }
  }, [sessions])

  return (
    <div className="min-h-screen bg-gray-50/50 pb-12">
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-200/80 pb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
              <GraduationCap className="h-8 w-8 text-blue-600" />
              Gestión de Capacitaciones
            </h1>
            <p className="text-muted-foreground mt-1 text-sm md:text-base">
              Bitácora legal del Programa de Seguridad y Salud en el Trabajo (PSST) según LOPCYMAT y COVENIN.
            </p>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => {
                if (confirm('¿Restablecer todas las capacitaciones semilla? Se perderán las personalizadas.')) {
                  resetTrainings()
                  toast.success('Bitácora restablecida.')
                }
              }}
              className="bg-white border-slate-200"
            >
              Semillas por Defecto
            </Button>
            <Button 
              size="sm" 
              onClick={openAddModal}
              className="bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-md shadow-blue-500/10"
            >
              <Plus className="h-4 w-4 mr-2" />
              Registrar Capacitación
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <Card className="border-slate-200/60 shadow-xs bg-gradient-to-br from-white to-slate-50/50">
            <CardContent className="p-5 flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">HHC Trimestrales</span>
                <div className="text-3xl font-extrabold text-slate-800">{stats.totalHHC}h</div>
                <p className="text-[10px] text-slate-500">Horas-Hombre de Capacitación Acumuladas</p>
              </div>
              <div className="h-12 w-12 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-center text-blue-600">
                <Users className="h-6 w-6 animate-pulse" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200/60 shadow-xs bg-gradient-to-br from-white to-slate-50/50">
            <CardContent className="p-5 flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Sesiones Realizadas</span>
                <div className="text-3xl font-extrabold text-slate-800">{stats.totalSessions}</div>
                <p className="text-[10px] text-slate-500">{stats.totalHours} horas reales dictadas</p>
              </div>
              <div className="h-12 w-12 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-center text-indigo-600">
                <BookOpen className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200/60 shadow-xs bg-gradient-to-br from-white to-slate-50/50">
            <CardContent className="p-5 flex flex-col justify-between h-full space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Meta de Cumplimiento PSST</span>
                <span className="font-extrabold text-emerald-600">{stats.pctHhc}%</span>
              </div>
              <div className="space-y-1">
                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden flex">
                  <div 
                    className={`h-full rounded-full ${stats.pctHhc < 50 ? 'bg-red-500' : stats.pctHhc < 85 ? 'bg-amber-500' : 'bg-emerald-500'}`} 
                    style={{ width: `${stats.pctHhc}%` }}
                  />
                </div>
                <div className="flex justify-between text-[9px] text-slate-500">
                  <span>Progreso: {stats.totalHHC} HHC</span>
                  <span>Meta: {stats.hhcMeta} HHC</span>
                </div>
              </div>
            </CardContent>
          </Card>

        </div>

        {/* Legal Advisory */}
        <Alert className="bg-blue-50 border-blue-100 text-blue-900 rounded-xl">
          <AlertCircle className="h-5 w-5 text-blue-600" />
          <AlertDescription className="text-xs text-blue-800">
            <strong>Requisito de Auditoría INPSASEL / LOPCYMAT:</strong> Toda capacitación debe contar con el registro de firmas de asistencia física (Minuta de Asistencia), estar contemplada en los 16 temas obligatorios del PSST, y cumplir la cuota mínima de 16 horas trimestrales por trabajador.
          </AlertDescription>
        </Alert>

        {/* Training Table */}
        <Card className="border-slate-200/60 shadow-xs bg-white rounded-xl overflow-hidden">
          <CardHeader className="bg-slate-50/20 border-b border-slate-100 pb-4">
            <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <FileCheck className="h-5 w-5 text-slate-600" />
              Bitácora de Sesiones Ocupacionales
            </CardTitle>
            <CardDescription className="text-xs">
              Listado total de inducciones y entrenamientos. Administra los registros para cumplir con los inspectores de SSL.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50/50 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                  <tr>
                    <th className="p-4">Tema / Capacitación</th>
                    <th className="p-4">Categoría & Tipo</th>
                    <th className="p-4">Fecha & Área</th>
                    <th className="p-4 text-center">Duración</th>
                    <th className="p-4 text-center">Asistentes (M/F)</th>
                    <th className="p-4">Facilitador</th>
                    <th className="p-4 text-center">Estado</th>
                    <th className="p-4 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sessions.map((session) => (
                    <tr key={session.id} className="hover:bg-slate-50/50 transition-colors font-medium">
                      
                      <td className="p-4 max-w-[200px]">
                        <p className="font-bold text-slate-800 leading-snug">{session.title}</p>
                        {session.evidenceUrl && (
                          <span className="text-[10px] text-blue-600 flex items-center gap-1 mt-1 font-semibold cursor-pointer hover:underline">
                            📄 {session.evidenceUrl}
                          </span>
                        )}
                      </td>

                      <td className="p-4 space-y-1">
                        <Badge variant="outline" className="bg-slate-50 text-slate-600 border-slate-200 text-[9px] px-1.5 py-0">
                          {getCategoryLabel(session.category)}
                        </Badge>
                        <p className="text-[10px] text-muted-foreground font-semibold">{getTypeLabel(session.type)}</p>
                      </td>

                      <td className="p-4 space-y-0.5">
                        <p className="flex items-center gap-1">
                          <CalendarDays className="h-3 w-3 text-slate-400" />
                          {session.date}
                        </p>
                        <p className="text-[10px] text-muted-foreground">📍 {session.department}</p>
                      </td>

                      <td className="p-4 text-center">
                        <Badge variant="secondary" className="bg-indigo-50 text-indigo-700 border-indigo-100 text-[10px] font-bold">
                          {session.durationHours}h
                        </Badge>
                      </td>

                      <td className="p-4 text-center space-y-0.5">
                        <p className="font-extrabold text-slate-800 text-sm">{session.attendeesCount}</p>
                        <p className="text-[9px] text-slate-400 font-semibold uppercase">
                          M:{session.attendeesMale} / F:{session.attendeesFemale}
                        </p>
                      </td>

                      <td className="p-4">
                        <p className="font-bold text-slate-800">{session.facilitator}</p>
                        <p className="text-[9px] text-slate-400">Doc: {session.facilitatorDoc}</p>
                      </td>

                      <td className="p-4 text-center">
                        <Badge className={`text-[9px] font-bold py-0.5 px-2 rounded-full border ${
                          session.status === 'realizada' ? 'bg-emerald-50 text-emerald-700 border-emerald-150' :
                          session.status === 'planificada' ? 'bg-blue-50 text-blue-700 border-blue-150' : 'bg-red-50 text-red-700 border-red-150'
                        }`}>
                          {session.status.toUpperCase()}
                        </Badge>
                      </td>

                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-7 w-7 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-md"
                            onClick={() => openEditModal(session)}
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-7 w-7 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-md"
                            onClick={() => handleDelete(session.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>

                    </tr>
                  ))}
                  {sessions.length === 0 && (
                    <tr>
                      <td colSpan={8} className="p-12 text-center text-slate-400 text-xs">
                        No hay capacitaciones registradas en la bitácora de SST.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Modal Dialog Form */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-bold text-slate-800 flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-blue-600" />
                {editingSession ? 'Editar Registro de Capacitación' : 'Registrar Nueva Capacitación'}
              </DialogTitle>
              <DialogDescription className="text-xs">
                Por favor complete los campos obligatorios para registrar legalmente la inducción o charla.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 py-2">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                <div className="space-y-1 md:col-span-2">
                  <Label htmlFor="title" className="text-xs font-semibold text-slate-600">Título / Tema de la Capacitación</Label>
                  <Input 
                    id="title"
                    placeholder="Ej. Uso adecuado de protectores auditivos de copa"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="bg-slate-50 border-slate-200 text-xs"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="category" className="text-xs font-semibold text-slate-600">Categoría PSST / COVENIN</Label>
                  <Select value={category} onValueChange={(v) => setCategory(v as TrainingSession['category'])}>
                    <SelectTrigger className="bg-slate-50 border-slate-200 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="prevencion_incendios">Control de Incendios</SelectItem>
                      <SelectItem value="primeros_auxilios">Primeros Auxilios</SelectItem>
                      <SelectItem value="epp">Equipos de Protección Personal</SelectItem>
                      <SelectItem value="ergonomia">Ergonomía Postural</SelectItem>
                      <SelectItem value="riesgo_quimico">Manejo Sustancias Químicas</SelectItem>
                      <SelectItem value="orden_limpieza">Metodología 5S</SelectItem>
                      <SelectItem value="trabajo_altura">Trabajos en Altura</SelectItem>
                      <SelectItem value="seguridad_vial">Seguridad Vial</SelectItem>
                      <SelectItem value="otros">Otros Temas PSST</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="type" className="text-xs font-semibold text-slate-600">Tipo de Capacitación</Label>
                  <Select value={type} onValueChange={(v) => setType(v as TrainingSession['type'])}>
                    <SelectTrigger className="bg-slate-50 border-slate-200 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="charla_5min">Charla de 5 Minutos</SelectItem>
                      <SelectItem value="induccion_lopcymat">Inducción Art. 56 LOPCYMAT</SelectItem>
                      <SelectItem value="teorico">Curso Teórico</SelectItem>
                      <SelectItem value="practico">Entrenamiento Práctico</SelectItem>
                      <SelectItem value="simulacro">Simulacro General de Desalojo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="date" className="text-xs font-semibold text-slate-600">Fecha de Ejecución</Label>
                  <Input 
                    id="date" 
                    type="date" 
                    value={date} 
                    onChange={(e) => setDate(e.target.value)} 
                    className="bg-slate-50 border-slate-200 text-xs"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="department" className="text-xs font-semibold text-slate-600">Departamento / Área</Label>
                  <Select value={department} onValueChange={(v) => setDepartment(v as TrainingSession['department'])}>
                    <SelectTrigger className="bg-slate-50 border-slate-200 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Operaciones">Operaciones</SelectItem>
                      <SelectItem value="Mantenimiento">Mantenimiento</SelectItem>
                      <SelectItem value="Logística">Logística</SelectItem>
                      <SelectItem value="Administración">Administración</SelectItem>
                      <SelectItem value="Calidad">Calidad</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="duration" className="text-xs font-semibold text-slate-600">Duración (Horas Reales)</Label>
                  <Input 
                    id="duration" 
                    type="number" 
                    min={1} 
                    max={40} 
                    value={durationHours} 
                    onChange={(e) => setDurationHours(Math.max(1, parseInt(e.target.value) || 1))}
                    className="bg-slate-50 border-slate-200 text-xs"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="attendees" className="text-xs font-semibold text-slate-600">Asistentes Totales</Label>
                  <Input 
                    id="attendees" 
                    type="number" 
                    min={1} 
                    value={attendeesCount} 
                    onChange={(e) => setAttendeesCount(Math.max(1, parseInt(e.target.value) || 1))}
                    className="bg-slate-50 border-slate-200 text-xs"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="males" className="text-xs font-semibold text-slate-600">Asistentes Masculinos</Label>
                  <Input 
                    id="males" 
                    type="number" 
                    min={0} 
                    value={attendeesMale} 
                    onChange={(e) => setAttendeesMale(Math.max(0, parseInt(e.target.value) || 0))}
                    className="bg-slate-50 border-slate-200 text-xs"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="females" className="text-xs font-semibold text-slate-600">Asistentes Femeninos</Label>
                  <Input 
                    id="females" 
                    type="number" 
                    min={0} 
                    value={attendeesFemale} 
                    onChange={(e) => setAttendeesFemale(Math.max(0, parseInt(e.target.value) || 0))}
                    className="bg-slate-50 border-slate-200 text-xs"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="facilitator" className="text-xs font-semibold text-slate-600">Nombre del Facilitador / Instructor</Label>
                  <Input 
                    id="facilitator"
                    placeholder="Ej. Ing. Juan Pérez"
                    value={facilitator}
                    onChange={(e) => setFacilitator(e.target.value)}
                    className="bg-slate-50 border-slate-200 text-xs"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="facDoc" className="text-xs font-semibold text-slate-600">Cédula / Registro INPSASEL</Label>
                  <Input 
                    id="facDoc"
                    placeholder="Ej. V-18.495.284 o Reg L-49298"
                    value={facilitatorDoc}
                    onChange={(e) => setFacilitatorDoc(e.target.value)}
                    className="bg-slate-50 border-slate-200 text-xs"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="status" className="text-xs font-semibold text-slate-600">Estado</Label>
                  <Select value={status} onValueChange={(v) => setStatus(v as TrainingSession['status'])}>
                    <SelectTrigger className="bg-slate-50 border-slate-200 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="realizada">Realizada / Concluida</SelectItem>
                      <SelectItem value="planificada">Planificada / Programada</SelectItem>
                      <SelectItem value="suspendida">Suspendida / Postpuesta</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="evidence" className="text-xs font-semibold text-slate-600">Evidencia / Nombre del PDF</Label>
                  <Input 
                    id="evidence" 
                    placeholder="Ej. minuta_asistencia_ruido.pdf"
                    value={evidenceUrl} 
                    onChange={(e) => setEvidenceUrl(e.target.value)} 
                    className="bg-slate-50 border-slate-200 text-xs"
                  />
                </div>

                <div className="space-y-1 md:col-span-2">
                  <Label htmlFor="content" className="text-xs font-semibold text-slate-600">Contenido Programático Cubierto</Label>
                  <Textarea 
                    id="content"
                    placeholder="Breve resumen de los contenidos impartidos a los trabajadores..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="bg-slate-50 border-slate-200 text-xs min-h-[60px]"
                    required
                  />
                </div>

              </div>

              <DialogFooter className="gap-2 sm:gap-0 pt-4 border-t">
                <DialogClose asChild>
                  <Button type="button" variant="outline" className="border-slate-200 bg-white">
                    Cancelar
                  </Button>
                </DialogClose>
                <Button 
                  type="submit" 
                  className="bg-blue-600 hover:bg-blue-500 text-white font-semibold"
                >
                  {editingSession ? 'Guardar Cambios' : 'Registrar Capacitación'}
                </Button>
              </DialogFooter>

            </form>
          </DialogContent>
        </Dialog>

      </div>
    </div>
  )
}
