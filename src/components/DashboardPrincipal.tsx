import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Globe, Building2, ArrowRight, BarChart3, AlertCircle } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { useDataContext } from '../contexts/DataContext';
import { api } from '../services/supabaseApi';

export const DashboardPrincipal: React.FC = () => {
  const navigate = useNavigate();
  const { setDataType } = useDataContext();
  const [selectedType, setSelectedType] = useState<'global' | 'empresa' | 'comparativo' | null>(null);
  const [analisisData, setAnalisisData] = useState<any>(null);
  const [cargandoAnalisis, setCargandoAnalisis] = useState(false);

  useEffect(() => {
    const cargarAnalisis = async () => {
      try {
        setCargandoAnalisis(true);
        
        const [global, empresa] = await Promise.all([
          api.getEstadisticas('global'),
          api.getEstadisticas('empresa')
        ]);

        const porcentajeEmpresa = global.totalAtenciones > 0 
          ? ((empresa.totalAtenciones / global.totalAtenciones) * 100).toFixed(2)
          : '0';

        // Obtener más datos para el análisis
        const [empresaDeptos, empresaDemo] = await Promise.all([
          api.getEstadisticasDepartamentos('empresa'),
          api.getEstadisticasDemograficas('empresa')
        ]);

        // Calcular insights
        const promedioEdad = empresaDemo.porEdad || [];
        
        // Causas más comunes basadas en departamentos
        const causasComunes = empresaDeptos?.slice(0, 3).map((d: any) => d.nombre_departamento) || [];
        
        // Grupos de edad
        const edadMayor = promedioEdad.sort((a: any, b: any) => b.cantidad - a.cantidad)[0];
        const edadMenor = promedioEdad.sort((a: any, b: any) => a.cantidad - b.cantidad)[0];

        setAnalisisData({
          porcentajeEmpresa: parseFloat(porcentajeEmpresa),
          totalGlobal: global.totalAtenciones,
          totalEmpresa: empresa.totalAtenciones,
          departamentosGlobal: global.totalDepartamentos,
          departamentosEmpresa: empresa.totalDepartamentos,
          diagnosticosGlobal: global.totalDiagnosticos,
          diagnosticosEmpresa: empresa.totalDiagnosticos,
          causasComunes,
          edadMayor,
          edadMenor,
          totalDepartamentosEmpresa: empresaDeptos?.length || 0,
          distribucionEdad: empresaDemo.porEdad || []
        });
      } catch (error) {
        console.error('Error cargando análisis:', error);
      } finally {
        setCargandoAnalisis(false);
      }
    };

    cargarAnalisis();
  }, []);

  const handleSelect = (type: 'global' | 'empresa') => {
    // Establecer el tipo en el contexto
    setDataType(type);
    // Redirigir al dashboard
    navigate('/dashboard');
  };

  return (
    <div className="dashboard" style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '40px'
    }}>
      <div className="container" style={{ maxWidth: '1600px', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <h1 style={{ 
            fontSize: '3rem', 
            fontWeight: 'bold', 
            color: 'white', 
            marginBottom: '20px',
            textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
          }}>
            Sistema de Morbilidad
          </h1>
          <p style={{ 
            fontSize: '1.5rem', 
            color: 'rgba(255,255,255,0.9)',
            textShadow: '1px 1px 2px rgba(0,0,0,0.2)'
          }}>
            Selecciona el tipo de datos que deseas consultar
          </p>
        </div>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '350px 1fr', 
          gap: '40px',
          marginTop: '60px',
          alignItems: 'stretch'
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
          {/* Opción Global */}
          <div 
            onMouseEnter={() => setSelectedType('global')}
            onMouseLeave={() => setSelectedType(null)}
            onClick={() => handleSelect('global')}
            style={{
              background: selectedType === 'global' 
                ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'
                : selectedType === 'empresa'
                ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                : 'white',
              borderRadius: '20px',
              padding: '40px',
              boxShadow: selectedType === 'global'
                ? '0 20px 60px rgba(59, 130, 246, 0.5)'
                : '0 10px 40px rgba(0,0,0,0.2)',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              transform: selectedType === 'global' ? 'scale(1.05)' : 'scale(1)',
              border: selectedType === 'global' ? '3px solid #1d4ed8' : '3px solid transparent'
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
              <div style={{
                width: '100px',
                height: '100px',
                borderRadius: '50%',
                background: selectedType === 'global' 
                  ? 'rgba(255,255,255,0.3)'
                  : 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 10px 30px rgba(59, 130, 246, 0.3)'
              }}>
                <Globe size={50} color={selectedType === 'global' ? 'white' : '#3b82f6'} />
              </div>
              
              <h2 style={{
                fontSize: '2rem',
                fontWeight: 'bold',
                color: selectedType === 'global' ? 'white' : '#3b82f6',
                margin: 0
              }}>
                Datos Globales
              </h2>
              
              <p style={{
                fontSize: '1.2rem',
                color: selectedType === 'global' ? 'rgba(255,255,255,0.9)' : '#6b7280',
                textAlign: 'center',
                margin: 0
              }}>
                Accede a todos los datos del sistema
              </p>
              
              <div style={{
                background: selectedType === 'global' 
                  ? 'rgba(255,255,255,0.2)'
                  : '#e0f2fe',
                padding: '15px 30px',
                borderRadius: '50px',
                color: selectedType === 'global' ? 'white' : '#0369a1',
                fontWeight: 'bold',
                fontSize: '1.1rem'
              }}>
                ~32K registros
              </div>
              
              <button
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  marginTop: '20px',
                  padding: '15px 30px',
                  background: selectedType === 'global' 
                    ? 'white'
                    : 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                  color: selectedType === 'global' ? '#3b82f6' : 'white',
                  border: 'none',
                  borderRadius: '50px',
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 5px 15px rgba(0,0,0,0.2)'
                }}
              >
                Entrar
                <ArrowRight size={20} />
              </button>
            </div>
          </div>

          {/* Opción Empresa */}
          <div 
            onMouseEnter={() => setSelectedType('empresa')}
            onMouseLeave={() => setSelectedType(null)}
            onClick={() => handleSelect('empresa')}
            style={{
              background: selectedType === 'empresa' 
                ? 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)'
                : selectedType === 'global'
                ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                : 'white',
              borderRadius: '20px',
              padding: '40px',
              boxShadow: selectedType === 'empresa'
                ? '0 20px 60px rgba(139, 92, 246, 0.5)'
                : '0 10px 40px rgba(0,0,0,0.2)',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              transform: selectedType === 'empresa' ? 'scale(1.05)' : 'scale(1)',
              border: selectedType === 'empresa' ? '3px solid #5b21b6' : '3px solid transparent'
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
              <div style={{
                width: '100px',
                height: '100px',
                borderRadius: '50%',
                background: selectedType === 'empresa' 
                  ? 'rgba(255,255,255,0.3)'
                  : 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 10px 30px rgba(139, 92, 246, 0.3)'
              }}>
                <Building2 size={50} color={selectedType === 'empresa' ? 'white' : '#8b5cf6'} />
              </div>
              
              <h2 style={{
                fontSize: '2rem',
                fontWeight: 'bold',
                color: selectedType === 'empresa' ? 'white' : '#8b5cf6',
                margin: 0
              }}>
                Datos de Empresa
              </h2>
              
              <p style={{
                fontSize: '1.2rem',
                color: selectedType === 'empresa' ? 'rgba(255,255,255,0.9)' : '#6b7280',
                textAlign: 'center',
                margin: 0
              }}>
                Accede a los datos de tu empresa
              </p>
              
              <div style={{
                background: selectedType === 'empresa' 
                  ? 'rgba(255,255,255,0.2)'
                  : '#f5f3ff',
                padding: '15px 30px',
                borderRadius: '50px',
                color: selectedType === 'empresa' ? 'white' : '#5b21b6',
                fontWeight: 'bold',
                fontSize: '1.1rem'
              }}>
                ~3K registros
              </div>
              
              <button
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  marginTop: '20px',
                  padding: '15px 30px',
                  background: selectedType === 'empresa' 
                    ? 'white'
                    : 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                  color: selectedType === 'empresa' ? '#8b5cf6' : 'white',
                  border: 'none',
                  borderRadius: '50px',
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 5px 15px rgba(0,0,0,0.2)'
                }}
              >
                Entrar
                <ArrowRight size={20} />
              </button>
            </div>
          </div>
          </div>

          {/* Opción Comparativo */}
          <div style={{ display: 'flex', alignItems: 'stretch' }}>
          <div 
            onMouseEnter={() => setSelectedType('comparativo')}
            onMouseLeave={() => setSelectedType(null)}
            onClick={() => {
              // Para comparativo, abrimos una vista especial
              setDataType('global'); // Por defecto global
              navigate('/comparativo');
            }}
            style={{
              background: selectedType === 'comparativo' 
                ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '20px',
              padding: '40px',
              boxShadow: selectedType === 'comparativo'
                ? '0 20px 60px rgba(16, 185, 129, 0.5)'
                : '0 10px 40px rgba(0,0,0,0.2)',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              transform: selectedType === 'comparativo' ? 'scale(1.05)' : 'scale(1)',
              border: selectedType === 'comparativo' ? '3px solid #047857' : '3px solid transparent'
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
              <div style={{
                width: '100px',
                height: '100px',
                borderRadius: '50%',
                background: selectedType === 'comparativo' 
                  ? 'rgba(255,255,255,0.3)'
                  : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 10px 30px rgba(16, 185, 129, 0.3)'
              }}>
                <BarChart3 size={50} color={selectedType === 'comparativo' ? 'white' : '#10b981'} />
              </div>
              
              <h2 style={{
                fontSize: '2rem',
                fontWeight: 'bold',
                color: selectedType === 'comparativo' ? 'white' : '#10b981',
                margin: 0
              }}>
                Comparativo
              </h2>
              
              <p style={{
                fontSize: '1.2rem',
                color: selectedType === 'comparativo' ? 'rgba(255,255,255,0.9)' : '#6b7280',
                textAlign: 'center',
                margin: 0
              }}>
                Compara datos globales vs empresa
              </p>

              {/* Análisis Comparativo */}
              {cargandoAnalisis ? (
                <div style={{ textAlign: 'center', color: selectedType === 'comparativo' ? 'white' : '#6b7280' }}>
                  <div className="animate-spin">📊</div>
                  <p>Cargando análisis...</p>
                </div>
              ) : analisisData ? (
                <div style={{ width: '100%' }}>
                  <div style={{ 
                    width: '100%',
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr 1fr',
                    gap: '15px',
                    marginTop: '10px'
                  }}>
                    {/* Columna 1: Estadísticas Principales */}
                    <div style={{ 
                      background: selectedType === 'comparativo' ? 'rgba(255,255,255,0.15)' : 'rgba(16, 185, 129, 0.1)',
                      borderRadius: '15px',
                      padding: '20px'
                    }}>
                      <div style={{ 
                        fontSize: '2.5rem', 
                        fontWeight: 'bold', 
                        color: selectedType === 'comparativo' ? 'white' : '#10b981',
                        marginBottom: '10px'
                      }}>
                        {analisisData.porcentajeEmpresa}%
                      </div>
                      <div style={{ 
                        fontSize: '0.85rem', 
                        color: selectedType === 'comparativo' ? 'rgba(255,255,255,0.8)' : '#065f46',
                        marginBottom: '20px'
                      }}>
                        del total global
                      </div>
                      
                      <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: '1fr 1fr', 
                        gap: '10px'
                      }}>
                        <div>
                          <div style={{ fontSize: '1.3rem', fontWeight: 'bold', color: selectedType === 'comparativo' ? 'white' : '#10b981' }}>
                            {analisisData.totalEmpresa?.toLocaleString()}
                          </div>
                          <div style={{ fontSize: '0.7rem', color: selectedType === 'comparativo' ? 'rgba(255,255,255,0.7)' : '#6b7280' }}>
                            Empresa
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize: '1.3rem', fontWeight: 'bold', color: selectedType === 'comparativo' ? 'white' : '#10b981' }}>
                            {analisisData.totalGlobal?.toLocaleString()}
                          </div>
                          <div style={{ fontSize: '0.7rem', color: selectedType === 'comparativo' ? 'rgba(255,255,255,0.7)' : '#6b7280' }}>
                            Global
                          </div>
                        </div>
                      </div>

                      {analisisData.porcentajeEmpresa < 10 && (
                        <div style={{
                          background: selectedType === 'comparativo' ? 'rgba(239, 68, 68, 0.3)' : '#fee2e2',
                          color: selectedType === 'comparativo' ? 'white' : '#991b1b',
                          padding: '10px',
                          borderRadius: '8px',
                          fontSize: '0.75rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px',
                          marginTop: '15px'
                        }}>
                          <AlertCircle size={14} />
                          Menos del 10% del total
                        </div>
                      )}
                    </div>

                    {/* Columna 2: Causas y Edad */}
                    <div style={{ 
                      background: selectedType === 'comparativo' ? 'rgba(255,255,255,0.15)' : 'rgba(16, 185, 129, 0.1)',
                      borderRadius: '15px',
                      padding: '20px'
                    }}>
                      <div style={{ fontSize: '0.95rem', fontWeight: 'bold', marginBottom: '10px', color: selectedType === 'comparativo' ? 'white' : '#10b981' }}>
                        📍 Causas Más Comunes:
                      </div>
                      <div style={{ fontSize: '0.75rem', color: selectedType === 'comparativo' ? 'rgba(255,255,255,0.9)' : '#6b7280', marginBottom: '20px' }}>
                        {analisisData.causasComunes?.map((causa: string, idx: number) => (
                          <div key={idx} style={{ marginBottom: '5px' }}>• {causa}</div>
                        ))}
                      </div>

                      {analisisData.edadMayor && (
                        <>
                          <div style={{ fontSize: '0.95rem', fontWeight: 'bold', marginBottom: '10px', color: selectedType === 'comparativo' ? 'white' : '#10b981' }}>
                            👥 Mayor Incidencia:
                          </div>
                          <div style={{ fontSize: '0.75rem', color: selectedType === 'comparativo' ? 'rgba(255,255,255,0.9)' : '#6b7280' }}>
                            {analisisData.edadMayor.grupo_edad}<br/>
                            <span style={{ fontWeight: 'bold' }}>{analisisData.edadMayor.cantidad} atenciones</span>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Columna 3: Recomendaciones */}
                    <div style={{ 
                      background: selectedType === 'comparativo' ? 'rgba(255,255,255,0.15)' : 'rgba(16, 185, 129, 0.1)',
                      borderRadius: '15px',
                      padding: '20px'
                    }}>
                      <div style={{ fontSize: '0.95rem', fontWeight: 'bold', marginBottom: '10px', color: selectedType === 'comparativo' ? 'white' : '#10b981' }}>
                        🏥 Prevención:
                      </div>
                      <div style={{ fontSize: '0.75rem', color: selectedType === 'comparativo' ? 'rgba(255,255,255,0.9)' : '#6b7280', lineHeight: '1.5' }}>
                        {analisisData.porcentajeEmpresa < 10 ? (
                          <div>
                            • Implementar programas de prevención<br/>
                            • Campañas de salud pública<br/>
                            • Vigilancia epidemiológica
                          </div>
                        ) : (
                          'Continuar con programas preventivos y seguimiento epidemiológico.'
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Gráficas Comparativas */}
                  {analisisData.distribucionEdad && analisisData.distribucionEdad.length > 0 && (
                    <div style={{ 
                      width: '100%',
                      marginTop: '20px',
                      background: selectedType === 'comparativo' ? 'rgba(255,255,255,0.15)' : 'rgba(16, 185, 129, 0.1)',
                      borderRadius: '15px',
                      padding: '20px'
                    }}>
                      <div style={{ fontSize: '0.95rem', fontWeight: 'bold', marginBottom: '15px', color: selectedType === 'comparativo' ? 'white' : '#10b981' }}>
                        📊 Distribución por Grupos de Edad
                      </div>
                      <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={analisisData.distribucionEdad}>
                          <XAxis dataKey="grupo_edad" angle={-45} textAnchor="end" fontSize={10} />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="cantidad" fill="#10b981" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>
              ) : (
                <p style={{ color: selectedType === 'comparativo' ? 'rgba(255,255,255,0.9)' : '#6b7280' }}>
                  Error cargando datos
                </p>
              )}
              
              <button
                onClick={() => navigate('/comparativo')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  marginTop: '20px',
                  padding: '15px 30px',
                  background: selectedType === 'comparativo' 
                    ? 'white'
                    : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: selectedType === 'comparativo' ? '#10b981' : 'white',
                  border: 'none',
                  borderRadius: '50px',
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 5px 15px rgba(0,0,0,0.2)'
                }}
              >
                Ver Análisis Detallado
                <ArrowRight size={20} />
              </button>
            </div>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
};

