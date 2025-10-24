#!/usr/bin/env python3
"""
Script para migrar datos de MySQL local a Supabase usando el cliente oficial
"""

import mysql.connector
from supabase import create_client, Client
import logging
from datetime import datetime

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

# Configuración Supabase
SUPABASE_URL = "https://jikjuutgacyzlxiczrrh.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imppa2p1dXRnYWN5emx4aWN6cnJoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEzMjM4MjksImV4cCI6MjA3Njg5OTgyOX0.gFsKJ8z23cWS4asH12UCFAL4KCQMwz3tuFI_wyPdqbU"

def conectar_mysql():
    """Conectar a MySQL local"""
    try:
        conn = mysql.connector.connect(**MYSQL_CONFIG)
        logger.info("Conectado a MySQL local")
        return conn
    except Exception as e:
        logger.error(f"Error conectando a MySQL: {e}")
        return None

def conectar_supabase():
    """Conectar a Supabase"""
    try:
        supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
        logger.info("Conectado a Supabase")
        return supabase
    except Exception as e:
        logger.error(f"Error conectando a Supabase: {e}")
        return None

def migrar_departamentos(mysql_conn, supabase):
    """Migrar tabla departamentos"""
    try:
        mysql_cursor = mysql_conn.cursor()
        
        # Obtener datos de MySQL
        mysql_cursor.execute("SELECT * FROM departamentos")
        departamentos = mysql_cursor.fetchall()
        
        logger.info(f"Migrando {len(departamentos)} departamentos...")
        
        # Preparar datos para Supabase
        datos_supabase = []
        for dept in departamentos:
            datos_supabase.append({
                'id_departamento': dept[0],
                'nombre_departamento': dept[1],
                'codigo_departamento': dept[2],
                'region': dept[3],
                'poblacion_estimada': dept[4],
                'fecha_creacion': dept[5].isoformat() if dept[5] else None
            })
        
        # Insertar en Supabase
        if datos_supabase:
            response = supabase.table("departamentos").insert(datos_supabase).execute()
            logger.info(f"Departamentos migrados: {len(response.data)}")
        
    except Exception as e:
        logger.error(f"Error migrando departamentos: {e}")

def migrar_municipios(mysql_conn, supabase):
    """Migrar tabla municipios"""
    try:
        mysql_cursor = mysql_conn.cursor()
        
        mysql_cursor.execute("SELECT * FROM municipios")
        municipios = mysql_cursor.fetchall()
        
        logger.info(f"Migrando {len(municipios)} municipios...")
        
        datos_supabase = []
        for mun in municipios:
            datos_supabase.append({
                'id_municipio': mun[0],
                'nombre_municipio': mun[1],
                'id_departamento': mun[2],
                'codigo_municipio': mun[3],
                'tipo_municipio': mun[4],
                'altitud_msnm': mun[5]
            })
        
        if datos_supabase:
            response = supabase.table("municipios").insert(datos_supabase).execute()
            logger.info(f"Municipios migrados: {len(response.data)}")
        
    except Exception as e:
        logger.error(f"Error migrando municipios: {e}")

def migrar_diagnosticos(mysql_conn, supabase):
    """Migrar tabla diagnosticos"""
    try:
        mysql_cursor = mysql_conn.cursor()
        
        mysql_cursor.execute("SELECT * FROM diagnosticos")
        diagnosticos = mysql_cursor.fetchall()
        
        logger.info(f"Migrando {len(diagnosticos)} diagnosticos...")
        
        datos_supabase = []
        for diag in diagnosticos:
            datos_supabase.append({
                'id_diagnostico': diag[0],
                'codigo_diagnostico': diag[1],
                'nombre_diagnostico': diag[2],
                'categoria_diagnostico': diag[3],
                'severidad': diag[4],
                'requiere_hospitalizacion': diag[5]
            })
        
        if datos_supabase:
            response = supabase.table("diagnosticos").insert(datos_supabase).execute()
            logger.info(f"Diagnosticos migrados: {len(response.data)}")
        
    except Exception as e:
        logger.error(f"Error migrando diagnosticos: {e}")

