const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../build')));

// Configuración de Supabase
const supabaseUrl = process.env.SUPABASE_URL || 'https://jikjuutgacyzlxiczrrh.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imppa2p1dXRnYWN5emx4aWN6cnJoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEzMjM4MjksImV4cCI6MjA3Njg5OTgyOX0.gFsKJ8z23cWS4asH12UCFAL4KCQMwz3tuFI_wyPdqbU';

const supabase = createClient(supabaseUrl, supabaseKey);

// Rutas de la API

// 1. Obtener estadísticas generales
app.get('/api/estadisticas', async (req, res) => {
  try {
    // Obtener conteos usando Supabase
    const [atenciones, departamentos, municipios, diagnosticos] = await Promise.all([
      supabase.from('atenciones_urgencias').select('*'),
      supabase.from('departamentos').select('*'),
      supabase.from('municipios').select('*'),
      supabase.from('diagnosticos').select('*')
    ]);

    // Contar atenciones de hoy
    const today = new Date().toISOString().split('T')[0];
    const atencionesHoy = atenciones.data?.filter(a => 
      a.fecha_atencion && a.fecha_atencion.startsWith(today)
    ).length || 0;

    res.json({
      totalAtenciones: atenciones.data?.length || 0,
      atencionesHoy: atencionesHoy,
      totalDepartamentos: departamentos.data?.length || 0,
      totalMunicipios: municipios.data?.length || 0,
      totalDiagnosticos: diagnosticos.data?.length || 0,
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
    const { data, error } = await supabase
      .from('atenciones_urgencias')
      .select(`
        departamentos!inner(nombre_departamento),
        id_atencion
      `);

    if (error) throw error;

    // Agrupar por departamento
    const departamentos = {};
    data?.forEach(atencion => {
      const depto = atencion.departamentos.nombre_departamento;
      departamentos[depto] = (departamentos[depto] || 0) + 1;
    });

    const result = Object.entries(departamentos)
      .map(([nombre, total]) => ({ nombre_departamento: nombre, total_atenciones: total }))
      .sort((a, b) => b.total_atenciones - a.total_atenciones);

    res.json(result);
  } catch (error) {
    console.error('Error obteniendo estadísticas de departamentos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// 3. Obtener estadísticas demográficas
app.get('/api/estadisticas/demograficas', async (req, res) => {
  try {
    const { data: atenciones, error } = await supabase
      .from('atenciones_urgencias')
      .select('sexo, edad, regimenes_salud!inner(nombre_regimen)');

    if (error) throw error;

    // Procesar datos demográficos
    const porSexo = {};
    const porEdad = {};
    const porRegimen = {};

    atenciones?.forEach(atencion => {
      // Por sexo
      porSexo[atencion.sexo] = (porSexo[atencion.sexo] || 0) + 1;

      // Por edad
      let grupoEdad;
      if (atencion.edad < 18) grupoEdad = 'Menores de 18';
      else if (atencion.edad <= 30) grupoEdad = '18-30 años';
      else if (atencion.edad <= 50) grupoEdad = '31-50 años';
      else if (atencion.edad <= 70) grupoEdad = '51-70 años';
      else grupoEdad = 'Mayores de 70';
      
      porEdad[grupoEdad] = (porEdad[grupoEdad] || 0) + 1;

      // Por régimen
      const regimen = atencion.regimenes_salud.nombre_regimen;
      porRegimen[regimen] = (porRegimen[regimen] || 0) + 1;
    });

    const total = atenciones?.length || 0;

    res.json({
      porSexo: Object.entries(porSexo).map(([sexo, cantidad]) => ({
        sexo,
        cantidad,
        porcentaje: Math.round((cantidad / total) * 100 * 100) / 100
      })),
      porEdad: Object.entries(porEdad).map(([grupo, cantidad]) => ({
        grupo_edad: grupo,
        cantidad
      })),
      porRegimen: Object.entries(porRegimen)
        .map(([regimen, cantidad]) => ({
          nombre_regimen: regimen,
          cantidad,
          porcentaje: Math.round((cantidad / total) * 100 * 100) / 100
        }))
        .sort((a, b) => b.cantidad - a.cantidad)
        .slice(0, 10)
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

    let query = supabase
      .from('atenciones_urgencias')
      .select(`
        id_atencion,
        fecha_atencion,
        sexo,
        edad,
        diagnosticos!inner(nombre_diagnostico),
        municipios!inner(nombre_municipio, departamentos!inner(nombre_departamento)),
        regimenes_salud!inner(nombre_regimen),
        eapb!inner(nombre_eapb)
      `)
      .order('fecha_atencion', { ascending: false })
      .range(offset, offset + limit - 1);

    if (search) {
      // Para búsqueda, necesitaríamos usar una función personalizada
      // Por ahora, obtenemos todos y filtramos en memoria
    }

    const { data: atenciones, error } = await query;

    if (error) throw error;

    // Obtener total para paginación
    const { count } = await supabase
      .from('atenciones_urgencias')
      .select('*', { count: 'exact', head: true });

    res.json({
      atenciones: atenciones || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
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

    const { data: diagnosticos, error } = await supabase
      .from('diagnosticos')
      .select('*')
      .order('id_diagnostico', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    // Obtener total para paginación
    const { count } = await supabase
      .from('diagnosticos')
      .select('*', { count: 'exact', head: true });

    res.json({
      diagnosticos: diagnosticos || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
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
    const { data, error } = await supabase.from('departamentos').select('*').limit(1);
    
    if (error) throw error;
    
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

// Servir la aplicación React
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../build', 'index.html'));
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor API ejecutándose en puerto ${PORT}`);
  console.log(`📊 Base de datos: Supabase PostgreSQL`);
  console.log(`🌐 Frontend disponible en: http://localhost:${PORT}`);
});
