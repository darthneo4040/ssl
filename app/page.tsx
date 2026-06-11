import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  ShieldCheck, 
  Scale, 
  ClipboardList, 
  BrainCircuit, 
  ArrowRight,
  Sparkles
} from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-900 text-white selection:bg-blue-600 selection:text-white relative overflow-hidden flex flex-col justify-between">
      
      {/* Decorative Glowing Orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 -z-10" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 -z-10" />

      {/* Header */}
      <header className="border-b border-slate-800/80 backdrop-blur-md sticky top-0 z-50 bg-slate-900/80">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-500/20">
              <ShieldCheck className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
              SSL-Vzla
            </span>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost" className="text-sm font-medium hover:bg-slate-800 text-slate-300 hover:text-white">
                Iniciar Sesión
              </Button>
            </Link>
            <Link href="/login">
              <Button className="text-sm bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg px-4 shadow-lg shadow-blue-600/20">
                Registrarse
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col justify-center py-16 px-6 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column Text */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-950/60 border border-blue-800/30 text-xs font-semibold text-blue-400">
              <Sparkles className="h-3 w-3 text-blue-400 animate-pulse" />
              Módulo de Analítica Predictiva Activo
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1] text-slate-100">
              Gestión Inteligente de
              <span className="block bg-gradient-to-r from-blue-400 via-indigo-400 to-sky-400 bg-clip-text text-transparent">
                Seguridad y Salud Laboral
              </span>
            </h1>
            
            <p className="text-base sm:text-lg text-slate-400 max-w-xl mx-auto lg:mx-0">
              Cumple estrictamente con la LOPCYMAT y normas COVENIN, organiza matrices de riesgo IPER y anticipa accidentes industriales usando nuestro motor predictivo con Inteligencia Artificial.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-2">
              <Link href="/login">
                <Button size="lg" className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl px-8 py-6 text-base shadow-xl shadow-blue-600/25 flex items-center justify-center gap-2 group">
                  Acceder a la Plataforma
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button size="lg" variant="outline" className="w-full sm:w-auto border-slate-700 hover:bg-slate-800/60 text-slate-300 font-bold rounded-xl px-8 py-6 text-base">
                  Explorar Demo
                </Button>
              </Link>
            </div>
          </div>

          {/* Right Column Features Grid */}
          <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Feature 1 */}
            <div className="p-5 rounded-2xl bg-slate-800/50 border border-slate-700/40 space-y-3 backdrop-blur-xs">
              <div className="h-10 w-10 rounded-lg bg-blue-900/50 border border-blue-700/30 flex items-center justify-center">
                <Scale className="h-5 w-5 text-blue-400" />
              </div>
              <h3 className="font-bold text-slate-200">Cumplimiento Legal</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Automatización de índices COVENIN 474 e impresión de formularios de notificación inmediata para el INPSASEL.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-5 rounded-2xl bg-slate-800/50 border border-slate-700/40 space-y-3 backdrop-blur-xs">
              <div className="h-10 w-10 rounded-lg bg-indigo-900/50 border border-indigo-700/30 flex items-center justify-center">
                <ClipboardList className="h-5 w-5 text-indigo-400" />
              </div>
              <h3 className="font-bold text-slate-200">Matriz IPER / ART</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Identificación de peligros en puestos de trabajo con mapas de calor interactivos 5x5 y planes de acción preventivos.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-5 rounded-2xl bg-slate-800/50 border border-slate-700/40 space-y-3 backdrop-blur-xs sm:col-span-2">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-sky-900/50 border border-sky-700/30 flex items-center justify-center shrink-0">
                  <BrainCircuit className="h-5 w-5 text-sky-400" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-200">Modelos de IA & Predicción</h3>
                  <p className="text-xs text-slate-400 leading-relaxed mt-1">
                    Clasificación causal por NLP, pirámide de Heinrich en tiempo real y mapas de probabilidad de accidentes en planta.
                  </p>
                </div>
              </div>
            </div>

          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p>© {new Date().getFullYear()} SSL-Vzla. Diseñado para la prevención de riesgos laborales en Venezuela.</p>
          <div className="flex gap-4">
            <span className="hover:text-slate-400 cursor-pointer">LOPCYMAT</span>
            <span className="hover:text-slate-400 cursor-pointer">INPSASEL</span>
            <span className="hover:text-slate-400 cursor-pointer">COVENIN</span>
          </div>
        </div>
      </footer>

    </div>
  )
}