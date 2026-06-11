'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { toast } from 'sonner'
import { Loader2, AlertCircle, ShieldCheck, Sparkles, KeyRound } from 'lucide-react'
import { useAuth } from '@/components/providers/auth-provider'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [fullName, setFullName] = useState('')
  
  const { signIn, signUp } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (isSignUp) {
        await signUp(email, password, fullName)
        toast.success('¡Cuenta creada exitosamente!')
      } else {
        await signIn(email, password)
        toast.success('¡Bienvenido a SSL-Vzla!')
      }
    } catch (err) {
      setError((err as Error).message || 'Ocurrió un error')
      console.error('Auth error:', err)
    } finally {
      setLoading(false)
    }
  }

  // Credenciales de demo para testing
  const fillDemoCredentials = () => {
    setEmail('demo@ssl-vzla.com')
    setPassword('demo123456')
    toast.info('Credenciales de demo ingresadas.')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100 relative overflow-hidden px-4 selection:bg-blue-600 selection:text-white">
      
      {/* Decorative Orbs */}
      <div className="absolute top-0 right-1/4 w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-indigo-600/10 rounded-full blur-3xl -z-10" />

      <Card className="w-full max-w-md bg-slate-900/60 border-slate-800/80 backdrop-blur-md shadow-2xl rounded-2xl overflow-hidden text-slate-200">
        
        <CardHeader className="space-y-2 pb-6 border-b border-slate-800/40 bg-slate-900/40 text-center">
          
          <div className="flex justify-center mb-1">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20 animate-pulse">
              <ShieldCheck className="h-6 w-6 text-white" />
            </div>
          </div>
          
          <CardTitle className="text-2xl font-bold tracking-tight text-white">
            {isSignUp ? 'Crear Cuenta SSL' : 'Ingreso al Sistema'}
          </CardTitle>
          
          <CardDescription className="text-slate-400 text-xs sm:text-sm">
            {isSignUp 
              ? 'Registra tu cuenta para acceder a SSL-Vzla' 
              : 'Introduce tus credenciales para administrar la prevención'}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="pt-6 space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {error && (
              <Alert className="bg-red-950/40 border-red-900/50 text-red-400">
                <AlertCircle className="h-4 w-4 text-red-500" />
                <AlertDescription className="text-xs">{error}</AlertDescription>
              </Alert>
            )}

            {isSignUp && (
              <div className="space-y-1.5">
                <Label htmlFor="fullName" className="text-xs font-semibold text-slate-300">Nombre Completo</Label>
                <Input
                  id="fullName"
                  placeholder="Juan Pérez"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required={isSignUp}
                  disabled={loading}
                  className="bg-slate-950/60 border-slate-800 focus:border-blue-600 text-slate-100 placeholder:text-slate-600"
                />
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-semibold text-slate-300">Correo Electrónico</Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@empresa.com.ve"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                className="bg-slate-950/60 border-slate-800 focus:border-blue-600 text-slate-100 placeholder:text-slate-600"
              />
            </div>
            
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <Label htmlFor="password" className="text-xs font-semibold text-slate-300">Contraseña</Label>
                {!isSignUp && (
                  <span className="text-[10px] text-blue-400 hover:text-blue-300 cursor-pointer transition-colors">¿Olvidó su clave?</span>
                )}
              </div>
              <Input
                id="password"
                type="password"
                placeholder={isSignUp ? "Mínimo 6 caracteres" : "••••••••"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                minLength={6}
                className="bg-slate-950/60 border-slate-800 focus:border-blue-600 text-slate-100 placeholder:text-slate-600"
              />
            </div>

            <Button 
              type="submit" 
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl py-5 shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-white" />
                  {isSignUp ? 'Creando cuenta...' : 'Ingresando...'}
                </>
              ) : (
                <>
                  <KeyRound className="h-4 w-4" />
                  {isSignUp ? 'Crear Cuenta' : 'Ingresar al Portal'}
                </>
              )}
            </Button>
          </form>

          {!isSignUp && (
            <div className="text-center pt-2">
              <Button 
                type="button"
                variant="outline" 
                size="sm"
                onClick={fillDemoCredentials}
                disabled={loading}
                className="border-slate-800 hover:bg-slate-800/50 text-slate-300 hover:text-white flex items-center gap-1.5 mx-auto text-xs"
              >
                <Sparkles className="h-3 w-3 text-blue-400" />
                Usar credenciales de demo
              </Button>
            </div>
          )}

          <div className="border-t border-slate-800/40 pt-4 text-center text-xs text-slate-500">
            {isSignUp ? '¿Ya tienes cuenta?' : '¿No tienes cuenta registrada?'}{' '}
            <Button 
              variant="link" 
              className="p-0 text-blue-400 hover:text-blue-300 h-auto text-xs font-semibold"
              onClick={() => {
                setIsSignUp(!isSignUp)
                setError('')
              }}
            >
              {isSignUp ? 'Iniciar Sesión' : 'Registrarse ahora'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}