#!/usr/bin/env python3
"""
Script para probar la conexión a Supabase
"""

import psycopg2
import sys

def probar_conexion_supabase():
    """Probar diferentes formas de conectar a Supabase"""
    
    # Opción 1: URL completa de conexión
    url_conexion = "postgresql://postgres:JX71EllZRtUC8oiJ@db.jikjuutgacyzlxiczrrh.supabase.co:5432/postgres"
    
    print("🔍 Probando conexión a Supabase...")
    print(f"URL: {url_conexion}")
    
    try:
        conn = psycopg2.connect(url_conexion)
        print("✅ ¡Conexión exitosa con URL completa!")
        
        # Probar una consulta simple
        cursor = conn.cursor()
        cursor.execute("SELECT version();")
        version = cursor.fetchone()
        print(f"📊 Versión de PostgreSQL: {version[0]}")
        
        # Verificar tablas
        cursor.execute("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
            ORDER BY table_name;
        """)
        tablas = cursor.fetchall()
        
        print(f"📋 Tablas encontradas ({len(tablas)}):")
        for tabla in tablas:
            print(f"  - {tabla[0]}")
        
        conn.close()
        return True
        
    except Exception as e:
        print(f"❌ Error con URL completa: {e}")
        
        # Opción 2: Parámetros individuales
        print("\n🔍 Probando con parámetros individuales...")
        
        config = {
            'host': 'db.jikjuutgacyzlxiczrrh.supabase.co',
            'user': 'postgres',
            'password': 'JX71EllZRtUC8oiJ',
            'database': 'postgres',
            'port': 5432
        }
        
        try:
            conn = psycopg2.connect(**config)
            print("✅ ¡Conexión exitosa con parámetros individuales!")
            
            cursor = conn.cursor()
            cursor.execute("SELECT COUNT(*) FROM departamentos;")
            count = cursor.fetchone()
            print(f"📊 Registros en departamentos: {count[0]}")
            
            conn.close()
            return True
            
        except Exception as e2:
            print(f"❌ Error con parámetros individuales: {e2}")
            return False

if __name__ == "__main__":
    if probar_conexion_supabase():
        print("\n🎉 ¡Conexión a Supabase funcionando!")
    else:
        print("\n💡 Necesitamos verificar las credenciales en Supabase")
        print("   Ve a Settings → Database en tu dashboard de Supabase")
