import Link from 'next/link'
import { Button } from '../components/ui/button'

export default function HomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center space-y-6 p-8">
        <h1 className="text-5xl font-bold text-gray-900">
          SSL-Vzla
        </h1>
        <p className="text-xl text-gray-600 max-w-md mx-auto">
          Plataforma integral para la gestión de Seguridad y Salud Laboral
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/login">
            <Button size="lg">
              Iniciar Sesión
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button size="lg" variant="outline">
              Demo Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}