-- Script SQL para crear las tablas en Aiven PostgreSQL
-- Ejecutar en el SQL Editor de Aiven

-- Eliminar tablas si existen (para recrear con la estructura correcta)
DROP TABLE IF EXISTS atenciones_urgencias;
DROP TABLE IF EXISTS eapb;
DROP TABLE IF EXISTS regimenes_salud;
DROP TABLE IF EXISTS diagnosticos;
DROP TABLE IF EXISTS municipios;
DROP TABLE IF EXISTS departamentos;

-- =====================================================
-- 1. TABLA DEPARTAMENTOS
-- =====================================================
CREATE TABLE IF NOT EXISTS departamentos (
    id_departamento SERIAL PRIMARY KEY,
    nombre_departamento VARCHAR(100) NOT NULL UNIQUE,
    codigo_departamento VARCHAR(10),
    region VARCHAR(50),
    poblacion_estimada INT,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 2. TABLA MUNICIPIOS/PROCEDENCIAS
-- =====================================================
CREATE TABLE IF NOT EXISTS municipios (
    id_municipio SERIAL PRIMARY KEY,
    nombre_municipio VARCHAR(100) NOT NULL,
    id_departamento INT NOT NULL,
    codigo_municipio VARCHAR(10),
    tipo_municipio VARCHAR(50),
    altitud_msnm INT,
    FOREIGN KEY (id_departamento) REFERENCES departamentos(id_departamento),
    UNIQUE (nombre_municipio, id_departamento)
);

-- =====================================================
-- 3. TABLA DIAGNOSTICOS
-- =====================================================
CREATE TABLE IF NOT EXISTS diagnosticos (
    id_diagnostico SERIAL PRIMARY KEY,
    codigo_diagnostico VARCHAR(20) NOT NULL UNIQUE,
    nombre_diagnostico TEXT NOT NULL,
    categoria_diagnostico VARCHAR(100),
    severidad VARCHAR(50),
    requiere_hospitalizacion BOOLEAN DEFAULT FALSE
);

-- =====================================================
-- 4. TABLA REGIMENES_SALUD
-- =====================================================
CREATE TABLE IF NOT EXISTS regimenes_salud (
    id_regimen SERIAL PRIMARY KEY,
    nombre_regimen VARCHAR(100) NOT NULL UNIQUE,
    tipo_regimen VARCHAR(50),
    descripcion TEXT,
    cobertura_porcentaje DECIMAL(5,2),
    activo BOOLEAN DEFAULT TRUE
);

-- =====================================================
-- 5. TABLA EAPB (Entidades Administradoras)
-- =====================================================
CREATE TABLE IF NOT EXISTS eapb (
    id_eapb SERIAL PRIMARY KEY,
    nombre_eapb VARCHAR(200) NOT NULL UNIQUE,
    tipo_entidad VARCHAR(100),
    codigo_eapb VARCHAR(20),
    region_cobertura VARCHAR(100),
    activa BOOLEAN DEFAULT TRUE
);

-- =====================================================
-- 6. TABLA PRINCIPAL - ATENCIONES_URGENCIAS
-- =====================================================
CREATE TABLE IF NOT EXISTS atenciones_urgencias (
    id_atencion SERIAL PRIMARY KEY,
    periodo VARCHAR(20) NOT NULL,
    año INT NOT NULL,
    sexo CHAR(1) NOT NULL,
    edad INT NOT NULL,
    tipo_edad VARCHAR(10) NOT NULL,
    id_municipio INT NOT NULL,
    id_diagnostico INT NOT NULL,
    id_regimen INT NOT NULL,
    id_eapb INT NOT NULL,
    fecha_atencion TIMESTAMP NOT NULL,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_municipio) REFERENCES municipios(id_municipio),
    FOREIGN KEY (id_diagnostico) REFERENCES diagnosticos(id_diagnostico),
    FOREIGN KEY (id_regimen) REFERENCES regimenes_salud(id_regimen),
    FOREIGN KEY (id_eapb) REFERENCES eapb(id_eapb)
);

-- =====================================================
-- ÍNDICES ADICIONALES PARA MEJOR RENDIMIENTO
-- =====================================================

-- Índices para consultas frecuentes
CREATE INDEX IF NOT EXISTS idx_fecha_atencion ON atenciones_urgencias(fecha_atencion);
CREATE INDEX IF NOT EXISTS idx_edad ON atenciones_urgencias(edad);
CREATE INDEX IF NOT EXISTS idx_sexo ON atenciones_urgencias(sexo);
CREATE INDEX IF NOT EXISTS idx_periodo ON atenciones_urgencias(periodo);
CREATE INDEX IF NOT EXISTS idx_atencion_fecha_sexo ON atenciones_urgencias(fecha_atencion, sexo);

-- Verificar que las tablas se crearon correctamente
SELECT 'departamentos' as tabla, COUNT(*) as registros FROM departamentos
UNION ALL
SELECT 'municipios', COUNT(*) FROM municipios
UNION ALL
SELECT 'diagnosticos', COUNT(*) FROM diagnosticos
UNION ALL
SELECT 'regimenes_salud', COUNT(*) FROM regimenes_salud
UNION ALL
SELECT 'eapb', COUNT(*) FROM eapb
UNION ALL
SELECT 'atenciones_urgencias', COUNT(*) FROM atenciones_urgencias;
