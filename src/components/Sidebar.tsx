import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Users, 
  BarChart3, 
  Stethoscope, 
  Database
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const location = useLocation();

  const menuItems = [
    {
      path: '/',
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
    }
  ];

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
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Database className="w-4 h-4" />
            <span>Base de datos activa</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
