// app/(auth)/legislacion/page.tsx

'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  BookOpen,
  Search,
  Loader2,
  AlertCircle
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Alert, AlertDescription } from '@/components/ui/alert'

// Define el tipo para una legislación individual
type Legislation = {
  id: string
  category: string
  title: string
  summary: string | null
  tags: string[] | null
}

export default function LegislacionPage() {
  const [legislations, setLegislations] = useState<Legislation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const supabase = createClient()

  useEffect(() => {
    loadLegislations()
  }, [])

  const loadLegislations = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('legislations')
        .select('id, category, title, summary, tags')
        .order('category', { ascending: true })
        .order('title', { ascending: true })

      if (fetchError) {
        throw fetchError
      }

      setLegislations(data || [])
    } catch (err: any) {
      setError('No se pudo cargar la legislación. Inténtalo de nuevo.')
      console.error('Error loading legislations:', err)
    } finally {
      setLoading(false)
    }
  }

  const filteredLegislations = legislations.filter(leg =>
    leg.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    leg.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    leg.summary?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Base de Conocimiento Legal
          </h1>
          <p className="text-muted-foreground mt-1">
            Consulta leyes, normativas y reglamentos de SSL
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative mb-6 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por título, categoría o palabra clave..."
          className="pl-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Contenido */}
      {loading ? (
        <div className="flex justify-center items-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : error ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : (
        <div className="space-y-4">
          {filteredLegislations.length > 0 ? (
            filteredLegislations.map((leg) => (
              <Card key={leg.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-primary" />
                    {leg.title}
                  </CardTitle>
                  <CardDescription>
                    <Badge variant="secondary">{leg.category}</Badge>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {leg.summary || 'No hay resumen disponible.'}
                  </p>
                  {leg.tags && leg.tags.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {leg.tags.map(tag => (
                        <Badge key={tag} variant="outline">{tag}</Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-10">
              <p className="text-muted-foreground">No se encontraron resultados para "{searchTerm}"</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}