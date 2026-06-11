-- Ejecuta este script en el Editor SQL de tu panel de Supabase

-- 1. Habilitar la extensión pgvector
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Crear tabla para almacenar los fragmentos (chunks) y sus vectores
CREATE TABLE IF NOT EXISTS document_chunks (
  id BIGSERIAL PRIMARY KEY,
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  -- Utilizamos 768 dimensiones porque es el estándar para el modelo text-embedding-004 de Google Gemini
  embedding vector(768) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Crear índice para acelerar las búsquedas (opcional pero recomendado para producción)
-- HNSW index para búsqueda rápida (se requiere cierta cantidad de datos para que el índice se cree correctamente,
-- por ahora lo comentamos o lo puedes correr más adelante. Aquí usamos ivfflat como alternativa simple o sin índice)
-- CREATE INDEX ON document_chunks USING hnsw (embedding vector_cosine_ops);

-- 4. Crear la función para buscar fragmentos similares (distancia coseno)
CREATE OR REPLACE FUNCTION match_document_chunks (
  query_embedding vector(768),
  match_threshold float,
  match_count int
)
RETURNS TABLE (
  id bigint,
  document_id uuid,
  content text,
  similarity float
)
LANGUAGE sql STABLE
AS $$
  SELECT
    document_chunks.id,
    document_chunks.document_id,
    document_chunks.content,
    1 - (document_chunks.embedding <=> query_embedding) AS similarity
  FROM document_chunks
  WHERE 1 - (document_chunks.embedding <=> query_embedding) > match_threshold
  ORDER BY document_chunks.embedding <=> query_embedding
  LIMIT match_count;
$$;
