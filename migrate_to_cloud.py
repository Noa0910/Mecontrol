#!/usr/bin/env python3
"""
Script para migrar datos de MySQL local a base de datos en la nube
"""

import mysql.connector
import os
import sys
from datetime import datetime

def connect_to_database(host, user, password, database, port=3306):
    """Conectar a la base de datos"""
    try:
        connection = mysql.connector.connect(
            host=host,
            user=user,
            password=password,
            database=database,
            port=port
        )
        print(f"✅ Conectado a {host}:{port}/{database}")
        return connection
    except mysql.connector.Error as err:
        print(f"❌ Error conectando a la base de datos: {err}")
        return None

def migrate_data():
    """Migrar datos de local a nube"""
    
    # Configuración local (XAMPP)
    local_config = {
        'host': 'localhost',
        'user': 'root',
        'password': '',
        'database': 'morbilidad_urgencias',
        'port': 3306
    }
    
    # Configuración de la nube (actualizar con tus credenciales)
    cloud_config = {
        'host': input("Host de la base de datos en la nube: "),
        'user': input("Usuario de la base de datos: "),
        'password': input("Password de la base de datos: "),
        'database': input("Nombre de la base de datos: "),
        'port': int(input("Puerto (default 3306): ") or 3306)
    }
    
    # Conectar a ambas bases de datos
    local_conn = connect_to_database(**local_config)
    cloud_conn = connect_to_database(**cloud_config)
    
    if not local_conn or not cloud_conn:
        print("❌ No se pudo conectar a una o ambas bases de datos")
        return False
    
    try:
        local_cursor = local_conn.cursor()
        cloud_cursor = cloud_conn.cursor()
        
        # Obtener lista de tablas
        local_cursor.execute("SHOW TABLES")
        tables = [table[0] for table in local_cursor.fetchall()]
        
        print(f"📋 Tablas encontradas: {', '.join(tables)}")
        
        for table in tables:
            print(f"\n🔄 Migrando tabla: {table}")
            
            # Obtener estructura de la tabla
            local_cursor.execute(f"DESCRIBE {table}")
            columns = local_cursor.fetchall()
            
            # Crear tabla en la nube si no existe
            local_cursor.execute(f"SHOW CREATE TABLE {table}")
            create_table_sql = local_cursor.fetchone()[1]
            cloud_cursor.execute(create_table_sql)
            
            # Obtener datos de la tabla local
            local_cursor.execute(f"SELECT * FROM {table}")
            rows = local_cursor.fetchall()
            
            if rows:
                # Preparar query de inserción
                placeholders = ', '.join(['%s'] * len(columns))
                insert_sql = f"INSERT INTO {table} VALUES ({placeholders})"
                
                # Insertar datos en lotes
                batch_size = 1000
                for i in range(0, len(rows), batch_size):
                    batch = rows[i:i + batch_size]
                    cloud_cursor.executemany(insert_sql, batch)
                    cloud_conn.commit()
                    print(f"  ✅ Insertados {len(batch)} registros")
                
                print(f"  ✅ Tabla {table} migrada: {len(rows)} registros")
            else:
                print(f"  ⚠️ Tabla {table} vacía")
        
        print(f"\n🎉 Migración completada exitosamente!")
        print(f"📊 Total de tablas migradas: {len(tables)}")
        
        return True
        
    except mysql.connector.Error as err:
        print(f"❌ Error durante la migración: {err}")
        return False
    
    finally:
        local_conn.close()
        cloud_conn.close()

if __name__ == "__main__":
    print("🚀 Migrador de Base de Datos - MedControl")
    print("=" * 50)
    
    # Verificar que XAMPP esté ejecutándose
    try:
        test_conn = mysql.connector.connect(
            host='localhost',
            user='root',
            password='',
            port=3306
        )
        test_conn.close()
        print("✅ XAMPP/MySQL local está ejecutándose")
    except:
        print("❌ XAMPP/MySQL local no está ejecutándose")
        print("   Por favor inicia XAMPP antes de continuar")
        sys.exit(1)
    
    # Ejecutar migración
    if migrate_data():
        print("\n🎯 Próximos pasos:")
        print("1. Actualiza las variables de entorno en Vercel")
        print("2. Redespliega tu aplicación")
        print("3. Verifica que todo funcione correctamente")
    else:
        print("\n❌ La migración falló. Revisa los errores anteriores.")
