-- Script para crear tablas de empresa en Supabase
-- Este script crea las mismas tablas que los datos globales pero con un campo adicional para identificar el tipo de datos

-- 1. Tabla de departamentos (ya existe, solo agregamos campo tipo_datos)
ALTER TABLE departamentos ADD COLUMN IF NOT EXISTS tipo_datos VARCHAR(20) DEFAULT 'global';

-- 2. Tabla de municipios (ya existe, solo agregamos campo tipo_datos)
ALTER TABLE municipios ADD COLUMN IF NOT EXISTS tipo_datos VARCHAR(20) DEFAULT 'global';

-- 3. Tabla de diagnósticos (ya existe, solo agregamos campo tipo_datos)
ALTER TABLE diagnosticos ADD COLUMN IF NOT EXISTS tipo_datos VARCHAR(20) DEFAULT 'global';

-- 4. Tabla de EPS (ya existe, solo agregamos campo tipo_datos)
ALTER TABLE eapb ADD COLUMN IF NOT EXISTS tipo_datos VARCHAR(20) DEFAULT 'global';

-- 5. Tabla de regímenes de salud (ya existe, solo agregamos campo tipo_datos)
ALTER TABLE regimenes_salud ADD COLUMN IF NOT EXISTS tipo_datos VARCHAR(20) DEFAULT 'global';

-- 6. Tabla de atenciones_urgencias (ya existe, solo agregamos campo tipo_datos)
ALTER TABLE atenciones_urgencias ADD COLUMN IF NOT EXISTS tipo_datos VARCHAR(20) DEFAULT 'global';

-- 7. Crear índices para mejorar el rendimiento de consultas por tipo_datos
CREATE INDEX IF NOT EXISTS idx_atenciones_tipo_datos ON atenciones_urgencias(tipo_datos);
CREATE INDEX IF NOT EXISTS idx_departamentos_tipo_datos ON departamentos(tipo_datos);
CREATE INDEX IF NOT EXISTS idx_municipios_tipo_datos ON municipios(tipo_datos);
CREATE INDEX IF NOT EXISTS idx_diagnosticos_tipo_datos ON diagnosticos(tipo_datos);
CREATE INDEX IF NOT EXISTS idx_eapb_tipo_datos ON eapb(tipo_datos);
CREATE INDEX IF NOT EXISTS idx_regimenes_tipo_datos ON regimenes_salud(tipo_datos);

-- 8. Crear políticas RLS para permitir acceso a datos de empresa
-- Política para atenciones_urgencias
CREATE POLICY "Permitir acceso a datos de empresa" ON atenciones_urgencias
    FOR ALL USING (tipo_datos = 'empresa' OR tipo_datos = 'global');

-- Política para departamentos
CREATE POLICY "Permitir acceso a departamentos empresa" ON departamentos
    FOR ALL USING (tipo_datos = 'empresa' OR tipo_datos = 'global');

-- Política para municipios
CREATE POLICY "Permitir acceso a municipios empresa" ON municipios
    FOR ALL USING (tipo_datos = 'empresa' OR tipo_datos = 'global');

-- Política para diagnósticos
CREATE POLICY "Permitir acceso a diagnósticos empresa" ON diagnosticos
    FOR ALL USING (tipo_datos = 'empresa' OR tipo_datos = 'global');

-- Política para EPS
CREATE POLICY "Permitir acceso a EPS empresa" ON eapb
    FOR ALL USING (tipo_datos = 'empresa' OR tipo_datos = 'global');

-- Política para regímenes
CREATE POLICY "Permitir acceso a regímenes empresa" ON regimenes_salud
    FOR ALL USING (tipo_datos = 'empresa' OR tipo_datos = 'global');

-- 9. Comentarios para documentar las tablas
COMMENT ON COLUMN atenciones_urgencias.tipo_datos IS 'Tipo de datos: global o empresa';
COMMENT ON COLUMN departamentos.tipo_datos IS 'Tipo de datos: global o empresa';
COMMENT ON COLUMN municipios.tipo_datos IS 'Tipo de datos: global o empresa';
COMMENT ON COLUMN diagnosticos.tipo_datos IS 'Tipo de datos: global o empresa';
COMMENT ON COLUMN eapb.tipo_datos IS 'Tipo de datos: global o empresa';
COMMENT ON COLUMN regimenes_salud.tipo_datos IS 'Tipo de datos: global o empresa';

-- 10. Verificar que las tablas existen y tienen la estructura correcta
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name IN ('atenciones_urgencias', 'departamentos', 'municipios', 'diagnosticos', 'eapb', 'regimenes_salud')
    AND column_name = 'tipo_datos'
ORDER BY table_name;

