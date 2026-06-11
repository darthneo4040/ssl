import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { GoogleGenerativeAI } from '@google/generative-ai'
// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdf = require('pdf-parse')
import mammoth from 'mammoth'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

export async function POST(req: Request) {
  try {
    const { documentId } = await req.json()
    if (!documentId) {
      return NextResponse.json({ error: 'documentId es requerido' }, { status: 400 })
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: 'GEMINI_API_KEY no configurado' }, { status: 500 })
    }

    // 1. Obtener documento de Supabase
    const { data: doc, error: docError } = await supabase
      .from('documents')
      .select('*')
      .eq('id', documentId)
      .single()

    if (docError || !doc) {
      return NextResponse.json({ error: 'Documento no encontrado' }, { status: 404 })
    }

    // 2. Descargar archivo del storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('documents')
      .download(doc.file_url)

    if (downloadError || !fileData) {
      return NextResponse.json({ error: 'Error descargando archivo' }, { status: 500 })
    }

    const buffer = Buffer.from(await fileData.arrayBuffer())
    let text = ''

    // 3. Extraer texto según el tipo
    const filename = doc.name.toLowerCase()
    if (filename.endsWith('.pdf')) {
      const pdfData = await pdf(buffer)
      text = pdfData.text
    } else if (filename.endsWith('.docx')) {
      const docxData = await mammoth.extractRawText({ buffer })
      text = docxData.value
    } else if (filename.endsWith('.txt') || filename.endsWith('.md') || filename.endsWith('.csv')) {
      text = buffer.toString('utf-8')
    } else {
      return NextResponse.json({ error: 'Tipo de archivo no soportado para RAG' }, { status: 400 })
    }

    if (!text || text.trim().length === 0) {
      return NextResponse.json({ error: 'No se pudo extraer texto del documento' }, { status: 400 })
    }

    // 4. Chunking (dividir en fragmentos)
    // Estrategia simple: dividir por párrafos dobles o por límite de caracteres
    const CHUNK_SIZE = 1000
    const CHUNK_OVERLAP = 100
    const chunks = []
    
    // Primero limpiamos el texto
    const cleanText = text.replace(/\n{3,}/g, '\n\n').trim()
    
    let i = 0
    while (i < cleanText.length) {
      const chunk = cleanText.substring(i, i + CHUNK_SIZE)
      if (chunk.trim().length > 0) {
        chunks.push(chunk.trim())
      }
      i += (CHUNK_SIZE - CHUNK_OVERLAP)
    }

    // 5. Vectorizar cada chunk con Gemini
    const model = genAI.getGenerativeModel({ model: "text-embedding-004" })
    
    const insertedChunks = []
    
    for (const chunk of chunks) {
      try {
        const result = await model.embedContent(chunk)
        const embedding = result.embedding.values // Array of floats (768 para text-embedding-004)

        // 6. Guardar en Supabase (tabla document_chunks)
        const { error: insertError } = await supabase
          .from('document_chunks')
          .insert({
            document_id: doc.id,
            content: chunk,
            embedding: embedding
          })

        if (insertError) {
          console.error('Error insertando chunk:', insertError)
        } else {
          insertedChunks.push(chunk)
        }
      } catch (embError) {
        console.error('Error generando embedding para chunk:', embError)
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: `Ingesta completada: ${insertedChunks.length} fragmentos vectorizados.` 
    })

  } catch (error: unknown) {
    console.error('Error en ingesta:', error)
    const errMessage = error instanceof Error ? error.message : 'Error interno'
    return NextResponse.json({ error: errMessage }, { status: 500 })
  }
}
