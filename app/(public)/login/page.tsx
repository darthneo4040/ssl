'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'
import { Label } from '../../../components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/card'
import { toast } from 'sonner'
import { Loader2, AlertCircle } from 'lucide-react' //
import { createClient } from '../../../lib/supabase/client'



export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [fullName, setFullName] = useState('')
  
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (isSignUp) {
        // Sign up new user
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        })

        if (signUpError) throw signUpError

        // Create profile
        if (data.user) {
          const { error: profileError } = await supabase
            .from('profiles')
            .insert({
              id: data.user.id,
              full_name: fullName,
              company_id: '550e8400-e29b-41d4-a716-446655440000', // Demo company
              role: 'inspector'
            })

          if (profileError) throw profileError
        }

        toast.success('¡Cuenta creada exitosamente!')
        router.push('/dashboard')
      } else {
        // Sign in existing user
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (signInError) throw signInError

        toast.success('¡Bienvenido a SSL-Vzla!')
        router.push('/dashboard')
      }
    } catch (err: any) {
      setError(err.message || 'Ocurrió un error')
      console.error('Auth error:', err)
    } finally {
      setLoading(false)
    }
  }

  // Credenciales de demo para testing
  const fillDemoCredentials = () => {
    setEmail('demo@ssl-vzla.com')
    setPassword('demo123456')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            {isSignUp ? 'Crear Cuenta' : 'Iniciar Sesión'}
          </CardTitle>
          <CardDescription className="text-center">
            {isSignUp 
              ? 'Registra tu cuenta para acceder al sistema' 
              : 'Ingresa tus credenciales para acceder al sistema'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {isSignUp && (
              <div className="space-y-2">
                <Label htmlFor="fullName">Nombre Completo</Label>
                <Input
                  id="fullName"
                  placeholder="Juan Pérez"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required={isSignUp}
                  disabled={loading}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Correo Electrónico</Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@empresa.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                placeholder={isSignUp ? "Mínimo 6 caracteres" : "••••••••"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                minLength={6}
              />
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isSignUp ? 'Creando cuenta...' : 'Ingresando...'}
                </>
              ) : (
                isSignUp ? 'Crear Cuenta' : 'Ingresar'
              )}
            </Button>
          </form>

          {!isSignUp && (
            <div className="mt-4 text-center">
              <Button 
                type="button"
                variant="outline" 
                size="sm"
                onClick={fillDemoCredentials}
                disabled={loading}
              >
                Usar credenciales de demo
              </Button>
            </div>
          )}

          <div className="mt-4 text-center text-sm text-muted-foreground">
            {isSignUp ? '¿Ya tienes cuenta?' : '¿No tienes cuenta?'}{' '}
            <Button 
              variant="link" 
              className="p-0"
              onClick={() => {
                setIsSignUp(!isSignUp)
                setError('')
              }}
            >
              {isSignUp ? 'Iniciar Sesión' : 'Registrarse'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}