# 🚀 Guía de Despliegue - MedControl

Esta guía te ayudará a desplegar MedControl en Vercel con tu dominio personalizado de Hostinger.

## 📋 Prerrequisitos

- ✅ Cuenta de GitHub con el repositorio `Noa0910/Mecontrol`
- ✅ Cuenta de Vercel
- ✅ Dominio en Hostinger
- ✅ Base de datos MySQL en la nube (PlanetScale, Railway, o Hostinger)

## 🌐 Paso 1: Configurar Vercel

### 1.1 Crear cuenta en Vercel
1. Ve a [vercel.com](https://vercel.com)
2. Haz clic en "Sign Up"
3. Selecciona "Continue with GitHub"
4. Autoriza la conexión

### 1.2 Importar proyecto
1. En el dashboard, haz clic en "New Project"
2. Selecciona "Import Git Repository"
3. Busca `Noa0910/Mecontrol`
4. Haz clic en "Import"

### 1.3 Configurar proyecto
- **Framework Preset:** `Other`
- **Root Directory:** `./`
- **Build Command:** `cd frontend-morbilidad && npm install && npm run build`
- **Output Directory:** `frontend-morbilidad/build`

## 🗄️ Paso 2: Configurar Base de Datos en la Nube

### Opción A: PlanetScale (Recomendado - Gratis)
1. Ve a [planetscale.com](https://planetscale.com)
2. Crea cuenta gratuita
3. Crea nueva base de datos: `medcontrol`
4. Obtén credenciales de conexión
5. Ejecuta el script de migración:
```bash
python migrate_to_cloud.py
```

### Opción B: Railway
1. Ve a [railway.app](https://railway.app)
2. Crea cuenta
3. Crea nuevo proyecto MySQL
4. Obtén credenciales
5. Ejecuta migración

### Opción C: Hostinger MySQL
1. Ve a tu panel de Hostinger
2. Activa MySQL si no está activo
3. Crea base de datos `medcontrol`
4. Obtén credenciales
5. Ejecuta migración

## ⚙️ Paso 3: Configurar Variables de Entorno en Vercel

En Vercel → Settings → Environment Variables, agrega:

```
NODE_ENV = production
DB_HOST = tu-host-de-base-de-datos
DB_USER = tu-usuario-de-base-de-datos
DB_PASSWORD = tu-password-de-base-de-datos
DB_PORT = 3306
DB_NAME = medcontrol
REACT_APP_API_URL = /api
```

## 🌍 Paso 4: Configurar Dominio Personalizado

### 4.1 En Vercel
1. Ve a tu proyecto → Settings → Domains
2. Agrega tu dominio: `medcontrol.com`
3. Vercel te dará registros DNS

### 4.2 En Hostinger
1. Ve a tu panel → DNS Zone
2. Agrega los registros que Vercel te proporcionó:
   - **Tipo A:** `@` → IP de Vercel
   - **Tipo CNAME:** `www` → `cname.vercel-dns.com`

## 🚀 Paso 5: Desplegar

1. En Vercel, haz clic en "Deploy"
2. Espera a que termine el build
3. Tu aplicación estará disponible en la URL temporal
4. Una vez configurado el dominio, estará en `https://medcontrol.com`

## 🔧 Paso 6: Verificar Despliegue

### 6.1 Verificar Frontend
- Visita tu dominio
- Verifica que el dashboard cargue correctamente
- Prueba la navegación entre páginas

### 6.2 Verificar Backend
- Visita `https://tudominio.com/api/estadisticas`
- Debe devolver datos JSON
- Verifica que no haya errores de CORS

### 6.3 Verificar Base de Datos
- Los datos deben cargar correctamente
- Los gráficos deben mostrarse
- Las estadísticas deben ser precisas

## 🛠️ Solución de Problemas

### Error: "Cannot connect to database"
- Verifica las variables de entorno en Vercel
- Asegúrate de que la base de datos esté accesible desde internet
- Revisa las credenciales

### Error: "Build failed"
- Verifica que todas las dependencias estén en package.json
- Revisa los logs de build en Vercel
- Asegúrate de que el comando de build sea correcto

### Error: "CORS policy"
- El backend ya tiene CORS habilitado
- Si persiste, verifica la configuración de Vercel

### Error: "404 Not Found"
- Verifica la configuración de rutas en vercel.json
- Asegúrate de que el frontend esté en la ruta correcta

## 📊 Monitoreo Post-Despliegue

### 6.1 Logs de Vercel
- Ve a tu proyecto → Functions → Logs
- Revisa errores del backend

### 6.2 Analytics
- Vercel proporciona analytics básicos
- Puedes integrar Google Analytics si lo deseas

### 6.3 Base de Datos
- Monitorea el uso de la base de datos
- Configura alertas si es necesario

## 🔄 Actualizaciones Futuras

### Para actualizar el código:
1. Haz cambios en tu repositorio local
2. Haz commit y push a GitHub
3. Vercel desplegará automáticamente

### Para actualizar la base de datos:
1. Ejecuta `migrate_to_cloud.py` nuevamente
2. O usa herramientas de administración de BD

## 📞 Soporte

Si encuentras problemas:

1. **Revisa los logs** en Vercel
2. **Verifica las variables de entorno**
3. **Comprueba la conectividad de la base de datos**
4. **Revisa la configuración DNS**

## 🎯 Checklist Final

- [ ] Proyecto desplegado en Vercel
- [ ] Base de datos migrada a la nube
- [ ] Variables de entorno configuradas
- [ ] Dominio personalizado funcionando
- [ ] Frontend cargando correctamente
- [ ] Backend respondiendo
- [ ] Datos mostrándose en el dashboard
- [ ] Sin errores en la consola

¡Tu sistema MedControl estará listo para producción! 🎉
