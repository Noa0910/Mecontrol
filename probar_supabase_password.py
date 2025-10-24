#!/usr/bin/env python3
"""
Script para probar la conexion a Supabase con la password correcta
"""

import psycopg2
import sys

def probar_conexion_supabase(password):
    """Probar conexion a Supabase con la password proporcionada"""
    
    print("Probando conexion a Supabase...")
    
    # Credenciales de Supabase
    config = {
        'host': 'db.jikjuutgacyzlxiczrrh.supabase.co',
        'user': 'postgres',
        'password': password,
        'database': 'postgres',
        'port': 5432,
        'sslmode': 'require'
    }
    
    try:
        print(f"Conectando a: {config['host']}:{config['port']}")
        print(f"Base de datos: {config['database']}")
        print(f"Usuario: {config['user']}")
        
        conn = psycopg2.connect(**config)
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
    if len(sys.argv) != 2:
        print("Uso: python probar_supabase_password.py [PASSWORD]")
        print("Ejemplo: python probar_supabase_password.py mi_password_123")
        sys.exit(1)
    
    password = sys.argv[1]
    
    if probar_conexion_supabase(password):
        print("\nConexion a Supabase funcionando!")
        print("Ahora podemos migrar los datos.")
    else:
        print("\nError en la conexion. Verifica la password.")
