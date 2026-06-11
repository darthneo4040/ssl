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
  useCindynicResponsibles,
  useCreateCindynicResponsible,
  useUpdateCindynicResponsible,
  useDeleteCindynicResponsible
} from '@/hooks/useCindynics'

export default function CindynicResponsiblesPage() {
  const { data: responsibles = [], isLoading } = useCindynicResponsibles()
  const createResp = useCreateCindynicResponsible()
  const updateResp = useUpdateCindynicResponsible()
  const deleteResp = useDeleteCindynicResponsible()
  const [newName, setNewName] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [editing, setEditing] = useState<Record<string, { name: string; email: string }>>({})

  const handleCreate = async () => {
    if (!newName.trim()) { toast.error('Ingrese un nombre'); return }
    try {
      await createResp.mutateAsync({ name: newName.trim(), email: newEmail.trim() || null })
      toast.success('Responsable creado')
      setNewName('')
      setNewEmail('')
    } catch (err) { toast.error('Error: ' + (err as Error).message) }
  }

  const handleSaveEdit = async (id: string) => {
    const data = editing[id]
    if (!data?.name.trim()) return
    try {
      await updateResp.mutateAsync({ id, data: { name: data.name.trim(), email: data.email.trim() || null } })
      toast.success('Actualizado')
      setEditing(prev => { const n = { ...prev }; delete n[id]; return n })
    } catch (err) { toast.error('Error: ' + (err as Error).message) }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este responsable?')) return
    try {
      await deleteResp.mutateAsync(id)
      toast.success('Responsable eliminado')
    } catch (err) { toast.error('Error: ' + (err as Error).message) }
  }

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center min-h-[400px]">
      <Loader2 className="h-8 w-8 animate-spin mb-4" />
      <p className="text-muted-foreground">Cargando responsables...</p>
    </div>
  )

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/settings">
          <Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Responsables</h1>
          <p className="text-muted-foreground text-sm">Personas asignables a las acciones correctivas</p>
        </div>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-sm">Nuevo Responsable</CardTitle></CardHeader>
        <CardContent>
          <div className="flex gap-3 items-end">
            <div className="flex-1">
              <Label className="text-xs">Nombre</Label>
              <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Ej: Ana López" />
            </div>
            <div className="flex-1">
              <Label className="text-xs">Email</Label>
              <Input value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="ana@empresa.com" />
            </div>
            <Button size="sm" onClick={handleCreate} disabled={createResp.isPending}>
              <Plus className="h-4 w-4 mr-1" />Agregar
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-2">
        {responsibles.map((r) => (
          <Card key={r.id} className="border-slate-200/60">
            <CardContent className="p-3">
              {editing[r.id] ? (
                <div className="flex gap-2 items-end">
                  <div className="flex-1">
                    <Label className="text-[10px]">Nombre</Label>
                    <Input value={editing[r.id].name} onChange={(e) => setEditing(prev => ({ ...prev, [r.id]: { ...prev[r.id], name: e.target.value } }))} className="h-7 text-sm" />
                  </div>
                  <div className="flex-1">
                    <Label className="text-[10px]">Email</Label>
                    <Input value={editing[r.id].email} onChange={(e) => setEditing(prev => ({ ...prev, [r.id]: { ...prev[r.id], email: e.target.value } }))} className="h-7 text-sm" />
                  </div>
                  <Button size="sm" variant="ghost" className="h-7" onClick={() => handleSaveEdit(r.id)}><Save className="h-3 w-3" /></Button>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{r.name}</p>
                    {r.email && <p className="text-xs text-muted-foreground">{r.email}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={r.is_active ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-500'}>{r.is_active ? 'Activo' : 'Inactivo'}</Badge>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setEditing(prev => ({ ...prev, [r.id]: { name: r.name, email: r.email || '' } }))}>
                      <Pencil className="h-3 w-3" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => handleDelete(r.id)}>
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
