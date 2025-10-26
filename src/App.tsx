import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { DashboardPrincipal } from './components/DashboardPrincipal';
import { Dashboard } from './components/Dashboard';
import { AtencionesTable } from './components/AtencionesTable';
import { EstadisticasPage } from './components/EstadisticasPage';
import { DiagnosticosPage } from './components/DiagnosticosPage';
import ConsultasPage from './components/ConsultasPage';
import { ComparativoPage } from './components/ComparativoPage';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { DataProvider, useDataContext } from './contexts/DataContext';
import './App.css';

// Componente wrapper que usa el contexto
const AppWithContext = ({ children }: { children: React.ReactNode }) => {
  const { dataType } = useDataContext();
  
  // Si no hay tipo seleccionado, mostrar selección inicial
  if (!dataType) {
    return children as React.ReactElement;
  }
  
  // Si hay tipo seleccionado, mostrar navbar y sidebar
  return (
    <div className="App">
      <Navbar />
      <div className="app-container">
        <Sidebar />
        <main className="main-content">
          {children}
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    <DataProvider>
      <Router>
        <Routes>
          <Route path="/" element={<DashboardPrincipal />} />
          <Route path="/dashboard" element={
            <AppWithContext>
              <Dashboard />
            </AppWithContext>
          } />
          <Route path="/atenciones" element={
            <AppWithContext>
              <AtencionesTable />
            </AppWithContext>
          } />
          <Route path="/estadisticas" element={
            <AppWithContext>
              <EstadisticasPage />
            </AppWithContext>
          } />
          <Route path="/diagnosticos" element={
            <AppWithContext>
              <DiagnosticosPage />
            </AppWithContext>
          } />
          <Route path="/consultas" element={
            <AppWithContext>
              <ConsultasPage />
            </AppWithContext>
          } />
          <Route path="/comparativo" element={
            <AppWithContext>
              <ComparativoPage />
            </AppWithContext>
          } />
        </Routes>
      </Router>
    </DataProvider>
  );
}

export default App;