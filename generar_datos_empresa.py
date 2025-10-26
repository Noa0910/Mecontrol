#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script para generar datos de ejemplo de empresa (3,000 registros)
Simula datos similares a los globales pero con variaciones específicas de empresa
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

# Datos de ejemplo para generar registros de empresa
DEPARTAMENTOS_EMPRESA = [
    "Bogotá D.C.", "Antioquia", "Valle del Cauca", "Santander", "Atlántico",
    "Cundinamarca", "Bolívar", "Nariño", "Córdoba", "Tolima"
]

MUNICIPIOS_EMPRESA = {
    "Bogotá D.C.": ["Bogotá"],
    "Antioquia": ["Medellín", "Bello", "Itagüí", "Envigado"],
    "Valle del Cauca": ["Cali", "Palmira", "Buenaventura"],
    "Santander": ["Bucaramanga", "Floridablanca", "Girón"],
    "Atlántico": ["Barranquilla", "Soledad", "Malambo"],
    "Cundinamarca": ["Soacha", "Girardot", "Zipaquirá"],
    "Bolívar": ["Cartagena", "Magangué", "Turbaco"],
    "Nariño": ["Pasto", "Tumaco", "Ipiales"],
    "Córdoba": ["Montería", "Cereté", "Sahagún"],
    "Tolima": ["Ibagué", "Girardot", "Espinal"]
}

DIAGNOSTICOS_EMPRESA = [
    {"codigo": "A09", "nombre": "Diarrea y gastroenteritis de presunto origen infeccioso", "categoria": "Enfermedades infecciosas", "severidad": "Media"},
    {"codigo": "J06", "nombre": "Infecciones agudas de las vías respiratorias superiores", "categoria": "Enfermedades respiratorias", "severidad": "Baja"},
    {"codigo": "K59", "nombre": "Otros trastornos funcionales del intestino", "categoria": "Enfermedades digestivas", "severidad": "Media"},
    {"codigo": "M79", "nombre": "Otros trastornos de los tejidos blandos", "categoria": "Enfermedades musculoesqueléticas", "severidad": "Baja"},
    {"codigo": "R50", "nombre": "Fiebre de origen desconocido", "categoria": "Síntomas y signos", "severidad": "Media"},
    {"codigo": "S72", "nombre": "Fractura del fémur", "categoria": "Traumatismos", "severidad": "Alta"},
    {"codigo": "I10", "nombre": "Hipertensión esencial", "categoria": "Enfermedades cardiovasculares", "severidad": "Media"},
    {"codigo": "E11", "nombre": "Diabetes mellitus tipo 2", "categoria": "Enfermedades endocrinas", "severidad": "Alta"},
    {"codigo": "N39", "nombre": "Otros trastornos del sistema urinario", "categoria": "Enfermedades genitourinarias", "severidad": "Media"},
    {"codigo": "H52", "nombre": "Trastornos de la refracción y acomodación", "categoria": "Enfermedades oculares", "severidad": "Baja"}
]

EPS_EMPRESA = [
    "Sanitas", "Sura", "Nueva EPS", "Compensar", "Cafesalud",
    "Salud Total", "Coomeva", "Famisanar", "Cruz Blanca", "Comfenalco"
]

REGIMENES_EMPRESA = [
    "Contributivo", "Subsidiado", "Especial", "Excepción"
]

def obtener_datos_existentes():
    """Obtener datos existentes de las tablas para generar relaciones"""
    try:
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
        
        return {
            'departamentos': departamentos,
            'municipios': municipios,
            'diagnosticos': diagnosticos,
            'eps': eps,
            'regimenes': regimenes
        }
    except Exception as e:
        print(f"Error obteniendo datos existentes: {e}")
        return None

def generar_atenciones_empresa(cantidad=3000):
    """Generar atenciones de empresa con características específicas"""
    datos_existentes = obtener_datos_existentes()
    if not datos_existentes:
        print("No se pudieron obtener los datos existentes")
        return []
    
    atenciones = []
    
    # Filtrar datos para empresa (solo algunos departamentos y EPS)
    deptos_empresa = [d for d in datos_existentes['departamentos'] if d['nombre_departamento'] in DEPARTAMENTOS_EMPRESA]
    munis_empresa = [m for m in datos_existentes['municipios'] if m['nombre_municipio'] in [muni for munis in MUNICIPIOS_EMPRESA.values() for muni in munis]]
    eps_empresa = [e for e in datos_existentes['eps'] if e['nombre_eapb'] in EPS_EMPRESA]
    
    print(f"Generando {cantidad} atenciones de empresa...")
    print(f"Departamentos disponibles: {len(deptos_empresa)}")
    print(f"Municipios disponibles: {len(munis_empresa)}")
    print(f"EPS disponibles: {len(eps_empresa)}")
    
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
        
        atencion = {
            'fecha_atencion': fecha_aleatoria.strftime('%Y-%m-%d'),
            'sexo': sexo,
            'edad': edad,
            'periodo': periodo,
            'id_diagnostico': diagnostico['id_diagnostico'],
            'id_municipio': municipio['id_municipio'],
            'id_regimen': regimen['id_regimen'],
            'id_eapb': eps['id_eapb'],
            'tipo_datos': 'empresa'  # Campo para identificar datos de empresa
        }
        
        atenciones.append(atencion)
        
        if (i + 1) % 500 == 0:
            print(f"Generadas {i + 1} atenciones...")
    
    return atenciones

def insertar_atenciones_empresa(atenciones):
    """Insertar atenciones de empresa en la base de datos"""
    try:
        print(f"Insertando {len(atenciones)} atenciones de empresa...")
        
        # Insertar en lotes de 100
        batch_size = 100
        for i in range(0, len(atenciones), batch_size):
            batch = atenciones[i:i + batch_size]
            response = supabase.table('atenciones_urgencias').insert(batch).execute()
            
            if response.data:
                print(f"Insertado lote {i//batch_size + 1}: {len(batch)} registros")
            else:
                print(f"Error insertando lote {i//batch_size + 1}")
        
        print("✅ Datos de empresa insertados exitosamente")
        return True
        
    except Exception as e:
        print(f"❌ Error insertando datos de empresa: {e}")
        return False

def main():
    """Función principal"""
    print("🏢 Generador de Datos de Empresa")
    print("=" * 50)
    
    # Generar atenciones de empresa
    atenciones_empresa = generar_atenciones_empresa(3000)
    
    if atenciones_empresa:
        # Insertar en la base de datos
        if insertar_atenciones_empresa(atenciones_empresa):
            print("\n🎉 Proceso completado exitosamente!")
            print(f"📊 Se generaron {len(atenciones_empresa)} atenciones de empresa")
            print("💡 Los datos están marcados con tipo_datos='empresa' para diferenciarlos")
        else:
            print("\n❌ Error en el proceso de inserción")
    else:
        print("\n❌ No se pudieron generar las atenciones")

if __name__ == "__main__":
    main()

