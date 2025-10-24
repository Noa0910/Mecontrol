import React, { useState, useEffect } from 'react';
import { 
  Users, 
  MapPin, 
  Stethoscope, 
  TrendingUp,
  Calendar,
  Activity,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { api } from '../services/api';

interface Estadisticas {
  totalAtenciones: number;
  atencionesHoy: number;
  totalDepartamentos: number;
  totalMunicipios: number;
  totalDiagnosticos: number;
  ultimaActualizacion: {
    fecha_actualizacion: string;
    total_atenciones: number;
    atenciones_nuevas: number;
  } | null;
}

interface DepartamentoStats {
  nombre_departamento: string;
  total_atenciones: number;
  total_municipios: number;
  edad_promedio: number;
  atenciones_masculino: number;
  atenciones_femenino: number;
}

interface Demograficas {
  porSexo: Array<{
    sexo: string;
    cantidad: number;
    porcentaje: number;
  }>;
  porEdad: Array<{
    grupo_edad: string;
    cantidad: number;
    porcentaje: number;
  }>;
  porRegimen: Array<{
    nombre_regimen: string;
    tipo_regimen: string;
    cantidad: number;
    porcentaje: number;
  }>;
}

const COLORS = ['#667eea', '#4ade80', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

export const Dashboard: React.FC = () => {
  const [estadisticas, setEstadisticas] = useState<Estadisticas | null>(null);
  const [departamentos, setDepartamentos] = useState<DepartamentoStats[]>([]);
  const [demograficas, setDemograficas] = useState<Demograficas | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setLoading(true);
        const [estats, deptos, demo] = await Promise.all([
          api.getEstadisticas(),
          api.getEstadisticasDepartamentos(),
          api.getEstadisticasDemograficas()
        ]);
        
        setEstadisticas(estats);
        setDepartamentos(Array.isArray(deptos) ? deptos.slice(0, 10) : []); // Top 10 departamentos
        setDemograficas(demo && typeof demo === 'object' ? demo : null);
        setError(null);
      } catch (err) {
        setError('Error cargando datos del dashboard');
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
        <span className="ml-2">Cargando dashboard...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error">
        <AlertCircle className="w-5 h-5 inline mr-2" />
        {error}
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Vista general del sistema de morbilidad en urgencias</p>
      </div>

      {/* Estadísticas principales */}
      <div className="stats-grid">
        <div className="stat-card primary">
          <div className="stat-header">
            <span className="stat-title">Total Atenciones</span>
            <Users className="stat-icon" />
          </div>
          <div className="stat-value">{estadisticas?.totalAtenciones?.toLocaleString() || '0'}</div>
          <div className="stat-change positive">
            <CheckCircle className="w-4 h-4" />
            <span>Datos actualizados</span>
          </div>
        </div>

        <div className="stat-card success">
          <div className="stat-header">
            <span className="stat-title">Atenciones Hoy</span>
            <Calendar className="stat-icon" />
          </div>
          <div className="stat-value">{estadisticas?.atencionesHoy?.toLocaleString() || '0'}</div>
          <div className="stat-change positive">
            <TrendingUp className="w-4 h-4" />
            <span>Hoy</span>
          </div>
        </div>

        <div className="stat-card warning">
          <div className="stat-header">
            <span className="stat-title">Departamentos</span>
            <MapPin className="stat-icon" />
          </div>
          <div className="stat-value">{estadisticas?.totalDepartamentos}</div>
          <div className="stat-change">
            <span>Registrados</span>
          </div>
        </div>

        <div className="stat-card danger">
          <div className="stat-header">
            <span className="stat-title">Diagnósticos</span>
            <Stethoscope className="stat-icon" />
          </div>
          <div className="stat-value">{estadisticas?.totalDiagnosticos}</div>
          <div className="stat-change">
            <span>Únicos</span>
          </div>
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Top Departamentos */}
        <div className="chart-container">
          <h3 className="chart-title">Top 10 Departamentos por Atenciones</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={departamentos || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="nombre_departamento" 
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
              <Bar dataKey="total_atenciones" fill="#667eea" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Distribución por Sexo */}
        <div className="chart-container">
          <h3 className="chart-title">Distribución por Sexo</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={demograficas?.porSexo || []}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ sexo, porcentaje }) => `${sexo}: ${porcentaje}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="cantidad"
              >
                {(demograficas?.porSexo || []).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => [value?.toLocaleString() || '0', 'Casos']} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Distribución por Edad y Régimen */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="chart-container">
          <h3 className="chart-title">Distribución por Grupos de Edad</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={demograficas?.porEdad || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="grupo_edad" />
              <YAxis />
              <Tooltip 
                formatter={(value: number) => [value?.toLocaleString() || '0', 'Casos']}
                labelFormatter={(label) => `Grupo: ${label}`}
              />
              <Bar dataKey="cantidad" fill="#4ade80" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-container">
          <h3 className="chart-title">Distribución por Régimen de Salud</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={demograficas?.porRegimen || []}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ nombre_regimen, porcentaje }) => `${nombre_regimen}: ${porcentaje}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="cantidad"
              >
                {(demograficas?.porRegimen || []).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => [value?.toLocaleString() || '0', 'Casos']} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Información de actualización */}
      {estadisticas?.ultimaActualizacion && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Información de Actualización</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {new Date(estadisticas.ultimaActualizacion.fecha_actualizacion).toLocaleDateString()}
              </div>
              <div className="text-sm text-gray-600">Última actualización</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {estadisticas?.ultimaActualizacion?.total_atenciones?.toLocaleString() || '0'}
              </div>
              <div className="text-sm text-gray-600">Total atenciones</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {estadisticas?.ultimaActualizacion?.atenciones_nuevas?.toLocaleString() || '0'}
              </div>
              <div className="text-sm text-gray-600">Atenciones nuevas</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
