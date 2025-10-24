# 🏥 MedControl - Sistema de Morbilidad en Urgencias

Sistema completo para la gestión y análisis de datos de morbilidad en urgencias médicas, desarrollado con tecnologías modernas.

## 🚀 Demo en Vivo

**🌐 [Ver Demo](https://medcontrol.vercel.app)** - Próximamente disponible

## 📋 Características Principales

### 📊 Dashboard Interactivo
- Estadísticas en tiempo real
- Gráficos dinámicos (barras, pastel, líneas)
- Filtros avanzados
- Diseño responsive

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

## 🛠️ Stack Tecnológico

### Frontend
- **React 18** con TypeScript
- **Recharts** para gráficos
- **Tailwind CSS** para estilos
- **Lucide React** para iconos

### Backend
- **Node.js** con Express
- **MySQL** como base de datos
- **CORS** habilitado
- **API REST** completa

### Herramientas
- **Python** para actualizador automático
- **XAMPP** para desarrollo local
- **Git** para control de versiones
- **Vercel** para despliegue

## 🚀 Instalación Local

### Prerrequisitos
- Node.js (v14+)
- Python (v3.8+)
- XAMPP (MySQL)
- Git

### Pasos de Instalación

1. **Clonar el repositorio**
```bash
git clone https://github.com/Noa0910/Mecontrol.git
cd Mecontrol
```

2. **Instalar dependencias del backend**
```bash
cd backend-api
npm install
```

3. **Instalar dependencias del frontend**
```bash
cd ../frontend-morbilidad
npm install
```

4. **Configurar base de datos**
```bash
# Iniciar XAMPP
# Crear base de datos MySQL
python crear_base_datos_mysql.py
python poblar_tablas_completo.py
```

5. **Iniciar servicios**
```bash
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

## 📊 API Endpoints

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

### Desarrollo
```bash
# Backend
cd backend-api && npm start

# Frontend
cd frontend-morbilidad && npm start

# Actualizador
python actualizador_automatico.py
```

### Base de Datos
```bash
# Crear BD
python crear_base_datos_mysql.py

# Poblar datos
python poblar_tablas_completo.py
```

## 📈 Características del Frontend

- ✅ Dashboard interactivo con estadísticas en tiempo real
- ✅ Gráficos dinámicos y responsivos
- ✅ Tabla de atenciones con paginación avanzada
- ✅ Búsqueda y filtros en tiempo real
- ✅ Análisis estadístico completo
- ✅ Gestión de diagnósticos
- ✅ Diseño responsive para móviles

## 🔄 Sistema de Actualización

- ⏰ **Frecuencia**: Cada 24 horas automáticamente
- 🔍 **Detección**: Hash MD5 para evitar duplicados
- 📊 **Estadísticas**: Registro completo de actualizaciones
- 📝 **Logging**: Archivos de logs detallados

## 📊 Integración con Power BI

El sistema incluye endpoints específicos para integración con Power BI:

1. Abrir Power BI Desktop
2. Obtener datos → Web
3. URL: `http://localhost:5000/api/powerbi/datos`
4. Configurar actualización automática

## 🛡️ Monitoreo y Logs

### Verificar Estado
```bash
python monitor_actualizador.py
```

### Logs Disponibles
- `actualizador_morbilidad.log` - Logs del actualizador
- Consola del navegador - Errores del frontend
- Consola del backend - Errores de la API

## 🚨 Solución de Problemas

### Error: "Cannot connect to MySQL"
- Verificar que XAMPP esté ejecutándose
- Iniciar MySQL desde XAMPP Control Panel
- Verificar puerto 3306

### Error: "API not responding"
- Verificar que el backend esté ejecutándose
- Verificar puerto 5000
- Revisar logs de la consola

### Error: "Frontend not loading"
- Verificar que el frontend esté ejecutándose
- Verificar puerto 3000
- Revisar consola del navegador

## 🎯 Próximas Mejoras

- [ ] Autenticación de usuarios
- [ ] Reportes PDF automáticos
- [ ] Alertas por email
- [ ] Dashboard móvil
- [ ] API de notificaciones
- [ ] Integración con más fuentes de datos

## 📞 Soporte

Para soporte técnico o preguntas sobre el sistema, puedes:

1. Revisar los logs del sistema
2. Verificar la documentación
3. Crear un issue en GitHub

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 👥 Contribuidores

- **Nikolas** - Desarrollador principal

---

**MedControl** - Sistema de Morbilidad en Urgencias 🏥✨
