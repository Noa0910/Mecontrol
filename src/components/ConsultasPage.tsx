import React, { useState, useEffect, useCallback } from 'react';
import { Search, Download, Filter, Calendar, MapPin, Users, Stethoscope } from 'lucide-react';
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
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Consultas Avanzadas
        </h1>
        <p className="text-gray-600">
          Filtra y analiza los datos de morbilidad según tus criterios específicos
        </p>
      </div>

      {/* Panel de Filtros */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center mb-4">
          <Filter className="w-5 h-5 text-blue-600 mr-2" />
          <h2 className="text-xl font-semibold text-gray-900">Filtros de Consulta</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {/* Departamento */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MapPin className="w-4 h-4 inline mr-1" />
              Departamento
            </label>
            <select
              value={filtros.departamento}
              onChange={(e) => setFiltros({...filtros, departamento: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos los departamentos</option>
              {opciones.departamentos.map(depto => (
                <option key={depto} value={depto}>{depto}</option>
              ))}
            </select>
          </div>

          {/* Sexo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Users className="w-4 h-4 inline mr-1" />
              Sexo
            </label>
            <select
              value={filtros.sexo}
              onChange={(e) => setFiltros({...filtros, sexo: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos</option>
              <option value="M">Masculino</option>
              <option value="F">Femenino</option>
            </select>
          </div>

          {/* Rango de Edad */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="w-4 h-4 inline mr-1" />
              Rango de Edad
            </label>
            <div className="flex space-x-2">
              <input
                type="number"
                placeholder="Mín"
                value={filtros.edadMin || ''}
                onChange={(e) => setFiltros({...filtros, edadMin: parseInt(e.target.value) || 0})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="number"
                placeholder="Máx"
                value={filtros.edadMax || ''}
                onChange={(e) => setFiltros({...filtros, edadMax: parseInt(e.target.value) || 100})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* EPS */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Stethoscope className="w-4 h-4 inline mr-1" />
              EPS
            </label>
            <select
              value={filtros.eps}
              onChange={(e) => setFiltros({...filtros, eps: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todas las EPS</option>
              {opciones.eps.map(eps => (
                <option key={eps} value={eps}>{eps}</option>
              ))}
            </select>
          </div>

          {/* Fecha Inicio */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha Inicio
            </label>
            <input
              type="date"
              value={filtros.fechaInicio}
              onChange={(e) => setFiltros({...filtros, fechaInicio: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Fecha Fin */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha Fin
            </label>
            <input
              type="date"
              value={filtros.fechaFin}
              onChange={(e) => setFiltros({...filtros, fechaFin: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex justify-end space-x-4">
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
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Limpiar Filtros
          </button>
          <button
            onClick={ejecutarConsulta}
            disabled={cargando}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center"
          >
            <Search className="w-4 h-4 mr-2" />
            {cargando ? 'Consultando...' : 'Ejecutar Consulta'}
          </button>
        </div>
      </div>

      {/* Resultados */}
      {resultados && (
        <div className="space-y-6">
          {/* Resumen */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-900">
                Resultados de la Consulta
              </h3>
              <button
                onClick={exportarCSV}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center"
              >
                <Download className="w-4 h-4 mr-2" />
                Exportar CSV
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {resultados.totalAtenciones.toLocaleString()}
                </div>
                <div className="text-sm text-blue-800">Total Atenciones</div>
              </div>
            </div>

            {/* Gráficos de Resumen */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Por Sexo */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Distribución por Sexo</h4>
                <div className="space-y-2">
                  {resultados.resumen.porSexo.map((item, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">{item.sexo}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${item.porcentaje}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-900">
                          {item.cantidad} ({item.porcentaje}%)
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Por Edad */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Distribución por Edad</h4>
                <div className="space-y-2">
                  {resultados.resumen.porEdad.map((item, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">{item.grupo}</span>
                      <span className="text-sm font-medium text-gray-900">{item.cantidad}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Tabla de Atenciones */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Detalle de Atenciones ({resultados.atenciones.length})
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sexo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Edad
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Diagnóstico
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Departamento
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      EPS
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {resultados.atenciones.slice(0, 100).map((atencion) => (
                    <tr key={atencion.id_atencion}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {atencion.id_atencion}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(atencion.fecha_atencion).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {atencion.sexo === 'M' ? 'Masculino' : 'Femenino'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {atencion.edad}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                        {atencion.nombre_diagnostico}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {atencion.nombre_departamento}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                        {atencion.nombre_eapb}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {resultados.atenciones.length > 100 && (
                <div className="text-center py-4 text-gray-500">
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
