import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface TrainingSession {
  id: string
  title: string
  category: 'prevencion_incendios' | 'primeros_auxilios' | 'epp' | 'ergonomia' | 'riesgo_quimico' | 'orden_limpieza' | 'trabajo_altura' | 'seguridad_vial' | 'otros'
  type: 'charla_5min' | 'induccion_lopcymat' | 'teorico' | 'practico' | 'simulacro'
  date: string
  durationHours: number
  attendeesCount: number
  attendeesMale: number
  attendeesFemale: number
  department: 'Operaciones' | 'Mantenimiento' | 'Logística' | 'Administración' | 'Calidad'
  facilitator: string
  facilitatorDoc: string // C.I. o Registro INPSASEL del facilitador
  content: string
  status: 'realizada' | 'planificada' | 'suspendida'
  evidenceUrl?: string // Nombre o enlace de la minuta de asistencia firmada
}

interface TrainingState {
  sessions: TrainingSession[]
  addTraining: (session: TrainingSession) => void
  updateTraining: (id: string, updatedSession: Partial<TrainingSession>) => void
  deleteTraining: (id: string) => void
  resetTrainings: () => void
}

const DEFAULT_SEEDS: TrainingSession[] = [
  {
    id: 'seed-1',
    title: 'Inducción de Seguridad de Nuevos Ingresos (Art. 56 LOPCYMAT)',
    category: 'otros',
    type: 'induccion_lopcymat',
    date: '2026-05-10',
    durationHours: 8,
    attendeesCount: 15,
    attendeesMale: 10,
    attendeesFemale: 5,
    department: 'Operaciones',
    facilitator: 'Ing. Carlos Mendoza (Registro L-238495)',
    facilitatorDoc: 'L-238495',
    content: 'Deberes y derechos de los trabajadores en SSL, riesgos específicos del puesto, plan de emergencia y rutas de evacuación.',
    status: 'realizada',
    evidenceUrl: 'minuta_induccion_mayo.pdf'
  },
  {
    id: 'seed-2',
    title: 'Uso Correcto de Equipos de Protección Personal (COVENIN 2237)',
    category: 'epp',
    type: 'teorico',
    date: '2026-05-18',
    durationHours: 2,
    attendeesCount: 20,
    attendeesMale: 15,
    attendeesFemale: 5,
    department: 'Operaciones',
    facilitator: 'T.S.U. Luisa Ortega',
    facilitatorDoc: 'V-15.482.948',
    content: 'Clasificación de EPP, mantenimiento y almacenamiento de respiradores, uso obligatorio de calzado dieléctrico.',
    status: 'realizada',
    evidenceUrl: 'epp_operaciones.pdf'
  },
  {
    id: 'seed-3',
    title: 'Prevención y Control de Incendios en Almacenes (COVENIN 1040)',
    category: 'prevencion_incendios',
    type: 'practico',
    date: '2026-05-22',
    durationHours: 4,
    attendeesCount: 30,
    attendeesMale: 20,
    attendeesFemale: 10,
    department: 'Logística',
    facilitator: 'Cuerpo de Bomberos del Edo. Lara',
    facilitatorDoc: 'CB-2309',
    content: 'Uso de extintores portátiles PQS y CO2, clases de fuego, y protocolo de llamada de emergencia.',
    status: 'realizada',
    evidenceUrl: 'incendios_logistica.pdf'
  },
  {
    id: 'seed-4',
    title: 'Higiene Postural y Pausas Activas (Riesgos Disergonómicos)',
    category: 'ergonomia',
    type: 'charla_5min',
    date: '2026-05-25',
    durationHours: 1,
    attendeesCount: 15,
    attendeesMale: 5,
    attendeesFemale: 10,
    department: 'Administración',
    facilitator: 'Lic. Sofía Rivas (Fisioterapeuta)',
    facilitatorDoc: 'FT-3094',
    content: 'Ejercicios de estiramiento muscular, ajuste de silla y pantalla, levantamiento manual de cargas livianas.',
    status: 'realizada',
    evidenceUrl: 'pausas_activas_admin.pdf'
  },
  {
    id: 'seed-5',
    title: 'Simulacro de Desalojo ante Evento Sísmico (PSST)',
    category: 'otros',
    type: 'simulacro',
    date: '2026-05-20',
    durationHours: 2,
    attendeesCount: 75,
    attendeesMale: 45,
    attendeesFemale: 30,
    department: 'Calidad',
    facilitator: 'Ing. Carlos Mendoza (Brigada de Emergencia)',
    facilitatorDoc: 'L-238495',
    content: 'Activación de alarma, desalojo ordenado por pasillos delimitados, y conteo final en el punto de encuentro.',
    status: 'realizada',
    evidenceUrl: 'simulacro_mayo.pdf'
  }
]

export const useTrainingStore = create<TrainingState>()(
  persist(
    (set) => ({
      sessions: DEFAULT_SEEDS,
      
      addTraining: (session) => 
        set((state) => ({ 
          sessions: [session, ...state.sessions] 
        })),
        
      updateTraining: (id, updatedSession) => 
        set((state) => ({
          sessions: state.sessions.map((s) => 
            s.id === id ? { ...s, ...updatedSession } : s
          )
        })),
        
      deleteTraining: (id) => 
        set((state) => ({ 
          sessions: state.sessions.filter((s) => s.id !== id) 
        })),
        
      resetTrainings: () => 
        set({ sessions: DEFAULT_SEEDS })
    }),
    {
      name: 'ssl-trainings-store'
    }
  )
)
