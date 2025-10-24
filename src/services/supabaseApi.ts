import { supabase } from '../supabaseClient';

// Interfaz para las estadísticas
export interface Estadisticas {
  totalAtenciones: number;
  atencionesHoy: number;
  totalDepartamentos: number;
  totalMunicipios: number;
  totalDiagnosticos: number;
  ultimaActualizacion: any;
}

// Interfaz para departamentos
export interface DepartamentoStats {
  nombre_departamento: string;
  total_atenciones: number;
  total_municipios: number;
  edad_promedio: number;
  atenciones_masculino: number;
  atenciones_femenino: number;
}

// Interfaz para atenciones
export interface Atencion {
  id_atencion: number;
  fecha_atencion: string;
  sexo: string;
  edad: number;
  nombre_diagnostico: string;
  nombre_municipio: string;
  nombre_departamento: string;
  nombre_regimen: string;
  nombre_eapb: string;
  periodo: string;
  codigo_diagnostico: string;
}

// Interfaz para diagnósticos
export interface Diagnostico {
  id_diagnostico: number;
  codigo_diagnostico: string;
  nombre_diagnostico: string;
  categoria_diagnostico: string;
  severidad: string;
  requiere_hospitalizacion: boolean;
  total_atenciones?: number;
  edad_promedio: number;
  porcentaje: number;
  atenciones_masculino: number;
  atenciones_femenino: number;
}

// Interfaz para paginación
export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasPrev: boolean;
  hasNext: boolean;
}

// Interfaz para estadísticas demográficas
export interface Demograficas {
  porSexo: Array<{
    sexo: string;
    cantidad: number;
    porcentaje: number;
  }>;
  porEdad: Array<{
    grupo_edad: string;
    cantidad: number;
  }>;
  porRegimen: Array<{
    nombre_regimen: string;
    cantidad: number;
    porcentaje: number;
  }>;
}

// Interfaz para evolución temporal
export interface EvolucionTemporal {
  mes: string;
  cantidad: number;
}

// Clase API para manejar todas las consultas a Supabase
class SupabaseAPI {
  // Obtener estadísticas generales
  async getEstadisticas(): Promise<Estadisticas> {
    try {
      // Usar count para obtener totales sin cargar todos los datos
      const [atencionesCount, departamentosCount, municipiosCount, diagnosticosCount] = await Promise.all([
        supabase.from('atenciones_urgencias').select('*', { count: 'exact', head: true }),
        supabase.from('departamentos').select('*', { count: 'exact', head: true }),
        supabase.from('municipios').select('*', { count: 'exact', head: true }),
        supabase.from('diagnosticos').select('*', { count: 'exact', head: true })
      ]);

      // Obtener atenciones de hoy usando una consulta específica
      const today = new Date().toISOString().split('T')[0];
      const { count: atencionesHoyCount } = await supabase
        .from('atenciones_urgencias')
        .select('*', { count: 'exact', head: true })
        .gte('fecha_atencion', today)
        .lt('fecha_atencion', today + 'T23:59:59');

      return {
        totalAtenciones: atencionesCount.count || 0,
        atencionesHoy: atencionesHoyCount || 0,
        totalDepartamentos: departamentosCount.count || 0,
        totalMunicipios: municipiosCount.count || 0,
        totalDiagnosticos: diagnosticosCount.count || 0,
        ultimaActualizacion: null
      };
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      throw error;
    }
  }

