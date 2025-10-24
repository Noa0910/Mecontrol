-- =====================================================
-- SCRIPT DE CREACIÓN DE BASE DE DATOS MYSQL
-- MORBILIDAD URGENCIAS - DATOS.GOV.CO
-- =====================================================

-- Crear base de datos
CREATE DATABASE IF NOT EXISTS morbilidad_urgencias;
USE morbilidad_urgencias;

-- =====================================================
-- 1. TABLA DEPARTAMENTOS
-- =====================================================
CREATE TABLE IF NOT EXISTS departamentos (
    id_departamento INT AUTO_INCREMENT PRIMARY KEY,
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
    id_municipio INT AUTO_INCREMENT PRIMARY KEY,
    nombre_municipio VARCHAR(100) NOT NULL,
    id_departamento INT NOT NULL,
    codigo_municipio VARCHAR(10),
    tipo_municipio VARCHAR(50),
    altitud_msnm INT,
    FOREIGN KEY (id_departamento) REFERENCES departamentos(id_departamento),
    UNIQUE KEY unique_municipio_dept (nombre_municipio, id_departamento)
);

-- =====================================================
-- 3. TABLA DIAGNOSTICOS
-- =====================================================
CREATE TABLE IF NOT EXISTS diagnosticos (
    id_diagnostico INT AUTO_INCREMENT PRIMARY KEY,
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
    id_regimen INT AUTO_INCREMENT PRIMARY KEY,
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
    id_eapb INT AUTO_INCREMENT PRIMARY KEY,
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
    id_atencion INT AUTO_INCREMENT PRIMARY KEY,
    periodo VARCHAR(20) NOT NULL,
    año INT NOT NULL,
    sexo CHAR(1) NOT NULL,
    edad INT NOT NULL,
    tipo_edad VARCHAR(10) NOT NULL,
    id_municipio INT NOT NULL,
    id_diagnostico INT NOT NULL,
    id_regimen INT NOT NULL,
    id_eapb INT NOT NULL,
    fecha_atencion DATETIME NOT NULL,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_municipio) REFERENCES municipios(id_municipio),
    FOREIGN KEY (id_diagnostico) REFERENCES diagnosticos(id_diagnostico),
    FOREIGN KEY (id_regimen) REFERENCES regimenes_salud(id_regimen),
    FOREIGN KEY (id_eapb) REFERENCES eapb(id_eapb),
    INDEX idx_fecha_atencion (fecha_atencion),
    INDEX idx_edad (edad),
    INDEX idx_sexo (sexo),
    INDEX idx_periodo (periodo)
);

-- =====================================================
-- ÍNDICES ADICIONALES PARA MEJOR RENDIMIENTO
-- =====================================================

-- Índices para consultas frecuentes
CREATE INDEX idx_atencion_fecha_sexo ON atenciones_urgencias(fecha_atencion, sexo);
CREATE INDEX idx_atencion_edad_periodo ON atenciones_urgencias(edad, periodo);
CREATE INDEX idx_atencion_diagnostico ON atenciones_urgencias(id_diagnostico);
CREATE INDEX idx_atencion_regimen ON atenciones_urgencias(id_regimen);

-- =====================================================
-- VISTAS ÚTILES PARA REPORTES
-- =====================================================

-- Vista: Resumen de atenciones por departamento
CREATE VIEW vista_atenciones_por_departamento AS
SELECT 
    d.nombre_departamento,
    COUNT(a.id_atencion) as total_atenciones,
    COUNT(DISTINCT a.sexo) as sexos_atendidos,
    AVG(a.edad) as edad_promedio,
    MIN(a.fecha_atencion) as primera_atencion,
    MAX(a.fecha_atencion) as ultima_atencion
FROM departamentos d
LEFT JOIN municipios m ON d.id_departamento = m.id_departamento
LEFT JOIN atenciones_urgencias a ON m.id_municipio = a.id_municipio
GROUP BY d.id_departamento, d.nombre_departamento;

-- Vista: Top diagnósticos más frecuentes
CREATE VIEW vista_top_diagnosticos AS
SELECT 
    diag.codigo_diagnostico,
    diag.nombre_diagnostico,
    COUNT(a.id_atencion) as frecuencia,
    ROUND(COUNT(a.id_atencion) * 100.0 / (SELECT COUNT(*) FROM atenciones_urgencias), 2) as porcentaje
FROM diagnosticos diag
JOIN atenciones_urgencias a ON diag.id_diagnostico = a.id_diagnostico
GROUP BY diag.id_diagnostico, diag.codigo_diagnostico, diag.nombre_diagnostico
ORDER BY frecuencia DESC;

-- Vista: Estadísticas por sexo y edad
CREATE VIEW vista_estadisticas_sexo_edad AS
SELECT 
    sexo,
    tipo_edad,
    COUNT(*) as total_casos,
    AVG(edad) as edad_promedio,
    MIN(edad) as edad_minima,
    MAX(edad) as edad_maxima
FROM atenciones_urgencias
GROUP BY sexo, tipo_edad
ORDER BY sexo, tipo_edad;

-- Vista: Atenciones por período
CREATE VIEW vista_atenciones_por_periodo AS
SELECT 
    periodo,
    año,
    COUNT(*) as total_atenciones,
    COUNT(DISTINCT id_municipio) as municipios_atendidos,
    COUNT(DISTINCT id_diagnostico) as diagnosticos_diferentes
FROM atenciones_urgencias
GROUP BY periodo, año
ORDER BY año, periodo;

-- =====================================================
-- CONSULTAS DE EJEMPLO PARA POWER BI
-- =====================================================

-- Consulta 1: Datos para gráfico de barras - Atenciones por departamento
-- SELECT * FROM vista_atenciones_por_departamento ORDER BY total_atenciones DESC;

-- Consulta 2: Datos para gráfico circular - Distribución por sexo
-- SELECT sexo, COUNT(*) as cantidad FROM atenciones_urgencias GROUP BY sexo;

-- Consulta 3: Datos para gráfico de líneas - Evolución temporal
-- SELECT 
--     DATE(fecha_atencion) as fecha,
--     COUNT(*) as atenciones_diarias
-- FROM atenciones_urgencias 
-- GROUP BY DATE(fecha_atencion) 
-- ORDER BY fecha;

-- Consulta 4: Datos para gráfico de dispersión - Edad vs Frecuencia
-- SELECT 
--     edad,
--     COUNT(*) as frecuencia
-- FROM atenciones_urgencias 
-- GROUP BY edad 
-- ORDER BY edad;

-- Consulta 5: Datos para tabla - Top 10 diagnósticos
-- SELECT * FROM vista_top_diagnosticos LIMIT 10;

-- =====================================================
-- FIN DEL SCRIPT
-- =====================================================

