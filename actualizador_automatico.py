import mysql.connector
import pandas as pd
import requests
import schedule
import time
import hashlib
import logging
from datetime import datetime, timedelta
import os
import sys

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('actualizador_morbilidad.log'),
        logging.StreamHandler()
    ]
)

class ActualizadorMorbilidad:
    def __init__(self):
        self.conexion = None
        self.api_url = "https://www.datos.gov.co/resource/w6k7-5tme.json"
        self.ultima_actualizacion = None
        
    def conectar_mysql(self):
        """
        Conectar a MySQL (XAMPP)
        """
        try:
            self.conexion = mysql.connector.connect(
                host='localhost',
                user='root',
                password='',
                port=3306,
                database='morbilidad_urgencias',
                autocommit=False
            )
            logging.info("[SUCCESS] Conexión a MySQL exitosa")
            return True
        except mysql.connector.Error as e:
            logging.error(f"[ERROR] Error conectando a MySQL: {e}")
            return False
    
    def obtener_datos_api(self):
        """
        Obtener todos los datos de la API
        """
        try:
            logging.info("🔄 Obteniendo datos de la API...")
            
            todos_los_datos = []
            offset = 0
            limite = 1000
            
            while True:
                params = {
                    '$limit': limite,
                    '$offset': offset
                }
                
                response = requests.get(self.api_url, params=params, timeout=30)
                response.raise_for_status()
                
                data = response.json()
                
                if not data or len(data) == 0:
                    break
                
                todos_los_datos.extend(data)
                logging.info(f"[INFO] Obtenidos {len(data)} registros. Total: {len(todos_los_datos)}")
                
                if len(data) < limite:
                    break
                
                offset += limite
                time.sleep(0.5)  # Pausa para no sobrecargar la API
            
            logging.info(f"[SUCCESS] Total de registros obtenidos de la API: {len(todos_los_datos)}")
            return todos_los_datos
            
        except Exception as e:
            logging.error(f"[ERROR] Error obteniendo datos de la API: {e}")
            return []
    
    def limpiar_datos(self, datos):
        """
        Limpiar y validar los datos
        """
        try:
            df = pd.DataFrame(datos)
            
            # Limpiar espacios en blanco
            for col in df.columns:
                if df[col].dtype == 'object':
                    df[col] = df[col].astype(str).str.strip()
            
            # Validar y limpiar edad
            df['edad'] = pd.to_numeric(df['edad'], errors='coerce')
            df = df.dropna(subset=['edad'])
            df = df[(df['edad'] >= 0) & (df['edad'] <= 120)]
            
            # Validar sexo
            df = df[df['sexo'].isin(['M', 'F'])]
            
            # Limpiar fechas
            df['fecha_atencion'] = pd.to_datetime(df['fecha_atencion'], errors='coerce')
            df = df.dropna(subset=['fecha_atencion'])
            
            # Validar año
            df['a_o'] = pd.to_numeric(df['a_o'], errors='coerce')
            df = df[(df['a_o'] >= 2020) & (df['a_o'] <= 2025)]
            
            # Limpiar texto de diagnósticos
            df['nombre_diagnostico'] = df['nombre_diagnostico'].str.replace(r'[^\w\s\-\.]', '', regex=True)
            df['nombre_diagnostico'] = df['nombre_diagnostico'].str.replace(r'\s+', ' ', regex=True)
            
            # Eliminar registros con campos vacíos críticos
            campos_criticos = ['procedencia', 'departamento', 'diagnostico', 'nombre_diagnostico', 'regimen', 'eapb']
            for campo in campos_criticos:
                df = df[df[campo].str.len() > 0]
            
            # Crear hash único para cada registro para detectar duplicados
            df['hash_registro'] = df.apply(lambda row: hashlib.md5(
                f"{row['periodo']}{row['a_o']}{row['sexo']}{row['edad']}{row['procedencia']}{row['departamento']}{row['fecha_atencion']}{row['diagnostico']}{row['regimen']}{row['eapb']}".encode()
            ).hexdigest(), axis=1)
            
            logging.info(f"[SUCCESS] Datos limpiados: {len(df)} registros válidos")
            return df
            
        except Exception as e:
            logging.error(f"[ERROR] Error limpiando datos: {e}")
            return pd.DataFrame()
    
    def obtener_hashes_existentes(self):
        """
        Obtener hashes de registros ya existentes en la base de datos
        """
        try:
            cursor = self.conexion.cursor()
            
            # Crear tabla de hashes si no existe
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS hashes_registros (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    hash_registro VARCHAR(32) UNIQUE,
                    fecha_insercion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)
            
            # Obtener todos los hashes existentes
            cursor.execute("SELECT hash_registro FROM hashes_registros")
            hashes_existentes = set(row[0] for row in cursor.fetchall())
            
            cursor.close()
            logging.info(f"[INFO] Hashes existentes en BD: {len(hashes_existentes)}")
            return hashes_existentes
            
        except Exception as e:
            logging.error(f"[ERROR] Error obteniendo hashes existentes: {e}")
            return set()
    
    def identificar_datos_nuevos(self, df, hashes_existentes):
        """
        Identificar datos nuevos que no existen en la base de datos
        """
        try:
            # Filtrar solo registros nuevos
            df_nuevos = df[~df['hash_registro'].isin(hashes_existentes)]
            
            logging.info(f"[NEW] Datos nuevos identificados: {len(df_nuevos)} de {len(df)} total")
            return df_nuevos
            
        except Exception as e:
            logging.error(f"[ERROR] Error identificando datos nuevos: {e}")
            return pd.DataFrame()
    
    def actualizar_tablas_maestras(self, df_nuevos):
        """
        Actualizar tablas maestras con datos nuevos
        """
        try:
            cursor = self.conexion.cursor()
            
            # 1. Actualizar departamentos
            departamentos_nuevos = df_nuevos[['departamento']].drop_duplicates()
            for _, row in departamentos_nuevos.iterrows():
                nombre = row['departamento'].strip()
                if len(nombre) > 0:
                    cursor.execute("""
                        INSERT IGNORE INTO departamentos (nombre_departamento, region, poblacion_estimada)
                        VALUES (%s, %s, %s)
                    """, (nombre, 'Colombia', None))
            
            # 2. Actualizar municipios
            municipios_nuevos = df_nuevos[['procedencia', 'departamento']].drop_duplicates()
            for _, row in municipios_nuevos.iterrows():
                procedencia = row['procedencia'].strip()
                departamento = row['departamento'].strip()
                
                if len(procedencia) > 0 and len(departamento) > 0:
                    cursor.execute("SELECT id_departamento FROM departamentos WHERE nombre_departamento = %s", 
                                 (departamento,))
                    dept_id = cursor.fetchone()
                    
                    if dept_id:
                        cursor.execute("""
                            INSERT IGNORE INTO municipios (nombre_municipio, id_departamento, tipo_municipio)
                            VALUES (%s, %s, %s)
                        """, (procedencia, dept_id[0], 'Municipio'))
            
            # 3. Actualizar diagnósticos
            diagnosticos_nuevos = df_nuevos[['diagnostico', 'nombre_diagnostico']].drop_duplicates()
            for _, row in diagnosticos_nuevos.iterrows():
                codigo = row['diagnostico'].strip()
                nombre = row['nombre_diagnostico'].strip()
                
                if len(codigo) > 0 and len(nombre) > 0:
                    categoria = 'Urgencias'
                    if codigo.startswith('R'):
                        categoria = 'Síntomas y signos'
                    elif codigo.startswith('S') or codigo.startswith('T'):
                        categoria = 'Traumatismos'
                    elif codigo.startswith('V') or codigo.startswith('W'):
                        categoria = 'Causas externas'
                    elif codigo.startswith('M'):
                        categoria = 'Sistema musculoesquelético'
                    
                    cursor.execute("""
                        INSERT IGNORE INTO diagnosticos (codigo_diagnostico, nombre_diagnostico, categoria_diagnostico)
                        VALUES (%s, %s, %s)
                    """, (codigo, nombre, categoria))
            
            # 4. Actualizar regímenes
            regimenes_nuevos = df_nuevos[['regimen']].drop_duplicates()
            for _, row in regimenes_nuevos.iterrows():
                regimen = row['regimen'].strip()
                
                if len(regimen) > 0:
                    tipo_regimen = 'Público'
                    if regimen in ['CONTRIBUTIVO', 'PARTICULAR']:
                        tipo_regimen = 'Privado'
                    elif regimen in ['VINCULADO', 'OTRO']:
                        tipo_regimen = 'Especial'
                    
                    cursor.execute("""
                        INSERT IGNORE INTO regimenes_salud (nombre_regimen, tipo_regimen, descripcion)
                        VALUES (%s, %s, %s)
                    """, (regimen, tipo_regimen, f'Régimen de salud {regimen}'))
            
            # 5. Actualizar EAPB
            eapb_nuevos = df_nuevos[['eapb']].drop_duplicates()
            for _, row in eapb_nuevos.iterrows():
                eapb = row['eapb'].strip()
                
                if len(eapb) > 0:
                    tipo_entidad = 'EAPB'
                    if 'EPS' in eapb.upper():
                        tipo_entidad = 'EPS'
                    elif 'ARS' in eapb.upper():
                        tipo_entidad = 'ARS'
                    elif 'VINCULADOS' in eapb.upper():
                        tipo_entidad = 'Vinculados'
                    
                    cursor.execute("""
                        INSERT IGNORE INTO eapb (nombre_eapb, tipo_entidad)
                        VALUES (%s, %s)
                    """, (eapb, tipo_entidad))
            
            self.conexion.commit()
            cursor.close()
            logging.info("✅ Tablas maestras actualizadas")
            return True
            
        except Exception as e:
            logging.error(f"❌ Error actualizando tablas maestras: {e}")
            return False
    
    def insertar_atenciones_nuevas(self, df_nuevos):
        """
        Insertar nuevas atenciones en la tabla principal
        """
        try:
            cursor = self.conexion.cursor()
            
            # Crear mapeos de IDs
            cursor.execute("SELECT id_municipio, nombre_municipio FROM municipios")
            municipios_map = {row[1]: row[0] for row in cursor.fetchall()}
            
            cursor.execute("SELECT id_diagnostico, codigo_diagnostico FROM diagnosticos")
            diagnosticos_map = {row[1]: row[0] for row in cursor.fetchall()}
            
            cursor.execute("SELECT id_regimen, nombre_regimen FROM regimenes_salud")
            regimenes_map = {row[1]: row[0] for row in cursor.fetchall()}
            
            cursor.execute("SELECT id_eapb, nombre_eapb FROM eapb")
            eapb_map = {row[1]: row[0] for row in cursor.fetchall()}
            
            # Insertar atenciones nuevas
            insertados = 0
            batch_data = []
            
            for _, row in df_nuevos.iterrows():
                try:
                    municipio_id = municipios_map.get(row['procedencia'])
                    diagnostico_id = diagnosticos_map.get(row['diagnostico'])
                    regimen_id = regimenes_map.get(row['regimen'])
                    eapb_id = eapb_map.get(row['eapb'])
                    
                    if all([municipio_id, diagnostico_id, regimen_id, eapb_id]):
                        batch_data.append((
                            row['periodo'], int(row['a_o']), row['sexo'], int(row['edad']), 
                            row['tipo_edad'], municipio_id, diagnostico_id, 
                            regimen_id, eapb_id, row['fecha_atencion']
                        ))
                        insertados += 1
                        
                        # Insertar hash del registro
                        cursor.execute("""
                            INSERT IGNORE INTO hashes_registros (hash_registro)
                            VALUES (%s)
                        """, (row['hash_registro'],))
                
                except Exception as e:
                    logging.warning(f"⚠️  Error procesando registro: {e}")
                    continue
            
            # Insertar atenciones en lote
            if batch_data:
                insert_query = """
                    INSERT INTO atenciones_urgencias 
                    (periodo, año, sexo, edad, tipo_edad, id_municipio, id_diagnostico, 
                     id_regimen, id_eapb, fecha_atencion)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                """
                cursor.executemany(insert_query, batch_data)
            
            self.conexion.commit()
            cursor.close()
            
            logging.info(f"✅ {insertados} atenciones nuevas insertadas")
            return insertados
            
        except Exception as e:
            logging.error(f"❌ Error insertando atenciones nuevas: {e}")
            return 0
    
    def actualizar_estadisticas(self):
        """
        Actualizar estadísticas de la base de datos
        """
        try:
            cursor = self.conexion.cursor()
            
            # Contar total de atenciones
            cursor.execute("SELECT COUNT(*) FROM atenciones_urgencias")
            total_atenciones = cursor.fetchone()[0]
            
            # Contar atenciones del último día
            cursor.execute("""
                SELECT COUNT(*) FROM atenciones_urgencias 
                WHERE fecha_registro >= DATE_SUB(NOW(), INTERVAL 1 DAY)
            """)
            atenciones_hoy = cursor.fetchone()[0]
            
            # Actualizar registro de última actualización
            cursor.execute("""
                INSERT INTO estadisticas_actualizacion 
                (fecha_actualizacion, total_atenciones, atenciones_nuevas)
                VALUES (NOW(), %s, %s)
                ON DUPLICATE KEY UPDATE
                total_atenciones = VALUES(total_atenciones),
                atenciones_nuevas = VALUES(atenciones_nuevas)
            """, (total_atenciones, atenciones_hoy))
            
            self.conexion.commit()
            cursor.close()
            
            logging.info(f"📊 Estadísticas actualizadas - Total: {total_atenciones}, Nuevas hoy: {atenciones_hoy}")
            
        except Exception as e:
            logging.error(f"❌ Error actualizando estadísticas: {e}")
    
    def crear_tabla_estadisticas(self):
        """
        Crear tabla para estadísticas de actualización
        """
        try:
            cursor = self.conexion.cursor()
            
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS estadisticas_actualizacion (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    total_atenciones INT,
                    atenciones_nuevas INT,
                    UNIQUE KEY unique_fecha (fecha_actualizacion)
                )
            """)
            
            self.conexion.commit()
            cursor.close()
            
        except Exception as e:
            logging.error(f"❌ Error creando tabla estadísticas: {e}")
    
    def ejecutar_actualizacion(self):
        """
        Ejecutar proceso completo de actualización
        """
        try:
            logging.info("🚀 Iniciando actualización automática...")
            
            # Conectar a MySQL
            if not self.conectar_mysql():
                return False
            
            # Crear tabla de estadísticas si no existe
            self.crear_tabla_estadisticas()
            
            # Obtener datos de la API
            datos_api = self.obtener_datos_api()
            if not datos_api:
                logging.error("❌ No se pudieron obtener datos de la API")
                return False
            
            # Limpiar datos
            df_limpio = self.limpiar_datos(datos_api)
            if df_limpio.empty:
                logging.error("❌ No hay datos válidos para procesar")
                return False
            
            # Obtener hashes existentes
            hashes_existentes = self.obtener_hashes_existentes()
            
            # Identificar datos nuevos
            df_nuevos = self.identificar_datos_nuevos(df_limpio, hashes_existentes)
            
            if df_nuevos.empty:
                logging.info("[SUCCESS] No hay datos nuevos para actualizar")
                return True
            
            # Actualizar tablas maestras
            if not self.actualizar_tablas_maestras(df_nuevos):
                return False
            
            # Insertar atenciones nuevas
            insertados = self.insertar_atenciones_nuevas(df_nuevos)
            
            # Actualizar estadísticas
            self.actualizar_estadisticas()
            
            logging.info(f"🎉 Actualización completada - {insertados} registros nuevos insertados")
            return True
            
        except Exception as e:
            logging.error(f"❌ Error en actualización: {e}")
            return False
        finally:
            if self.conexion:
                self.conexion.close()
    
    def iniciar_programador(self):
        """
        Iniciar el programador de tareas
        """
        logging.info("⏰ Iniciando programador de actualizaciones...")
        
        # Programar actualización cada 24 horas
        schedule.every(24).hours.do(self.ejecutar_actualizacion)
        
        # Ejecutar actualización inicial
        logging.info("🔄 Ejecutando actualización inicial...")
        self.ejecutar_actualizacion()
        
        # Mantener el programador ejecutándose
        while True:
            schedule.run_pending()
            time.sleep(60)  # Verificar cada minuto

def main():
    """
    Función principal
    """
    print("="*80)
    print("🔄 ACTUALIZADOR AUTOMÁTICO DE MORBILIDAD URGENCIAS")
    print("="*80)
    print("⏰ Actualización automática cada 24 horas")
    print("🆕 Solo inserta datos nuevos (sin duplicados)")
    print("📊 Mantiene estadísticas de actualización")
    print("="*80)
    
    actualizador = ActualizadorMorbilidad()
    
    try:
        actualizador.iniciar_programador()
    except KeyboardInterrupt:
        logging.info("🛑 Actualizador detenido por el usuario")
    except Exception as e:
        logging.error(f"❌ Error en el actualizador: {e}")

if __name__ == "__main__":
    main()

