import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Home, 
  Users, 
  BarChart3, 
  Stethoscope, 
  Database,
  Search,
  LogOut
} from 'lucide-react';
import { useDataContext } from '../contexts/DataContext';

export const Sidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { dataType, setDataType } = useDataContext();

  const menuItems = [
    {
      path: '/dashboard',
      icon: Home,
      label: 'Dashboard',
      description: 'Vista general del sistema'
    },
    {
      path: '/atenciones',
      icon: Users,
      label: 'Atenciones',
      description: 'Registros de atenciones'
    },
    {
      path: '/estadisticas',
      icon: BarChart3,
      label: 'Estadísticas',
      description: 'Análisis y gráficos'
    },
    {
      path: '/diagnosticos',
      icon: Stethoscope,
      label: 'Diagnósticos',
      description: 'Top diagnósticos'
    },
    {
      path: '/consultas',
      icon: Search,
      label: 'Consultas Avanzadas',
      description: 'Filtros y análisis personalizado'
    }
  ];

  const handleLogout = () => {
    setDataType('global'); // Reset al tipo por defecto
    navigate('/');
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Navegación</h2>
          <p className="text-sm text-gray-600">Sistema de Morbilidad</p>
        </div>
      </div>

      {/* Indicador de tipo de datos actual */}
      <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <p className="text-xs font-semibold mb-2 uppercase tracking-wide opacity-90">Datos Actuales</p>
        <div className="flex items-center justify-center">
          <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
            <span className="text-sm font-bold">
              {dataType === 'global' ? '🌍 Datos Globales' : '🏢 Datos de Empresa'}
            </span>
          </div>
        </div>
      </div>
      
      <ul className="sidebar-menu">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`sidebar-link ${isActive(item.path) ? 'active' : ''}`}
                title={item.description}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
      
      <div className="sidebar-footer">
        <div className="p-4 border-t border-gray-200 space-y-2">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Database className="w-4 h-4" />
            <span>Base de datos activa</span>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-all"
          >
            <LogOut className="w-4 h-4" />
            Cambiar Vista
          </button>
        </div>
      </div>
    </aside>
  );
};
