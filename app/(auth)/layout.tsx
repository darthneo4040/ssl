'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { 
  LayoutDashboard, 
  AlertTriangle, 
  FileText, 
  Menu,
  X,
  LogOut,
  Plus,
  Bell,
  BookOpen,
  ClipboardList,
  User as UserIcon,
  BarChart3,
  GraduationCap,
  Users,
  Settings,
  Bot,
} from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/components/providers/auth-provider'
import { useQuery } from '@tanstack/react-query'
import { authService } from '@/lib/services/auth'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user, signOut } = useAuth()

  // Consultar perfil de usuario para mostrar su nombre
  const { data: profile } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: () => user ? authService.getProfile(user.id) : null,
    enabled: !!user,
  })

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Incidentes', href: '/incidents', icon: AlertTriangle },
    { name: 'Evaluación de Riesgos', href: '/risk-assessment', icon: ClipboardList },
    { name: 'Legislación', href: '/legislacion', icon: BookOpen },
    { name: 'Documentos', href: '/documents', icon: FileText },
    { name: 'RRHH', href: '/employees', icon: Users },
    { name: 'Capacitaciones', href: '/training', icon: GraduationCap },
    { name: 'Reportes y Analítica', href: '/reports', icon: BarChart3 },
    { name: 'Asistente IA', href: '/assistant', icon: Bot },
    { name: 'Configuración', href: '/settings', icon: Settings },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div className={cn(
        "fixed inset-0 z-50 lg:hidden",
        sidebarOpen ? "block" : "hidden"
      )}>
        <div className="fixed inset-0 bg-gray-900/80" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 w-64 bg-white">
          <div className="flex h-16 items-center justify-between px-6 border-b">
            <span className="text-xl font-bold">SSL-Vzla</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          <nav className="mt-6 px-3">
            {navigation.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium mb-1",
                    pathname === item.href
                      ? "bg-gray-100 text-gray-900"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  )}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon className="h-5 w-5" />
                  {item.name}
                </Link>
              )
            })}
          </nav>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-1 bg-white border-r">
          <div className="flex h-16 items-center px-6 border-b">
            <span className="text-xl font-bold">SSL-Vzla</span>
          </div>
          <nav className="flex-1 mt-6 px-3">
            {navigation.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium mb-1",
                    pathname === item.href
                      ? "bg-gray-100 text-gray-900"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {item.name}
                </Link>
              )
            })}
          </nav>
          <div className="p-3 border-t">
            <Button variant="ghost" className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50" onClick={signOut}>
              <LogOut className="h-5 w-5 mr-3" />
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <div className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-white px-4 sm:px-6">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          <div className="flex flex-1 items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              {navigation.find(item => item.href === pathname)?.name || 'SSL-Vzla'}
            </h2>
            
            <div className="flex items-center gap-2">
              {pathname === '/incidents' && (
                <Link href="/incidents/new">
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-1" />
                    Reportar Incidente
                  </Button>
                </Link>
              )}
              <Button variant="ghost" size="icon">
                <Bell className="h-5 w-5" />
              </Button>
              <div className="flex items-center gap-2 pl-2 border-l">
                <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center">
                  <UserIcon className="h-4 w-4 text-slate-600" />
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-xs font-semibold text-gray-700 line-clamp-1">
                    {profile?.full_name || user?.email?.split('@')[0] || 'Inspector'}
                  </p>
                  <p className="text-[10px] text-gray-500 capitalize">
                    {profile?.role || 'Inspector'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  )
}