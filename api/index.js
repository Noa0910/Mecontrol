const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Configuración de la base de datos PostgreSQL con Session Pooler
const dbConfig = {
  host: process.env.DB_HOST || 'aws-0-us-west-1.pooler.supabase.com',
  user: process.env.DB_USER || 'postgres.jikjuutgacyzlxiczrrh',
  password: process.env.DB_PASSWORD || 'JX71EllZRtUC8oiJ',
  port: process.env.DB_PORT || 6543,
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
      totalDiagnosticos
    ] = await Promise.all([
      query('SELECT COUNT(*) as total FROM atenciones_urgencias'),
      query('SELECT COUNT(*) as total FROM atenciones_urgencias WHERE DATE(fecha_atencion) = CURRENT_DATE'),
      query('SELECT COUNT(*) as total FROM departamentos'),
      query('SELECT COUNT(*) as total FROM municipios'),
      query('SELECT COUNT(*) as total FROM diagnosticos')
    ]);

    res.json({
      totalAtenciones: parseInt(totalAtenciones[0]?.total || 0),
      atencionesHoy: parseInt(atencionesHoy[0]?.total || 0),
      totalDepartamentos: parseInt(totalDepartamentos[0]?.total || 0),
      totalMunicipios: parseInt(totalMunicipios[0]?.total || 0),
      totalDiagnosticos: parseInt(totalDiagnosticos[0]?.total || 0),
      ultimaActualizacion: null
    });
  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// 2. Obtener estadísticas por departamentos
app.get('/api/estadisticas/departamentos', async (req, res) => {
  try {
    const departamentos = await query(`
      SELECT 
        d.nombre_departamento,
        COUNT(a.id_atencion) as total_atenciones
      FROM departamentos d
      LEFT JOIN municipios m ON d.id_departamento = m.id_departamento
      LEFT JOIN atenciones_urgencias a ON m.id_municipio = a.id_municipio
      GROUP BY d.id_departamento, d.nombre_departamento
      ORDER BY total_atenciones DESC
    `);

    res.json(departamentos);
  } catch (error) {
    console.error('Error obteniendo estadísticas de departamentos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// 3. Obtener estadísticas demográficas
app.get('/api/estadisticas/demograficas', async (req, res) => {
  try {
    const [porSexo, porEdad, porRegimen] = await Promise.all([
      query(`
        SELECT 
          sexo,
          COUNT(*) as cantidad,
          ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM atenciones_urgencias), 2) as porcentaje
        FROM atenciones_urgencias 
        GROUP BY sexo
      `),
      query(`
        SELECT 
          CASE 
            WHEN edad < 18 THEN 'Menores de 18'
            WHEN edad BETWEEN 18 AND 30 THEN '18-30 años'
            WHEN edad BETWEEN 31 AND 50 THEN '31-50 años'
            WHEN edad BETWEEN 51 AND 70 THEN '51-70 años'
            ELSE 'Mayores de 70'
          END as grupo_edad,
          COUNT(*) as cantidad
        FROM atenciones_urgencias 
        GROUP BY grupo_edad
        ORDER BY cantidad DESC
      `),
      query(`
        SELECT 
          r.nombre_regimen,
          COUNT(*) as cantidad,
          ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM atenciones_urgencias), 2) as porcentaje
        FROM atenciones_urgencias a
        JOIN regimenes_salud r ON a.id_regimen = r.id_regimen
        GROUP BY r.id_regimen, r.nombre_regimen
        ORDER BY cantidad DESC
        LIMIT 10
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

// 4. Obtener atenciones con paginación
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
        WHERE d.nombre_diagnostico ILIKE $1 
        OR m.nombre_municipio ILIKE $1 
        OR dep.nombre_departamento ILIKE $1
      `;
      params = [`%${search}%`];
    }

    const atenciones = await query(`
      SELECT 
        a.id_atencion,
        a.fecha_atencion,
        a.sexo,
        a.edad,
        d.nombre_diagnostico,
        m.nombre_municipio,
        dep.nombre_departamento,
        r.nombre_regimen,
        e.nombre_eapb
      FROM atenciones_urgencias a
      JOIN diagnosticos d ON a.id_diagnostico = d.id_diagnostico
      JOIN municipios m ON a.id_municipio = m.id_municipio
      JOIN departamentos dep ON m.id_departamento = dep.id_departamento
      JOIN regimenes_salud r ON a.id_regimen = r.id_regimen
      JOIN eapb e ON a.id_eapb = e.id_eapb
      ${whereClause}
      ORDER BY a.fecha_atencion DESC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `, [...params, limit, offset]);

    const total = await query(`
      SELECT COUNT(*) as total
      FROM atenciones_urgencias a
      JOIN diagnosticos d ON a.id_diagnostico = d.id_diagnostico
      JOIN municipios m ON a.id_municipio = m.id_municipio
      JOIN departamentos dep ON m.id_departamento = dep.id_departamento
      ${whereClause}
    `, params);

    res.json({
      atenciones,
      pagination: {
        page,
        limit,
        total: parseInt(total[0]?.total || 0),
        totalPages: Math.ceil(parseInt(total[0]?.total || 0) / limit)
      }
    });
  } catch (error) {
    console.error('Error obteniendo atenciones:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// 5. Obtener diagnósticos
app.get('/api/diagnosticos', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;
    const search = req.query.search || '';

    let whereClause = '';
    let params = [];
    
    if (search) {
      whereClause = 'WHERE nombre_diagnostico ILIKE $1';
      params = [`%${search}%`];
    }

    const diagnosticos = await query(`
      SELECT 
        d.*,
        COUNT(a.id_atencion) as total_atenciones
      FROM diagnosticos d
      LEFT JOIN atenciones_urgencias a ON d.id_diagnostico = a.id_diagnostico
      ${whereClause}
      GROUP BY d.id_diagnostico
      ORDER BY total_atenciones DESC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `, [...params, limit, offset]);

    const total = await query(`
      SELECT COUNT(*) as total FROM diagnosticos ${whereClause}
    `, params);

    res.json({
      diagnosticos,
      pagination: {
        page,
        limit,
        total: parseInt(total[0]?.total || 0),
        totalPages: Math.ceil(parseInt(total[0]?.total || 0) / limit)
      }
    });
  } catch (error) {
    console.error('Error obteniendo diagnósticos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Health check
app.get('/api/health', async (req, res) => {
  try {
    await query('SELECT 1');
    res.json({ 
      status: 'OK', 
      database: 'Supabase PostgreSQL',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'ERROR', 
      database: 'Supabase PostgreSQL',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = app;