  // Obtener estadísticas por departamentos
  async getEstadisticasDepartamentos(): Promise<DepartamentoStats[]> {
    try {
      const { data, error } = await supabase
        .from('atenciones_urgencias')
        .select(`
          id_atencion,
          sexo,
          edad,
          id_municipio
        `);

      if (error) throw error;

      // Obtener departamentos y municipios por separado
      const { data: departamentosData, error: deptosError } = await supabase
        .from('departamentos')
        .select('id_departamento, nombre_departamento');

      const { data: municipiosData, error: munisError } = await supabase
        .from('municipios')
        .select('id_municipio, nombre_municipio, id_departamento');

      if (deptosError || munisError) {
        console.error('Error obteniendo departamentos o municipios:', deptosError || munisError);
        throw deptosError || munisError;
      }

      // Crear mapas para búsqueda rápida
      const deptosMap = new Map(departamentosData?.map(d => [d.id_departamento, d.nombre_departamento]) || []);
      const munisMap = new Map(municipiosData?.map(m => [m.id_municipio, { nombre: m.nombre_municipio, id_depto: m.id_departamento }]) || []);

      // Agrupar por departamento
      const departamentos: { [key: string]: any } = {};
      data?.forEach((atencion: any) => {
        // Obtener municipio y departamento
        const muniInfo = munisMap.get(atencion.id_municipio);
        if (!muniInfo) return; // Skip si no encontramos el municipio
        
        const deptoNombre = deptosMap.get(muniInfo.id_depto);
        if (!deptoNombre) return; // Skip si no encontramos el departamento

        if (!departamentos[deptoNombre]) {
          departamentos[deptoNombre] = {
            nombre_departamento: deptoNombre,
            total_atenciones: 0,
            total_municipios: new Set(),
            edades: [],
            atenciones_masculino: 0,
            atenciones_femenino: 0
          };
        }
        
        departamentos[deptoNombre].total_atenciones++;
        departamentos[deptoNombre].total_municipios.add(muniInfo.nombre);
        departamentos[deptoNombre].edades.push(atencion.edad);
        
        if (atencion.sexo === 'M') {
          departamentos[deptoNombre].atenciones_masculino++;
        } else if (atencion.sexo === 'F') {
          departamentos[deptoNombre].atenciones_femenino++;
        }
      });

      return Object.values(departamentos)
        .map((depto: any) => ({
          nombre_departamento: depto.nombre_departamento,
          total_atenciones: depto.total_atenciones,
          total_municipios: depto.total_municipios.size,
          edad_promedio: depto.edades.length > 0 ? 
            depto.edades.reduce((sum: number, edad: number) => sum + edad, 0) / depto.edades.length : 0,
          atenciones_masculino: depto.atenciones_masculino,
          atenciones_femenino: depto.atenciones_femenino
        }))
        .sort((a, b) => b.total_atenciones - a.total_atenciones);
    } catch (error) {
      console.error('Error obteniendo estadísticas de departamentos:', error);
      throw error;
    }
  }

  // Obtener estadísticas demográficas
  async getEstadisticasDemograficas(): Promise<any> {
    try {
      const { data: atenciones, error } = await supabase
        .from('atenciones_urgencias')
        .select('sexo, edad, id_regimen');

      if (error) throw error;

      // Obtener regímenes por separado
      const { data: regimenesData, error: regimenesError } = await supabase
        .from('regimenes_salud')
        .select('id_regimen, nombre_regimen');

      if (regimenesError) {
        console.error('Error obteniendo regímenes:', regimenesError);
        throw regimenesError;
      }

      // Crear mapa para búsqueda rápida
      const regimenesMap = new Map(regimenesData?.map(r => [r.id_regimen, r.nombre_regimen]) || []);

      // Procesar datos demográficos
      const porSexo: { [key: string]: number } = {};
      const porEdad: { [key: string]: number } = {};
      const porRegimen: { [key: string]: number } = {};

      atenciones?.forEach((atencion: any) => {
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
        const regimenNombre = regimenesMap.get(atencion.id_regimen);
        if (regimenNombre) {
          porRegimen[regimenNombre] = (porRegimen[regimenNombre] || 0) + 1;
        }
      });

      const total = atenciones?.length || 0;

      return {
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
      };
    } catch (error) {
      console.error('Error obteniendo estadísticas demográficas:', error);
      throw error;
    }
  }

