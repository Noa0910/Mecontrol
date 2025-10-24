#!/usr/bin/env python3
"""
Script para migrar datos de MySQL local a Supabase PostgreSQL
Ejecutar después de crear las tablas en Supabase
"""

import mysql.connector
import psycopg2
import os
from datetime import datetime
import logging

# Configurar logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Configuración MySQL (XAMPP local)
MYSQL_CONFIG = {
    'host': 'localhost',
    'user': 'root',
    'password': '',
    'database': 'morbilidad_urgencias',
    'port': 3306
}

# Configuración PostgreSQL (Supabase)
POSTGRES_CONFIG = {
    'host': 'db.jikjuutgacyzlxiczrrh.supabase.co',
    'user': 'postgres',
    'password': 'JX71EllZRtUC8oiJ',
    'database': 'postgres',
    'port': 5432
}

def conectar_mysql():
    """Conectar a MySQL local"""
    try:
        conn = mysql.connector.connect(**MYSQL_CONFIG)
        logger.info("✅ Conectado a MySQL local")
        return conn
    except Exception as e:
        logger.error(f"❌ Error conectando a MySQL: {e}")
        return None

def conectar_postgres():
    """Conectar a PostgreSQL (Supabase)"""
    try:
        conn = psycopg2.connect(**POSTGRES_CONFIG)
        logger.info("✅ Conectado a Supabase PostgreSQL")
        return conn
    except Exception as e:
        logger.error(f"❌ Error conectando a Supabase: {e}")
        return None

def migrar_departamentos(mysql_conn, postgres_conn):
    """Migrar tabla departamentos"""
    try:
        mysql_cursor = mysql_conn.cursor()
        postgres_cursor = postgres_conn.cursor()
        
        # Obtener datos de MySQL
        mysql_cursor.execute("SELECT * FROM departamentos")
        departamentos = mysql_cursor.fetchall()
        
        logger.info(f"📦 Migrando {len(departamentos)} departamentos...")
        
        # Limpiar tabla en PostgreSQL
        postgres_cursor.execute("DELETE FROM departamentos")
        
        # Insertar datos en PostgreSQL
        for dept in departamentos:
            postgres_cursor.execute("""
                INSERT INTO departamentos (id_departamento, nombre_departamento, codigo_departamento, region, poblacion_estimada, fecha_creacion)
                VALUES (%s, %s, %s, %s, %s, %s)
            """, dept)
        
        postgres_conn.commit()
        logger.info("✅ Departamentos migrados correctamente")
        
    except Exception as e:
        logger.error(f"❌ Error migrando departamentos: {e}")
        postgres_conn.rollback()

def migrar_municipios(mysql_conn, postgres_conn):
    """Migrar tabla municipios"""
    try:
        mysql_cursor = mysql_conn.cursor()
        postgres_cursor = postgres_conn.cursor()
        
        mysql_cursor.execute("SELECT * FROM municipios")
        municipios = mysql_cursor.fetchall()
        
        logger.info(f"📦 Migrando {len(municipios)} municipios...")
        
        postgres_cursor.execute("DELETE FROM municipios")
        
        for mun in municipios:
            postgres_cursor.execute("""
                INSERT INTO municipios (id_municipio, nombre_municipio, id_departamento, codigo_municipio, tipo_municipio, altitud_msnm)
                VALUES (%s, %s, %s, %s, %s, %s)
            """, mun)
        
        postgres_conn.commit()
        logger.info("✅ Municipios migrados correctamente")
        
    except Exception as e:
        logger.error(f"❌ Error migrando municipios: {e}")
        postgres_conn.rollback()

def migrar_diagnosticos(mysql_conn, postgres_conn):
    """Migrar tabla diagnosticos"""
    try:
        mysql_cursor = mysql_conn.cursor()
        postgres_cursor = postgres_conn.cursor()
        
        mysql_cursor.execute("SELECT * FROM diagnosticos")
        diagnosticos = mysql_cursor.fetchall()
        
        logger.info(f"📦 Migrando {len(diagnosticos)} diagnósticos...")
        
        postgres_cursor.execute("DELETE FROM diagnosticos")
        
        for diag in diagnosticos:
            postgres_cursor.execute("""
                INSERT INTO diagnosticos (id_diagnostico, codigo_diagnostico, nombre_diagnostico, categoria_diagnostico, severidad, requiere_hospitalizacion)
                VALUES (%s, %s, %s, %s, %s, %s)
            """, diag)
        
        postgres_conn.commit()
        logger.info("✅ Diagnósticos migrados correctamente")
        
    except Exception as e:
        logger.error(f"❌ Error migrando diagnósticos: {e}")
        postgres_conn.rollback()

