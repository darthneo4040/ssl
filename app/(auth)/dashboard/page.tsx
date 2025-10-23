import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  FileText,
  TrendingUp,
  Users,
  Shield,
  Activity
} from 'lucide-react'

export default function DashboardPage() {
  const stats = [
    {
      title: "Días sin Accidentes",
      value: "127",
      description: "Último: 15/06/2024",
      icon: CheckCircle,
      color: "text-green-600"
    },
    {
      title: "Incidentes Activos",
      value: "3",
      description: "2 de alta prioridad",
      icon: AlertTriangle,
      color: "text-yellow-600"
    },
    {
      title: "Inspecciones Pendientes",
      value: "8",
      description: "Próxima: mañana",
      icon: Clock,
      color: "text-blue-600"
    },
    {
      title: "Documentos por Revisar",
      value: "12",
      description: "5 urgentes",
      icon: FileText,
      color: "text-purple-600"
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Panel de Control SSL
          </h1>
          <p className="text-muted-foreground mt-1">
            Resumen de seguridad y salud laboral
          </p>
        </div>
        
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <Card key={index}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {stat.title}
                  </CardTitle>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground">
                    {stat.description}
                  </p>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Actividad Reciente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { status: 'success', text: 'Inspección completada - Área de Producción', time: 'Hace 2 horas' },
                  { status: 'warning', text: 'Nuevo incidente reportado - Almacén', time: 'Hace 5 horas' },
                  { status: 'info', text: 'Capacitación programada - Primeros Auxilios', time: 'Hace 1 día' },
                ].map((item, index) => (
                  <div key={index} className="flex items-center space-x-4 text-sm">
                    <div className={`w-2 h-2 rounded-full ${
                      item.status === 'success' ? 'bg-green-500' :
                      item.status === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
                    }`} />
                    <div className="flex-1">
                      <p className="font-medium">{item.text}</p>
                      <p className="text-muted-foreground">{item.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Métricas del Mes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Reducción de Incidentes</span>
                  <span className="text-sm font-bold text-green-600">-23%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Cumplimiento de Inspecciones</span>
                  <span className="text-sm font-bold text-blue-600">87%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Personal Capacitado</span>
                  <span className="text-sm font-bold text-purple-600">156</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}