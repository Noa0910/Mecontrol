-- Script SQL para crear las tablas en PostgreSQL (Supabase)
-- Ejecutar en el SQL Editor de Supabase

-- Crear tabla de departamentos
CREATE TABLE IF NOT EXISTS departamentos (
    id SERIAL PRIMARY KEY,
    codigo_departamento VARCHAR(10) UNIQUE NOT NULL,
    nombre_departamento VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla de municipios
CREATE TABLE IF NOT EXISTS municipios (
    id SERIAL PRIMARY KEY,
    codigo_municipio VARCHAR(10) UNIQUE NOT NULL,
    nombre_municipio VARCHAR(100) NOT NULL,
    codigo_departamento VARCHAR(10) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (codigo_departamento) REFERENCES departamentos(codigo_departamento)
);

-- Crear tabla de diagnósticos
CREATE TABLE IF NOT EXISTS diagnosticos (
    id SERIAL PRIMARY KEY,
    codigo_diagnostico VARCHAR(20) UNIQUE NOT NULL,
    nombre_diagnostico TEXT NOT NULL,
    categoria VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla de regímenes de salud
CREATE TABLE IF NOT EXISTS regimenes_salud (
    id SERIAL PRIMARY KEY,
    codigo_regimen VARCHAR(10) UNIQUE NOT NULL,
    nombre_regimen VARCHAR(100) NOT NULL,
    tipo_regimen VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla de atenciones
CREATE TABLE IF NOT EXISTS atenciones (
    id SERIAL PRIMARY KEY,
    numero_atencion VARCHAR(50) UNIQUE NOT NULL,
    fecha_atencion DATE NOT NULL,
    hora_atencion TIME,
    edad INTEGER,
    sexo VARCHAR(10),
    codigo_departamento VARCHAR(10),
    codigo_municipio VARCHAR(10),
    codigo_diagnostico VARCHAR(20),
    codigo_regimen VARCHAR(10),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (codigo_departamento) REFERENCES departamentos(codigo_departamento),
    FOREIGN KEY (codigo_municipio) REFERENCES municipios(codigo_municipio),
    FOREIGN KEY (codigo_diagnostico) REFERENCES diagnosticos(codigo_diagnostico),
    FOREIGN KEY (codigo_regimen) REFERENCES regimenes_salud(codigo_regimen)
);

-- Crear tabla de actualizaciones
CREATE TABLE IF NOT EXISTS actualizaciones (
    id SERIAL PRIMARY KEY,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    total_atenciones INTEGER DEFAULT 0,
    atenciones_nuevas INTEGER DEFAULT 0,
    archivo_hash VARCHAR(64),
    estado VARCHAR(20) DEFAULT 'completada'
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_atenciones_fecha ON atenciones(fecha_atencion);
CREATE INDEX IF NOT EXISTS idx_atenciones_departamento ON atenciones(codigo_departamento);
CREATE INDEX IF NOT EXISTS idx_atenciones_municipio ON atenciones(codigo_municipio);
CREATE INDEX IF NOT EXISTS idx_atenciones_diagnostico ON atenciones(codigo_diagnostico);
CREATE INDEX IF NOT EXISTS idx_atenciones_regimen ON atenciones(codigo_regimen);
CREATE INDEX IF NOT EXISTS idx_atenciones_sexo ON atenciones(sexo);
CREATE INDEX IF NOT EXISTS idx_atenciones_edad ON atenciones(edad);

-- Habilitar Row Level Security (RLS) para seguridad
ALTER TABLE departamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE municipios ENABLE ROW LEVEL SECURITY;
ALTER TABLE diagnosticos ENABLE ROW LEVEL SECURITY;
ALTER TABLE regimenes_salud ENABLE ROW LEVEL SECURITY;
ALTER TABLE atenciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE actualizaciones ENABLE ROW LEVEL SECURITY;

-- Crear políticas para permitir acceso público (para desarrollo)
CREATE POLICY "Allow public read access" ON departamentos FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON municipios FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON diagnosticos FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON regimenes_salud FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON atenciones FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON actualizaciones FOR SELECT USING (true);

-- Permitir inserción para el proceso de migración
CREATE POLICY "Allow public insert access" ON departamentos FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public insert access" ON municipios FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public insert access" ON diagnosticos FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public insert access" ON regimenes_salud FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public insert access" ON atenciones FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public insert access" ON actualizaciones FOR INSERT WITH CHECK (true);

-- Permitir actualización para el proceso de migración
CREATE POLICY "Allow public update access" ON departamentos FOR UPDATE USING (true);
CREATE POLICY "Allow public update access" ON municipios FOR UPDATE USING (true);
CREATE POLICY "Allow public update access" ON diagnosticos FOR UPDATE USING (true);
CREATE POLICY "Allow public update access" ON regimenes_salud FOR UPDATE USING (true);
CREATE POLICY "Allow public update access" ON atenciones FOR UPDATE USING (true);
CREATE POLICY "Allow public update access" ON actualizaciones FOR UPDATE USING (true);
