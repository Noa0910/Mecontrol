#!/usr/bin/env python3
"""
Script para probar la conexion a Supabase usando el cliente oficial
"""

from supabase import create_client, Client
import sys

def probar_conexion_supabase():
    """Probar conexion a Supabase usando el cliente oficial"""
    
    print("Probando conexion a Supabase usando cliente oficial...")
    
    # Credenciales de Supabase
    url = "https://jikjuutgacyzlxiczrrh.supabase.co"
    key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imppa2p1dXRnYWN5emx4aWN6cnJoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEzMjM4MjksImV4cCI6MjA3Njg5OTgyOX0.gFsKJ8z23cWS4asH12UCFAL4KCQMwz3tuFI_wyPdqbU"
    
    try:
        # Crear cliente de Supabase
        supabase: Client = create_client(url, key)
        print("Cliente de Supabase creado exitosamente!")
        
        # Probar una consulta simple
        print("Probando consulta a la tabla departamentos...")
        response = supabase.table("departamentos").select("*").limit(5).execute()
        
        print(f"Consulta exitosa! Encontrados {len(response.data)} registros")
        
        if response.data:
            print("Primeros registros:")
            for i, record in enumerate(response.data[:3]):
                print(f"  {i+1}. {record}")
        
        # Verificar todas las tablas
        print("\nVerificando todas las tablas:")
        tablas = ["departamentos", "municipios", "diagnosticos", "regimenes_salud", "eapb", "atenciones_urgencias"]
        
        for tabla in tablas:
            try:
                response = supabase.table(tabla).select("*", count="exact").limit(1).execute()
                count = response.count if hasattr(response, 'count') else len(response.data)
                print(f"  - {tabla}: {count} registros")
            except Exception as e:
                print(f"  - {tabla}: Error - {e}")
        
        return True
        
    except Exception as e:
        print(f"Error conectando a Supabase: {e}")
        return False

if __name__ == "__main__":
    if probar_conexion_supabase():
        print("\nConexion a Supabase funcionando!")
        print("Ahora podemos migrar los datos usando el cliente de Supabase.")
    else:
        print("\nError en la conexion.")
        print("Verifica que el proyecto este activo en Supabase.")
