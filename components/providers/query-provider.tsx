'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'

export function QueryProvider({ children }: { children: React.ReactNode }) {
  // Evitar compartir el estado del cliente entre diferentes peticiones/sesiones creando el QueryClient en el estado del componente
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1 minuto de vigencia de caché por defecto
        refetchOnWindowFocus: false, // Desactivar recarga al enfocar ventana para evitar parpadeos
        retry: 1, // Limitar reintentos automáticos
      },
    },
  }))

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}
