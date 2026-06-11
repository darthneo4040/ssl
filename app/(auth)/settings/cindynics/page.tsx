'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import {
  Plus,
  Search,
  Loader2,
  CalendarDays,
  BarChart3,
  Play,
  Trash2,
  FileText
} from 'lucide-react'
import { toast } from 'sonner'
import {
  useCindynicEvaluations,
  useCreateCindynicEvaluation,
  useDeleteCindynicEvaluation,
  useInitializeResponses
} from '@/hooks/useCindynics'

export default function CindynicsPage() {
  const router = useRouter()
  const { data: evaluations = [], isLoading } = useCindynicEvaluations()
  const createEvaluation = useCreateCindynicEvaluation()
  const deleteEvaluation = useDeleteCindynicEvaluation()
  const initializeResponses = useInitializeResponses()
  const [search, setSearch] = useState('')
  const [newName, setNewName] = useState('')
  const [newNotes, setNewNotes] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)

  const filtered = evaluations.filter(e =>
    e.name.toLowerCase().includes(search.toLowerCase())
  )

  const handleCreate = async () => {
    if (!newName.trim()) { toast.error('Ingrese un nombre'); return }
    try {
      const ev = await createEvaluation.mutateAsync({
        company_id: '550e8400-e29b-41d4-a716-446655440000',
        name: newName.trim(),
        notes: newNotes.trim() || null,
        evaluation_date: new Date().toISOString(),
        status: 'draft'
      })
      await initializeResponses.mutateAsync(ev.id)
      toast.success('Evaluación creada')
      setDialogOpen(false)
      setNewName('')
      setNewNotes('')
      router.push(`/settings/cindynics/${ev.id}`)
    } catch (err) {
      toast.error('Error: ' + (err as Error).message)
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`¿Eliminar "${name}"?`)) return
    try {
      await deleteEvaluation.mutateAsync(id)
      toast.success('Evaluación eliminada')
    } catch (err) {
      toast.error('Error: ' + (err as Error).message)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft': return <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-200">Borrador</Badge>
      case 'in_progress': return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">En Curso</Badge>
      case 'completed': return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Completado</Badge>
      default: return <Badge>{status}</Badge>
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-4" />
        <p className="text-muted-foreground">Cargando evaluaciones...</p>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">Gestión del Peligro</h1>
          <p className="text-muted-foreground text-sm">Evaluaciones cindínicas ({evaluations.length})</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="bg-blue-600 hover:bg-blue-500">
              <Plus className="h-4 w-4 mr-2" />Nueva Evaluación
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Nueva Evaluación Cindínica</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Nombre *</Label>
                <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Ej: Evaluación Junio 2026" />
              </div>
              <div>
                <Label>Notas</Label>
                <Textarea value={newNotes} onChange={(e) => setNewNotes(e.target.value)} rows={3} />
              </div>
              <Button onClick={handleCreate} className="w-full" disabled={createEvaluation.isPending || initializeResponses.isPending}>
                {(createEvaluation.isPending || initializeResponses.isPending) ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Play className="h-4 w-4 mr-2" />}
                Crear e Iniciar
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative max-w-md mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Buscar evaluación..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>

      {filtered.length === 0 ? (
        <Card className="p-12 text-center">
          <FileText className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
          <p className="text-muted-foreground">No hay evaluaciones. Crea la primera.</p>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((ev) => (
            <Card key={ev.id} className="border-slate-200/60 hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-base">{ev.name}</CardTitle>
                  {getStatusBadge(ev.status)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-xs text-muted-foreground">
                  <p className="flex items-center gap-1.5">
                    <CalendarDays className="h-3.5 w-3.5" />
                    {new Date(ev.evaluation_date).toLocaleDateString('es-VE')}
                  </p>
                  {ev.notes && <p className="line-clamp-2">{ev.notes}</p>}
                </div>
                <div className="flex gap-2 mt-4 pt-3 border-t border-slate-100">
                  <Link href={`/settings/cindynics/${ev.id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full text-xs">
                      <BarChart3 className="h-3.5 w-3.5 mr-1" />Dashboard
                    </Button>
                  </Link>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => handleDelete(ev.id, ev.name)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
