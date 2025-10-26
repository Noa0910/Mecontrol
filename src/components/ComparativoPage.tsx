import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { TrendingUp, Users, Globe } from 'lucide-react';
import { api } from '../services/supabaseApi';

const COLORS = ['#667eea', '#8b5cf6', '#4ade80', '#f59e0b', '#ef4444', '#06b6d4'];

export const ComparativoPage: React.FC = () => {
  const [globalData, setGlobalData] = useState<any>(null);
  const [empresaData, setEmpresaData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setLoading(true);
        
        // Cargar datos globales y de empresa en paralelo
        const [global, empresa] = await Promise.all([
          Promise.all([
            api.getEstadisticas('global'),
            api.getEstadisticasDepartamentos('global'),
            api.getEstadisticasDemograficas('global')
          ]),
          Promise.all([
            api.getEstadisticas('empresa'),
            api.getEstadisticasDepartamentos('empresa'),
            api.getEstadisticasDemograficas('empresa')
          ])
        ]);

        setGlobalData({
          estadisticas: global[0],
          departamentos: global[1],
          demograficas: global[2]
        });

        setEmpresaData({
          estadisticas: empresa[0],
          departamentos: empresa[1],
          demograficas: empresa[2]
        });

      } catch (error) {
        console.error('Error cargando datos:', error);
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, []);

  if (loading) {
    return (
      <div className="dashboard">
        <div className="loading">
          <div className="text-center">
            <div className="animate-spin">📊</div>
            <p>Cargando datos comparativos...</p>
          </div>
        </div>
      </div>
    );
  }

  const calcularPorcentaje = (actual: number, total: number) => {
    if (!total) return 0;
    return ((actual / total) * 100).toFixed(2);
  };

  return (
    <div className="dashboard">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Comparativo de Datos</h1>
        <p className="text-gray-600">Comparación entre datos globales y datos de empresa</p>
      </div>

      {/* Métricas Comparativas */}
      <div className="stats-grid mb-6">
        <div className="stat-card" style={{ borderLeftColor: '#667eea' }}>
          <div className="stat-header">
            <span className="stat-title">Total Atenciones</span>
            <Users className="stat-icon" />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div className="stat-value" style={{ color: '#667eea' }}>
                {globalData?.estadisticas?.totalAtenciones?.toLocaleString() || '0'}
              </div>
              <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Global</div>
            </div>
            <div>
              <div className="stat-value" style={{ color: '#8b5cf6' }}>
                {empresaData?.estadisticas?.totalAtenciones?.toLocaleString() || '0'}
              </div>
              <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Empresa</div>
            </div>
          </div>
          <div className="stat-change">
            <TrendingUp className="w-4 h-4" />
            <span>
              {calcularPorcentaje(empresaData?.estadisticas?.totalAtenciones || 0, globalData?.estadisticas?.totalAtenciones || 0)}% del total
            </span>
          </div>
        </div>

        <div className="stat-card" style={{ borderLeftColor: '#4ade80' }}>
          <div className="stat-header">
            <span className="stat-title">Departamentos</span>
            <Globe className="stat-icon" />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div className="stat-value" style={{ color: '#4ade80' }}>
                {globalData?.estadisticas?.totalDepartamentos || '0'}
              </div>
              <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Global</div>
            </div>
            <div>
              <div className="stat-value" style={{ color: '#10b981' }}>
                {empresaData?.estadisticas?.totalDepartamentos || '0'}
              </div>
              <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Empresa</div>
            </div>
          </div>
        </div>

        <div className="stat-card" style={{ borderLeftColor: '#f59e0b' }}>
          <div className="stat-header">
            <span className="stat-title">Diagnósticos</span>
            <Users className="stat-icon" />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div className="stat-value" style={{ color: '#f59e0b' }}>
                {globalData?.estadisticas?.totalDiagnosticos || '0'}
              </div>
              <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Global</div>
            </div>
            <div>
              <div className="stat-value" style={{ color: '#d97706' }}>
                {empresaData?.estadisticas?.totalDiagnosticos || '0'}
              </div>
              <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Empresa</div>
            </div>
          </div>
        </div>
      </div>

      {/* Gráfico Comparativo de Sexo */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="chart-container">
          <h3 className="chart-title">Distribución por Sexo - Global</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={globalData?.demograficas?.porSexo || []}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ sexo, porcentaje }) => `${sexo}: ${porcentaje}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="cantidad"
              >
                {(globalData?.demograficas?.porSexo || []).map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => [value?.toLocaleString() || '0', 'Casos']} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-container">
          <h3 className="chart-title">Distribución por Sexo - Empresa</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={empresaData?.demograficas?.porSexo || []}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ sexo, porcentaje }) => `${sexo}: ${porcentaje}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="cantidad"
              >
                {(empresaData?.demograficas?.porSexo || []).map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => [value?.toLocaleString() || '0', 'Casos']} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Departamentos Comparativo */}
      <div className="card mb-6">
        <h3 className="card-title">Top 10 Departamentos - Comparativo</h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={[
            ...(globalData?.departamentos?.slice(0, 10).map((d: any) => ({ ...d, tipo: 'Global' })) || []),
            ...(empresaData?.departamentos?.slice(0, 10).map((d: any) => ({ ...d, tipo: 'Empresa' })) || [])
          ].slice(0, 10)}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="nombre_departamento" angle={-45} textAnchor="end" height={100} />
            <YAxis />
            <Tooltip formatter={(value: number) => [value?.toLocaleString() || '0', 'Atenciones']} />
            <Legend />
            <Bar dataKey="total_atenciones" fill="#667eea" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

