import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Area, AreaChart } from 'recharts';
import { TrendingUp, Users, MapPin, Activity } from 'lucide-react';
import { api, DepartamentoStats, Demograficas, EvolucionTemporal } from '../services/api';

const COLORS = ['#667eea', '#4ade80', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

export const EstadisticasPage: React.FC = () => {
  const [departamentos, setDepartamentos] = useState<DepartamentoStats[]>([]);
  const [demograficas, setDemograficas] = useState<Demograficas | null>(null);
  const [evolucion, setEvolucion] = useState<EvolucionTemporal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('departamentos');

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setLoading(true);
        const [deptos, demo, evol] = await Promise.all([
          api.getEstadisticasDepartamentos(),
          api.getEstadisticasDemograficas(),
          api.getEvolucionTemporal()
        ]);
        
        setDepartamentos(deptos);
        setDemograficas(demo);
        setEvolucion(evol);
        setError(null);
      } catch (err) {
        setError('Error cargando estadísticas');
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, []);

  if (loading) {
    return (
      <div className="loading">
        <Activity className="w-8 h-8 animate-spin" />
        <span className="ml-2">Cargando estadísticas...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error">
        {error}
      </div>
    );
  }

  const tabs = [
    { id: 'departamentos', label: 'Por Departamentos', icon: MapPin },
    { id: 'demograficas', label: 'Demográficas', icon: Users },
    { id: 'evolucion', label: 'Evolución Temporal', icon: TrendingUp }
  ];

  return (
    <div className="estadisticas-page">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Análisis Estadístico</h1>
        <p className="text-gray-600">Visualización detallada de los datos de morbilidad</p>
      </div>

      {/* Tabs de navegación */}
      <div className="card mb-6">
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`btn ${activeTab === tab.id ? 'btn-primary' : 'btn-secondary'}`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Contenido de las pestañas */}
      {activeTab === 'departamentos' && (
        <div className="space-y-6">
          {/* Top Departamentos */}
          <div className="chart-container">
            <h3 className="chart-title">Top 15 Departamentos por Atenciones</h3>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={departamentos.slice(0, 15)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="nombre_departamento" 
                  angle={-45}
                  textAnchor="end"
                  height={120}
                  fontSize={12}
                />
                <YAxis />
                <Tooltip 
                  formatter={(value: number) => [value.toLocaleString(), 'Atenciones']}
                  labelFormatter={(label) => `Departamento: ${label}`}
                />
                <Bar dataKey="total_atenciones" fill="#667eea" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Distribución por sexo en departamentos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="chart-container">
              <h3 className="chart-title">Atenciones Masculinas por Departamento (Top 10)</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={departamentos.slice(0, 10)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="nombre_departamento" 
                    angle={-45}
                    textAnchor="end"
                    height={100}
                    fontSize={10}
                  />
                  <YAxis />
                  <Tooltip formatter={(value: number) => [value.toLocaleString(), 'Atenciones M']} />
                  <Bar dataKey="atenciones_masculino" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="chart-container">
              <h3 className="chart-title">Atenciones Femeninas por Departamento (Top 10)</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={departamentos.slice(0, 10)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="nombre_departamento" 
                    angle={-45}
                    textAnchor="end"
                    height={100}
                    fontSize={10}
                  />
                  <YAxis />
                  <Tooltip formatter={(value: number) => [value.toLocaleString(), 'Atenciones F']} />
                  <Bar dataKey="atenciones_femenino" fill="#ec4899" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Edad promedio por departamento */}
          <div className="chart-container">
            <h3 className="chart-title">Edad Promedio por Departamento (Top 15)</h3>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={departamentos.slice(0, 15)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="nombre_departamento" 
                  angle={-45}
                  textAnchor="end"
                  height={120}
                  fontSize={12}
                />
                <YAxis />
                <Tooltip 
                  formatter={(value: number) => [value.toFixed(1), 'Años']}
                  labelFormatter={(label) => `Departamento: ${label}`}
                />
                <Bar dataKey="edad_promedio" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {activeTab === 'demograficas' && demograficas && (
        <div className="space-y-6">
          {/* Distribución por sexo */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="chart-container">
              <h3 className="chart-title">Distribución por Sexo</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={demograficas.porSexo}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ sexo, porcentaje }) => `${sexo}: ${porcentaje}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="cantidad"
                  >
                    {demograficas.porSexo.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => [value.toLocaleString(), 'Casos']} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="chart-container">
              <h3 className="chart-title">Distribución por Grupos de Edad</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={demograficas.porEdad}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="grupo_edad" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value: number) => [value.toLocaleString(), 'Casos']}
                    labelFormatter={(label) => `Grupo: ${label}`}
                  />
                  <Bar dataKey="cantidad" fill="#4ade80" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Distribución por régimen */}
          <div className="chart-container">
            <h3 className="chart-title">Distribución por Régimen de Salud</h3>
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie
                  data={demograficas.porRegimen}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ nombre_regimen, porcentaje }) => `${nombre_regimen}: ${porcentaje}%`}
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="cantidad"
                >
                  {demograficas.porRegimen.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => [value.toLocaleString(), 'Casos']} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Comparación detallada por sexo y edad */}
          <div className="chart-container">
            <h3 className="chart-title">Comparación por Sexo y Grupos de Edad</h3>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={demograficas.porEdad}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="grupo_edad" />
                <YAxis />
                <Tooltip 
                  formatter={(value: number) => [value.toLocaleString(), 'Casos']}
                  labelFormatter={(label) => `Grupo: ${label}`}
                />
                <Bar dataKey="cantidad" fill="#667eea" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {activeTab === 'evolucion' && (
        <div className="space-y-6">
          {/* Evolución temporal de atenciones */}
          <div className="chart-container">
            <h3 className="chart-title">Evolución de Atenciones (Últimos 30 días)</h3>
            <ResponsiveContainer width="100%" height={400}>
              <AreaChart data={evolucion}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="fecha" 
                  tickFormatter={(value) => new Date(value).toLocaleDateString('es-CO', { month: 'short', day: 'numeric' })}
                />
                <YAxis />
                <Tooltip 
                  formatter={(value: number) => [value.toLocaleString(), 'Atenciones']}
                  labelFormatter={(label) => `Fecha: ${new Date(label).toLocaleDateString('es-CO')}`}
                />
                <Area 
                  type="monotone" 
                  dataKey="total_atenciones" 
                  stroke="#667eea" 
                  fill="#667eea" 
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Evolución de edad promedio */}
          <div className="chart-container">
            <h3 className="chart-title">Evolución de Edad Promedio (Últimos 30 días)</h3>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={evolucion}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="fecha" 
                  tickFormatter={(value) => new Date(value).toLocaleDateString('es-CO', { month: 'short', day: 'numeric' })}
                />
                <YAxis />
                <Tooltip 
                  formatter={(value: number) => [value.toFixed(1), 'Años']}
                  labelFormatter={(label) => `Fecha: ${new Date(label).toLocaleDateString('es-CO')}`}
                />
                <Line 
                  type="monotone" 
                  dataKey="edad_promedio" 
                  stroke="#10b981" 
                  strokeWidth={3}
                  dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Resumen de evolución */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">
                  {evolucion.length > 0 ? evolucion[0].total_atenciones.toLocaleString() : 0}
                </div>
                <div className="text-sm text-gray-600">Atenciones hoy</div>
              </div>
            </div>
            <div className="card">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">
                  {evolucion.length > 0 ? evolucion[0].edad_promedio.toFixed(1) : 0}
                </div>
                <div className="text-sm text-gray-600">Edad promedio hoy</div>
              </div>
            </div>
            <div className="card">
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">
                  {evolucion.length}
                </div>
                <div className="text-sm text-gray-600">Días con datos</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
