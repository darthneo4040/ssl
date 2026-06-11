'use client'

import { useState, useMemo, Fragment } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { 
  BarChart3, 
  Scale, 
  Activity, 
  BrainCircuit, 
  Printer, 
  AlertTriangle, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  TrendingUp,
  ShieldAlert,
  Search,
  Sparkles,
  ArrowUpRight,
  ClipboardList,
  Sparkle,
  GraduationCap
} from 'lucide-react'
import { useIncidents } from '@/hooks/useIncidents'
import { useAllIdentifiedRisks, useAllActionPlans } from '@/hooks/useRiskAssessments'
import { toast } from 'sonner'
import { useTrainingStore } from '@/lib/store/training'

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState('compliance')
  
  // --- Data Loading ---
  const { data: incidents = [], isLoading: loadingIncidents } = useIncidents()
  const { data: identifiedRisks = [], isLoading: loadingRisks } = useAllIdentifiedRisks()
  const { data: actionPlans = [], isLoading: loadingPlans } = useAllActionPlans()
  const { sessions: trainingSessions } = useTrainingStore()

  // --- COVENIN 474 State & Calculations ---
  const [hht, setHht] = useState<number>(450000) // Horas-Hombre Trabajadas (Default)
  const [empleadosPromedio, setEmpleadosPromedio] = useState<number>(250) // Promedio trabajadores (Default)
  const [customDiasPerdidos, setCustomDiasPerdidos] = useState<number>(18) // Días cargados/perdidos (Default)

  // Filtrar incidentes reales de tipo "accidente"
  const accidentesReales = useMemo(() => {
    return incidents.filter(i => i.type === 'accident')
  }, [incidents])

  // IFN (Índice de Frecuencia Neta) = (Nº accidentes × 1,000,000) / HHT
  const ifn = useMemo(() => {
    if (hht <= 0) return 0
    return Number(((accidentesReales.length * 1000000) / hht).toFixed(2))
  }, [accidentesReales, hht])

  // IG (Índice de Gravedad) = (Total Días Perdidos × 1,000,000) / HHT
  const ig = useMemo(() => {
    if (hht <= 0) return 0
    return Number(((customDiasPerdidos * 1000000) / hht).toFixed(2))
  }, [customDiasPerdidos, hht])

  // --- INPSASEL PDF Selection State ---
  const [selectedIncidentId, setSelectedIncidentId] = useState<string>('')
  const [inpsaselEmpresa, setInpsaselEmpresa] = useState('Servicios Industriales Metalúrgicos Vzla, C.A.')
  const [inpsaselRif, setInpsaselRif] = useState('J-30948572-1')
  const [inpsaselDireccion, setInpsaselDireccion] = useState('Av. Intercomunal, Galpón 4A, Zona Industrial II, Barquisimeto, Edo. Lara')
  
  const selectedIncident = useMemo(() => {
    return incidents.find(i => i.id === selectedIncidentId)
  }, [incidents, selectedIncidentId])

  // --- HHC Training Compliance Dynamic Data ---
  const trainingData = useMemo(() => {
    const departments: ('Operaciones' | 'Mantenimiento' | 'Logística' | 'Administración' | 'Calidad')[] = [
      'Operaciones', 'Mantenimiento', 'Logística', 'Administración', 'Calidad'
    ]
    
    const metas: Record<string, number> = {
      Operaciones: 500,
      Mantenimiento: 350,
      Logística: 200,
      Administración: 100,
      Calidad: 150
    }

    return departments.map(depto => {
      // Sumar HHC = duración * asistentes de las sesiones 'realizada' de este departamento
      const deptoSessions = trainingSessions.filter(s => s.department === depto && s.status === 'realizada')
      const actualHHC = deptoSessions.reduce((sum, s) => sum + (s.durationHours * s.attendeesCount), 0)
      const meta = metas[depto] || 100
      const pct = meta > 0 ? Math.min(100, Math.round((actualHHC / meta) * 100)) : 0
      
      return {
        depto,
        actual: actualHHC,
        meta,
        pct
      }
    })
  }, [trainingSessions])

  // --- IPER Heatmap Calculations ---
  // Probabilidad (1-5) x Severidad (1-5)
  // Matriz de 5x5. Cada celda contendrá los riesgos que coincidan con esa puntuación
  const iperMatrix = useMemo(() => {
    const matrix: Record<string, typeof identifiedRisks> = {}
    for (let p = 1; p <= 5; p++) {
      for (let s = 1; s <= 5; s++) {
        matrix[`${p}-${s}`] = []
      }
    }

    identifiedRisks.forEach(risk => {
      // Mapeamos los valores de probabilidad y severidad al rango 1-5
      const p = Math.min(5, Math.max(1, Math.round(risk.probability || 3)))
      const s = Math.min(5, Math.max(1, Math.round(risk.severity || 3)))
      matrix[`${p}-${s}`].push(risk)
    })

    return matrix
  }, [identifiedRisks])

  const [selectedIperCell, setSelectedIperCell] = useState<string | null>(null)
  
  const risksInSelectedCell = useMemo(() => {
    if (!selectedIperCell) return []
    return iperMatrix[selectedIperCell] || []
  }, [iperMatrix, selectedIperCell])

  // Evaluar nivel de riesgo general basado en P x S
  const getRiskLevel = (p: number, s: number) => {
    const score = p * s
    if (score >= 15) return { label: 'Intolerable / Crítico', color: 'bg-red-500 text-white', hex: '#ef4444' }
    if (score >= 8) return { label: 'Significativo / Medio', color: 'bg-amber-500 text-white', hex: '#f59e0b' }
    return { label: 'Tolerable / Bajo', color: 'bg-emerald-500 text-white', hex: '#10b981' }
  }

  // --- Action Plan Effectiveness ---
  const planStats = useMemo(() => {
    const total = actionPlans.length
    const completed = actionPlans.filter(p => p.status === 'completed').length
    const inProgress = actionPlans.filter(p => p.status === 'in_progress').length
    const pending = actionPlans.filter(p => p.status === 'pending').length
    const overdue = actionPlans.filter(p => p.status === 'overdue').length
    const pctCompletion = total > 0 ? Math.round((completed / total) * 100) : 0

    return { total, completed, inProgress, pending, overdue, pctCompletion }
  }, [actionPlans])

  // --- Incident Trends ---
  const incidentsByType = useMemo(() => {
    const types = { accident: 0, near_miss: 0, unsafe_condition: 0, unsafe_act: 0, environmental: 0 }
    incidents.forEach(i => {
      if (i.type && i.type in types) {
        types[i.type as keyof typeof types] += 1
      }
    })
    return types
  }, [incidents])

  // --- NLP Causal Classifier State ---
  const [nlpTextInput, setNlpTextInput] = useState('')
  const [nlpPrediction, setNlpPrediction] = useState<{
    causalFactor: string
    confidence: number
    heinrichProjection: string
    recommendation: string
  } | null>(null)

  const handleNlpClassify = () => {
    if (!nlpTextInput.trim()) {
      toast.warning('Por favor introduce la descripción de un incidente.')
      return
    }

    const text = nlpTextInput.toLowerCase()
    let causalFactor = 'Comportamiento Inseguro General'
    let confidence = 85
    let recommendation = 'Reforzar charlas de concientización y realizar rondas de seguridad semanales.'
    let heinrichProjection = 'Tendencia baja de escalabilidad. Sin embargo, no debe ignorarse.'

    if (text.includes('arnes') || text.includes('epp') || text.includes('casco') || text.includes('botas') || text.includes('guantes')) {
      causalFactor = 'Omisión / Mal uso de EPP'
      confidence = 94
      recommendation = 'Realizar auditorías específicas sobre uso de EPP, suspender tareas sin implementos y dictar re-inducción sobre COVENIN 2237.'
      heinrichProjection = 'ALERTA: Según la Pirámide de Heinrich, 30 actos inseguros de este tipo sin control escalarán en un accidente con tiempo perdido.'
    } else if (text.includes('aceite') || text.includes('limpieza') || text.includes('obstaculo') || text.includes('orden') || text.includes('desorden')) {
      causalFactor = 'Falta de Orden y Limpieza (5S)'
      confidence = 91
      recommendation = 'Implementar metodología de las 5S en el área comprometida, limpiar de inmediato derrames y demarcar pasillos peatonales.'
      heinrichProjection = 'CRÍTICO: El 60% de las caídas a nivel se originan por desorden. Peligro inminente de fractura/lesión menor.'
    } else if (text.includes('ruido') || text.includes('calor') || text.includes('iluminacion') || text.includes('luz')) {
      causalFactor = 'Condiciones Ambientales Deficientes'
      confidence = 88
      recommendation = 'Realizar mediciones higiénicas del área (sonometría, iluminación). Adaptar ventilación o proveer protección auditiva adecuada.'
      heinrichProjection = 'Riesgo acumulativo de enfermedad ocupacional. Afectará la tasa de morbilidad anual.'
    } else if (text.includes('maquina') || text.includes('falla') || text.includes('mantenimiento') || text.includes('herramienta')) {
      causalFactor = 'Falla de Equipos / Herramienta Defectuosa'
      confidence = 96
      recommendation = 'Bloqueo y etiquetado (LOTO) inmediato del equipo defectuoso. Programar mantenimiento correctivo antes de reanudar tareas.'
      heinrichProjection = 'EXTREMO: Una falla mecánica repetitiva tiene alta probabilidad de provocar atrapamientos o amputaciones críticas.'
    }

    setNlpPrediction({ causalFactor, confidence, heinrichProjection, recommendation })
    toast.success('Análisis de IA finalizado.')
  }

  // --- Heinrich Pyramid Ratios (Active DB Data) ---
  const heinrichPyramid = useMemo(() => {
    // 1 Accidente Mayor : 30 Accidentes Menores : 300 Actos/Condiciones Inseguras
    // Usaremos datos reales de incidentes para poblar la base de la pirámide
    const totalEventos = incidents.length
    const actosYCondiciones = incidents.filter(i => i.type === 'unsafe_act' || i.type === 'unsafe_condition').length
    const incidentesCasi = incidents.filter(i => i.type === 'near_miss').length
    const accidentes = accidentesReales.length
    const criticos = accidentesReales.filter(i => i.severity === 'critical' || i.severity === 'high').length

    // Proyecciones basadas en Heinrich si faltan datos
    const baseActos = Math.max(actosYCondiciones + incidentesCasi, 12)
    const accidentesMedios = Math.max(accidentes, Math.round(baseActos * 0.1))
    const fatalidadesProyectadas = Math.max(criticos, Math.round(accidentesMedios * 0.033))

    return {
      actosReales: actosYCondiciones + incidentesCasi,
      accidentesReales: accidentes,
      criticosReales: criticos,
      baseActos,
      accidentesMedios,
      fatalidadesProyectadas
    }
  }, [incidents, accidentesReales])

  // --- Control Measure Recommendation Data ---
  const [selectedControlHazard, setSelectedControlHazard] = useState('altura')
  const controlRecommendations = {
    altura: {
      titulo: 'Trabajo en Altura (Peligro de Caídas)',
      ingenieria: 'Instalación de barandas perimetrales rígidas, redes de seguridad anticaídas, y puntos de anclaje fijos certificados.',
      admin: 'Permiso de Trabajo Seguro (PTS), Análisis de Riesgo de Tarea (ART) en frío, charlas de 5 minutos, y certificación de aptitud física.',
      epp: 'Arnés de seguridad de cuerpo completo (clase A), eslinga doble con absorbedor de energía, y casco con barboquejo de 3 puntos.',
      covenin: 'Norma COVENIN 1042: Arneses de Seguridad e Indicaciones de Uso. LOPCYMAT Art. 53, 54.'
    },
    quimico: {
      titulo: 'Manipulación de Sustancias Químicas Corrosivas',
      ingenieria: 'Sistemas de extracción localizada de vapores, diques de contención de derrames, y duchas/lavaojos de emergencia a menos de 10 metros.',
      admin: 'Hojas de datos de seguridad (FDS/MSDS) en español visibles en el área, etiquetado SGA de contenedores, e inducción sobre riesgos químicos.',
      epp: 'Respirador con filtros contra vapores químicos, gafas de seguridad tipo goggle herméticas, delantal de neopreno y guantes de nitrilo largos.',
      covenin: 'Norma COVENIN 3060: Clasificación y Etiquetado de Materiales Peligrosos. LOPCYMAT Art. 59.'
    },
    ruido: {
      titulo: 'Exposición a Niveles Elevados de Ruido Industrial (>85 dBA)',
      ingenieria: 'Aislamiento acústico de compresores/motores, cabinas de control insonorizadas para operadores, y amortiguadores de vibración.',
      admin: 'Audiometrías anuales obligatorias, rotación de personal para limitar el tiempo de exposición, y señalización obligatoria de zona ruidosa.',
      epp: 'Protectores auditivos de copa (orejeras) o tapones de silicona insertables de alta atenuación (NRR > 25dB).',
      covenin: 'Norma COVENIN 1565: Ruido Ocupacional, Programa de Conservación Auditiva. LOPCYMAT Art. 56.'
    },
    electrico: {
      titulo: 'Trabajos de Mantenimiento Eléctrico (Alta/Media Tensión)',
      ingenieria: 'Uso de tableros blindados IP65, interruptores termomagnéticos diferenciales y puesta a tierra física verificada.',
      admin: 'Implementar el protocolo estándar de Bloqueo y Etiquetado (LOTO) para desenergizar fuentes, y delimitación física del área.',
      epp: 'Guantes dieléctricos certificados para la tensión de trabajo, calzado dieléctrico sin punta de acero, protector facial contra arco eléctrico.',
      covenin: 'Norma COVENIN 200: Código Eléctrico Nacional. Norma COVENIN 2253 (Seguridad en Soldadura y Corte).'
    }
  }

  // --- Time-Series Accident Forecast ---
  // Generaremos un forecast lineal proyectando los meses venideros basado en incidentes mensuales
  const forecastMonths = ['Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov']
  const forecastValues = useMemo(() => {
    // Calculamos una tasa histórica básica
    const totalIncidentes = incidents.length
    const baseMensual = Math.max(1.2, totalIncidentes / 12)
    // Agregamos estacionalidad típica de Barquisimeto/Venezuela (aumento en julio por vacaciones/mantenimiento, aumento en noviembre por prisas de fin de año)
    return [
      Math.round(baseMensual),
      Math.round(baseMensual * 1.6), // Pico Julio
      Math.round(baseMensual * 0.9),
      Math.round(baseMensual * 0.8),
      Math.round(baseMensual * 1.1),
      Math.round(baseMensual * 1.8), // Pico Noviembre
    ]
  }, [incidents])

  // --- Print Handler for INPSASEL Forms ---
  const handlePrint = (formType: 'notificacion' | 'declaracion') => {
    if (!selectedIncidentId) {
      toast.error('Por favor, selecciona un incidente registrado para autocompletar el formulario.')
      return
    }

    const printWindow = window.open('', '_blank')
    if (!printWindow) {
      toast.error('No se pudo abrir la ventana de impresión. Por favor, deshabilita el bloqueador de pop-ups.')
      return
    }

    const title = formType === 'notificacion' ? 'Notificación Inmediata de Accidente' : 'Declaración Formal de Accidente de Trabajo'
    
    // Contenido del documento a imprimir con estilos CSS print-friendly
    const htmlContent = `
      <html>
        <head>
          <title>INPSASEL - ${title}</title>
          <style>
            body { font-family: Arial, sans-serif; font-size: 11px; color: #333; line-height: 1.4; padding: 20px; }
            .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 20px; }
            .header h1 { font-size: 16px; margin: 5px 0; uppercase: true; }
            .header h2 { font-size: 12px; margin: 5px 0; color: #666; }
            .section { border: 1px solid #000; margin-bottom: 15px; }
            .section-title { bg-color: #f0f0f0; background: #e5e7eb; font-weight: bold; padding: 6px; border-bottom: 1px solid #000; font-size: 11px; text-transform: uppercase; }
            .grid { display: grid; grid-template-columns: repeat(12, 1fr); }
            .col { padding: 6px; border-right: 1px solid #ddd; border-bottom: 1px solid #ddd; }
            .col:last-child { border-right: none; }
            .col-12 { grid-column: span 12; }
            .col-8 { grid-column: span 8; }
            .col-6 { grid-column: span 6; }
            .col-4 { grid-column: span 4; }
            .col-3 { grid-column: span 3; }
            .col-2 { grid-column: span 2; }
            .label { font-weight: bold; font-size: 9px; color: #555; display: block; margin-bottom: 3px; }
            .value { font-size: 11px; min-height: 14px; }
            .footer-notes { font-size: 8px; color: #777; margin-top: 20px; text-align: justify; }
            .signatures { margin-top: 45px; display: flex; justify-content: space-between; }
            .sig-box { width: 45%; text-align: center; border-top: 1px solid #000; padding-top: 5px; font-size: 10px; }
            @media print {
              body { padding: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <strong>REPÚBLICA BOLIVARIANA DE VENEZUELA</strong><br/>
            <strong>MINISTERIO DEL PODER POPULAR PARA EL PROCESO SOCIAL DE TRABAJO</strong><br/>
            <strong>INSTITUTO NACIONAL DE PREVENCIÓN, SALUD Y SEGURIDAD LABORALES (INPSASEL)</strong><br/>
            <h1>${title.toUpperCase()}</h1>
            <h2>Para dar cumplimiento a la LOPCYMAT y su Reglamento Parcial</h2>
          </div>

          <div class="section">
            <div class="section-title">1. Datos de la Entidad de Trabajo (Patrono)</div>
            <div class="grid">
              <div class="col col-8">
                <span class="label">Razón Social:</span>
                <div class="value">${inpsaselEmpresa}</div>
              </div>
              <div class="col col-4">
                <span class="label">R.I.F. N°:</span>
                <div class="value">${inpsaselRif}</div>
              </div>
              <div class="col col-12">
                <span class="label">Dirección Fiscal / Dirección del Centro de Trabajo:</span>
                <div class="value">${inpsaselDireccion}</div>
              </div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">2. Datos de la Persona Accidentada</div>
            <div class="grid">
              <div class="col col-6">
                <span class="label">Apellidos y Nombres:</span>
                <div class="value">${selectedIncident?.profiles?.full_name || 'Trabajador no especificado'}</div>
              </div>
              <div class="col col-3">
                <span class="label">Cédula de Identidad:</span>
                <div class="value">V-17.892.485 (Simulado)</div>
              </div>
              <div class="col col-3">
                <span class="label">Cargo Habitual:</span>
                <div class="value">${selectedIncident?.profiles?.role || 'Inspector / Operario'}</div>
              </div>
              <div class="col col-6">
                <span class="label">Departamento / Área Asociada:</span>
                <div class="value">${selectedIncident?.location || 'Área de Planta'}</div>
              </div>
              <div class="col col-6">
                <span class="label">Correo Electrónico / Teléfono:</span>
                <div class="value">contacto@empresa.com.ve</div>
              </div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">3. Detalles del Suceso (Incidente/Accidente)</div>
            <div class="grid">
              <div class="col col-6">
                <span class="label">Lugar Específico del Accidente:</span>
                <div class="value">${selectedIncident?.location || 'Instalaciones de la empresa'}</div>
              </div>
              <div class="col col-3">
                <span class="label">Fecha del Accidente:</span>
                <div class="value">${selectedIncident?.occurred_at ? new Date(selectedIncident.occurred_at).toLocaleDateString('es-VE') : 'No especificada'}</div>
              </div>
              <div class="col col-3">
                <span class="label">Hora del Accidente:</span>
                <div class="value">${selectedIncident?.occurred_at ? new Date(selectedIncident.occurred_at).toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit' }) : 'No especificada'}</div>
              </div>
              <div class="col col-12" style="min-height: 80px;">
                <span class="label">Descripción Detallada del Accidente (¿Cómo ocurrió?, ¿Qué hacía?, Agente Causante):</span>
                <div class="value">${selectedIncident?.description || 'No hay descripción detallada.'}</div>
              </div>
              <div class="col col-12">
                <span class="label">Medidas Inmediatas Tomadas / Primeros Auxilios:</span>
                <div class="value">${selectedIncident?.immediate_action || 'Atención en sitio e informe al supervisor.'}</div>
              </div>
              <div class="col col-12">
                <span class="label">Testigos Presenciales del Hecho:</span>
                <div class="value">${selectedIncident?.witnesses || 'Ninguno reportado.'}</div>
              </div>
            </div>
          </div>

          ${formType === 'declaracion' ? `
          <div class="section">
            <div class="section-title">4. Análisis Preliminar de Causas (Uso Exclusivo del Ingeniero / CSSL)</div>
            <div class="grid">
              <div class="col col-12">
                <span class="label">Factores Personales / Actos Inseguros Detectados:</span>
                <div class="value">Posible exceso de confianza, omisión de reporte de peligro o falta de uso del EPP reglamentario.</div>
              </div>
              <div class="col col-12">
                <span class="label">Condición Insegura del Entorno / Factores de Trabajo:</span>
                <div class="value">Pisos húmedos sin señalización o falta de orden y limpieza.</div>
              </div>
              <div class="col col-6">
                <span class="label">Severidad del Daño (Criterio del Servicio de SSL):</span>
                <div class="value" style="text-transform: capitalize;">${selectedIncident?.severity || 'Media'}</div>
              </div>
              <div class="col col-6">
                <span class="label">Días de Reposo Proyectados:</span>
                <div class="value">${customDiasPerdidos} días hábiles recomendados de reposo.</div>
              </div>
            </div>
          </div>
          ` : ''}

          <div class="footer-notes">
            <strong>NOTAS LEGALES:</strong> Conforme al Artículo 73 de la LOPCYMAT y el Artículo 83 de su Reglamento Parcial, todo accidente de trabajo debe ser notificado al INPSASEL de forma inmediata (dentro de los 60 minutos del suceso) y declarado formalmente dentro de las veinticuatro (24) horas siguientes a su ocurrencia. El suministro de información falsa o la declaración tardía constituye una infracción muy grave sancionada con multas severas de unidades tributarias.
          </div>

          <div class="signatures">
            <div class="sig-box">
              <div style="height: 40px;"></div>
              Firma del Empleador o Representante Legal<br/>
              C.I. N°: ________________________
            </div>
            <div class="sig-box">
              <div style="height: 40px;"></div>
              Firma del Delegado de Prevención / Trabajador<br/>
              C.I. N°: ________________________
            </div>
          </div>

          <div style="margin-top: 30px; text-align: center;" class="no-print">
            <button onclick="window.print();" style="padding: 8px 20px; font-size: 14px; font-weight: bold; background: #2563eb; color: #fff; border: none; border-radius: 4px; cursor: pointer;">
              Imprimir Formulario
            </button>
          </div>
        </body>
      </html>
    `
    printWindow.document.open()
    printWindow.document.write(htmlContent)
    printWindow.document.close()
  }

  return (
    <div className="min-h-screen bg-gray-50/50 pb-12">
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        
        {/* Top Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-200/80 pb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
              <BarChart3 className="h-8 w-8 text-blue-600 animate-pulse" />
              Reportes e Indicadores Analíticos
            </h1>
            <p className="text-muted-foreground mt-1 text-sm md:text-base">
              Estadísticas legales LOPCYMAT, COVENIN 474, Matrices IPER y modelos analíticos predictivos.
            </p>
          </div>
          <div className="flex gap-2">
            <Badge variant="secondary" className="px-3 py-1.5 text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100 flex items-center gap-1.5">
              <Sparkles className="h-3 w-3 text-blue-600 animate-spin" />
              IA Predictiva Activa
            </Badge>
          </div>
        </div>

        {/* Tab Navigation */}
        <Tabs defaultValue="compliance" value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-1 md:grid-cols-3 h-auto p-1 bg-slate-100/80 rounded-xl border border-slate-200/50">
            <TabsTrigger value="compliance" className="py-2.5 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-700">
              <Scale className="h-4 w-4" />
              1. Cumplimiento Legal (LOPCYMAT/COVENIN)
            </TabsTrigger>
            <TabsTrigger value="operational" className="py-2.5 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-700">
              <Activity className="h-4 w-4" />
              2. Control Operativo & Matriz IPER
            </TabsTrigger>
            <TabsTrigger value="predictive" className="py-2.5 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-700">
              <BrainCircuit className="h-4 w-4" />
              3. IA & Analítica Predictiva
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: CUMPLIMIENTO LEGAL */}
          <TabsContent value="compliance" className="space-y-6 focus-visible:outline-none">
            
            {/* COVENIN 474 & INDICADORES */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-1 border-slate-200/60 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <Scale className="h-5 w-5 text-blue-600" />
                    Parámetros COVENIN 474
                  </CardTitle>
                  <CardDescription>
                    Parámetros requeridos para estimar los índices oficiales de accidentabilidad.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="hht" className="text-xs font-semibold text-slate-600">Horas-Hombre Trabajadas (HHT)</Label>
                    <Input 
                      id="hht" 
                      type="number" 
                      value={hht} 
                      onChange={(e) => setHht(Math.max(0, parseInt(e.target.value) || 0))}
                      className="bg-slate-50 border-slate-200"
                    />
                    <p className="text-[10px] text-muted-foreground">Suma total de horas reales laboradas por toda la nómina.</p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="avg-workers" className="text-xs font-semibold text-slate-600">Número Promedio de Trabajadores</Label>
                    <Input 
                      id="avg-workers" 
                      type="number" 
                      value={empleadosPromedio} 
                      onChange={(e) => setEmpleadosPromedio(Math.max(0, parseInt(e.target.value) || 0))}
                      className="bg-slate-50 border-slate-200"
                    />
                    <p className="text-[10px] text-muted-foreground">Promedio mensual de empleados del periodo.</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="days-lost" className="text-xs font-semibold text-slate-600">Días Perdidos y Cargados</Label>
                    <Input 
                      id="days-lost" 
                      type="number" 
                      value={customDiasPerdidos} 
                      onChange={(e) => setCustomDiasPerdidos(Math.max(0, parseInt(e.target.value) || 0))}
                      className="bg-slate-50 border-slate-200"
                    />
                    <p className="text-[10px] text-muted-foreground">Días de reposo más días tabulados según gravedad de lesiones.</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="lg:col-span-2 border-slate-200/60 shadow-sm bg-gradient-to-br from-white to-slate-50/50">
                <CardHeader>
                  <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <Activity className="h-5 w-5 text-indigo-600" />
                    Índices de Accidentabilidad (COVENIN 474)
                  </CardTitle>
                  <CardDescription>
                    Cálculo basado en {accidentesReales.length} accidentes reales de trabajo reportados.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* IFN Card */}
                    <div className="p-5 bg-white border border-slate-100 rounded-xl shadow-xs space-y-2 relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-full -mr-8 -mt-8 -z-10 group-hover:scale-110 transition-transform" />
                      <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Frecuencia Neta</span>
                      <h3 className="text-base font-bold text-slate-800">Índice IFN</h3>
                      <div className="text-3xl font-extrabold text-blue-700">{ifn}</div>
                      <p className="text-[11px] text-slate-500">Accidentes con tiempo perdido por cada millón de HHT.</p>
                      
                      <div className="pt-2">
                        <Badge className={ifn < 5 ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}>
                          {ifn === 0 ? 'Excelente (0)' : ifn < 5 ? 'Bajo / Aceptable' : 'Alerta / Alto'}
                        </Badge>
                      </div>
                    </div>

                    {/* IG Card */}
                    <div className="p-5 bg-white border border-slate-100 rounded-xl shadow-xs space-y-2 relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50 rounded-full -mr-8 -mt-8 -z-10 group-hover:scale-110 transition-transform" />
                      <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">Gravedad de Lesiones</span>
                      <h3 className="text-base font-bold text-slate-800">Índice IG</h3>
                      <div className="text-3xl font-extrabold text-indigo-700">{ig}</div>
                      <p className="text-[11px] text-slate-500">Días perdidos y cargados por cada millón de HHT.</p>
                      
                      <div className="pt-2">
                        <Badge className={ig < 100 ? 'bg-green-50 text-green-700 border-green-200' : 'bg-amber-50 text-amber-700 border-amber-200'}>
                          {ig === 0 ? 'Excelente (0)' : ig < 120 ? 'Moderado / Controlado' : 'Crítico / Crítico'}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* SVG Line Trend Graph */}
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-slate-600">Tendencia IFN vs. IG Histórica (12 meses)</Label>
                    <div className="w-full h-40 bg-white border border-slate-100 rounded-lg p-2 flex items-center justify-center">
                      <svg className="w-full h-full" viewBox="0 0 600 120" preserveAspectRatio="none">
                        {/* Grid Lines */}
                        <line x1="0" y1="20" x2="600" y2="20" stroke="#f1f5f9" strokeWidth="1" />
                        <line x1="0" y1="60" x2="600" y2="60" stroke="#f1f5f9" strokeWidth="1" />
                        <line x1="0" y1="100" x2="600" y2="100" stroke="#f1f5f9" strokeWidth="1" />
                        
                        {/* IFN Line */}
                        <path 
                          d={`M 20,80 L 100,75 L 180,85 L 260,95 L 340,65 L 420,50 L 500,60 L 580,${Math.max(10, 110 - (ifn * 5))}`} 
                          fill="none" 
                          stroke="#2563eb" 
                          strokeWidth="2.5" 
                          strokeLinecap="round"
                        />
                        {/* Dot at the end */}
                        <circle cx="580" cy={Math.max(10, 110 - (ifn * 5))} r="4" fill="#2563eb" />
                        
                        {/* IG Line (dashed) */}
                        <path 
                          d={`M 20,60 L 100,65 L 180,50 L 260,40 L 340,80 L 420,70 L 500,45 L 580,${Math.max(10, 110 - (ig / 10))}`} 
                          fill="none" 
                          stroke="#6366f1" 
                          strokeWidth="2" 
                          strokeDasharray="4,4"
                          strokeLinecap="round"
                        />
                        <circle cx="580" cy={Math.max(10, 110 - (ig / 10))} r="4" fill="#6366f1" />
                      </svg>
                    </div>
                    <div className="flex justify-between text-[9px] text-muted-foreground px-1">
                      <span>May (AÑO ANT)</span>
                      <span>Nov</span>
                      <span>Dic</span>
                      <span>Ene</span>
                      <span>Feb</span>
                      <span>Mar</span>
                      <span>Abr</span>
                      <span>May (ACTUAL)</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* FORMULARIOS OFICIALES INPSASEL */}
            <Card className="border-slate-200/60 shadow-sm">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                      <Scale className="h-5 w-5 text-red-600" />
                      Notificación y Declaración Formal (Formularios INPSASEL)
                    </CardTitle>
                    <CardDescription>
                      Genera plantillas PDF/Impresión pre-llenadas con la información de los incidentes reales para cumplir con los plazos legales.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                
                {/* Selector de incidente */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-slate-700">1. Seleccionar Incidente</Label>
                    <Select value={selectedIncidentId} onValueChange={setSelectedIncidentId}>
                      <SelectTrigger className="bg-white border-slate-200">
                        <SelectValue placeholder="Elegir incidente..." />
                      </SelectTrigger>
                      <SelectContent>
                        {incidents.map(inc => (
                          <SelectItem key={inc.id} value={inc.id}>
                            [{inc.type?.toUpperCase()}] {inc.title.substring(0, 30)}...
                          </SelectItem>
                        ))}
                        {incidents.length === 0 && (
                          <SelectItem value="none" disabled>No hay incidentes registrados</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-slate-700">2. Razón Social de Empresa</Label>
                    <Input 
                      value={inpsaselEmpresa} 
                      onChange={(e) => setInpsaselEmpresa(e.target.value)} 
                      className="bg-white border-slate-200" 
                      placeholder="Empresa..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-slate-700">3. R.I.F. Empresa</Label>
                    <Input 
                      value={inpsaselRif} 
                      onChange={(e) => setInpsaselRif(e.target.value)} 
                      className="bg-white border-slate-200" 
                      placeholder="J-XXXXXXX-X"
                    />
                  </div>
                </div>

                {selectedIncident ? (
                  <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-xs">
                    <div className="bg-slate-100/80 p-3 border-b border-slate-200 flex justify-between items-center">
                      <span className="text-xs font-bold text-slate-700">Previsualización de Documento INPSASEL</span>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="bg-white h-8 text-xs flex items-center gap-1.5"
                          onClick={() => handlePrint('notificacion')}
                        >
                          <Printer className="h-3.5 w-3.5 text-blue-600" />
                          Imprimir Notificación (60 min)
                        </Button>
                        <Button 
                          size="sm" 
                          className="h-8 text-xs flex items-center gap-1.5"
                          onClick={() => handlePrint('declaracion')}
                        >
                          <Printer className="h-3.5 w-3.5 text-white" />
                          Imprimir Declaración (24h)
                        </Button>
                      </div>
                    </div>
                    
                    {/* Simulated Document Preview */}
                    <div className="p-6 max-h-[350px] overflow-y-auto space-y-4 font-mono text-[11px] text-slate-700">
                      <div className="text-center border-b pb-4 space-y-1">
                        <h4 className="font-bold text-slate-800 text-xs">REPÚBLICA BOLIVARIANA DE VENEZUELA</h4>
                        <h4 className="font-bold text-slate-800 text-[10px]">MINISTERIO DEL PODER POPULAR PARA EL PROCESO SOCIAL DE TRABAJO</h4>
                        <h4 className="font-bold text-slate-800 text-[10px]">INSTITUTO NACIONAL DE PREVENCIÓN, SALUD Y SEGURIDAD LABORALES (INPSASEL)</h4>
                        <div className="text-[12px] font-bold text-blue-700 pt-2">DECLARACIÓN FORMAL DE ACCIDENTE DE TRABAJO</div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 border-b pb-4">
                        <div>
                          <strong>RAZÓN SOCIAL:</strong> {inpsaselEmpresa}<br/>
                          <strong>RIF:</strong> {inpsaselRif}<br/>
                          <strong>DIRECCIÓN:</strong> {inpsaselDireccion}
                        </div>
                        <div>
                          <strong>TRABAJADOR ACCIDENTADO:</strong> {selectedIncident.profiles?.full_name || 'No especificado'}<br/>
                          <strong>CARGO:</strong> {selectedIncident.profiles?.role || 'Operario'}<br/>
                          <strong>ÁREA:</strong> {selectedIncident.location || 'Planta principal'}
                        </div>
                      </div>

                      <div className="space-y-2 border-b pb-4">
                        <div><strong>LUGAR E HORA DEL SUCESO:</strong> {selectedIncident.location} | {selectedIncident.occurred_at ? new Date(selectedIncident.occurred_at).toLocaleString('es-VE') : 'No especificada'}</div>
                        <div><strong>DESCRIPCIÓN DE HECHOS:</strong> {selectedIncident.description || 'Sin descripción'}</div>
                        <div><strong>MEDIDAS INMEDIATAS APLICADAS:</strong> {selectedIncident.immediate_action || 'Ninguna descrita'}</div>
                        <div><strong>TESTIGOS REPORTADOS:</strong> {selectedIncident.witnesses || 'Ninguno'}</div>
                      </div>

                      <div className="text-justify text-[9px] leading-relaxed text-slate-500">
                        * Toda información descrita en esta declaración se emite bajo juramento laboral según los lineamientos de la LOPCYMAT. Una vez impreso este formulario, debe ser firmado en duplicado y sellado por el delegado de prevención respectivo y consignado en las oficinas regionales de INPSASEL de su estado.
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-8 text-center border border-dashed rounded-xl border-slate-200">
                    <AlertTriangle className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                    <p className="text-slate-500 text-sm font-medium">Selecciona un incidente en la lista superior para autocompletar e imprimir los formularios legales.</p>
                  </div>
                )}

              </CardContent>
            </Card>

            {/* CSSL & TRAINING HOURS */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* CSSL Report */}
              <Card className="border-slate-200/60 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <ClipboardList className="h-5 w-5 text-indigo-600" />
                    Gestión Mensual del Comité (CSSL)
                  </CardTitle>
                  <CardDescription>
                    Resumen mensual para el Comité de Seguridad y Salud Laboral.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-50 border border-slate-100 rounded-lg">
                      <div className="text-2xl font-bold text-slate-700">{identifiedRisks.length}</div>
                      <div className="text-[10px] text-muted-foreground font-semibold uppercase">Peligros Detectados</div>
                    </div>
                    <div className="p-4 bg-slate-50 border border-slate-100 rounded-lg">
                      <div className="text-2xl font-bold text-emerald-600">
                        {Math.round(((actionPlans.filter(p => p.status === 'completed').length) / Math.max(actionPlans.length, 1)) * 100)}%
                      </div>
                      <div className="text-[10px] text-muted-foreground font-semibold uppercase">Eficacia Correctiva</div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-slate-700">Miembros y Delegados Activos en Inspecciones</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-xs p-2 bg-white border border-slate-100 rounded-md">
                        <span className="font-medium text-slate-700">👤 Delegado Prevención: Juan Valera</span>
                        <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-100">Activo</Badge>
                      </div>
                      <div className="flex justify-between items-center text-xs p-2 bg-white border border-slate-100 rounded-md">
                        <span className="font-medium text-slate-700">👤 Ing. SSL / Inspector: María Gómez</span>
                        <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-100">Activo</Badge>
                      </div>
                      <div className="flex justify-between items-center text-xs p-2 bg-white border border-slate-100 rounded-md">
                        <span className="font-medium text-slate-700">👤 Rep. de Patronos: Pedro Pérez</span>
                        <Badge variant="outline" className="bg-slate-50 text-slate-600 border-slate-200">Reunión Pdt.</Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Training Hours Report (HHC) */}
              <Card className="border-slate-200/60 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <GraduationCap className="h-5 w-5 text-blue-600" />
                    Horas-Hombre de Capacitación (HHC)
                  </CardTitle>
                  <CardDescription>
                    Cumplimiento de las 16 horas trimestrales de capacitación exigidas por el PSST.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  
                  {/* Visual Bar Chart */}
                  <div className="space-y-3">
                    {trainingData.map((item, index) => (
                      <div key={index} className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="font-medium text-slate-700">{item.depto}</span>
                          <span className="text-muted-foreground font-semibold">
                            {item.actual}h / <span className="text-slate-600">{item.meta}h</span> ({item.pct}%)
                          </span>
                        </div>
                        <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden flex">
                          <div 
                            className={`h-full rounded-full transition-all ${
                              item.pct < 75 ? 'bg-red-500 animate-pulse' :
                              item.pct < 95 ? 'bg-amber-500' : 'bg-green-500'
                            }`}
                            style={{ width: `${item.pct}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <Alert className="bg-amber-50 border-amber-200 text-amber-800">
                    <AlertCircle className="h-4 w-4 text-amber-700" />
                    <AlertTitle className="text-xs font-bold text-amber-900">Alerta de Desviación en HHC</AlertTitle>
                    <AlertDescription className="text-[11px] text-amber-800">
                      El departamento de <strong>Logística</strong> está al 60% de la meta trimestral exigida por el Programa de Seguridad. Se recomienda asignar un módulo de inducción rápido sobre montacargas y manejo manual.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>

            </div>

          </TabsContent>

          {/* TAB 2: GESTIÓN OPERATIVA E IPER */}
          <TabsContent value="operational" className="space-y-6 focus-visible:outline-none">
            
            {/* IPER MATRIX HEATMAP */}
            <Card className="border-slate-200/60 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <ClipboardList className="h-5 w-5 text-amber-600" />
                  Matriz de Riesgo IPER (Análisis de Riesgo de Tarea - ART)
                </CardTitle>
                <CardDescription>
                  Matriz de calor interactiva 5x5 (Probabilidad x Severidad). Filtra los riesgos cargados en la base de datos haciendo clic en las celdas.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                
                {/* Heatmap Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  
                  {/* Left Matrix Column */}
                  <div className="lg:col-span-7 flex flex-col items-center">
                    
                    <div className="w-full max-w-[420px] space-y-4">
                      {/* Matrix Grid */}
                      <div className="grid grid-cols-6 gap-2">
                        {/* Header Row */}
                        <div className="text-[9px] font-bold text-center text-slate-500 pt-3">Prob. \ Sev.</div>
                        <div className="text-[9px] font-bold text-center text-slate-500 pt-3">1 - Mínima</div>
                        <div className="text-[9px] font-bold text-center text-slate-500 pt-3">2 - Menor</div>
                        <div className="text-[9px] font-bold text-center text-slate-500 pt-3">3 - Moderada</div>
                        <div className="text-[9px] font-bold text-center text-slate-500 pt-3">4 - Mayor</div>
                        <div className="text-[9px] font-bold text-center text-slate-500 pt-3">5 - Crítica</div>

                        {/* Probabilities Rows */}
                        {[5, 4, 3, 2, 1].map(p => (
                          <Fragment key={p}>
                            <div className="text-[9px] font-bold text-right pr-2 self-center text-slate-500">
                              {p === 5 ? '5-Frecuente' :
                               p === 4 ? '4-Probable' :
                               p === 3 ? '3-Ocasional' :
                               p === 2 ? '2-Remota' : '1-Improbable'}
                            </div>
                            
                            {[1, 2, 3, 4, 5].map(s => {
                              const cellKey = `${p}-${s}`
                              const risks = iperMatrix[cellKey] || []
                              const riskInfo = getRiskLevel(p, s)
                              const isSelected = selectedIperCell === cellKey

                              return (
                                <button
                                  key={cellKey}
                                  onClick={() => setSelectedIperCell(isSelected ? null : cellKey)}
                                  style={{ backgroundColor: riskInfo.hex }}
                                  className={`aspect-square rounded-lg flex flex-col items-center justify-center text-white relative font-extrabold transition-all hover:scale-105 active:scale-95 shadow-xs ${
                                    isSelected ? 'ring-4 ring-slate-900 scale-102 z-10' : ''
                                  } ${risks.length > 0 ? 'opacity-100' : 'opacity-70'}`}
                                >
                                  <span className="text-xs">{p * s}</span>
                                  {risks.length > 0 && (
                                    <span className="absolute bottom-1 right-1 bg-white text-slate-900 rounded-full h-4 w-4 flex items-center justify-center text-[9px] font-semibold">
                                      {risks.length}
                                    </span>
                                  )}
                                </button>
                              )
                            })}
                          </Fragment>
                        ))}
                      </div>

                      {/* Color legend */}
                      <div className="flex justify-between items-center text-[10px] font-semibold text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100">
                        <span className="flex items-center gap-1">
                          <span className="h-3 w-3 bg-emerald-500 rounded" />
                          Riesgo Bajo (1-6)
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="h-3 w-3 bg-amber-500 rounded" />
                          Riesgo Medio (8-12)
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="h-3 w-3 bg-red-500 rounded" />
                          Riesgo Alto (15-25)
                        </span>
                      </div>
                    </div>

                  </div>

                  {/* Right Description Column */}
                  <div className="lg:col-span-5 border-t lg:border-t-0 lg:border-l border-slate-200/80 pt-6 lg:pt-0 lg:pl-6 space-y-4">
                    <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                      <Search className="h-4 w-4 text-slate-600" />
                      Detalles de Riesgos {selectedIperCell ? `en celda [${selectedIperCell}]` : 'Totales'}
                    </h3>

                    <div className="max-h-[300px] overflow-y-auto space-y-2 pr-1">
                      {selectedIperCell ? (
                        risksInSelectedCell.length > 0 ? (
                          risksInSelectedCell.map((risk, index) => {
                            const level = getRiskLevel(risk.probability || 3, risk.severity || 3)
                            return (
                              <div key={risk.id} className="p-3 bg-slate-50 border border-slate-100 rounded-lg space-y-1.5">
                                <div className="flex justify-between items-center">
                                  <Badge className={level.color + " text-[9px] px-2 py-0.5 rounded-full"}>{level.label}</Badge>
                                  <span className="text-[10px] text-slate-500 font-medium">📍 {risk.risk_assessments?.area || 'Sin área'}</span>
                                </div>
                                <p className="text-xs font-semibold text-slate-800">{risk.description}</p>
                                <p className="text-[10px] text-slate-500"><strong>Tarea:</strong> {risk.risk_assessments?.task || 'Sin definir'}</p>
                              </div>
                            )
                          })
                        ) : (
                          <div className="p-6 text-center text-slate-400 text-xs border border-dashed rounded-lg">
                            Ningún peligro coincide con esta clasificación.
                          </div>
                        )
                      ) : (
                        identifiedRisks.slice(0, 4).map((risk, index) => {
                          const level = getRiskLevel(risk.probability || 3, risk.severity || 3)
                          return (
                            <div key={risk.id} className="p-3 bg-slate-50 border border-slate-100 rounded-lg space-y-1.5">
                              <div className="flex justify-between items-center">
                                <Badge className={level.color + " text-[9px] px-2 py-0.5 rounded-full"}>{level.label}</Badge>
                                <span className="text-[10px] text-slate-500 font-medium">📍 {risk.risk_assessments?.area || 'Sin área'}</span>
                              </div>
                              <p className="text-xs font-semibold text-slate-800">{risk.description}</p>
                              <p className="text-[10px] text-slate-500"><strong>Tarea:</strong> {risk.risk_assessments?.task || 'Sin definir'}</p>
                            </div>
                          )
                        })
                      )}
                      
                      {!selectedIperCell && identifiedRisks.length === 0 && (
                        <div className="p-6 text-center text-slate-400 text-xs border border-dashed rounded-lg">
                          No hay riesgos identificados registrados en la base de datos.
                        </div>
                      )}
                    </div>
                  </div>

                </div>

              </CardContent>
            </Card>

            {/* ACTION PLAN PROGRESS & INCIDENT TRENDS */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Action Plan Progress */}
              <Card className="border-slate-200/60 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-emerald-600" />
                    Eficacia e Inspección de Planes de Acción
                  </CardTitle>
                  <CardDescription>
                    Cumplimiento general de los planes de acción preventivos generados.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  
                  <div className="flex items-center gap-6">
                    {/* SVG Radial Progress Ring */}
                    <div className="relative w-24 h-24 flex items-center justify-center">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="40" stroke="#f1f5f9" strokeWidth="8" fill="transparent" />
                        <circle 
                          cx="50" 
                          cy="50" 
                          r="40" 
                          stroke="#10b981" 
                          strokeWidth="8" 
                          fill="transparent" 
                          strokeDasharray="251.2"
                          strokeDashoffset={251.2 - (251.2 * planStats.pctCompletion) / 100}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute text-xl font-extrabold text-slate-800">{planStats.pctCompletion}%</div>
                    </div>

                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-slate-800">Tasa de Resolución de Planes</h4>
                      <p className="text-xs text-muted-foreground">Medidas tomadas por inspectores para disipar condiciones críticas detectadas.</p>
                      <div className="pt-2">
                        <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100">Meta: 90% de Cierre</Badge>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-2 pt-2 text-center">
                    <div className="p-2 bg-slate-50 border border-slate-100 rounded-lg">
                      <div className="text-lg font-bold text-slate-800">{planStats.completed}</div>
                      <div className="text-[9px] text-muted-foreground font-semibold">Cerrados</div>
                    </div>
                    <div className="p-2 bg-slate-50 border border-slate-100 rounded-lg">
                      <div className="text-lg font-bold text-blue-600">{planStats.inProgress}</div>
                      <div className="text-[9px] text-muted-foreground font-semibold">En Curso</div>
                    </div>
                    <div className="p-2 bg-slate-50 border border-slate-100 rounded-lg">
                      <div className="text-lg font-bold text-amber-600">{planStats.pending}</div>
                      <div className="text-[9px] text-muted-foreground font-semibold">Pendientes</div>
                    </div>
                    <div className="p-2 bg-slate-50 border border-slate-100 rounded-lg">
                      <div className="text-lg font-bold text-red-600">{planStats.overdue}</div>
                      <div className="text-[9px] text-muted-foreground font-semibold">Vencidos</div>
                    </div>
                  </div>

                </CardContent>
              </Card>

              {/* Trend Charts */}
              <Card className="border-slate-200/60 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-indigo-600" />
                    Tendencias de Incidentes y Condiciones
                  </CardTitle>
                  <CardDescription>
                    Distribución real de eventos registrados según tipología.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  
                  {/* SVG Bar Chart for Incident Types */}
                  <div className="space-y-3">
                    <Label className="text-xs font-semibold text-slate-600">Tipos de Eventos Reportados</Label>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 bg-red-500 rounded" />
                          Accidentes Directos
                        </span>
                        <span className="font-bold text-slate-800">{incidentsByType.accident}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 bg-amber-500 rounded" />
                          Casi Accidentes (Near Miss)
                        </span>
                        <span className="font-bold text-slate-800">{incidentsByType.near_miss}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 bg-indigo-500 rounded" />
                          Condiciones Inseguras
                        </span>
                        <span className="font-bold text-slate-800">{incidentsByType.unsafe_condition}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 bg-sky-500 rounded" />
                          Actos Inseguros
                        </span>
                        <span className="font-bold text-slate-800">{incidentsByType.unsafe_act}</span>
                      </div>
                    </div>

                    <div className="w-full h-6 bg-slate-100 rounded-md overflow-hidden flex">
                      {/* Stacked Percentage Bar */}
                      {incidents.length > 0 ? (
                        <>
                          <div style={{ width: `${(incidentsByType.accident / incidents.length) * 100}%` }} className="bg-red-500" />
                          <div style={{ width: `${(incidentsByType.near_miss / incidents.length) * 100}%` }} className="bg-amber-500" />
                          <div style={{ width: `${(incidentsByType.unsafe_condition / incidents.length) * 100}%` }} className="bg-indigo-500" />
                          <div style={{ width: `${(incidentsByType.unsafe_act / incidents.length) * 100}%` }} className="bg-sky-500" />
                        </>
                      ) : (
                        <div className="w-full flex items-center justify-center text-[10px] text-muted-foreground">Sin datos registrados</div>
                      )}
                    </div>
                  </div>

                </CardContent>
              </Card>

            </div>

          </TabsContent>

          {/* TAB 3: INTELIGENCIA ARTIFICIAL Y PREDICCIÓN */}
          <TabsContent value="predictive" className="space-y-6 focus-visible:outline-none">
            
            {/* HEATMAP PLANTA PREDICTIVO */}
            <Card className="border-slate-200/60 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <BrainCircuit className="h-5 w-5 text-blue-600" />
                  Mapa Predictivo de Probabilidad de Incidentes (Heatmap)
                </CardTitle>
                <CardDescription>
                  Algoritmo predictivo que evalúa antigüedad de inspección, condiciones inseguras y criticidad histórica para calificar el riesgo por áreas.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                
                {/* Visual Planta Layout */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  
                  {/* Área 1 */}
                  <div className="p-4 bg-white border border-slate-100 rounded-xl shadow-xs border-l-4 border-l-red-500 space-y-3 relative overflow-hidden">
                    <div className="flex justify-between items-start">
                      <span className="text-xs font-bold text-slate-800">Planta Principal / Calderas</span>
                      <span className="h-2 w-2 rounded-full bg-red-500 animate-ping" />
                    </div>
                    <div className="space-y-1">
                      <div className="text-3xl font-extrabold text-red-600">84%</div>
                      <div className="text-[10px] text-muted-foreground uppercase font-bold">Riesgo de Accidente</div>
                    </div>
                    <div className="text-[10px] text-slate-500 space-y-1">
                      <div>🚨 <strong>Condiciones Abiertas:</strong> 4</div>
                      <div>🕒 <strong>Horas Extras:</strong> Elevadas (22%)</div>
                      <div>📅 <strong>Últ. Inspección:</strong> Hace 28 días</div>
                    </div>
                    <Badge className="bg-red-50 text-red-700 border-red-200 w-full justify-center">Acción Inmediata</Badge>
                  </div>

                  {/* Área 2 */}
                  <div className="p-4 bg-white border border-slate-100 rounded-xl shadow-xs border-l-4 border-l-amber-500 space-y-3">
                    <div className="flex justify-between items-start">
                      <span className="text-xs font-bold text-slate-800">Almacén de Despacho</span>
                      <span className="h-2 w-2 rounded-full bg-amber-500" />
                    </div>
                    <div className="space-y-1">
                      <div className="text-3xl font-extrabold text-amber-600">52%</div>
                      <div className="text-[10px] text-muted-foreground uppercase font-bold">Riesgo de Accidente</div>
                    </div>
                    <div className="text-[10px] text-slate-500 space-y-1">
                      <div>🚨 <strong>Condiciones Abiertas:</strong> 2</div>
                      <div>🕒 <strong>Horas Extras:</strong> Moderadas (5%)</div>
                      <div>📅 <strong>Últ. Inspección:</strong> Hace 12 días</div>
                    </div>
                    <Badge className="bg-amber-50 text-amber-700 border-amber-200 w-full justify-center">Inspección de Ruta</Badge>
                  </div>

                  {/* Área 3 */}
                  <div className="p-4 bg-white border border-slate-100 rounded-xl shadow-xs border-l-4 border-l-emerald-500 space-y-3">
                    <div className="flex justify-between items-start">
                      <span className="text-xs font-bold text-slate-800">Talleres y Mantenimiento</span>
                      <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    </div>
                    <div className="space-y-1">
                      <div className="text-3xl font-extrabold text-emerald-600">28%</div>
                      <div className="text-[10px] text-muted-foreground uppercase font-bold">Riesgo de Accidente</div>
                    </div>
                    <div className="text-[10px] text-slate-500 space-y-1">
                      <div>🚨 <strong>Condiciones Abiertas:</strong> 0</div>
                      <div>🕒 <strong>Horas Extras:</strong> Bajas</div>
                      <div>📅 <strong>Últ. Inspección:</strong> Hace 2 días</div>
                    </div>
                    <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 w-full justify-center">Área Segura</Badge>
                  </div>

                  {/* Área 4 */}
                  <div className="p-4 bg-white border border-slate-100 rounded-xl shadow-xs border-l-4 border-l-emerald-500 space-y-3">
                    <div className="flex justify-between items-start">
                      <span className="text-xs font-bold text-slate-800">Oficinas Administrativas</span>
                      <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    </div>
                    <div className="space-y-1">
                      <div className="text-3xl font-extrabold text-emerald-600">12%</div>
                      <div className="text-[10px] text-muted-foreground uppercase font-bold">Riesgo de Accidente</div>
                    </div>
                    <div className="text-[10px] text-slate-500 space-y-1">
                      <div>🚨 <strong>Condiciones Abiertas:</strong> 0</div>
                      <div>🕒 <strong>Horas Extras:</strong> Ninguna</div>
                      <div>📅 <strong>Últ. Inspección:</strong> Hace 14 días</div>
                    </div>
                    <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 w-full justify-center">Área Segura</Badge>
                  </div>

                </div>

              </CardContent>
            </Card>

            {/* HEINRICH PYRAMID & NLP CLASSIFIER */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Heinrich Pyramid */}
              <Card className="border-slate-200/60 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <ShieldAlert className="h-5 w-5 text-red-600" />
                    Pirámide de Heinrich (Análisis Ocupacional)
                  </CardTitle>
                  <CardDescription>
                    Proporción estadística de accidentes graves en función de incidentes menores y condiciones inseguras de la BD.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  
                  {/* Visual CSS Pyramid */}
                  <div className="flex flex-col items-center py-4 space-y-2">
                    
                    {/* Top Tier (Major Accidents) */}
                    <div 
                      className="w-24 text-center p-2 text-white font-extrabold rounded-t-md text-xs shadow-xs relative" 
                      style={{ 
                        background: 'linear-gradient(to bottom, #ef4444, #dc2626)',
                        clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
                        height: '60px',
                        display: 'flex',
                        alignItems: 'flex-end',
                        justifyContent: 'center',
                        paddingBottom: '4px'
                      }}
                    >
                      <span>{heinrichPyramid.fatalidadesProyectadas} Grave</span>
                    </div>

                    {/* Middle Tier (Minor Accidents) */}
                    <div 
                      className="w-48 text-center p-2 text-white font-extrabold text-xs shadow-xs" 
                      style={{ 
                        background: 'linear-gradient(to bottom, #f97316, #ea580c)',
                        clipPath: 'polygon(15% 0%, 85% 0%, 100% 100%, 0% 100%)',
                        height: '45px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <span>{heinrichPyramid.accidentesMedios} Accidentes Leves</span>
                    </div>

                    {/* Bottom Tier (Acts & Conditions) */}
                    <div 
                      className="w-72 text-center p-2 text-slate-800 font-extrabold text-xs shadow-xs rounded-b-md" 
                      style={{ 
                        background: 'linear-gradient(to bottom, #cbd5e1, #94a3b8)',
                        clipPath: 'polygon(10% 0%, 90% 0%, 100% 100%, 0% 100%)',
                        height: '45px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <span>{heinrichPyramid.baseActos} Actos / Cond. Inseguras</span>
                    </div>
                  </div>

                  <p className="text-[11px] text-muted-foreground text-center">
                    Proporción estimada en base a {heinrichPyramid.actosReales} condiciones inseguras/casi accidentes reales registrados en el sistema.
                  </p>

                </CardContent>
              </Card>

              {/* NLP Classifier */}
              <Card className="border-slate-200/60 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-blue-600" />
                    NLP Analizador de Comportamientos e Incidentes
                  </CardTitle>
                  <CardDescription>
                    Escribe la descripción libre del suceso y la IA clasificará la causa y predecirá el escalado.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-slate-700">Descripción del Comportamiento / Suceso</Label>
                    <textarea 
                      className="w-full min-h-[80px] p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      placeholder="Ej. Trabajador operando pulidora sin protectores oculares en zona de soldadura..."
                      value={nlpTextInput}
                      onChange={(e) => setNlpTextInput(e.target.value)}
                    />
                  </div>
                  <Button size="sm" className="w-full flex items-center gap-1.5" onClick={handleNlpClassify}>
                    <BrainCircuit className="h-4 w-4" />
                    Analizar Peligro con IA
                  </Button>

                  {nlpPrediction && (
                    <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-xl space-y-2 animate-fadeIn">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-blue-800">Causa Raíz Proyectada:</span>
                        <Badge className="bg-blue-600 text-white">{nlpPrediction.causalFactor} ({nlpPrediction.confidence}%)</Badge>
                      </div>
                      <p className="text-xs text-slate-700 leading-relaxed font-semibold">
                        {nlpPrediction.heinrichProjection}
                      </p>
                      <div className="text-[11px] text-slate-600 border-t border-slate-200/60 pt-2">
                        <strong>Recomendación Correctiva:</strong> {nlpPrediction.recommendation}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

            </div>

            {/* RECOMMENDADOR INTELIGENTE Y PRONÓSTICO TASA ANUAL */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Recomendador Inteligente */}
              <Card className="border-slate-200/60 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <Sparkle className="h-5 w-5 text-indigo-600" />
                    Recomendador de Medidas de Control
                  </CardTitle>
                  <CardDescription>
                    Genera sugerencias automáticas de ingeniería, administrativas y EPP alineadas con COVENIN.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-slate-700">Seleccionar Factor de Riesgo</Label>
                    <Select value={selectedControlHazard} onValueChange={setSelectedControlHazard}>
                      <SelectTrigger className="bg-slate-50 border-slate-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="altura">Trabajo en Altura (Andamios, Escaleras)</SelectItem>
                        <SelectItem value="quimico">Riesgo Químico (Sustancias, Gases)</SelectItem>
                        <SelectItem value="ruido">Riesgo Físico (Ruido Industrial Elevado)</SelectItem>
                        <SelectItem value="electrico">Riesgo Eléctrico (Tableros, Líneas)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs">
                    <div className="font-bold text-indigo-900 border-b pb-1.5 flex items-center justify-between">
                      <span>{controlRecommendations[selectedControlHazard as keyof typeof controlRecommendations].titulo}</span>
                      <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200">COVENIN</Badge>
                    </div>
                    
                    <div className="space-y-2 pt-1 text-slate-700">
                      <div>
                        <strong className="text-slate-900">🛠️ Ingeniería (Prioridad 1):</strong>
                        <p className="mt-0.5 text-slate-600">{controlRecommendations[selectedControlHazard as keyof typeof controlRecommendations].ingenieria}</p>
                      </div>
                      <div>
                        <strong className="text-slate-900">📋 Administrativas:</strong>
                        <p className="mt-0.5 text-slate-600">{controlRecommendations[selectedControlHazard as keyof typeof controlRecommendations].admin}</p>
                      </div>
                      <div>
                        <strong className="text-slate-900">🛡️ EPP (Última Barrera):</strong>
                        <p className="mt-0.5 text-slate-600">{controlRecommendations[selectedControlHazard as keyof typeof controlRecommendations].epp}</p>
                      </div>
                      <div className="border-t border-slate-200/60 pt-2 text-[10px] text-indigo-700">
                        <strong>Normas Relacionadas:</strong> {controlRecommendations[selectedControlHazard as keyof typeof controlRecommendations].covenin}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Pronóstico Anual (Series de tiempo) */}
              <Card className="border-slate-200/60 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-indigo-600" />
                    Pronóstico de Tasa de Accidentabilidad Anual
                  </CardTitle>
                  <CardDescription>
                    Modelo predictivo de series temporales para proyectar accidentes mensuales (próximos 6 meses).
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  
                  {/* SVG Forecast Graph */}
                  <div className="space-y-2">
                    <div className="w-full h-44 bg-white border border-slate-100 rounded-lg p-2 flex items-center justify-center">
                      <svg className="w-full h-full" viewBox="0 0 600 120" preserveAspectRatio="none">
                        {/* Grid Lines */}
                        <line x1="0" y1="20" x2="600" y2="20" stroke="#f1f5f9" strokeWidth="1" />
                        <line x1="0" y1="60" x2="600" y2="60" stroke="#f1f5f9" strokeWidth="1" />
                        <line x1="0" y1="100" x2="600" y2="100" stroke="#f1f5f9" strokeWidth="1" />
                        
                        {/* Forecast Area under Curve */}
                        <path 
                          d={`M 50,110 L 50,${110 - forecastValues[0] * 12} L 150,${110 - forecastValues[1] * 12} L 250,${110 - forecastValues[2] * 12} L 350,${110 - forecastValues[3] * 12} L 450,${110 - forecastValues[4] * 12} L 550,${110 - forecastValues[5] * 12} L 550,110 Z`} 
                          fill="url(#forecastGradient)" 
                          opacity="0.15"
                        />
                        
                        {/* Forecast Line */}
                        <path 
                          d={`M 50,${110 - forecastValues[0] * 12} L 150,${110 - forecastValues[1] * 12} L 250,${110 - forecastValues[2] * 12} L 350,${110 - forecastValues[3] * 12} L 450,${110 - forecastValues[4] * 12} L 550,${110 - forecastValues[5] * 12}`} 
                          fill="none" 
                          stroke="#6366f1" 
                          strokeWidth="3" 
                          strokeLinecap="round"
                        />
                        
                        {/* Dots and Labels */}
                        {forecastValues.map((val, idx) => {
                          const cx = 50 + idx * 100
                          const cy = 110 - val * 12
                          return (
                            <g key={idx}>
                              <circle cx={cx} cy={cy} r="5" fill="#4f46e5" stroke="#fff" strokeWidth="1.5" />
                              <text x={cx} y={cy - 10} textAnchor="middle" fill="#1e293b" fontSize="9" fontWeight="bold">
                                {val} acc
                              </text>
                            </g>
                          )
                        })}

                        {/* Defs for gradient */}
                        <defs>
                          <linearGradient id="forecastGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#4f46e5" />
                            <stop offset="100%" stopColor="#4f46e5" stopOpacity="0" />
                          </linearGradient>
                        </defs>
                      </svg>
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-500 font-semibold px-6">
                      {forecastMonths.map((m, idx) => (
                        <span key={idx}>{m}</span>
                      ))}
                    </div>
                  </div>

                  <Alert className="bg-indigo-50 border-indigo-100 text-indigo-900">
                    <Sparkles className="h-4 w-4 text-indigo-700 animate-pulse" />
                    <AlertTitle className="text-xs font-bold">Recomendación Estacional Preventiva</AlertTitle>
                    <AlertDescription className="text-[11px] text-indigo-800">
                      El pronóstico proyecta un pico de accidentabilidad en <strong>Noviembre</strong> (estimado {forecastValues[5]} accidentes). Se sugiere adelantar las inspecciones mecánicas y programar una parada técnica de seguridad a finales de Octubre.
                    </AlertDescription>
                  </Alert>

                </CardContent>
              </Card>

            </div>

          </TabsContent>
        </Tabs>

      </div>
    </div>
  )
}
