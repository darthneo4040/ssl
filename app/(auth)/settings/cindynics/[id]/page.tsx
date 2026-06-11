'use client'

import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
  RadarChart, PolarGrid, PolarAngleAxis, Radar,
  LineChart, Line, CartesianGrid
} from 'recharts'
import {
  ArrowLeft,
  CheckCircle2,
  Loader2
} from 'lucide-react'
import { useCindynicDashboard, useUpdateCindynicEvaluation, useUpdateCindynicResponse } from '@/hooks/useCindynics'
import { Database } from '@/types/database'

const CATEGORY_LABELS: Record<string, string> = {
  deficit_cindinico: 'Déficit Cindínico',
  falla_cindinica: 'Falla Cindínica',
  disonancia_cognitiva: 'Disonancia Cognitiva'
}

const PIE_COLORS = ['#22c55e', '#eab308', '#ef4444']

export default function CindynicDashboardPage() {
  const params = useParams()
  const id = params.id as string

  const { data: dashboard, isLoading, error } = useCindynicDashboard(id)
  const updateEval = useUpdateCindynicEvaluation(id)
  const updateResponse = useUpdateCindynicResponse(id)

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center min-h-[400px]">
      <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-4" />
      <p className="text-muted-foreground">Cargando dashboard...</p>
    </div>
  )

  if (error || !dashboard) return (
    <div className="p-6">
      <Card className="p-6 border-red-200 bg-red-50">
        <p className="text-red-600">Evaluación no encontrada</p>
      </Card>
      <Link href="/settings/cindynics"><Button className="mt-4">Volver</Button></Link>
    </div>
  )

  const { evaluation, responses, stats } = dashboard

  const pieData = [
    { name: 'Completados', value: stats.completedItems },
    { name: 'En Curso', value: stats.inProgressItems },
    { name: 'Pendientes', value: stats.pendingItems }
  ].filter(d => d.value > 0)

  const radarData = stats.byCategory.map(c => ({
    category: CATEGORY_LABELS[c.category] || c.category,
    Detectados: c.detected,
    Completados: c.completed,
    Total: c.total
  }))

  // Mock historical trend (from past evaluations would be ideal, but for now generate from completion)
  const trendData = [
    { name: 'Hace 2m', avance: 10 },
    { name: 'Hace 1m', avance: 25 },
    { name: 'Hoy', avance: Math.round(stats.completionPct * 100) }
  ]

  const handleStatusChange = async (responseId: string, newStatus: string) => {
    try {
      await updateResponse.mutateAsync({
        id: responseId,
        data: { status: newStatus as Database['public']['Tables']['cindynic_responses']['Update']['status'] }
      })
    } catch { /* toast handled by hook */ }
  }

  const handleDetectedChange = async (responseId: string, detected: boolean) => {
    try {
      await updateResponse.mutateAsync({
        id: responseId,
        data: { detected }
      })
    } catch { /* toast handled by hook */ }
  }

  const handleMarkCompleted = async () => {
    try {
      await updateEval.mutateAsync({ status: 'completed' })
    } catch { /* toast handled by hook */ }
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Link href="/settings/cindynics">
            <Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{evaluation.name}</h1>
            <p className="text-sm text-muted-foreground">
              {new Date(evaluation.evaluation_date).toLocaleDateString('es-VE')}
              {evaluation.notes && ` • ${evaluation.notes}`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className={
            evaluation.status === 'completed' ? 'bg-green-50 text-green-700 border-green-200' :
            evaluation.status === 'in_progress' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
            'bg-gray-50 text-gray-600 border-gray-200'
          }>
            {evaluation.status === 'completed' ? 'Completado' : evaluation.status === 'in_progress' ? 'En Curso' : 'Borrador'}
          </Badge>
          {evaluation.status !== 'completed' && (
            <Button size="sm" variant="outline" className="text-green-600 border-green-200" onClick={handleMarkCompleted} disabled={updateEval.isPending}>
              <CheckCircle2 className="h-4 w-4 mr-1" />Marcar Completado
            </Button>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Total Ítems</p>
          <p className="text-3xl font-extrabold text-slate-800 mt-1">{stats.totalItems}</p>
        </Card>
        <Card className="p-4">
          <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Detectados</p>
          <p className="text-3xl font-extrabold text-orange-600 mt-1">{stats.detectedItems}</p>
        </Card>
        <Card className="p-4">
          <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Completados</p>
          <p className="text-3xl font-extrabold text-green-600 mt-1">{stats.completedItems}</p>
        </Card>
        <Card className="p-4">
          <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">% Avance</p>
          <p className="text-3xl font-extrabold text-blue-600 mt-1">{(stats.completionPct * 100).toFixed(0)}%</p>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Bar Chart - Stacked by category */}
        <Card>
          <CardHeader><CardTitle className="text-sm">Avance por Categoría</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={stats.byCategory.map(c => ({
                name: CATEGORY_LABELS[c.category]?.slice(0, 12) || c.category,
                Completados: c.completed,
                Pendientes: c.total - c.completed
              }))}>
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="Completados" fill="#22c55e" stackId="a" />
                <Bar dataKey="Pendientes" fill="#ef4444" stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Pie Chart */}
        <Card>
          <CardHeader><CardTitle className="text-sm">Estado General</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}>
                  {pieData.map((entry, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Radar Chart */}
        <Card>
          <CardHeader><CardTitle className="text-sm">Rendimiento</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <RadarChart data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="category" tick={{ fontSize: 8 }} />
                <Radar name="Detectados" dataKey="Detectados" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.3} />
                <Radar name="Completados" dataKey="Completados" stroke="#22c55e" fill="#22c55e" fillOpacity={0.3} />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Trend Line */}
      <Card>
        <CardHeader><CardTitle className="text-sm">Tendencia de Avance</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Line type="monotone" dataKey="avance" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6' }} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Responses Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center justify-between">
            <span>Detalle de Ítems ({responses.length})</span>
            <div className="flex gap-2">
              <Badge variant="outline" className="bg-green-50 text-green-700 text-[10px]">{stats.completedItems} completados</Badge>
              <Badge variant="outline" className="bg-yellow-50 text-yellow-700 text-[10px]">{stats.inProgressItems} en curso</Badge>
              <Badge variant="outline" className="bg-red-50 text-red-700 text-[10px]">{stats.pendingItems} pendientes</Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="pb-2 pr-2">Ítem</th>
                  <th className="pb-2 pr-2">Categoría</th>
                  <th className="pb-2 pr-2">Detectado</th>
                  <th className="pb-2 pr-2">Acción</th>
                  <th className="pb-2 pr-2">Responsable</th>
                  <th className="pb-2 pr-2">Estado</th>
                </tr>
              </thead>
              <tbody>
                {responses.map((r) => (
                  <tr key={r.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-2 pr-2 font-medium">{r.item?.name || '—'}</td>
                    <td className="py-2 pr-2 text-muted-foreground">
                      {CATEGORY_LABELS[r.item?.category || ''] || '—'}
                    </td>
                    <td className="py-2 pr-2">
                      <input
                        type="checkbox"
                        checked={r.detected}
                        onChange={(e) => handleDetectedChange(r.id, e.target.checked)}
                        className="accent-orange-500"
                      />
                    </td>
                    <td className="py-2 pr-2 text-muted-foreground">{r.action?.name || '—'}</td>
                    <td className="py-2 pr-2 text-muted-foreground">{r.responsible?.name || '—'}</td>
                    <td className="py-2">
                      <select
                        value={r.status}
                        onChange={(e) => handleStatusChange(r.id, e.target.value)}
                        className={`text-[10px] px-2 py-0.5 rounded border rounded-md ${
                          r.status === 'completed' ? 'bg-green-50 text-green-700 border-green-200' :
                          r.status === 'in_progress' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                          'bg-gray-50 text-gray-600 border-gray-200'
                        }`}
                      >
                        <option value="pending">Pendiente</option>
                        <option value="in_progress">En Curso</option>
                        <option value="completed">Completado</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
