import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Search, Stethoscope } from 'lucide-react';
import { api, Diagnostico } from '../services/api';

const COLORS = ['#667eea', '#4ade80', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

export const DiagnosticosPage: React.FC = () => {
  const [diagnosticos, setDiagnosticos] = useState<Diagnostico[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [limit, setLimit] = useState(20);

  const cargarDiagnosticos = async () => {
    try {
      setLoading(true);
      const data = await api.getDiagnosticos(limit);
      setDiagnosticos(data);
      setError(null);
    } catch (err) {
      setError('Error cargando diagnósticos');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDiagnosticos();
  }, [limit]);

  const diagnosticosFiltrados = diagnosticos.filter(diag => {
    const matchesSearch = diag.nombre_diagnostico.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         diag.codigo_diagnostico.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || diag.categoria_diagnostico === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const categorias = Array.from(new Set(diagnosticos.map(d => d.categoria_diagnostico)));

  const getBadgeClass = (categoria: string) => {
    switch (categoria) {
      case 'Urgencias': return 'badge primary';
      case 'Síntomas y signos': return 'badge success';
      case 'Traumatismos': return 'badge warning';
      case 'Causas externas': return 'badge danger';
      case 'Sistema musculoesquelético': return 'badge gray';
      default: return 'badge gray';
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <Stethoscope className="w-8 h-8 animate-spin" />
        <span className="ml-2">Cargando diagnósticos...</span>
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

  return (
    <div className="diagnosticos-page">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Top Diagnósticos</h1>
        <p className="text-gray-600">Análisis de los diagnósticos más frecuentes en urgencias</p>
      </div>

      {/* Filtros y controles */}
      <div className="card mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex flex-col md:flex-row gap-4 flex-1">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar por código o nombre de diagnóstico..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-input pl-10"
              />
            </div>
            
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="form-input"
            >
              <option value="all">Todas las categorías</option>
              {categorias.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          
          <div className="flex gap-2">
            <select
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
              className="form-input"
            >
              <option value={10}>Top 10</option>
              <option value={20}>Top 20</option>
              <option value={50}>Top 50</option>
              <option value={100}>Top 100</option>
            </select>
          </div>
        </div>
      </div>

      {/* Estadísticas resumen */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="card">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {diagnosticosFiltrados.length}
            </div>
            <div className="text-sm text-gray-600">Diagnósticos mostrados</div>
          </div>
        </div>
        <div className="card">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {diagnosticosFiltrados.reduce((sum, d) => sum + d.total_atenciones, 0).toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Total atenciones</div>
          </div>
        </div>
        <div className="card">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {categorias.length}
            </div>
            <div className="text-sm text-gray-600">Categorías</div>
          </div>
        </div>
        <div className="card">
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {diagnosticosFiltrados.length > 0 ? (typeof diagnosticosFiltrados[0].edad_promedio === 'number' ? diagnosticosFiltrados[0].edad_promedio.toFixed(1) : 'N/A') : 0}
            </div>
            <div className="text-sm text-gray-600">Edad promedio (top 1)</div>
          </div>
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Top diagnósticos */}
        <div className="chart-container">
          <h3 className="chart-title">Top {Math.min(limit, diagnosticosFiltrados.length)} Diagnósticos</h3>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={diagnosticosFiltrados.slice(0, 15)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="codigo_diagnostico" 
                angle={-45}
                textAnchor="end"
                height={100}
                fontSize={10}
              />
              <YAxis />
              <Tooltip 
                formatter={(value: number) => [value.toLocaleString(), 'Atenciones']}
                labelFormatter={(label: string) => `Código: ${label}`}
              />
              <Bar dataKey="total_atenciones" fill="#667eea" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Distribución por categorías */}
        <div className="chart-container">
          <h3 className="chart-title">Distribución por Categorías</h3>
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={categorias.map(cat => ({
                  categoria: cat,
                  cantidad: diagnosticosFiltrados
                    .filter(d => d.categoria_diagnostico === cat)
                    .reduce((sum, d) => sum + d.total_atenciones, 0)
                }))}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry: any) => `${entry.categoria}: ${entry.cantidad.toLocaleString()}`}
                outerRadius={120}
                fill="#8884d8"
                dataKey="cantidad"
              >
                {categorias.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => [value.toLocaleString(), 'Atenciones']} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tabla de diagnósticos */}
      <div className="table-container">
        <div className="card-header">
          <h3 className="card-title">Lista Detallada de Diagnósticos</h3>
          <div className="text-sm text-gray-600">
            Mostrando {diagnosticosFiltrados.length} de {diagnosticos.length} diagnósticos
          </div>
        </div>
        
        <table className="table">
          <thead>
            <tr>
              <th>Ranking</th>
              <th>Código</th>
              <th>Diagnóstico</th>
              <th>Categoría</th>
              <th>Total Atenciones</th>
              <th>Porcentaje</th>
              <th>Edad Promedio</th>
              <th>M</th>
              <th>F</th>
            </tr>
          </thead>
          <tbody>
            {diagnosticosFiltrados.map((diag, index) => (
              <tr key={diag.codigo_diagnostico}>
                <td className="text-center font-bold text-blue-600">
                  #{index + 1}
                </td>
                <td className="font-mono text-sm font-medium">
                  {diag.codigo_diagnostico}
                </td>
                <td>
                  <div className="max-w-xs">
                    <div className="font-medium text-sm">{diag.nombre_diagnostico}</div>
                  </div>
                </td>
                <td>
                  <span className={getBadgeClass(diag.categoria_diagnostico)}>
                    {diag.categoria_diagnostico}
                  </span>
                </td>
                <td className="text-center font-bold">
                  {diag.total_atenciones.toLocaleString()}
                </td>
                <td className="text-center">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${Math.min(diag.porcentaje, 100)}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium">{diag.porcentaje}%</span>
                  </div>
                </td>
                <td className="text-center">
                  {typeof diag.edad_promedio === 'number' ? diag.edad_promedio.toFixed(1) : 'N/A'} años
                </td>
                <td className="text-center">
                  <span className="badge primary">
                    {diag.atenciones_masculino.toLocaleString()}
                  </span>
                </td>
                <td className="text-center">
                  <span className="badge success">
                    {diag.atenciones_femenino.toLocaleString()}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {diagnosticosFiltrados.length === 0 && (
        <div className="text-center py-8">
          <Stethoscope className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron diagnósticos</h3>
          <p className="text-gray-600">Intenta ajustar los filtros de búsqueda</p>
        </div>
      )}
    </div>
  );
};
