# 🏥 Sistema de Morbilidad en Urgencias - Completo

## 📋 Descripción del Sistema

Sistema completo para la gestión y análisis de datos de morbilidad en urgencias, incluyendo:

- **Backend API** (Node.js + Express + MySQL)
- **Frontend React** (TypeScript + Recharts)
- **Base de datos MySQL** (XAMPP)
- **Actualizador automático** (Python)
- **Sistema de monitoreo** (Python)

## 🚀 Características Principales

### 📊 Dashboard Interactivo
- Estadísticas en tiempo real
- Gráficos dinámicos (barras, pastel, líneas)
- Filtros avanzados
- Responsive design

### 🔄 Actualización Automática
- Descarga automática cada 24 horas
- Detección de duplicados por hash MD5
- Actualización de tablas maestras
- Logging completo

### 📈 Análisis Estadístico
- Top departamentos por atenciones
- Distribución demográfica (sexo, edad)
- Análisis por régimen de salud
- Evolución temporal

### 🏥 Gestión de Diagnósticos
- Top diagnósticos más frecuentes
- Categorización automática
- Análisis por edad y sexo
- Filtros por categoría

## 🛠️ Arquitectura del Sistema

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend API   │    │   MySQL DB      │
│   React + TS    │◄──►│   Node.js       │◄──►│   XAMPP         │
│   Port 3000     │    │   Port 5000     │    │   Port 3306     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Actualizador  │    │   Monitor       │    │   Power BI      │
│   Python        │    │   Python        │    │   Integration   │
│   Auto 24h      │    │   Status        │    │   Ready         │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 📁 Estructura del Proyecto

```
Trabajo1/
├── 📁 frontend-morbilidad/          # Frontend React
│   ├── 📁 src/
│   │   ├── 📁 components/           # Componentes React
│   │   ├── 📁 services/             # Servicios API
│   │   └── 📄 config.ts             # Configuración
│   └── 📄 package.json
├── 📁 backend-api/                  # Backend Node.js
│   ├── 📄 server.js                 # Servidor Express
│   └── 📄 package.json
├── 📄 actualizador_automatico.py    # Actualizador automático
├── 📄 monitor_actualizador.py       # Monitor del sistema
├── 📄 poblar_tablas_completo.py     # Poblador de BD
├── 📄 crear_base_datos_mysql.py     # Creador de BD
├── 📄 iniciar_sistema_completo.bat  # Script de inicio
└── 📄 datos_morbilidad_completos.csv # Datos fuente
```

## 🚀 Instalación Rápida

### Opción 1: Instalación Automática (Recomendado)
```bash
# Ejecutar instalador completo
python instalar_sistema_completo.py

# Iniciar sistema
iniciar_sistema_completo.bat
```

### Opción 2: Instalación Manual
```bash
# 1. Instalar dependencias
pip install -r requirements.txt
cd backend-api && npm install
cd ../frontend-morbilidad && npm install

# 2. Crear base de datos
python crear_base_datos_mysql.py
python poblar_tablas_completo.py

# 3. Iniciar servicios
# Terminal 1: Backend
cd backend-api && npm start

# Terminal 2: Frontend
cd frontend-morbilidad && npm start

# Terminal 3: Actualizador
python actualizador_automatico.py
```

## 🌐 URLs del Sistema

| Servicio | URL | Descripción |
|----------|-----|-------------|
| **Frontend** | http://localhost:3000 | Interfaz principal |
| **Backend API** | http://localhost:5000 | API REST |
| **phpMyAdmin** | http://localhost/phpmyadmin | Gestión BD |
| **API Docs** | http://localhost:5000/api/estadisticas | Endpoint ejemplo |

## 📊 Endpoints de la API

### Estadísticas Generales
```http
GET /api/estadisticas
```

### Atenciones con Paginación
```http
GET /api/atenciones?page=1&limit=50&search=texto
```

### Estadísticas por Departamento
```http
GET /api/estadisticas/departamentos
```

### Top Diagnósticos
```http
GET /api/estadisticas/diagnosticos?limit=20
```

### Datos para Power BI
```http
GET /api/powerbi/datos
```

## 🔧 Scripts Disponibles

