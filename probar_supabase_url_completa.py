#!/usr/bin/env python3
"""
Script para probar la conexion a Supabase con la URL completa
"""

import psycopg2
import sys

def probar_conexion_supabase():
    """Probar conexion a Supabase con la URL completa"""
    
    print("Probando conexion a Supabase...")
    
    # URL completa de conexion
    url_conexion = "postgresql://postgres:otg8PCZ9gb5czKxQ@db.jikjuutgacyzlxiczrrh.supabase.co:5432/postgres"
    
    print(f"URL: {url_conexion}")
    
    try:
        conn = psycopg2.connect(url_conexion)
        print("Conexion exitosa!")
        
        # Probar una consulta simple
        cursor = conn.cursor()
        cursor.execute("SELECT version();")
        version = cursor.fetchone()
        print(f"Version de PostgreSQL: {version[0]}")
        
        # Verificar tablas
        cursor.execute("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
            ORDER BY table_name;
        """)
        tablas = cursor.fetchall()
        
        print(f"\nTablas encontradas ({len(tablas)}):")
        for tabla in tablas:
            print(f"  - {tabla[0]}")
        
        # Verificar si hay datos en las tablas
        print(f"\nVerificando datos en las tablas:")
        for tabla in tablas:
            try:
                cursor.execute(f"SELECT COUNT(*) FROM {tabla[0]};")
                count = cursor.fetchone()
                print(f"  - {tabla[0]}: {count[0]} registros")
            except Exception as e:
                print(f"  - {tabla[0]}: Error - {e}")
        
        conn.close()
        return True
        
    except Exception as e:
        print(f"Error conectando a Supabase: {e}")
        return False

if __name__ == "__main__":
    if probar_conexion_supabase():
        print("\nConexion a Supabase funcionando!")
        print("Ahora podemos migrar los datos.")
    else:
        print("\nError en la conexion.")
        print("Verifica que el proyecto este activo en Supabase.")
