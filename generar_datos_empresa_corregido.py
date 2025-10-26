#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script para generar datos de ejemplo de empresa (3,000 registros)
Versión corregida con todos los campos requeridos
"""

import random
import json
from datetime import datetime, timedelta
from supabase import create_client, Client

# Configuración de Supabase
SUPABASE_URL = "https://jikjuutgacyzlxiczrrh.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imppa2p1dXRnYWN5emx4aWN6cnJoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEzMjM4MjksImV4cCI6MjA3Njg5OTgyOX0.gFsKJ8z23cWS4asH12UCFAL4KCQMwz3tuFI_wyPdqbU"

# Inicializar cliente Supabase
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def verificar_estructura_tabla():
    """Verificar la estructura de la tabla atenciones_urgencias"""
    try:
        print("Verificando estructura de tabla atenciones_urgencias...")
        
        # Obtener un registro existente para ver la estructura
        response = supabase.table('atenciones_urgencias').select('*').limit(1).execute()
        
        if response.data:
            registro = response.data[0]
            print("Campos encontrados en la tabla:")
            for campo in registro.keys():
                print(f"   - {campo}: {type(registro[campo]).__name__}")
            return registro.keys()
        else:
            print("ERROR: No se encontraron registros en la tabla")
            return None
            
    except Exception as e:
        print(f"ERROR verificando estructura: {e}")
        return None

def obtener_datos_existentes():
    """Obtener datos existentes de las tablas para generar relaciones"""
    try:
        print("Obteniendo datos existentes...")
        
        # Obtener departamentos
        deptos_response = supabase.table('departamentos').select('*').execute()
        departamentos = deptos_response.data if deptos_response.data else []
        
        # Obtener municipios
        munis_response = supabase.table('municipios').select('*').execute()
        municipios = munis_response.data if munis_response.data else []
        
        # Obtener diagnósticos
        diag_response = supabase.table('diagnosticos').select('*').execute()
        diagnosticos = diag_response.data if diag_response.data else []
        
        # Obtener EPS
        eps_response = supabase.table('eapb').select('*').execute()
        eps = eps_response.data if eps_response.data else []
        
        # Obtener regímenes
        reg_response = supabase.table('regimenes_salud').select('*').execute()
        regimenes = reg_response.data if reg_response.data else []
        
        print(f"Datos encontrados:")
        print(f"   - Departamentos: {len(departamentos)}")
        print(f"   - Municipios: {len(municipios)}")
        print(f"   - Diagnosticos: {len(diagnosticos)}")
        print(f"   - EPS: {len(eps)}")
        print(f"   - Regimenes: {len(regimenes)}")
        
        return {
            'departamentos': departamentos,
            'municipios': municipios,
            'diagnosticos': diagnosticos,
            'eps': eps,
            'regimenes': regimenes
        }
    except Exception as e:
        print(f"ERROR obteniendo datos existentes: {e}")
        return None

def generar_atenciones_empresa(cantidad=3000):
    """Generar atenciones de empresa con características específicas"""
    datos_existentes = obtener_datos_existentes()
    if not datos_existentes:
        print("ERROR: No se pudieron obtener los datos existentes")
        return []
    
    atenciones = []
    
    # Filtrar datos para empresa (solo algunos departamentos principales)
    deptos_empresa = datos_existentes['departamentos'][:10]  # Primeros 10 departamentos
    munis_empresa = datos_existentes['municipios'][:50]  # Primeros 50 municipios
    eps_empresa = datos_existentes['eps'][:10]  # Primeros 10 EPS
    
    print(f"Generando {cantidad} atenciones de empresa...")
    print(f"   - Departamentos disponibles: {len(deptos_empresa)}")
    print(f"   - Municipios disponibles: {len(munis_empresa)}")
    print(f"   - EPS disponibles: {len(eps_empresa)}")
    
    for i in range(cantidad):
        # Fecha aleatoria en los últimos 2 años
        fecha_inicio = datetime.now() - timedelta(days=730)
        fecha_aleatoria = fecha_inicio + timedelta(days=random.randint(0, 730))
        
        # Seleccionar municipio aleatorio
        municipio = random.choice(munis_empresa)
        
        # Seleccionar diagnóstico aleatorio
        diagnostico = random.choice(datos_existentes['diagnosticos'])
        
        # Seleccionar EPS aleatoria
        eps = random.choice(eps_empresa)
        
        # Seleccionar régimen aleatorio
        regimen = random.choice(datos_existentes['regimenes'])
        
        # Generar datos demográficos con sesgo hacia población laboral
        sexo = random.choice(['M', 'F'])
        if sexo == 'M':
            edad = random.randint(18, 65)  # Sesgo hacia población laboral masculina
        else:
            edad = random.randint(18, 60)  # Sesgo hacia población laboral femenina
        
        # Generar período (últimos 2 años)
        periodo = fecha_aleatoria.strftime("%Y-%m")
        año = fecha_aleatoria.year
        
        atencion = {
            'fecha_atencion': fecha_aleatoria.strftime('%Y-%m-%d'),
            'sexo': sexo,
            'edad': edad,
            'periodo': periodo,
            'año': año,  # Campo requerido
            'id_diagnostico': diagnostico['id_diagnostico'],
            'id_municipio': municipio['id_municipio'],
            'id_regimen': regimen['id_regimen'],
            'id_eapb': eps['id_eapb'],
            'tipo_datos': 'empresa'  # Campo para identificar datos de empresa
        }
        
        atenciones.append(atencion)
        
        if (i + 1) % 500 == 0:
            print(f"   Generadas {i + 1} atenciones...")
    
    return atenciones

def insertar_atenciones_empresa(atenciones):
    """Insertar atenciones de empresa en la base de datos"""
    try:
        print(f"Insertando {len(atenciones)} atenciones de empresa...")
        
        # Insertar en lotes de 100
        batch_size = 100
        total_insertados = 0
        
        for i in range(0, len(atenciones), batch_size):
            batch = atenciones[i:i + batch_size]
            response = supabase.table('atenciones_urgencias').insert(batch).execute()
            
            if response.data:
                total_insertados += len(batch)
                print(f"   OK: Lote {i//batch_size + 1}: {len(batch)} registros insertados")
            else:
                print(f"   ERROR: Error insertando lote {i//batch_size + 1}")
        
        print(f"Total insertados: {total_insertados} registros")
        return True
        
    except Exception as e:
        print(f"ERROR insertando datos de empresa: {e}")
        return False

def verificar_insercion():
    """Verificar que los datos se insertaron correctamente"""
    try:
        print("Verificando insercion...")
        
        # Contar registros de empresa
        response = supabase.table('atenciones_urgencias').select('*', count='exact').eq('tipo_datos', 'empresa').execute()
        count_empresa = response.count if response.count else 0
        
        # Contar registros globales
        response = supabase.table('atenciones_urgencias').select('*', count='exact').eq('tipo_datos', 'global').execute()
        count_global = response.count if response.count else 0
        
        print(f"Verificacion completada:")
        print(f"   - Registros globales: {count_global:,}")
        print(f"   - Registros empresa: {count_empresa:,}")
        print(f"   - Total registros: {count_global + count_empresa:,}")
        
        return True
        
    except Exception as e:
        print(f"ERROR verificando insercion: {e}")
        return False

def main():
    """Función principal"""
    print("Generador de Datos de Empresa - Version Corregida")
    print("=" * 60)
    
    # Verificar estructura de tabla
    campos = verificar_estructura_tabla()
    if not campos:
        print("ERROR: No se pudo verificar la estructura de la tabla")
        return
    
    # Generar atenciones de empresa
    atenciones_empresa = generar_atenciones_empresa(3000)
    
    if atenciones_empresa:
        # Insertar en la base de datos
        if insertar_atenciones_empresa(atenciones_empresa):
            # Verificar inserción
            verificar_insercion()
            print("\nProceso completado exitosamente!")
            print("Los datos estan marcados con tipo_datos='empresa' para diferenciarlos")
        else:
            print("\nERROR en el proceso de insercion")
    else:
        print("\nERROR: No se pudieron generar las atenciones")

if __name__ == "__main__":
    main()

