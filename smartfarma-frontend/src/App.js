// smartfarma-frontend/src/App.js

import React, { useState } from 'react';
import './index.css'; // Tus estilos CSS globales

// Importa los componentes de las diferentes vistas
import PacientesView from './components/PacientesView';
import MedicamentosView from './components/MedicamentosView';
import VentasView from './components/VentasView';
import HistorialVentasView from './components/HistorialVentasView'; // NUEVO: Importa el componente de Historial de Ventas

function App() {
  // Estado para controlar la vista actual: 'pacientes', 'medicamentos', 'ventas' o 'historialVentas'
  const [currentView, setCurrentView] = useState('pacientes'); // Inicia mostrando la vista de pacientes
  const [mensajeGlobal, setMensajeGlobal] = useState(''); // Estado para mensajes globales en la aplicación

  // Función para establecer el mensaje global y que desaparezca después de un tiempo
  const mostrarMensaje = (msg) => {
    setMensajeGlobal(msg);
    setTimeout(() => {
      setMensajeGlobal('');
    }, 5000); // El mensaje desaparecerá después de 5 segundos
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Bienvenido a SmartFarma</h1>
        <p>Tu software de farmacia moderno.</p>
        <nav style={{ marginTop: '20px' }}>
          {/* Botón para la vista de Pacientes */}
          <button
            onClick={() => setCurrentView('pacientes')}
            style={{
              padding: '10px 20px',
              marginRight: '10px',
              // Cambia el estilo si es la vista activa
              backgroundColor: currentView === 'pacientes' ? 'var(--color-secondary)' : 'var(--color-primary)',
              color: currentView === 'pacientes' ? 'var(--color-text-dark)' : 'var(--color-text-light)',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            Pacientes
          </button>
          {/* Botón para la vista de Medicamentos */}
          <button
            onClick={() => setCurrentView('medicamentos')}
            style={{
              padding: '10px 20px',
              backgroundColor: currentView === 'medicamentos' ? 'var(--color-secondary)' : 'var(--color-primary)',
              color: currentView === 'medicamentos' ? 'var(--color-text-dark)' : 'var(--color-text-light)',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            Medicamentos
          </button>
          {/* Botón para la vista de Ventas */}
          <button
            onClick={() => setCurrentView('ventas')}
            style={{
              padding: '10px 20px',
              marginLeft: '10px', // Un poco de espacio entre botones
              backgroundColor: currentView === 'ventas' ? 'var(--color-secondary)' : 'var(--color-primary)',
              color: currentView === 'ventas' ? 'var(--color-text-dark)' : 'var(--color-text-light)',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            Ventas
          </button>
          {/* NUEVO: Botón para la vista de Historial de Ventas */}
          <button
            onClick={() => setCurrentView('historialVentas')}
            style={{
              padding: '10px 20px',
              marginLeft: '10px',
              backgroundColor: currentView === 'historialVentas' ? 'var(--color-secondary)' : 'var(--color-primary)',
              color: currentView === 'historialVentas' ? 'var(--color-text-dark)' : 'var(--color-text-light)',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            Historial de Ventas
          </button>
        </nav>
        {/* Muestra el mensaje global si existe */}
        {mensajeGlobal && <p style={{ color: 'var(--color-text-light)', marginTop: '10px' }}>{mensajeGlobal}</p>}
      </header>

      <main style={{ padding: '20px', backgroundColor: 'var(--color-background)' }}>
        {/* Renderiza el componente de vista actual basado en el estado 'currentView' */}
        {currentView === 'pacientes' && <PacientesView mostrarMensaje={mostrarMensaje} />}
        {currentView === 'medicamentos' && <MedicamentosView mostrarMensaje={mostrarMensaje} />}
        {currentView === 'ventas' && <VentasView mostrarMensaje={mostrarMensaje} />}
        {currentView === 'historialVentas' && <HistorialVentasView mostrarMensaje={mostrarMensaje} />}
      </main>
    </div>
  );
}

export default App;

