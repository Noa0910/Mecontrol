import React, { useState, useEffect, useCallback } from 'react';
import { Search, Download, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import { api, Atencion, PaginationInfo } from '../services/api';

export const AtencionesTable: React.FC = () => {
  const [atenciones, setAtenciones] = useState<Atencion[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);

  const cargarAtenciones = useCallback(async (page: number = 1, search: string = '') => {
    try {
      setLoading(true);
      const response = await api.getAtenciones(page, pageSize, search);
      setAtenciones(response.atenciones);
      setPagination(response.pagination);
      setError(null);
    } catch (err) {
      setError('Error cargando atenciones');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  }, [pageSize]);

  useEffect(() => {
    cargarAtenciones(currentPage, searchTerm);
  }, [currentPage, pageSize, cargarAtenciones, searchTerm]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    cargarAtenciones(1, searchTerm);
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setCurrentPage(1);
    cargarAtenciones(1, searchTerm);
  };

  const getBadgeClass = (tipo: string) => {
    switch (tipo) {
      case 'M': return 'badge primary';
      case 'F': return 'badge success';
      case 'CONTRIBUTIVO': return 'badge primary';
      case 'SUBSIDIADO': return 'badge success';
      case 'VINCULADO': return 'badge warning';
      default: return 'badge gray';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CO');
  };

  if (loading && atenciones.length === 0) {
    return (
      <div className="loading">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Cargando atenciones...</span>
      </div>
    );
  }

  return (
    <div className="atenciones-page">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Registros de Atenciones</h1>
        <p className="text-gray-600">Consulta y filtra los registros de atenciones en urgencias</p>
      </div>

      {/* Filtros y búsqueda */}
      <div className="card mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <form onSubmit={handleSearch} className="flex-1 flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar por departamento, municipio, diagnóstico..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-input pl-10"
              />
            </div>
            <button type="submit" className="btn btn-primary">
              <Search className="w-4 h-4" />
              Buscar
            </button>
          </form>
          
          <div className="flex gap-2">
            <select
              value={pageSize}
              onChange={(e) => handlePageSizeChange(Number(e.target.value))}
              className="form-input"
            >
              <option value={25}>25 por página</option>
              <option value={50}>50 por página</option>
              <option value={100}>100 por página</option>
            </select>
            
            <button className="btn btn-secondary">
              <Download className="w-4 h-4" />
              Exportar
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="error mb-4">
          {error}
        </div>
      )}

      {/* Tabla de atenciones */}
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Período</th>
              <th>Sexo</th>
              <th>Edad</th>
              <th>Departamento</th>
              <th>Municipio</th>
              <th>Diagnóstico</th>
              <th>Régimen</th>
              <th>EAPB</th>
              <th>Fecha Atención</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {atenciones.map((atencion) => (
              <tr key={atencion.id_atencion}>
                <td className="font-mono text-sm">{atencion.id_atencion}</td>
                <td>
                  <span className="badge gray">{atencion.periodo}</span>
                </td>
                <td>
                  <span className={getBadgeClass(atencion.sexo)}>
                    {atencion.sexo}
                  </span>
                </td>
                <td className="text-center">{atencion.edad}</td>
                <td className="font-medium">{atencion.nombre_departamento}</td>
                <td>{atencion.nombre_municipio}</td>
                <td>
                  <div className="max-w-xs">
                    <div className="font-medium text-sm">{atencion.codigo_diagnostico}</div>
                    <div className="text-xs text-gray-500 truncate" title={atencion.nombre_diagnostico}>
                      {atencion.nombre_diagnostico}
                    </div>
                  </div>
                </td>
                <td>
                  <span className={getBadgeClass(atencion.nombre_regimen)}>
                    {atencion.nombre_regimen}
                  </span>
                </td>
                <td className="text-sm">{atencion.nombre_eapb}</td>
                <td className="text-sm">{formatDate(atencion.fecha_atencion)}</td>
                <td>
                  <button className="btn btn-secondary text-xs">
                    <Eye className="w-3 h-3" />
                    Ver
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      {pagination && (
        <div className="pagination">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={!pagination.hasPrev}
            className="btn btn-secondary"
          >
            <ChevronLeft className="w-4 h-4" />
            Anterior
          </button>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">
              Página {pagination.page} de {pagination.totalPages}
            </span>
            <span className="text-sm text-gray-500">
              ({pagination.total.toLocaleString()} registros totales)
            </span>
          </div>
          
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={!pagination.hasNext}
            className="btn btn-secondary"
          >
            Siguiente
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {loading && (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
          <span className="text-sm text-gray-600 mt-2">Cargando más registros...</span>
        </div>
      )}
    </div>
  );
};
