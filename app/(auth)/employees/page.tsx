'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Plus,
  Search,
  Users,
  UserCheck,
  UserX,
  CalendarDays,
  MapPin,
  Phone,
  Loader2
} from 'lucide-react'
import { useEmployees } from '@/hooks/useEmployees'

export default function EmployeesPage() {
  const { data: employees = [], isLoading, error } = useEmployees()
  const [search, setSearch] = useState('')

  const filtered = employees.filter(e => {
    const term = search.toLowerCase()
    return (
      e.full_name.toLowerCase().includes(term) ||
      (e.cedula?.toLowerCase() || '').includes(term) ||
      (e.position?.toLowerCase() || '').includes(term) ||
      (e.department?.toLowerCase() || '').includes(term)
    )
  })

  const active = employees.filter(e => e.status === 'active').length
  const inactive = employees.filter(e => e.status !== 'active').length

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active': return <Badge className="bg-green-100 text-green-700 border-green-200">Activo</Badge>
      case 'inactive': return <Badge className="bg-gray-100 text-gray-600 border-gray-200">Inactivo</Badge>
      case 'suspended': return <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">Suspendido</Badge>
      case 'retired': return <Badge className="bg-blue-100 text-blue-700 border-blue-200">Jubilado</Badge>
      case 'discharged': return <Badge className="bg-red-100 text-red-700 border-red-200">Retirado</Badge>
      default: return <Badge>{status}</Badge>
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-4" />
        <p className="text-muted-foreground">Cargando trabajadores...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50/50 pb-12">
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-200/80 pb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              Gestión de RRHH
            </h1>
            <p className="text-muted-foreground mt-1 text-sm md:text-base">
              {employees.length} {employees.length === 1 ? 'trabajador registrado' : 'trabajadores registrados'}
            </p>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Link href="/employees/new">
              <Button size="sm" className="bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-md shadow-blue-500/10">
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Trabajador
              </Button>
            </Link>
          </div>
        </div>

        {error && (
          <Card className="p-6 border-red-200 bg-red-50">
            <p className="text-red-600 text-sm">Error al cargar los trabajadores</p>
          </Card>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4 border-slate-200/60 bg-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Total</p>
                <p className="text-2xl font-extrabold text-slate-800 mt-1">{employees.length}</p>
              </div>
              <Users className="h-8 w-8 text-slate-300" />
            </div>
          </Card>
          <Card className="p-4 border-slate-200/60 bg-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Activos</p>
                <p className="text-2xl font-extrabold text-green-600 mt-1">{active}</p>
              </div>
              <UserCheck className="h-8 w-8 text-green-300" />
            </div>
          </Card>
          <Card className="p-4 border-slate-200/60 bg-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Inactivos</p>
                <p className="text-2xl font-extrabold text-gray-500 mt-1">{inactive}</p>
              </div>
              <UserX className="h-8 w-8 text-gray-300" />
            </div>
          </Card>
          <Card className="p-4 border-slate-200/60 bg-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Áreas</p>
                <p className="text-2xl font-extrabold text-blue-600 mt-1">
                  {new Set(employees.filter(e => e.department).map(e => e.department)).size}
                </p>
              </div>
              <MapPin className="h-8 w-8 text-blue-300" />
            </div>
          </Card>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre, cédula, cargo o área..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Employee List */}
        {filtered.length === 0 ? (
          <Card className="p-12 text-center border-slate-200/60 bg-white">
            <div className="max-w-md mx-auto space-y-4">
              <div className="h-12 w-12 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center mx-auto text-slate-400">
                <Users className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-800">
                  {search ? 'Sin resultados' : 'No hay trabajadores registrados'}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {search ? 'Intenta con otros términos de búsqueda' : 'Registra el primer trabajador para comenzar'}
                </p>
              </div>
            </div>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((employee) => (
              <Link key={employee.id} href={`/employees/${employee.id}`}>
                <Card className="hover:shadow-md hover:scale-[1.01] transition-all border-slate-200/60 bg-white rounded-xl overflow-hidden cursor-pointer group">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">
                          {employee.full_name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800 group-hover:text-blue-600 transition-colors">
                            {employee.full_name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {employee.cedula || 'Sin cédula'}
                          </p>
                        </div>
                      </div>
                      {getStatusBadge(employee.status)}
                    </div>

                    <div className="space-y-2 text-xs text-muted-foreground">
                      {employee.position && (
                        <p className="flex items-center gap-1.5">
                          <UserCheck className="h-3.5 w-3.5" />
                          {employee.position}
                        </p>
                      )}
                      {employee.department && (
                        <p className="flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5" />
                          {employee.department}
                        </p>
                      )}
                      {employee.phone && (
                        <p className="flex items-center gap-1.5">
                          <Phone className="h-3.5 w-3.5" />
                          {employee.phone}
                        </p>
                      )}
                      {employee.hire_date && (
                        <p className="flex items-center gap-1.5">
                          <CalendarDays className="h-3.5 w-3.5" />
                          Ingreso: {new Date(employee.hire_date).toLocaleDateString('es-VE')}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
