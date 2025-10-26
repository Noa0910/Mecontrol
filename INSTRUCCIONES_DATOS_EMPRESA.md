# 📋 Instrucciones para Configurar Datos de Empresa

## 🎯 Objetivo
Crear una funcionalidad de comparación entre datos globales (32K registros) y datos de empresa (3K registros de ejemplo).

## 📝 Pasos a Seguir

### 1. 🗄️ Configurar Tablas en Supabase

**Ejecutar el script SQL en Supabase:**

1. Ve a tu proyecto de Supabase: https://supabase.com/dashboard/project/jikjuutgacyzlxiczrrh
2. Ve a la sección **SQL Editor**
3. Copia y pega el contenido del archivo `crear_tablas_empresa_supabase.sql`
4. Ejecuta el script

**Este script:**
- Agrega el campo `tipo_datos` a todas las tablas existentes
- Crea índices para mejorar el rendimiento
- Configura políticas RLS para acceso a datos de empresa
- Marca los datos existentes como 'global'

### 2. 🏢 Generar Datos de Empresa

**Ejecutar el script Python:**

```bash
# Instalar dependencias si no están instaladas
pip install supabase

# Ejecutar el script
python generar_datos_empresa_supabase.py
```

**Este script:**
- Genera 3,000 registros de ejemplo para empresa
- Usa datos similares a los globales pero con variaciones
- Marca todos los registros con `tipo_datos = 'empresa'`
- Sesga los datos hacia población laboral (18-65 años)

### 3. 🎨 Funcionalidades Implementadas

**En la interfaz de Consultas Avanzadas:**

✅ **Pestañas de navegación:**
- **Datos Globales**: ~32K registros (datos originales)
- **Datos de Empresa**: ~3K registros (datos de ejemplo)

✅ **Filtros dinámicos:**
- Los filtros se aplican según la pestaña seleccionada
- El título del panel muestra el tipo de datos actual

✅ **Dashboard comparativo:**
- Estadísticas específicas por tipo de datos
- Gráficos diferenciados
- Exportación separada por tipo

### 4. 🔍 Verificación

**Para verificar que todo funciona:**

1. **Ejecuta la aplicación:**
   ```bash
   npm start
   ```

2. **Ve a "Consultas Avanzadas"**

3. **Prueba las pestañas:**
   - Haz clic en "Datos Globales" y ejecuta una consulta
   - Haz clic en "Datos de Empresa" y ejecuta una consulta
   - Compara los resultados

4. **Verifica en Supabase:**
   ```sql
   -- Contar registros por tipo
   SELECT tipo_datos, COUNT(*) as total
   FROM atenciones_urgencias 
   GROUP BY tipo_datos;
   ```

### 5. 📊 Características de los Datos de Empresa

**Diferencias con los datos globales:**
- **Población objetivo**: Sesgada hacia población laboral (18-65 años)
- **Departamentos**: Solo los 10 principales
- **EPS**: Solo las 10 principales
- **Período**: Últimos 2 años
- **Distribución**: Más concentrada geográficamente

### 6. 🚀 Próximos Pasos

**Para mejorar la funcionalidad:**

1. **Agregar comparativas lado a lado**
2. **Crear métricas de comparación**
3. **Implementar análisis de diferencias**
4. **Agregar filtros de fecha más específicos**

## ⚠️ Notas Importantes

- Los datos de empresa son **ejemplo/simulados**
- No afectan los datos globales existentes
- Se pueden regenerar ejecutando el script nuevamente
- El campo `tipo_datos` permite filtrar fácilmente

## 🆘 Solución de Problemas

**Si hay errores:**

1. **Verificar conexión a Supabase**
2. **Ejecutar primero el script SQL**
3. **Verificar que las tablas tengan el campo `tipo_datos`**
4. **Revisar los logs del script Python**

---

¡Listo! Ahora tienes un sistema completo de comparación entre datos globales y de empresa. 🎉

