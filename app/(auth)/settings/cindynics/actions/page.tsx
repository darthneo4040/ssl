'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  ArrowLeft,
  Plus,
  Loader2,
  Trash2,
  Save,
  Pencil
} from 'lucide-react'
import { toast } from 'sonner'
import {
  useCindynicActions,
  useCreateCindynicAction,
  useUpdateCindynicAction,
  useDeleteCindynicAction
} from '@/hooks/useCindynics'

export default function CindynicActionsPage() {
  const { data: actions = [], isLoading } = useCindynicActions()
  const createAction = useCreateCindynicAction()
  const updateAction = useUpdateCindynicAction()
  const deleteAction = useDeleteCindynicAction()
  const [newName, setNewName] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [editing, setEditing] = useState<Record<string, { name: string; description: string }>>({})

  const handleCreate = async () => {
    if (!newName.trim()) { toast.error('Ingrese un nombre'); return }
    try {
      await createAction.mutateAsync({ name: newName.trim(), description: newDesc.trim() || null })
      toast.success('Acción creada')
      setNewName('')
      setNewDesc('')
    } catch (err) { toast.error('Error: ' + (err as Error).message) }
  }

  const handleSaveEdit = async (id: string) => {
    const data = editing[id]
    if (!data?.name.trim()) return
    try {
      await updateAction.mutateAsync({ id, data: { name: data.name.trim(), description: data.description.trim() || null } })
      toast.success('Actualizado')
      setEditing(prev => { const n = { ...prev }; delete n[id]; return n })
    } catch (err) { toast.error('Error: ' + (err as Error).message) }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar esta acción?')) return
    try {
      await deleteAction.mutateAsync(id)
      toast.success('Acción eliminada')
    } catch (err) { toast.error('Error: ' + (err as Error).message) }
  }

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center min-h-[400px]">
      <Loader2 className="h-8 w-8 animate-spin mb-4" />
      <p className="text-muted-foreground">Cargando acciones...</p>
    </div>
  )

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/settings">
          <Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Acciones Correctivas</h1>
          <p className="text-muted-foreground text-sm">Catálogo de acciones disponibles</p>
        </div>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-sm">Nueva Acción</CardTitle></CardHeader>
        <CardContent>
          <div className="flex gap-3 items-end">
            <div className="flex-1">
              <Label className="text-xs">Nombre</Label>
              <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Ej: Crear bitácora" />
            </div>
            <div className="flex-1">
              <Label className="text-xs">Descripción</Label>
              <Input value={newDesc} onChange={(e) => setNewDesc(e.target.value)} />
            </div>
            <Button size="sm" onClick={handleCreate} disabled={createAction.isPending}>
              <Plus className="h-4 w-4 mr-1" />Agregar
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-2">
        {actions.map((a) => (
          <Card key={a.id} className="border-slate-200/60">
            <CardContent className="p-3">
              {editing[a.id] ? (
                <div className="flex gap-2 items-end">
                  <div className="flex-1">
                    <Label className="text-[10px]">Nombre</Label>
                    <Input value={editing[a.id].name} onChange={(e) => setEditing(prev => ({ ...prev, [a.id]: { ...prev[a.id], name: e.target.value } }))} className="h-7 text-sm" />
                  </div>
                  <div className="flex-1">
                    <Label className="text-[10px]">Descripción</Label>
                    <Input value={editing[a.id].description} onChange={(e) => setEditing(prev => ({ ...prev, [a.id]: { ...prev[a.id], description: e.target.value } }))} className="h-7 text-sm" />
                  </div>
                  <Button size="sm" variant="ghost" className="h-7" onClick={() => handleSaveEdit(a.id)}><Save className="h-3 w-3" /></Button>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{a.name}</p>
                    {a.description && <p className="text-xs text-muted-foreground">{a.description}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={a.is_active ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-500'}>{a.is_active ? 'Activo' : 'Inactivo'}</Badge>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setEditing(prev => ({ ...prev, [a.id]: { name: a.name, description: a.description || '' } }))}>
                      <Pencil className="h-3 w-3" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => handleDelete(a.id)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
