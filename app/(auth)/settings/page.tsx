'use client'

import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  AlertTriangle,
  ClipboardList,
  Users,
  ListChecks,
  ArrowRight
} from 'lucide-react'

const modules = [
  {
    title: 'Evaluaciones Cindínicas',
    description: 'Gestiona evaluaciones periódicas de déficit cindínico, falla cindínica y disonancia cognitiva',
    icon: AlertTriangle,
    href: '/settings/cindynics',
    color: 'text-orange-600 bg-orange-50'
  },
  {
    title: 'Ítems de Evaluación',
    description: 'Personaliza los 16 ítems: activa/desactiva, renombra o reordena',
    icon: ListChecks,
    href: '/settings/cindynics/items',
    color: 'text-blue-600 bg-blue-50'
  },
  {
    title: 'Acciones Correctivas',
    description: 'Catálogo de acciones disponibles para cada ítem detectado',
    icon: ClipboardList,
    href: '/settings/cindynics/actions',
    color: 'text-green-600 bg-green-50'
  },
  {
    title: 'Responsables',
    description: 'Gestiona la lista de responsables asignables a las acciones',
    icon: Users,
    href: '/settings/cindynics/responsibles',
    color: 'text-purple-600 bg-purple-50'
  }
]

export default function SettingsPage() {
  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
          Configuración del Sistema
        </h1>
        <p className="text-muted-foreground mt-1">
          Gestión del Peligro - Metodología Cindínica
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {modules.map((mod) => {
          const Icon = mod.icon
          return (
            <Link key={mod.href} href={mod.href}>
              <Card className="hover:shadow-md hover:scale-[1.01] transition-all border-slate-200/60 cursor-pointer h-full">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className={`p-2 rounded-lg ${mod.color}`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <CardTitle className="text-lg mt-3">{mod.title}</CardTitle>
                  <CardDescription>{mod.description}</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
