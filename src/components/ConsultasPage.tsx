import React, { useState, useEffect, useCallback } from 'react';
import { Search, Download, Filter, Calendar, MapPin, Users, Stethoscope, BarChart3, PieChart, TrendingUp, Activity } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell } from 'recharts';
import { api, Atencion } from '../services/supabaseApi';

interface FiltrosConsulta {
  departamento: string;
  sexo: string;
  edadMin: number;
  edadMax: number;
  eps: string;
  fechaInicio: string;
  fechaFin: string;
}

interface ResultadoConsulta {
  totalAtenciones: number;
  atenciones: Atencion[];
  resumen: {
    porSexo: Array<{ sexo: string; cantidad: number; porcentaje: number }>;
    porEdad: Array<{ grupo: string; cantidad: number }>;
    porDepartamento: Array<{ departamento: string; cantidad: number; porcentaje: number }>;
    porEps: Array<{ eps: string; cantidad: number; porcentaje: number }>;
  };
}

const COLORS = ['#667eea', '#4ade80', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#14b8a6'];

const ConsultasPage: React.FC = () => {
  const [filtros, setFiltros] = useState<FiltrosConsulta>({
    departamento: '',
    sexo: '',
    edadMin: 0,
    edadMax: 100,
    eps: '',
    fechaInicio: '',
    fechaFin: ''
  });

  const [resultados, setResultados] = useState<ResultadoConsulta | null>(null);
  const [cargando, setCargando] = useState(false);
  const [opciones, setOpciones] = useState({
    departamentos: [] as string[],
    eps: [] as string[]
  });

  // Cargar opciones para los filtros
  const cargarOpciones = useCallback(async () => {
    try {
      const [departamentos, atenciones] = await Promise.all([
        api.getEstadisticasDepartamentos(),
        api.getAtenciones(1, 1000) // Obtener muestra para extraer EPS
      ]);

      const departamentosUnicos = Array.from(new Set(departamentos.map(d => d.nombre_departamento)));
      const epsUnicas = Array.from(new Set(atenciones.atenciones.map(a => a.nombre_eapb)));

      setOpciones({
        departamentos: departamentosUnicos,
        eps: epsUnicas
      });
    } catch (error) {
      console.error('Error cargando opciones:', error);
    }
  }, []);

  useEffect(() => {
    cargarOpciones();
  }, [cargarOpciones]);

  // Ejecutar consulta
  const ejecutarConsulta = async () => {
    setCargando(true);
    try {
      // Obtener todas las atenciones
      const { atenciones } = await api.getAtenciones(1, 50000);
      
      // Aplicar filtros
      let atencionesFiltradas = atenciones;

      if (filtros.departamento) {
        atencionesFiltradas = atencionesFiltradas.filter(a => 
          a.nombre_departamento === filtros.departamento
        );
      }

      if (filtros.sexo) {
        atencionesFiltradas = atencionesFiltradas.filter(a => 
          a.sexo === filtros.sexo
        );
      }

      if (filtros.edadMin > 0 || filtros.edadMax < 100) {
        atencionesFiltradas = atencionesFiltradas.filter(a => 
          a.edad >= filtros.edadMin && a.edad <= filtros.edadMax
        );
      }

      if (filtros.eps) {
        atencionesFiltradas = atencionesFiltradas.filter(a => 
          a.nombre_eapb === filtros.eps
        );
      }

      if (filtros.fechaInicio) {
        atencionesFiltradas = atencionesFiltradas.filter(a => 
          new Date(a.fecha_atencion) >= new Date(filtros.fechaInicio)
        );
      }

      if (filtros.fechaFin) {
        atencionesFiltradas = atencionesFiltradas.filter(a => 
          new Date(a.fecha_atencion) <= new Date(filtros.fechaFin)
        );
      }

      // Generar resumen
      const total = atencionesFiltradas.length;
      
      // Por sexo
      const porSexo = atencionesFiltradas.reduce((acc: any, atencion) => {
        const sexo = atencion.sexo === 'M' ? 'Masculino' : 'Femenino';
        acc[sexo] = (acc[sexo] || 0) + 1;
        return acc;
      }, {});

      const porSexoArray = Object.entries(porSexo).map(([sexo, cantidad]) => ({
        sexo,
        cantidad: cantidad as number,
        porcentaje: Math.round(((cantidad as number) / total) * 100 * 100) / 100
      }));

      // Por edad
      const porEdad = atencionesFiltradas.reduce((acc: any, atencion) => {
        let grupo;
        if (atencion.edad < 18) grupo = 'Menores de 18';
        else if (atencion.edad <= 30) grupo = '18-30 años';
        else if (atencion.edad <= 50) grupo = '31-50 años';
        else if (atencion.edad <= 70) grupo = '51-70 años';
        else grupo = 'Mayores de 70';
        
        acc[grupo] = (acc[grupo] || 0) + 1;
        return acc;
      }, {});

      const porEdadArray = Object.entries(porEdad).map(([grupo, cantidad]) => ({
        grupo,
        cantidad: cantidad as number
      }));

      // Por departamento
      const porDepartamento = atencionesFiltradas.reduce((acc: any, atencion) => {
        const depto = atencion.nombre_departamento;
        acc[depto] = (acc[depto] || 0) + 1;
        return acc;
      }, {});

      const porDepartamentoArray = Object.entries(porDepartamento)
        .map(([departamento, cantidad]) => ({
          departamento,
          cantidad: cantidad as number,
          porcentaje: Math.round(((cantidad as number) / total) * 100 * 100) / 100
        }))
        .sort((a, b) => b.cantidad - a.cantidad);

      // Por EPS
      const porEps = atencionesFiltradas.reduce((acc: any, atencion) => {
        const eps = atencion.nombre_eapb;
        acc[eps] = (acc[eps] || 0) + 1;
        return acc;
      }, {});

      const porEpsArray = Object.entries(porEps)
        .map(([eps, cantidad]) => ({
          eps,
          cantidad: cantidad as number,
          porcentaje: Math.round(((cantidad as number) / total) * 100 * 100) / 100
        }))
        .sort((a, b) => b.cantidad - a.cantidad);

      setResultados({
        totalAtenciones: total,
        atenciones: atencionesFiltradas,
        resumen: {
          porSexo: porSexoArray,
          porEdad: porEdadArray,
          porDepartamento: porDepartamentoArray,
          porEps: porEpsArray
        }
      });

    } catch (error) {
      console.error('Error ejecutando consulta:', error);
    } finally {
      setCargando(false);
    }
  };

  // Exportar a CSV
  const exportarCSV = () => {
    if (!resultados) return;

    const headers = [
      'ID Atención',
      'Fecha',
      'Sexo',
      'Edad',
      'Diagnóstico',
      'Municipio',
      'Departamento',
      'Régimen',
      'EPS'
    ];

    const csvContent = [
      headers.join(','),
      ...resultados.atenciones.map(a => [
        a.id_atencion,
        a.fecha_atencion,
        a.sexo,
        a.edad,
        `"${a.nombre_diagnostico}"`,
        `"${a.nombre_municipio}"`,
        `"${a.nombre_departamento}"`,
        `"${a.nombre_regimen}"`,
        `"${a.nombre_eapb}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `consulta_morbilidad_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="dashboard">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Consultas Avanzadas</h1>
        <p className="text-gray-600">Filtra y analiza los datos de morbilidad según tus criterios específicos</p>
      </div>

      {/* Panel de Filtros */}
      <div className="card mb-6">
        <div className="card-header">
          <h3 className="card-title flex items-center">
            <Filter className="w-6 h-6 mr-3 text-blue-600" />
            Filtros de Consulta
          </h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          {/* Departamento */}
          <div className="form-group">
            <label className="form-label flex items-center">
              <MapPin className="w-5 h-5 mr-2 text-blue-600" />
              Departamento
            </label>
            <select
              value={filtros.departamento}
              onChange={(e) => setFiltros({...filtros, departamento: e.target.value})}
              className="form-input"
            >
              <option value="">Todos los departamentos</option>
              {opciones.departamentos.map(depto => (
                <option key={depto} value={depto}>{depto}</option>
              ))}
            </select>
          </div>

          {/* Sexo */}
          <div className="form-group">
            <label className="form-label flex items-center">
              <Users className="w-5 h-5 mr-2 text-pink-600" />
              Sexo
            </label>
            <select
              value={filtros.sexo}
              onChange={(e) => setFiltros({...filtros, sexo: e.target.value})}
              className="form-input"
            >
              <option value="">Todos</option>
              <option value="M">Masculino</option>
              <option value="F">Femenino</option>
            </select>
          </div>

          {/* Rango de Edad */}
          <div className="form-group">
            <label className="form-label flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-green-600" />
              Rango de Edad
            </label>
            <div className="flex space-x-2">
              <input
                type="number"
                placeholder="Mín"
                value={filtros.edadMin || ''}
                onChange={(e) => setFiltros({...filtros, edadMin: parseInt(e.target.value) || 0})}
                className="form-input"
              />
              <span className="flex items-center text-gray-500">-</span>
              <input
                type="number"
                placeholder="Máx"
                value={filtros.edadMax || ''}
                onChange={(e) => setFiltros({...filtros, edadMax: parseInt(e.target.value) || 100})}
                className="form-input"
              />
            </div>
          </div>

          {/* EPS */}
          <div className="form-group">
            <label className="form-label flex items-center">
              <Stethoscope className="w-5 h-5 mr-2 text-purple-600" />
              EPS
            </label>
            <select
              value={filtros.eps}
              onChange={(e) => setFiltros({...filtros, eps: e.target.value})}
              className="form-input"
            >
              <option value="">Todas las EPS</option>
              {opciones.eps.map(eps => (
                <option key={eps} value={eps}>{eps}</option>
              ))}
            </select>
          </div>

          {/* Fecha Inicio */}
          <div className="form-group">
            <label className="form-label flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-orange-600" />
              Fecha Inicio
            </label>
            <input
              type="date"
              value={filtros.fechaInicio}
              onChange={(e) => setFiltros({...filtros, fechaInicio: e.target.value})}
              className="form-input"
            />
          </div>

          {/* Fecha Fin */}
          <div className="form-group">
            <label className="form-label flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-red-600" />
              Fecha Fin
            </label>
            <input
              type="date"
              value={filtros.fechaFin}
              onChange={(e) => setFiltros({...filtros, fechaFin: e.target.value})}
              className="form-input"
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4">
          <button
            onClick={() => setFiltros({
              departamento: '',
              sexo: '',
              edadMin: 0,
              edadMax: 100,
              eps: '',
              fechaInicio: '',
              fechaFin: ''
            })}
            className="btn btn-secondary"
          >
            <Filter className="w-4 h-4" />
            Limpiar Filtros
          </button>
          <button
            onClick={ejecutarConsulta}
            disabled={cargando}
            className="btn btn-primary"
          >
            <Search className="w-4 h-4" />
            {cargando ? 'Consultando...' : 'Ejecutar Consulta'}
          </button>
        </div>
      </div>

      {/* Resultados */}
      {resultados && (
        <div className="space-y-6">
          {/* Estadísticas principales */}
          <div className="stats-grid">
            <div className="stat-card primary">
              <div className="stat-header">
                <span className="stat-title">Total Atenciones</span>
                <Users className="stat-icon" />
              </div>
              <div className="stat-value">{resultados.totalAtenciones.toLocaleString()}</div>
              <div className="stat-change positive">
                <Activity className="w-4 h-4" />
                <span>Resultados filtrados</span>
              </div>
            </div>

            <div className="stat-card success">
              <div className="stat-header">
                <span className="stat-title">Femenino</span>
                <Users className="stat-icon" />
              </div>
              <div className="stat-value">
                {resultados.resumen.porSexo.find(s => s.sexo === 'Femenino')?.cantidad || 0}
              </div>
              <div className="stat-change">
                <span>
                  {resultados.resumen.porSexo.find(s => s.sexo === 'Femenino')?.porcentaje || 0}%
                </span>
              </div>
            </div>

            <div className="stat-card warning">
              <div className="stat-header">
                <span className="stat-title">Masculino</span>
                <Users className="stat-icon" />
              </div>
              <div className="stat-value">
                {resultados.resumen.porSexo.find(s => s.sexo === 'Masculino')?.cantidad || 0}
              </div>
              <div className="stat-change">
                <span>
                  {resultados.resumen.porSexo.find(s => s.sexo === 'Masculino')?.porcentaje || 0}%
                </span>
              </div>
            </div>

            <div className="stat-card danger">
              <div className="stat-header">
                <span className="stat-title">Departamentos</span>
                <MapPin className="stat-icon" />
              </div>
              <div className="stat-value">{resultados.resumen.porDepartamento.length}</div>
              <div className="stat-change">
                <span>Con datos</span>
              </div>
            </div>
          </div>

          {/* Gráficos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Distribución por Sexo */}
            <div className="chart-container">
              <h3 className="chart-title flex items-center">
                <PieChart className="w-6 h-6 mr-3 text-pink-600" />
                Distribución por Sexo
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <RechartsPieChart>
                  <Pie
                    data={resultados.resumen.porSexo}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ sexo, porcentaje }) => `${sexo}: ${porcentaje}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="cantidad"
                  >
                    {resultados.resumen.porSexo.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => [value?.toLocaleString() || '0', 'Casos']} />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>

            {/* Distribución por Edad */}
            <div className="chart-container">
              <h3 className="chart-title flex items-center">
                <BarChart3 className="w-6 h-6 mr-3 text-green-600" />
                Distribución por Grupos de Edad
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={resultados.resumen.porEdad}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="grupo" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value: number) => [value?.toLocaleString() || '0', 'Casos']}
                    labelFormatter={(label) => `Grupo: ${label}`}
                  />
                  <Bar dataKey="cantidad" fill="#4ade80" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top Departamentos y EPS */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Departamentos */}
            <div className="chart-container">
              <h3 className="chart-title flex items-center">
                <TrendingUp className="w-6 h-6 mr-3 text-blue-600" />
                Top Departamentos
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={resultados.resumen.porDepartamento.slice(0, 10)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="departamento" 
                    angle={-45}
                    textAnchor="end"
                    height={100}
                    fontSize={12}
                  />
                  <YAxis />
                  <Tooltip 
                    formatter={(value: number) => [value?.toLocaleString() || '0', 'Atenciones']}
                    labelFormatter={(label) => `Departamento: ${label}`}
                  />
                  <Bar dataKey="cantidad" fill="#667eea" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Top EPS */}
            <div className="chart-container">
              <h3 className="chart-title flex items-center">
                <Stethoscope className="w-6 h-6 mr-3 text-purple-600" />
                Top EPS
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={resultados.resumen.porEps.slice(0, 10)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="eps" 
                    angle={-45}
                    textAnchor="end"
                    height={100}
                    fontSize={12}
                  />
                  <YAxis />
                  <Tooltip 
                    formatter={(value: number) => [value?.toLocaleString() || '0', 'Atenciones']}
                    labelFormatter={(label) => `EPS: ${label}`}
                  />
                  <Bar dataKey="cantidad" fill="#8b5cf6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Tabla de Atenciones */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title flex items-center">
                <Users className="w-6 h-6 mr-3 text-indigo-600" />
                Detalle de Atenciones ({resultados.atenciones.length})
              </h3>
              <button
                onClick={exportarCSV}
                className="btn btn-primary"
              >
                <Download className="w-4 h-4" />
                Exportar CSV
              </button>
            </div>
            
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Fecha</th>
                    <th>Sexo</th>
                    <th>Edad</th>
                    <th>Diagnóstico</th>
                    <th>Departamento</th>
                    <th>EPS</th>
                  </tr>
                </thead>
                <tbody>
                  {resultados.atenciones.slice(0, 100).map((atencion, index) => (
                    <tr key={atencion.id_atencion}>
                      <td className="font-bold">#{atencion.id_atencion}</td>
                      <td>{new Date(atencion.fecha_atencion).toLocaleDateString()}</td>
                      <td>
                        <span className={`badge ${atencion.sexo === 'M' ? 'badge.primary' : 'badge.warning'}`}>
                          {atencion.sexo === 'M' ? 'Masculino' : 'Femenino'}
                        </span>
                      </td>
                      <td className="font-bold">{atencion.edad} años</td>
                      <td className="max-w-xs truncate">{atencion.nombre_diagnostico}</td>
                      <td>{atencion.nombre_departamento}</td>
                      <td className="max-w-xs truncate">{atencion.nombre_eapb}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {resultados.atenciones.length > 100 && (
                <div className="text-center py-4 text-gray-600 font-semibold">
                  Mostrando 100 de {resultados.atenciones.length} atenciones
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConsultasPage;
