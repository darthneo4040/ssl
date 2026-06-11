'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import {
  ArrowLeft,
  Loader2,
  Save
} from 'lucide-react'
import { toast } from 'sonner'
import { useCindynicItems, useUpdateCindynicItem } from '@/hooks/useCindynics'

const CATEGORY_LABELS: Record<string, string> = {
  deficit_cindinico: 'Déficit Cindínico',
  falla_cindinica: 'Falla Cindínica',
  disonancia_cognitiva: 'Disonancia Cognitiva'
}

export default function CindynicItemsPage() {
  const { data: items = [], isLoading } = useCindynicItems()
  const updateItem = useUpdateCindynicItem()

  const [editingName, setEditingName] = useState<Record<string, string>>({})

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center min-h-[400px]">
      <Loader2 className="h-8 w-8 animate-spin mb-4" />
      <p className="text-muted-foreground">Cargando ítems...</p>
    </div>
  )

  const categories = ['deficit_cindinico', 'falla_cindinica', 'disonancia_cognitiva']

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      await updateItem.mutateAsync({ id, data: { is_active: isActive } })
      toast.success(isActive ? 'Ítem activado' : 'Ítem desactivado')
    } catch (err) {
      toast.error('Error: ' + (err as Error).message)
    }
  }

  const handleSaveName = async (id: string) => {
    const name = editingName[id]?.trim()
    if (!name) return
    try {
      await updateItem.mutateAsync({ id, data: { name } })
      toast.success('Nombre actualizado')
    } catch (err) {
      toast.error('Error: ' + (err as Error).message)
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/settings">
          <Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Ítems de Evaluación</h1>
          <p className="text-muted-foreground text-sm">Personaliza los 16 ítems cindínicos</p>
        </div>
      </div>

      {categories.map(cat => {
        const catItems = items.filter(i => i.category === cat).sort((a, b) => a.sort_order - b.sort_order)
        if (catItems.length === 0) return null

        return (
          <Card key={cat}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-blue-700">{CATEGORY_LABELS[cat]}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {catItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-2 rounded-md bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <Switch
                      checked={item.is_active}
                      onCheckedChange={(checked) => handleToggleActive(item.id, checked)}
                    />
                    <div className="flex-1 min-w-0">
                      {editingName[item.id] !== undefined ? (
                        <div className="flex gap-2">
                          <Input
                            value={editingName[item.id]}
                            onChange={(e) => setEditingName(prev => ({ ...prev, [item.id]: e.target.value }))}
                            className="h-7 text-sm"
                          />
                          <Button size="sm" variant="ghost" className="h-7" onClick={() => handleSaveName(item.id)}>
                            <Save className="h-3 w-3" />
                          </Button>
                        </div>
                      ) : (
                        <p
                          className={`text-sm font-medium cursor-pointer hover:text-blue-600 ${!item.is_active ? 'text-muted-foreground line-through' : ''}`}
                          onClick={() => setEditingName(prev => ({ ...prev, [item.id]: item.name }))}
                        >
                          {item.name}
                        </p>
                      )}
                    </div>
                  </div>
                  <Badge variant="outline" className="text-[10px] ml-2 shrink-0">
                    Orden {item.sort_order}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
