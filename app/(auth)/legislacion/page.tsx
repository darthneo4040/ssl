// app/(auth)/legislacion/page.tsx

'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  BookOpen,
  Search,
  Loader2,
  AlertCircle,
  Scale
} from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useLegislation } from '@/hooks/useLegislation'

export default function LegislacionPage() {
  const { data: legislations = [], isLoading: loading, error } = useLegislation()
  const [searchTerm, setSearchTerm] = useState('')

  const filteredLegislations = legislations.filter(leg =>
    leg.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    leg.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    leg.summary?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gray-50/50 pb-12">
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-200/80 pb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              Base de Conocimiento Legal
            </h1>
            <p className="text-muted-foreground mt-1 text-sm md:text-base">
              Consulta leyes nacionales, normativas técnicas COVENIN y reglamentos de LOPCYMAT vigentes.
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-md shadow-xs rounded-xl overflow-hidden">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400" />
          <Input
            placeholder="Buscar por título, categoría o palabra clave..."
            className="pl-10 pr-4 py-6 bg-white border-slate-200/80 focus:border-blue-600 rounded-xl text-xs sm:text-sm placeholder:text-slate-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Contenido */}
        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[400px]">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-4" />
            <p className="text-muted-foreground text-sm font-medium">Cargando base legal...</p>
          </div>
        ) : error ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error instanceof Error ? error.message : 'No se pudo cargar la legislación.'}
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-4">
            {filteredLegislations.length > 0 ? (
              filteredLegislations.map((leg) => (
                <Card key={leg.id} className="hover:shadow-md transition-all border-slate-200/60 bg-gradient-to-br from-white to-slate-50/50 rounded-xl overflow-hidden group">
                  <CardHeader className="pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 bg-slate-50/20">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0 group-hover:bg-indigo-100 transition-colors">
                        <BookOpen className="h-5 w-5" />
                      </div>
                      <div>
                        <CardTitle className="text-base font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                          {leg.title}
                        </CardTitle>
                        <p className="text-[10px] text-muted-foreground mt-0.5">Identificador legal / Norma técnica</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-[10px] font-bold py-0.5 px-2 bg-blue-50 text-blue-700 border-blue-100 self-start sm:self-center">
                      {leg.category}
                    </Badge>
                  </CardHeader>
                  <CardContent className="pt-4 space-y-4">
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                      {leg.summary || 'No hay resumen disponible.'}
                    </p>
                    {leg.full_content && (
                      <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-xs text-slate-500 font-mono leading-relaxed whitespace-pre-wrap max-h-40 overflow-y-auto">
                        {leg.full_content}
                      </div>
                    )}
                    {leg.tags && leg.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-100">
                        {leg.tags.map(tag => (
                          <Badge key={tag} variant="outline" className="text-[9px] font-semibold bg-white border-slate-200 text-slate-500 rounded-full py-0 px-2 uppercase">
                            #{tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className="p-12 text-center border-slate-200/60 bg-white">
                <div className="max-w-md mx-auto space-y-3">
                  <div className="h-10 w-10 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center mx-auto text-slate-400">
                    <Scale className="h-5 w-5" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-slate-700">Sin coincidencia jurídica</h3>
                    <p className="text-muted-foreground text-xs">
                      No se encontraron resultados para &quot;<span className="font-semibold text-slate-600">{searchTerm}</span>&quot; en la base de datos de LOPCYMAT/COVENIN.
                    </p>
                  </div>
                </div>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  )
}