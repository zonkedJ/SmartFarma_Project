// smartfarma-frontend/src/App.js

import React, { useState } from 'react';
import './App.css';
import PacientesView from './components/PacientesView';
import MedicamentosView from './components/MedicamentosView';
import VentasView from './components/VentasView';
import HistorialVentasView from './components/HistorialVentasView';

function App() {
  const [activeView, setActiveView] = useState('welcome'); // 'welcome', 'pacientes', 'medicamentos', 'ventas', 'historial_ventas'
  const [message, setMessage] = useState('');
  const [showMessage, setShowMessage] = useState(false);

  // Función para mostrar mensajes globales
  const mostrarMensaje = (msg) => {
    setMessage(msg);
    setShowMessage(true);
    setTimeout(() => {
      setShowMessage(false);
      setMessage('');
    }, 3000); // El mensaje desaparece después de 3 segundos
  };

  return (
    <div className="app-container">
      {/* Encabezado superior con el título como botón para volver a Bienvenido */}
      <header className="app-header-minimal">
        <button onClick={() => setActiveView('welcome')} className="app-title-button"> {/* Título como botón */}
          <h1 className="app-title">SmartFarma</h1>
        </button>
      </header>

      {/* Contenido principal */}
      <div className="main-content">
        {activeView === 'welcome' && (
          <div className="welcome-message">
            <h2>Bienvenido a SmartFarma</h2>
            <p>Tu software de farmacia moderno.</p>
            {/* Navegación ahora dentro del welcome-message */}
            <nav className="main-nav-buttons"> {/* Clase para los botones de navegación */}
              <ul className="nav-list">
                {/* El botón de "Bienvenido" no es necesario aquí si el título ya lo hace */}
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
              </ul>
            </nav>
          </div>
        )}
        {activeView === 'pacientes' && <PacientesView mostrarMensaje={mostrarMensaje} />}
        {activeView === 'medicamentos' && <MedicamentosView mostrarMensaje={mostrarMensaje} />}
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
