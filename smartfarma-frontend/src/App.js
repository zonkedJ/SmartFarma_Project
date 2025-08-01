import React, { useState } from 'react';
import './App.css';
import PacientesView from './components/PacientesView';
import MedicamentosView from './components/MedicamentosView';
import VentasView from './components/VentasView';
import HistorialVentasView from './components/HistorialVentasView';
import ProveedoresView from './components/ProveedoresView';

function App() {
  const [activeView, setActiveView] = useState('welcome');
  const [message, setMessage] = useState('');
  const [showMessage, setShowMessage] = useState(false);

  // Función para mostrar mensajes globales
  const mostrarMensaje = (msg) => {
    setMessage(msg);
    setShowMessage(true);
    setTimeout(() => {
      setShowMessage(false);
      setMessage('');
    }, 3000);
  };

  return (
    <div className="app-container">
      {/* Encabezado superior con el título de la app */}
      <header className="app-header-minimal">
        <h1 className="app-title-button" onClick={() => setActiveView('welcome')}>SmartFarma</h1>
      </header>

      {/* Contenido principal */}
      <div className="main-content">
        {activeView === 'welcome' && (
          <div className="welcome-message">
            <h2>Bienvenido a SmartFarma</h2>
            <p>Tu software de farmacia moderno.</p>

            {/* AQUI ES DONDE HEMOS MOVIDO LA NAVEGACIÓN */}
            {/* Esta sección de navegación solo se mostrará en la vista de bienvenida */}
            <nav className="main-nav-buttons welcome-nav-buttons"> {/* Añadí una clase extra para estilos si los necesitas */}
              <ul className="nav-list">
                <li>
                  <button
                    onClick={() => setActiveView('pacientes')}
                    className={activeView === 'pacientes' ? 'active' : ''}
                  >
                    Pacientes
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveView('medicamentos')}
                    className={activeView === 'medicamentos' ? 'active' : ''}
                  >
                    Medicamentos
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveView('ventas')}
                    className={activeView === 'ventas' ? 'active' : ''}
                  >
                    Ventas
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveView('historial_ventas')}
                    className={activeView === 'historial_ventas' ? 'active' : ''}
                  >
                    Historial de Ventas
                  </button>
                </li>
                {/* Botón de Proveedores al final, como solicitaste */}
                <li>
                  <button
                    onClick={() => setActiveView('proveedores')}
                    className={activeView === 'proveedores' ? 'active' : ''}
                  >
                    Proveedores
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        )}

        {/* Las vistas de cada sección */}
        {activeView === 'pacientes' && <PacientesView mostrarMensaje={mostrarMensaje} />}
        {activeView === 'medicamentos' && <MedicamentosView mostrarMensaje={mostrarMensaje} />}
        {activeView === 'proveedores' && <ProveedoresView mostrarMensaje={mostrarMensaje} />}
        {activeView === 'ventas' && <VentasView mostrarMensaje={mostrarMensaje} />}
        {activeView === 'historial_ventas' && <HistorialVentasView mostrarMensaje={mostrarMensaje} />}
      </div>

      {/* Mensaje global (notificaciones) */}
      <div className={`global-message ${showMessage ? 'show' : ''}`}>
        {message}
      </div>
    </div>
  );
}

export default App;