### Instalación y Configuración
- `instalar_sistema_completo.py` - Instalador automático completo
- `crear_base_datos_mysql.py` - Crea la base de datos y tablas
- `poblar_tablas_completo.py` - Pobla la BD con datos de la API

### Operación del Sistema
- `iniciar_sistema_completo.bat` - Inicia todos los servicios
- `actualizador_automatico.py` - Actualizador automático cada 24h
- `monitor_actualizador.py` - Monitor del estado del sistema
- `verificar_sistema.py` - Verificación completa del sistema

### Base de Datos
- `crear_base_datos.sql` - Script SQL completo
- `crear_tablas_simple.sql` - Script SQL simplificado

## 📈 Características del Frontend

### Dashboard
- ✅ Estadísticas en tiempo real
- ✅ Gráficos interactivos
- ✅ Filtros dinámicos
- ✅ Responsive design

### Tabla de Atenciones
- ✅ Paginación avanzada
- ✅ Búsqueda en tiempo real
- ✅ Filtros por múltiples campos
- ✅ Exportación de datos

### Análisis Estadístico
- ✅ Gráficos por departamento
- ✅ Distribución demográfica
- ✅ Evolución temporal
- ✅ Comparativas

### Gestión de Diagnósticos
- ✅ Top diagnósticos
- ✅ Categorización automática
- ✅ Análisis por edad/sexo
- ✅ Filtros por categoría

## 🔄 Sistema de Actualización

### Automática (Recomendado)
- ⏰ **Frecuencia**: Cada 24 horas
- 🔍 **Detección**: Hash MD5 para duplicados
- 📊 **Estadísticas**: Registro de actualizaciones
- 📝 **Logging**: Archivo de logs detallado

### Manual
```bash
# Actualización inmediata
python actualizador_automatico.py

# Verificar logs
tail -f actualizador_morbilidad.log
```

## 📊 Integración con Power BI

### Conexión Directa
1. Abrir Power BI Desktop
2. Obtener datos → Web
3. URL: `http://localhost:5000/api/powerbi/datos`
4. Configurar actualización automática

### Datos Disponibles
- ✅ Todas las atenciones
- ✅ Información demográfica
- ✅ Datos geográficos
- ✅ Información de diagnósticos
- ✅ Datos de régimen de salud

## 🛡️ Monitoreo y Verificación

### Verificar Estado del Sistema
```bash
python verificar_sistema.py
```

### Logs del Sistema
- `actualizador_morbilidad.log` - Logs del actualizador
- Consola del navegador - Errores del frontend
- Consola del backend - Errores de la API

## 🚨 Solución de Problemas

### Error: "Cannot connect to MySQL"
```bash
# Verificar XAMPP
# Iniciar MySQL desde XAMPP Control Panel
# Verificar puerto 3306
```

### Error: "API not responding"
```bash
# Verificar backend
cd backend-api && npm start
# Verificar puerto 5000
```

### Error: "Frontend not loading"
```bash
# Verificar frontend
cd frontend-morbilidad && npm start
# Verificar puerto 3000
```

### Error: "No data in tables"
```bash
# Poblar base de datos
python poblar_tablas_completo.py
# Verificar datos en phpMyAdmin
```

## 📞 Soporte Técnico

### Archivos de Log
- `actualizador_morbilidad.log` - Logs del actualizador
- Consola del navegador - Errores del frontend
- Consola del backend - Errores de la API

### Verificación Rápida
1. ✅ XAMPP ejecutándose
2. ✅ Backend en puerto 5000
3. ✅ Frontend en puerto 3000
4. ✅ Datos en base de datos
5. ✅ Actualizador funcionando

## 🎯 Próximas Mejoras

- [ ] Autenticación de usuarios
- [ ] Reportes PDF automáticos
- [ ] Alertas por email
- [ ] Dashboard móvil
- [ ] API de notificaciones
- [ ] Integración con más fuentes de datos

---

## 📝 Notas Importantes

1. **XAMPP debe estar ejecutándose** antes de iniciar el sistema
2. **El actualizador automático** se ejecuta en segundo plano
3. **Los datos se actualizan** cada 24 horas automáticamente
4. **Power BI** puede conectarse directamente a la API
5. **El sistema es completamente funcional** sin conexión a internet (excepto para actualizaciones)

¡Sistema listo para producción! 🚀✨