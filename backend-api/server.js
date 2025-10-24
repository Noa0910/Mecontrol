const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../build')));

// Configuración de la base de datos PostgreSQL
const dbConfig = {
  host: process.env.DB_HOST || 'db.jikjuutgacyzlxiczrrh.supabase.co',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'JX71EllZRtUC8oiJ',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'postgres',
  ssl: { rejectUnauthorized: false }
};

// Pool de conexiones PostgreSQL
const pool = new Pool(dbConfig);

// Función para ejecutar consultas PostgreSQL
const query = async (sql, params = []) => {
  try {
    const result = await pool.query(sql, params);
    return result.rows;
  } catch (err) {
    console.error('Error en consulta SQL:', err);
    throw err;
  }
};

// Rutas de la API

// 1. Obtener estadísticas generales
app.get('/api/estadisticas', async (req, res) => {
  try {
    const [
      totalAtenciones,
      atencionesHoy,
      totalDepartamentos,
      totalMunicipios,
      totalDiagnosticos,
      ultimaActualizacion
    ] = await Promise.all([
      query('SELECT COUNT(*) as total FROM atenciones_urgencias'),
      query(`
        SELECT COUNT(*) as total 
        FROM atenciones_urgencias 
        WHERE DATE(fecha_registro) = CURDATE()
      `),
      query('SELECT COUNT(*) as total FROM departamentos'),
      query('SELECT COUNT(*) as total FROM municipios'),
      query('SELECT COUNT(*) as total FROM diagnosticos'),
      query(`
        SELECT fecha_actualizacion, total_atenciones, atenciones_nuevas
        FROM estadisticas_actualizacion
        ORDER BY fecha_actualizacion DESC
        LIMIT 1
      `)
    ]);

    res.json({
      totalAtenciones: totalAtenciones[0].total,
      atencionesHoy: atencionesHoy[0].total,
      totalDepartamentos: totalDepartamentos[0].total,
      totalMunicipios: totalMunicipios[0].total,
      totalDiagnosticos: totalDiagnosticos[0].total,
      ultimaActualizacion: ultimaActualizacion[0] || null
    });
  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// 2. Obtener atenciones con paginación
app.get('/api/atenciones', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;
    const search = req.query.search || '';

    let whereClause = '';
    let params = [];

    if (search) {
      whereClause = `
        WHERE d.nombre_departamento LIKE ? 
        OR m.nombre_municipio LIKE ? 
        OR diag.nombre_diagnostico LIKE ?
        OR a.sexo LIKE ?
      `;
      params = [`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`];
    }

    const sql = `
      SELECT 
        a.id_atencion,
        a.periodo,
        a.año,
        a.sexo,
        a.edad,
        a.tipo_edad,
        d.nombre_departamento,
        m.nombre_municipio,
        diag.codigo_diagnostico,
        diag.nombre_diagnostico,
        diag.categoria_diagnostico,
        r.nombre_regimen,
        r.tipo_regimen,
        e.nombre_eapb,
        e.tipo_entidad,
        a.fecha_atencion,
        a.fecha_registro
      FROM atenciones_urgencias a
      LEFT JOIN municipios m ON a.id_municipio = m.id_municipio
      LEFT JOIN departamentos d ON m.id_departamento = d.id_departamento
      LEFT JOIN diagnosticos diag ON a.id_diagnostico = diag.id_diagnostico
      LEFT JOIN regimenes_salud r ON a.id_regimen = r.id_regimen
      LEFT JOIN eapb e ON a.id_eapb = e.id_eapb
      ${whereClause}
      ORDER BY a.fecha_atencion DESC
      LIMIT ? OFFSET ?
    `;

    const countSql = `
      SELECT COUNT(*) as total
      FROM atenciones_urgencias a
      LEFT JOIN municipios m ON a.id_municipio = m.id_municipio
      LEFT JOIN departamentos d ON m.id_departamento = d.id_departamento
      LEFT JOIN diagnosticos diag ON a.id_diagnostico = diag.id_diagnostico
      ${whereClause}
    `;

    const [atenciones, countResult] = await Promise.all([
      query(sql, [...params, limit, offset]),
      query(countSql, params)
    ]);

    const total = countResult[0].total;
    const totalPages = Math.ceil(total / limit);

    res.json({
      atenciones,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Error obteniendo atenciones:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// 3. Obtener estadísticas por departamento
app.get('/api/estadisticas/departamentos', async (req, res) => {
  try {
    const sql = `
      SELECT 
        d.nombre_departamento,
        COUNT(a.id_atencion) as total_atenciones,
        COUNT(DISTINCT m.id_municipio) as total_municipios,
        AVG(a.edad) as edad_promedio,
        SUM(CASE WHEN a.sexo = 'M' THEN 1 ELSE 0 END) as atenciones_masculino,
        SUM(CASE WHEN a.sexo = 'F' THEN 1 ELSE 0 END) as atenciones_femenino
      FROM departamentos d
      LEFT JOIN municipios m ON d.id_departamento = m.id_departamento
      LEFT JOIN atenciones_urgencias a ON m.id_municipio = a.id_municipio
      GROUP BY d.id_departamento, d.nombre_departamento
      ORDER BY total_atenciones DESC
    `;

    const departamentos = await query(sql);
    res.json(departamentos);
  } catch (error) {
    console.error('Error obteniendo estadísticas por departamento:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// 4. Obtener estadísticas por sexo y edad
app.get('/api/estadisticas/demograficas', async (req, res) => {
  try {
    const [porSexo, porEdad, porRegimen] = await Promise.all([
      query(`
        SELECT 
          sexo,
          COUNT(*) as cantidad,
          ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM atenciones_urgencias), 1) as porcentaje
        FROM atenciones_urgencias
        GROUP BY sexo
        ORDER BY cantidad DESC
      `),
      query(`
        SELECT 
          CASE 
            WHEN edad < 18 THEN 'Menores de 18'
            WHEN edad BETWEEN 18 AND 65 THEN '18-65 años'
            ELSE 'Mayores de 65'
          END as grupo_edad,
          COUNT(*) as cantidad,
          ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM atenciones_urgencias), 1) as porcentaje
        FROM atenciones_urgencias
        GROUP BY grupo_edad
        ORDER BY cantidad DESC
      `),
      query(`
        SELECT 
          r.nombre_regimen,
          r.tipo_regimen,
          COUNT(*) as cantidad,
          ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM atenciones_urgencias), 1) as porcentaje
        FROM atenciones_urgencias a
        LEFT JOIN regimenes_salud r ON a.id_regimen = r.id_regimen
        GROUP BY r.id_regimen, r.nombre_regimen, r.tipo_regimen
        ORDER BY cantidad DESC
      `)
    ]);

    res.json({
      porSexo,
      porEdad,
      porRegimen
    });
  } catch (error) {
    console.error('Error obteniendo estadísticas demográficas:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// 5. Obtener top diagnósticos
app.get('/api/estadisticas/diagnosticos', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    
    const sql = `
      SELECT 
        d.codigo_diagnostico,
        d.nombre_diagnostico,
        d.categoria_diagnostico,
        COUNT(*) as total_atenciones,
        ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM atenciones_urgencias), 2) as porcentaje,
        AVG(a.edad) as edad_promedio,
        SUM(CASE WHEN a.sexo = 'M' THEN 1 ELSE 0 END) as atenciones_masculino,
        SUM(CASE WHEN a.sexo = 'F' THEN 1 ELSE 0 END) as atenciones_femenino
      FROM diagnosticos d
      LEFT JOIN atenciones_urgencias a ON d.id_diagnostico = a.id_diagnostico
      GROUP BY d.id_diagnostico, d.codigo_diagnostico, d.nombre_diagnostico, d.categoria_diagnostico
      ORDER BY total_atenciones DESC
      LIMIT ?
    `;

    const diagnosticos = await query(sql, [limit]);
    res.json(diagnosticos);
  } catch (error) {
    console.error('Error obteniendo top diagnósticos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// 6. Obtener evolución temporal
app.get('/api/estadisticas/evolucion', async (req, res) => {
  try {
    const sql = `
      SELECT 
        DATE(fecha_atencion) as fecha,
        COUNT(*) as total_atenciones,
        AVG(edad) as edad_promedio
      FROM atenciones_urgencias
      WHERE fecha_atencion >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
      GROUP BY DATE(fecha_atencion)
      ORDER BY fecha DESC
    `;

    const evolucion = await query(sql);
    res.json(evolucion);
  } catch (error) {
    console.error('Error obteniendo evolución temporal:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// 7. Obtener datos para Power BI
app.get('/api/powerbi/datos', async (req, res) => {
  try {
    const sql = `
      SELECT 
        a.*,
        d.nombre_departamento,
        m.nombre_municipio,
        diag.codigo_diagnostico,
        diag.nombre_diagnostico,
        diag.categoria_diagnostico,
        r.nombre_regimen,
        r.tipo_regimen,
        e.nombre_eapb,
        e.tipo_entidad
      FROM atenciones_urgencias a
      LEFT JOIN municipios m ON a.id_municipio = m.id_municipio
      LEFT JOIN departamentos d ON m.id_departamento = d.id_departamento
      LEFT JOIN diagnosticos diag ON a.id_diagnostico = diag.id_diagnostico
      LEFT JOIN regimenes_salud r ON a.id_regimen = r.id_regimen
      LEFT JOIN eapb e ON a.id_eapb = e.id_eapb
      ORDER BY a.fecha_atencion DESC
    `;

    const datos = await query(sql);
    res.json(datos);
  } catch (error) {
    console.error('Error obteniendo datos para Power BI:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Servir la aplicación React
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../build', 'index.html'));
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor API ejecutándose en puerto ${PORT}`);
  console.log(`📊 Base de datos: ${dbConfig.database}@${dbConfig.host}:${dbConfig.port}`);
  console.log(`🌐 Frontend disponible en: http://localhost:${PORT}`);
});




