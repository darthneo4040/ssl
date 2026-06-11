import { streamText } from 'ai'
import { google } from '@ai-sdk/google'
import { createClient } from '@supabase/supabase-js'
import { GoogleGenerativeAI } from '@google/generative-ai'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

export async function POST(req: Request) {
  try {
    const { messages } = await req.json()
    const latestMessage = messages[messages.length - 1]

    // 1. Vectorizar la pregunta del usuario
    const model = genAI.getGenerativeModel({ model: "text-embedding-004" })
    const result = await model.embedContent(latestMessage.content)
    const embedding = result.embedding.values

    // 2. Buscar fragmentos relevantes en Supabase (Similarity Search)
    const { data: documents, error } = await supabase.rpc('match_document_chunks', {
      query_embedding: embedding,
      match_threshold: 0.70, // Ajustar umbral de similitud (70% recomendado)
      match_count: 5 // Top 5 fragmentos más relevantes
    })

    if (error) {
      console.error('Error buscando contexto:', error)
    }

    // 3. Construir el contexto a partir de los documentos recuperados
    let contextText = ''
    if (documents && documents.length > 0) {
      contextText = documents.map((doc: { content: string }) => doc.content).join('\n\n---\n\n')
    } else {
      contextText = "No se encontró información relevante en la base de datos documental."
    }

    // 4. Crear el System Prompt restrictivo
    const systemPrompt = `
Eres el Asistente Experto en Seguridad y Salud Laboral (SSL) de SSL-Vzla.
Tu objetivo es responder a las consultas de los usuarios basándote ÚNICA Y EXCLUSIVAMENTE en el siguiente contexto documental proporcionado.

REGLAS ESTRICTAS:
1. NUNCA utilices información externa, sentido común, o tu conocimiento previo para responder.
2. Si la respuesta no se encuentra dentro del contexto proporcionado, DEBES decir explícitamente: "Lo siento, no encuentro información en los documentos de SSL sobre esto. Por favor, consulta un documento relevante."
3. Sé preciso, profesional y claro.
4. Si el contexto incluye pasos o reglas, lístalos claramente.

CONTEXTO DOCUMENTAL:
${contextText}
`

    // 5. Generar respuesta utilizando Gemini y Vercel AI SDK
    const responseStream = await streamText({
      model: google('gemini-1.5-pro-latest'), // Puedes usar gemini-1.5-flash para mayor velocidad
      system: systemPrompt,
      messages: messages,
    })

    return responseStream.toTextStreamResponse()
  } catch (error: unknown) {
    console.error('Error en /api/chat:', error)
    const errMessage = error instanceof Error ? error.message : 'Unknown error'
    return new Response(JSON.stringify({ error: errMessage }), { status: 500 })
  }
}
