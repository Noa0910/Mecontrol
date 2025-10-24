import axios from 'axios';
import { config } from '../config';

const API_BASE_URL = config.API_URL;

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para manejar errores
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    throw error;
  }
);

export interface Atencion {
  id_atencion: number;
  periodo: string;
  año: number;
  sexo: string;
  edad: number;
  tipo_edad: string;
  nombre_departamento: string;
  nombre_municipio: string;
  codigo_diagnostico: string;
  nombre_diagnostico: string;
  categoria_diagnostico: string;
  nombre_regimen: string;
  tipo_regimen: string;
  nombre_eapb: string;
  tipo_entidad: string;
  fecha_atencion: string;
  fecha_registro: string;
}

export interface Estadisticas {
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

export interface DepartamentoStats {
  nombre_departamento: string;
  total_atenciones: number;
  total_municipios: number;
  edad_promedio: number;
  atenciones_masculino: number;
  atenciones_femenino: number;
}

export interface Demograficas {
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

export interface Diagnostico {
  codigo_diagnostico: string;
  nombre_diagnostico: string;
  categoria_diagnostico: string;
  total_atenciones: number;
  porcentaje: number;
  edad_promedio: number;
  atenciones_masculino: number;
  atenciones_femenino: number;
}

export interface EvolucionTemporal {
  fecha: string;
  total_atenciones: number;
  edad_promedio: number;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface AtencionesResponse {
  atenciones: Atencion[];
  pagination: PaginationInfo;
}

export const api = {
  // Obtener estadísticas generales
  getEstadisticas: async (): Promise<Estadisticas> => {
    const response = await apiClient.get('/estadisticas');
    return response.data;
  },

  // Obtener atenciones con paginación
  getAtenciones: async (
    page: number = 1,
    limit: number = 50,
    search: string = ''
  ): Promise<AtencionesResponse> => {
    const response = await apiClient.get('/atenciones', {
      params: { page, limit, search }
    });
    return response.data;
  },

  // Obtener estadísticas por departamento
  getEstadisticasDepartamentos: async (): Promise<DepartamentoStats[]> => {
    const response = await apiClient.get('/estadisticas/departamentos');
    return response.data;
  },

  // Obtener estadísticas demográficas
  getEstadisticasDemograficas: async (): Promise<Demograficas> => {
    const response = await apiClient.get('/estadisticas/demograficas');
    return response.data;
  },

  // Obtener top diagnósticos
  getDiagnosticos: async (limit: number = 20): Promise<Diagnostico[]> => {
    const response = await apiClient.get('/estadisticas/diagnosticos', {
      params: { limit }
    });
    return response.data;
  },

  // Obtener evolución temporal
  getEvolucionTemporal: async (): Promise<EvolucionTemporal[]> => {
    const response = await apiClient.get('/estadisticas/evolucion');
    return response.data;
  },

  // Obtener datos para Power BI
  getDatosPowerBI: async (): Promise<Atencion[]> => {
    const response = await apiClient.get('/powerbi/datos');
    return response.data;
  },

  // Verificar estado de la API
  checkHealth: async (): Promise<boolean> => {
    try {
      await apiClient.get('/estadisticas');
      return true;
    } catch {
      return false;
    }
  }
};

export default api;