def migrar_regimenes_salud(mysql_conn, supabase):
    """Migrar tabla regimenes_salud"""
    try:
        mysql_cursor = mysql_conn.cursor()
        
        mysql_cursor.execute("SELECT * FROM regimenes_salud")
        regimenes = mysql_cursor.fetchall()
        
        logger.info(f"Migrando {len(regimenes)} regimenes de salud...")
        
        datos_supabase = []
        for reg in regimenes:
            datos_supabase.append({
                'id_regimen': reg[0],
                'nombre_regimen': reg[1],
                'tipo_regimen': reg[2],
                'descripcion': reg[3],
                'cobertura_porcentaje': float(reg[4]) if reg[4] else None,
                'activo': reg[5]
            })
        
        if datos_supabase:
            response = supabase.table("regimenes_salud").insert(datos_supabase).execute()
            logger.info(f"Regimenes migrados: {len(response.data)}")
        
    except Exception as e:
        logger.error(f"Error migrando regimenes: {e}")

def migrar_eapb(mysql_conn, supabase):
    """Migrar tabla eapb"""
    try:
        mysql_cursor = mysql_conn.cursor()
        
        mysql_cursor.execute("SELECT * FROM eapb")
        eapbs = mysql_cursor.fetchall()
        
        logger.info(f"Migrando {len(eapbs)} EAPBs...")
        
        datos_supabase = []
        for eapb in eapbs:
            datos_supabase.append({
                'id_eapb': eapb[0],
                'nombre_eapb': eapb[1],
                'tipo_entidad': eapb[2],
                'codigo_eapb': eapb[3],
                'region_cobertura': eapb[4],
                'activa': eapb[5]
            })
        
        if datos_supabase:
            response = supabase.table("eapb").insert(datos_supabase).execute()
            logger.info(f"EAPBs migrados: {len(response.data)}")
        
    except Exception as e:
        logger.error(f"Error migrando EAPBs: {e}")

def migrar_atenciones_urgencias(mysql_conn, supabase):
    """Migrar tabla atenciones_urgencias"""
    try:
        mysql_cursor = mysql_conn.cursor()
        
        mysql_cursor.execute("SELECT * FROM atenciones_urgencias")
        atenciones = mysql_cursor.fetchall()
        
        logger.info(f"Migrando {len(atenciones)} atenciones de urgencias...")
        
        # Migrar en lotes para evitar problemas de memoria
        batch_size = 1000
        total_migrados = 0
        
        for i in range(0, len(atenciones), batch_size):
            batch = atenciones[i:i + batch_size]
            
            datos_supabase = []
            for atencion in batch:
                datos_supabase.append({
                    'id_atencion': atencion[0],
                    'periodo': atencion[1],
                    'año': atencion[2],
                    'sexo': atencion[3],
                    'edad': atencion[4],
                    'tipo_edad': atencion[5],
                    'id_municipio': atencion[6],
                    'id_diagnostico': atencion[7],
                    'id_regimen': atencion[8],
                    'id_eapb': atencion[9],
                    'fecha_atencion': atencion[10].isoformat() if atencion[10] else None,
                    'fecha_registro': atencion[11].isoformat() if atencion[11] else None
                })
            
            if datos_supabase:
                response = supabase.table("atenciones_urgencias").insert(datos_supabase).execute()
                total_migrados += len(response.data)
                logger.info(f"Lote {i//batch_size + 1}: {len(response.data)} atenciones migradas")
        
        logger.info(f"Total atenciones migradas: {total_migrados}")
        
    except Exception as e:
        logger.error(f"Error migrando atenciones: {e}")

def main():
    """Función principal de migración"""
    logger.info("Iniciando migracion de datos MySQL -> Supabase")
    
    # Conectar a ambas bases de datos
    mysql_conn = conectar_mysql()
    supabase = conectar_supabase()
    
    if not mysql_conn or not supabase:
        logger.error("No se pudo conectar a alguna de las bases de datos")
        return
    
    try:
        # Migrar en orden de dependencias
        migrar_departamentos(mysql_conn, supabase)
        migrar_municipios(mysql_conn, supabase)
        migrar_diagnosticos(mysql_conn, supabase)
        migrar_regimenes_salud(mysql_conn, supabase)
        migrar_eapb(mysql_conn, supabase)
        migrar_atenciones_urgencias(mysql_conn, supabase)
        
        logger.info("Migracion completada exitosamente!")
        
    except Exception as e:
        logger.error(f"Error durante la migracion: {e}")
    
    finally:
        # Cerrar conexiones
        if mysql_conn:
            mysql_conn.close()
        logger.info("Conexiones cerradas")

if __name__ == "__main__":
    main()
