import React from 'react';
import { Activity, Database, RefreshCw } from 'lucide-react';

interface NavbarProps {
  lastUpdate?: string;
  isOnline?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  lastUpdate, 
  isOnline = true 
}) => {
  return (
    <nav className="navbar">
      <div className="navbar-content">
        <div className="flex items-center gap-3">
          <Activity className="w-8 h-8" />
          <h1>Sistema de Morbilidad en Urgencias</h1>
        </div>
        
        <div className="navbar-status">
          <div className="status-indicator">
            <div className={`status-dot ${isOnline ? 'bg-green-400' : 'bg-red-400'}`}></div>
            <span>{isOnline ? 'Conectado' : 'Desconectado'}</span>
          </div>
          
          {lastUpdate && (
            <div className="status-indicator">
              <RefreshCw className="w-4 h-4" />
              <span>Última actualización: {new Date(lastUpdate).toLocaleString()}</span>
            </div>
          )}
          
          <div className="status-indicator">
            <Database className="w-4 h-4" />
            <span>MySQL</span>
          </div>
        </div>
      </div>
    </nav>
  );
};




