'use client'

import { useChat } from '@ai-sdk/react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

import { Bot, Send, User, Loader2, ShieldCheck, Info } from 'lucide-react'
import { useEffect, useRef } from 'react'

export default function AssistantPage() {
  const { messages = [], input = '', handleInputChange, handleSubmit, isLoading, error } = useChat({
    api: '/api/chat',
    initialMessages: [
      {
        id: 'welcome-msg',
        role: 'assistant',
        content: '¡Hola! Soy el Asistente Inteligente de SSL-Vzla. Estoy aquí para responder a tus preguntas basándome **únicamente** en los documentos, políticas y normativas que se han subido al Centro de Documentos. ¿En qué te puedo ayudar hoy?'
      }
    ]
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any) as any

  const scrollRef = useRef<HTMLDivElement>(null)

  // Auto-scroll al último mensaje
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 md:p-6 pb-20 lg:pb-6">
      <div className="max-w-4xl mx-auto space-y-6 h-[calc(100vh-6rem)] flex flex-col">
        
        {/* Header */}
        <div className="flex-none">
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Bot className="h-8 w-8 text-blue-600" />
            Asistente SSL
          </h1>
          <p className="text-muted-foreground mt-1 text-sm md:text-base flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            Consulta segura sobre normativas y procedimientos internos.
          </p>
        </div>

        {/* Chat Container */}
        <Card className="flex-1 flex flex-col shadow-lg border-slate-200/60 bg-white overflow-hidden">
          
          <div className="bg-blue-50/50 border-b border-blue-100 p-3 text-xs text-blue-800 flex items-start gap-2">
            <Info className="h-4 w-4 mt-0.5 shrink-0 text-blue-600" />
            <p>
              <strong>Aviso de Privacidad:</strong> Este asistente solo tiene acceso a los documentos aprobados en la plataforma. No utiliza información externa a SSL-Vzla.
            </p>
          </div>

          <div className="flex-1 p-4 overflow-y-auto" ref={scrollRef}>
            <div className="space-y-6 max-w-3xl mx-auto pb-4">
              {messages.map((m: { id: string; role: string; content: string }) => (
                <div
                  key={m.id}
                  className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {m.role === 'assistant' && (
                    <div className="h-8 w-8 shrink-0 rounded-full bg-blue-100 flex items-center justify-center border border-blue-200 mt-1">
                      <Bot className="h-5 w-5 text-blue-600" />
                    </div>
                  )}
                  
                  <div
                    className={`rounded-2xl px-5 py-3.5 max-w-[85%] sm:max-w-[75%] text-sm leading-relaxed shadow-sm ${
                      m.role === 'user'
                        ? 'bg-blue-600 text-white font-medium rounded-tr-sm'
                        : 'bg-slate-50 border border-slate-200 text-slate-700 rounded-tl-sm'
                    }`}
                  >
                    {/* Renderizado simple de markdown rudimentario (negritas) */}
                    {(m.content || '').split('**').map((part: string, i: number) => (
                      i % 2 === 1 ? <strong key={i} className="font-semibold">{part}</strong> : part
                    ))}
                  </div>

                  {m.role === 'user' && (
                    <div className="h-8 w-8 shrink-0 rounded-full bg-slate-200 flex items-center justify-center border border-slate-300 mt-1">
                      <User className="h-5 w-5 text-slate-600" />
                    </div>
                  )}
                </div>
              ))}
              
              {isLoading && (
                <div className="flex gap-3 justify-start">
                  <div className="h-8 w-8 shrink-0 rounded-full bg-blue-100 flex items-center justify-center border border-blue-200 mt-1">
                    <Bot className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="rounded-2xl px-5 py-3.5 bg-slate-50 border border-slate-200 flex items-center gap-2 rounded-tl-sm shadow-sm">
                    <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                    <span className="text-sm text-slate-500 font-medium">Buscando en la documentación...</span>
                  </div>
                </div>
              )}

              {error && (
                <div className="flex gap-3 justify-center">
                  <div className="rounded-xl px-4 py-2 bg-red-50 border border-red-200 text-red-600 text-xs font-medium text-center">
                    Ha ocurrido un error de conexión con el Asistente. Por favor, intenta de nuevo.
                  </div>
                </div>
              )}
            </div>
          </div>

          <CardFooter className="p-4 bg-slate-50/50 border-t border-slate-100">
            <form onSubmit={handleSubmit} className="flex w-full gap-2 max-w-3xl mx-auto relative">
              <Input
                value={input}
                onChange={handleInputChange}
                placeholder="Pregunta sobre LOPCYMAT, normativas, procedimientos..."
                className="flex-1 bg-white border-slate-300 shadow-xs h-12 px-4 rounded-xl focus-visible:ring-blue-600"
                disabled={isLoading}
              />
              <Button 
                type="submit" 
                disabled={isLoading || !input.trim()}
                className="h-12 w-12 rounded-xl bg-blue-600 hover:bg-blue-700 shadow-md shrink-0 p-0 flex items-center justify-center transition-all"
              >
                <Send className="h-5 w-5 text-white" />
              </Button>
            </form>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
