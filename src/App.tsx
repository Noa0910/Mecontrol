import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Dashboard } from './components/Dashboard';
import { AtencionesTable } from './components/AtencionesTable';
import { EstadisticasPage } from './components/EstadisticasPage';
import { DiagnosticosPage } from './components/DiagnosticosPage';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <div className="app-container">
          <Sidebar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/atenciones" element={<AtencionesTable />} />
              <Route path="/estadisticas" element={<EstadisticasPage />} />
              <Route path="/diagnosticos" element={<DiagnosticosPage />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;