def migrar_regimenes_salud(mysql_conn, postgres_conn):
    """Migrar tabla regimenes_salud"""
    try:
        mysql_cursor = mysql_conn.cursor()
        postgres_cursor = postgres_conn.cursor()
        
        mysql_cursor.execute("SELECT * FROM regimenes_salud")
        regimenes = mysql_cursor.fetchall()
        
        logger.info(f"📦 Migrando {len(regimenes)} regímenes de salud...")
        
        postgres_cursor.execute("DELETE FROM regimenes_salud")
        
        for reg in regimenes:
            postgres_cursor.execute("""
                INSERT INTO regimenes_salud (id_regimen, nombre_regimen, tipo_regimen, descripcion, cobertura_porcentaje, activo)
                VALUES (%s, %s, %s, %s, %s, %s)
            """, reg)
        
        postgres_conn.commit()
        logger.info("✅ Regímenes de salud migrados correctamente")
        
    except Exception as e:
        logger.error(f"❌ Error migrando regímenes: {e}")
        postgres_conn.rollback()

def migrar_eapb(mysql_conn, postgres_conn):
    """Migrar tabla eapb"""
    try:
        mysql_cursor = mysql_conn.cursor()
        postgres_cursor = postgres_conn.cursor()
        
        mysql_cursor.execute("SELECT * FROM eapb")
        eapbs = mysql_cursor.fetchall()
        
        logger.info(f"📦 Migrando {len(eapbs)} EAPBs...")
        
        postgres_cursor.execute("DELETE FROM eapb")
        
        for eapb in eapbs:
            postgres_cursor.execute("""
                INSERT INTO eapb (id_eapb, nombre_eapb, tipo_entidad, codigo_eapb, region_cobertura, activa)
                VALUES (%s, %s, %s, %s, %s, %s)
            """, eapb)
        
        postgres_conn.commit()
        logger.info("✅ EAPBs migrados correctamente")
        
    except Exception as e:
        logger.error(f"❌ Error migrando EAPBs: {e}")
        postgres_conn.rollback()

def migrar_atenciones_urgencias(mysql_conn, postgres_conn):
    """Migrar tabla atenciones_urgencias"""
    try:
        mysql_cursor = mysql_conn.cursor()
        postgres_cursor = postgres_conn.cursor()
        
        mysql_cursor.execute("SELECT * FROM atenciones_urgencias")
        atenciones = mysql_cursor.fetchall()
        
        logger.info(f"📦 Migrando {len(atenciones)} atenciones de urgencias...")
        
        postgres_cursor.execute("DELETE FROM atenciones_urgencias")
        
        for atencion in atenciones:
            postgres_cursor.execute("""
                INSERT INTO atenciones_urgencias (id_atencion, periodo, año, sexo, edad, tipo_edad, id_municipio, id_diagnostico, id_regimen, id_eapb, fecha_atencion, fecha_registro)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """, atencion)
        
        postgres_conn.commit()
        logger.info("✅ Atenciones de urgencias migradas correctamente")
        
    except Exception as e:
        logger.error(f"❌ Error migrando atenciones: {e}")
        postgres_conn.rollback()

def main():
    """Función principal de migración"""
    logger.info("🚀 Iniciando migración de datos MySQL → Supabase")
    
    # Conectar a ambas bases de datos
    mysql_conn = conectar_mysql()
    postgres_conn = conectar_postgres()
    
    if not mysql_conn or not postgres_conn:
        logger.error("❌ No se pudo conectar a alguna de las bases de datos")
        return
    
    try:
        # Migrar en orden de dependencias
        migrar_departamentos(mysql_conn, postgres_conn)
        migrar_municipios(mysql_conn, postgres_conn)
        migrar_diagnosticos(mysql_conn, postgres_conn)
        migrar_regimenes_salud(mysql_conn, postgres_conn)
        migrar_eapb(mysql_conn, postgres_conn)
        migrar_atenciones_urgencias(mysql_conn, postgres_conn)
        
        logger.info("🎉 ¡Migración completada exitosamente!")
        
    except Exception as e:
        logger.error(f"❌ Error durante la migración: {e}")
    
    finally:
        # Cerrar conexiones
        if mysql_conn:
            mysql_conn.close()
        if postgres_conn:
            postgres_conn.close()
        logger.info("🔌 Conexiones cerradas")

if __name__ == "__main__":
    main()
