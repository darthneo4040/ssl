-- ============================================================
-- SQL Completo: Módulo Cindínica (Gestión del Peligro)
-- Ejecutar en el SQL Editor de Supabase
-- ============================================================

-- 1. TABLAS
-- ---------

CREATE TABLE IF NOT EXISTS cindynic_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL CHECK (category IN ('deficit_cindinico','falla_cindinica','disonancia_cognitiva')),
  name TEXT NOT NULL,
  description TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS cindynic_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS cindynic_responsibles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS cindynic_evaluations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  evaluation_date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','in_progress','completed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS cindynic_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  evaluation_id UUID NOT NULL REFERENCES cindynic_evaluations(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES cindynic_items(id) ON DELETE CASCADE,
  detected BOOLEAN NOT NULL DEFAULT false,
  action_id UUID REFERENCES cindynic_actions(id) ON DELETE SET NULL,
  responsible_id UUID REFERENCES cindynic_responsibles(id) ON DELETE SET NULL,
  start_date DATE,
  due_date DATE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','in_progress','completed')),
  comments TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. TRIGGERS updated_at
-- ----------------------

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER cindynic_items_updated_at
  BEFORE UPDATE ON cindynic_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER cindynic_evaluations_updated_at
  BEFORE UPDATE ON cindynic_evaluations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER cindynic_responses_updated_at
  BEFORE UPDATE ON cindynic_responses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 3. ROW LEVEL SECURITY
-- ---------------------

ALTER TABLE cindynic_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE cindynic_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE cindynic_responsibles ENABLE ROW LEVEL SECURITY;
ALTER TABLE cindynic_evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE cindynic_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Auth all cindynic_items" ON cindynic_items
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Auth all cindynic_actions" ON cindynic_actions
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Auth all cindynic_responsibles" ON cindynic_responsibles
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Auth all cindynic_evaluations" ON cindynic_evaluations
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Auth all cindynic_responses" ON cindynic_responses
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 4. SEED DATA: 16 ítems cindínicos
-- ----------------------------------

INSERT INTO cindynic_items (category, name, sort_order) VALUES
  ('deficit_cindinico',     'Amnesia cindínica',              1),
  ('deficit_cindinico',     'Fragmentación del peligro',      2),
  ('deficit_cindinico',     'Invisibilidad del cuasi accidente', 3),
  ('deficit_cindinico',     'Zona gris normativa',            4),
  ('deficit_cindinico',     'Sesgo de éxito reciente',        5),
  ('deficit_cindinico',     'Ceguera de autoridad',           6),
  ('deficit_cindinico',     'Defensa ilusoria',               7),
  ('deficit_cindinico',     'Punto ciego sistémico',          8),
  ('falla_cindinica',       'Mala comunicación del peligro',  9),
  ('falla_cindinica',       'Memoria del error débil',        10),
  ('falla_cindinica',       'Cindinogénesis activa',          11),
  ('falla_cindinica',       'Defensas débiles',               12),
  ('disonancia_cognitiva',  'Brecha discurso-acción',         13),
  ('disonancia_cognitiva',  'Justificaciones del riesgo',     14),
  ('disonancia_cognitiva',  'Normalización del peligro',      15),
  ('disonancia_cognitiva',  'Disonancia colectiva',           16);

-- 5. SEED DATA: Acciones correctivas (desde Excel)
-- -------------------------------------------------

INSERT INTO cindynic_actions (name, description) VALUES
  ('Crear bitácora',            'Registro escrito de eventos y peligros'),
  ('Mapeo interdepartamental',  'Identificación cruzada de peligros entre áreas'),
  ('Reporte anónimo',           'Canal de denuncia confidencial'),
  ('Auditoría normas',          'Revisión de cumplimiento normativo'),
  ('Alertas automáticas',       'Notificaciones ante condiciones de riesgo'),
  ('Canal confidencial',        'Línea de reporte seguro'),
  ('Pruebas sorpresa',          'Evaluaciones inopinadas de seguridad'),
  ('Indicadores de proceso',    'Métricas de desempeño en SST'),
  ('Circuito corto',            'Canal directo de comunicación de peligros'),
  ('Casos estudio',             'Análisis de incidentes pasados'),
  ('Mapa efectos colaterales',  'Matriz de consecuencias secundarias'),
  ('Dueños de defensas',        'Asignación responsable de barreras de seguridad'),
  ('Auditoría coherencia',      'Verificación discurso vs. acción'),
  ('Taller disonancia',         'Sesiones de sensibilización cognitiva'),
  ('Walkthrough externo',       'Recorrido de seguridad con observador externo'),
  ('Reunión alineamiento',      'Sesiones de ajuste organizacional');

-- 6. SEED DATA: Responsables
-- --------------------------

INSERT INTO cindynic_responsibles (name) VALUES
  ('Sin asignar'),
  ('Ana López'),
  ('Carlos Ruiz'),
  ('Marta Gómez'),
  ('Juan Pérez'),
  ('Laura Díaz'),
  ('Rafael Soto');
