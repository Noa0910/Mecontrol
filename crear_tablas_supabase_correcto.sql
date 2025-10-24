-- Script SQL CORRECTO para crear las tablas en PostgreSQL (Supabase)
-- Replica exactamente la estructura de MySQL original
-- Ejecutar en el SQL Editor de Supabase

-- Eliminar tablas existentes si ya existen (en orden inverso de dependencia)
DROP TABLE IF EXISTS public.atenciones_urgencias CASCADE;
DROP TABLE IF EXISTS public.eapb CASCADE;
DROP TABLE IF EXISTS public.regimenes_salud CASCADE;
DROP TABLE IF EXISTS public.diagnosticos CASCADE;
DROP TABLE IF EXISTS public.municipios CASCADE;
DROP TABLE IF EXISTS public.departamentos CASCADE;

-- =====================================================
-- 1. TABLA DEPARTAMENTOS (igual que MySQL)
-- =====================================================
CREATE TABLE public.departamentos (
    id_departamento SERIAL PRIMARY KEY,
    nombre_departamento VARCHAR(100) NOT NULL UNIQUE,
    codigo_departamento VARCHAR(10),
    region VARCHAR(50),
    poblacion_estimada INTEGER,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 2. TABLA MUNICIPIOS/PROCEDENCIAS (igual que MySQL)
-- =====================================================
CREATE TABLE public.municipios (
    id_municipio SERIAL PRIMARY KEY,
    nombre_municipio VARCHAR(100) NOT NULL,
    id_departamento INTEGER NOT NULL,
    codigo_municipio VARCHAR(10),
    tipo_municipio VARCHAR(50),
    altitud_msnm INTEGER,
    FOREIGN KEY (id_departamento) REFERENCES public.departamentos(id_departamento),
    UNIQUE (nombre_municipio, id_departamento)
);

-- =====================================================
-- 3. TABLA DIAGNOSTICOS (igual que MySQL)
-- =====================================================
CREATE TABLE public.diagnosticos (
    id_diagnostico SERIAL PRIMARY KEY,
    codigo_diagnostico VARCHAR(20) NOT NULL UNIQUE,
    nombre_diagnostico TEXT NOT NULL,
    categoria_diagnostico VARCHAR(100),
    severidad VARCHAR(50),
    requiere_hospitalizacion BOOLEAN DEFAULT FALSE
);

-- =====================================================
-- 4. TABLA REGIMENES_SALUD (igual que MySQL)
-- =====================================================
CREATE TABLE public.regimenes_salud (
    id_regimen SERIAL PRIMARY KEY,
    nombre_regimen VARCHAR(100) NOT NULL UNIQUE,
    tipo_regimen VARCHAR(50),
    descripcion TEXT,
    cobertura_porcentaje DECIMAL(5,2),
    activo BOOLEAN DEFAULT TRUE
);

-- =====================================================
-- 5. TABLA EAPB (Entidades Administradoras) - igual que MySQL
-- =====================================================
CREATE TABLE public.eapb (
    id_eapb SERIAL PRIMARY KEY,
    nombre_eapb VARCHAR(200) NOT NULL UNIQUE,
    tipo_entidad VARCHAR(100),
    codigo_eapb VARCHAR(20),
    region_cobertura VARCHAR(100),
    activa BOOLEAN DEFAULT TRUE
);

-- =====================================================
-- 6. TABLA PRINCIPAL - ATENCIONES_URGENCIAS (igual que MySQL)
-- =====================================================
CREATE TABLE public.atenciones_urgencias (
    id_atencion SERIAL PRIMARY KEY,
    periodo VARCHAR(20) NOT NULL,
    año INTEGER NOT NULL,
    sexo CHAR(1) NOT NULL,
    edad INTEGER NOT NULL,
    tipo_edad VARCHAR(10) NOT NULL,
    id_municipio INTEGER NOT NULL,
    id_diagnostico INTEGER NOT NULL,
    id_regimen INTEGER NOT NULL,
    id_eapb INTEGER NOT NULL,
    fecha_atencion TIMESTAMP NOT NULL,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_municipio) REFERENCES public.municipios(id_municipio),
    FOREIGN KEY (id_diagnostico) REFERENCES public.diagnosticos(id_diagnostico),
    FOREIGN KEY (id_regimen) REFERENCES public.regimenes_salud(id_regimen),
    FOREIGN KEY (id_eapb) REFERENCES public.eapb(id_eapb)
);

-- =====================================================
-- ÍNDICES ADICIONALES PARA MEJOR RENDIMIENTO (igual que MySQL)
-- =====================================================

-- Índices para consultas frecuentes
CREATE INDEX idx_atencion_fecha_sexo ON public.atenciones_urgencias(fecha_atencion, sexo);
CREATE INDEX idx_atencion_fecha ON public.atenciones_urgencias(fecha_atencion);
CREATE INDEX idx_atencion_edad ON public.atenciones_urgencias(edad);
CREATE INDEX idx_atencion_sexo ON public.atenciones_urgencias(sexo);
CREATE INDEX idx_atencion_periodo ON public.atenciones_urgencias(periodo);

-- =====================================================
-- HABILITAR ROW LEVEL SECURITY (RLS) PARA SEGURIDAD
-- =====================================================
ALTER TABLE public.departamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.municipios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diagnosticos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.regimenes_salud ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.eapb ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.atenciones_urgencias ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- CREAR POLÍTICAS DE ACCESO PARA TODAS LAS TABLAS
-- =====================================================

-- Políticas de lectura pública
CREATE POLICY "Allow public read access" ON public.departamentos FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON public.municipios FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON public.diagnosticos FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON public.regimenes_salud FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON public.eapb FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON public.atenciones_urgencias FOR SELECT USING (true);

-- Políticas de inserción para migración de datos
CREATE POLICY "Allow public insert access" ON public.departamentos FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public insert access" ON public.municipios FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public insert access" ON public.diagnosticos FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public insert access" ON public.regimenes_salud FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public insert access" ON public.eapb FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public insert access" ON public.atenciones_urgencias FOR INSERT WITH CHECK (true);

-- Políticas de actualización para migración de datos
CREATE POLICY "Allow public update access" ON public.departamentos FOR UPDATE USING (true);
CREATE POLICY "Allow public update access" ON public.municipios FOR UPDATE USING (true);
CREATE POLICY "Allow public update access" ON public.diagnosticos FOR UPDATE USING (true);
CREATE POLICY "Allow public update access" ON public.regimenes_salud FOR UPDATE USING (true);
CREATE POLICY "Allow public update access" ON public.eapb FOR UPDATE USING (true);
CREATE POLICY "Allow public update access" ON public.atenciones_urgencias FOR UPDATE USING (true);