  // Obtener atenciones con paginación
  async getAtenciones(page: number = 1, limit: number = 50, search: string = ''): Promise<{ atenciones: Atencion[], pagination: PaginationInfo }> {
    try {
      const offset = (page - 1) * limit;

      let query = supabase
        .from('atenciones_urgencias')
        .select(`
          id_atencion,
          fecha_atencion,
          sexo,
          edad,
          periodo,
          id_diagnostico,
          id_municipio,
          id_regimen,
          id_eapb
        `)
        .order('fecha_atencion', { ascending: false })
        .range(offset, offset + limit - 1);

      const { data: atenciones, error } = await query;

      if (error) throw error;

      // Obtener total para paginación
      const { count } = await supabase
        .from('atenciones_urgencias')
        .select('*', { count: 'exact', head: true });

      // Obtener datos relacionados por separado
      const [diagnosticosRes, municipiosRes, regimenesRes, eapbRes] = await Promise.all([
        supabase.from('diagnosticos').select('id_diagnostico, nombre_diagnostico, codigo_diagnostico'),
        supabase.from('municipios').select('id_municipio, nombre_municipio, id_departamento'),
        supabase.from('regimenes_salud').select('id_regimen, nombre_regimen'),
        supabase.from('eapb').select('id_eapb, nombre_eapb')
      ]);

      // Obtener departamentos
      const { data: departamentosData } = await supabase
        .from('departamentos')
        .select('id_departamento, nombre_departamento');

      // Crear mapas para búsqueda rápida
      const diagMap = new Map(diagnosticosRes.data?.map(d => [d.id_diagnostico, d]) || []);
      const muniMap = new Map(municipiosRes.data?.map(m => [m.id_municipio, m]) || []);
      const regimenMap = new Map(regimenesRes.data?.map(r => [r.id_regimen, r.nombre_regimen]) || []);
      const eapbMap = new Map(eapbRes.data?.map(e => [e.id_eapb, e.nombre_eapb]) || []);
      const deptoMap = new Map(departamentosData?.map(d => [d.id_departamento, d.nombre_departamento]) || []);

      // Transformar datos para que coincidan con la interfaz
      const atencionesFormatted: Atencion[] = (atenciones || []).map((atencion: any) => {
        const diagnostico = diagMap.get(atencion.id_diagnostico);
        const municipio = muniMap.get(atencion.id_municipio);
        const departamento = municipio ? deptoMap.get(municipio.id_departamento) : null;

        return {
          id_atencion: atencion.id_atencion,
          fecha_atencion: atencion.fecha_atencion,
          sexo: atencion.sexo,
          edad: atencion.edad,
          periodo: atencion.periodo || 'N/A',
          codigo_diagnostico: diagnostico?.codigo_diagnostico || 'N/A',
          nombre_diagnostico: diagnostico?.nombre_diagnostico || 'N/A',
          nombre_municipio: municipio?.nombre_municipio || 'N/A',
          nombre_departamento: departamento || 'N/A',
          nombre_regimen: regimenMap.get(atencion.id_regimen) || 'N/A',
          nombre_eapb: eapbMap.get(atencion.id_eapb) || 'N/A'
        };
      });

      const totalPages = Math.ceil((count || 0) / limit);
      return {
        atenciones: atencionesFormatted,
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages,
          hasPrev: page > 1,
          hasNext: page < totalPages
        }
      };
    } catch (error) {
      console.error('Error obteniendo atenciones:', error);
      throw error;
    }
  }

  // Obtener diagnósticos
  async getDiagnosticos(limit: number = 50): Promise<Diagnostico[]> {
    try {
      // Primero obtener diagnósticos básicos
      const { data: diagnosticos, error } = await supabase
        .from('diagnosticos')
        .select('*')
        .order('id_diagnostico', { ascending: false })
        .limit(limit);

      if (error) throw error;

      // Obtener estadísticas de atenciones para cada diagnóstico
      const diagnosticosConStats = await Promise.all(
        (diagnosticos || []).map(async (diag: any) => {
          const { data: atenciones, error: atencionesError } = await supabase
            .from('atenciones_urgencias')
            .select('sexo, edad')
            .eq('id_diagnostico', diag.id_diagnostico);

          if (atencionesError) {
            console.error('Error obteniendo atenciones para diagnóstico:', atencionesError);
            return {
              ...diag,
              total_atenciones: 0,
              edad_promedio: 0,
              porcentaje: 0,
              atenciones_masculino: 0,
              atenciones_femenino: 0
            };
          }

          const totalAtenciones = atenciones?.length || 0;
          const edades = atenciones?.map(a => a.edad).filter(e => e) || [];
          const edadPromedio = edades.length > 0 ? 
            edades.reduce((sum, edad) => sum + edad, 0) / edades.length : 0;
          
          const atencionesMasculino = atenciones?.filter(a => a.sexo === 'M').length || 0;
          const atencionesFemenino = atenciones?.filter(a => a.sexo === 'F').length || 0;

          return {
            ...diag,
            total_atenciones: totalAtenciones,
            edad_promedio: edadPromedio,
            porcentaje: 0, // Se calculará después
            atenciones_masculino: atencionesMasculino,
            atenciones_femenino: atencionesFemenino
          };
        })
      );

      // Calcular porcentajes
      const totalGeneral = diagnosticosConStats.reduce((sum, d) => sum + d.total_atenciones, 0);
      const diagnosticosConPorcentajes = diagnosticosConStats.map(diag => ({
        ...diag,
        porcentaje: totalGeneral > 0 ? Math.round((diag.total_atenciones / totalGeneral) * 100 * 100) / 100 : 0
      }));

      return diagnosticosConPorcentajes.sort((a, b) => b.total_atenciones - a.total_atenciones);
    } catch (error) {
      console.error('Error obteniendo diagnósticos:', error);
      throw error;
    }
  }

  // Obtener evolución temporal
  async getEvolucionTemporal(): Promise<any> {
    try {
      const { data: atenciones, error } = await supabase
        .from('atenciones_urgencias')
        .select('fecha_atencion')
        .order('fecha_atencion', { ascending: true });

      if (error) throw error;

      // Agrupar por mes
      const porMes: { [key: string]: number } = {};
      atenciones?.forEach((atencion: any) => {
        const fecha = new Date(atencion.fecha_atencion);
        const mes = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;
        porMes[mes] = (porMes[mes] || 0) + 1;
      });

      return Object.entries(porMes)
        .map(([mes, cantidad]) => ({
          mes,
          cantidad
        }))
        .sort((a, b) => a.mes.localeCompare(b.mes));
    } catch (error) {
      console.error('Error obteniendo evolución temporal:', error);
      throw error;
    }
  }
}

// Exportar instancia única de la API
export const api = new SupabaseAPI();
