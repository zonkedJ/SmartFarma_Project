// smartfarma-frontend/src/components/HistorialVentasView.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';

function HistorialVentasView({ mostrarMensaje }) {
  const [historial, setHistorial] = useState([]);
  const [ventaExpandida, setVentaExpandida] = useState(null);

  // Función para cargar el historial de ventas
  const cargarHistorialVentas = async () => {
    try {
      const response = await axios.get('http://localhost:5000/ventas_historial');
      setHistorial(response.data);
      mostrarMensaje('Historial de ventas cargado exitosamente.');
    } catch (error) {
      console.error('Error al cargar historial de ventas:', error);
      if (error.response) {
          mostrarMensaje(`Error al cargar historial: ${error.response.status} - ${error.response.data.message || error.message}.`);
      } else if (error.request) {
          mostrarMensaje('Error de conexión al backend. Asegúrate que el servidor de SmartFarma esté corriendo.');
      } else {
          mostrarMensaje('Error al cargar historial de ventas. Verifica que el backend tenga la ruta /ventas_historial.');
      }
    }
  };

  // Cargar historial de ventas al inicio del componente (solo una vez)
  useEffect(() => {
    cargarHistorialVentas();
  }, []); // ¡CORRECCIÓN AQUÍ! Array vacío para que se ejecute solo una vez al montar.

  // Función para expandir/colapsar los detalles de una venta
  const toggleDetalles = (ventaId) => {
    setVentaExpandida(ventaExpandida === ventaId ? null : ventaId);
  };

  return (
    <div>
      <h2>Historial de Ventas:</h2>
      {historial.length === 0 ? (
        <p>No hay ventas registradas.</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            marginTop: '20px',
            backgroundColor: 'var(--color-text-light)',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--color-primary)' }}>
                <th style={{ padding: '12px 15px', textAlign: 'left', backgroundColor: 'var(--color-primary)', color: 'var(--color-text-light)', borderTopLeftRadius: '8px' }}>ID Venta</th>
                <th style={{ padding: '12px 15px', textAlign: 'left', backgroundColor: 'var(--color-primary)', color: 'var(--color-text-light)' }}>Fecha</th>
                <th style={{ padding: '12px 15px', textAlign: 'left', backgroundColor: 'var(--color-primary)', color: 'var(--color-text-light)' }}>Paciente</th>
                <th style={{ padding: '12px 15px', textAlign: 'right', backgroundColor: 'var(--color-primary)', color: 'var(--color-text-light)' }}>Total</th>
                <th style={{ padding: '12px 15px', textAlign: 'center', backgroundColor: 'var(--color-primary)', color: 'var(--color-text-light)', borderTopRightRadius: '8px' }}>Detalles</th>
              </tr>
            </thead>
            <tbody>
              {historial.map(venta => (
                <React.Fragment key={venta.id}>
                  <tr style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '10px 15px', textAlign: 'left', color: 'var(--color-text-dark)' }}>{venta.id}</td>
                    <td style={{ padding: '10px 15px', textAlign: 'left', color: 'var(--color-text-dark)' }}>
                      {new Date(venta.fecha_venta).toLocaleDateString()} {new Date(venta.fecha_venta).toLocaleTimeString()}
                    </td>
                    <td style={{ padding: '10px 15px', textAlign: 'left', color: 'var(--color-text-dark)' }}>{venta.paciente_nombre}</td>
                    <td style={{ padding: '10px 15px', textAlign: 'right', color: 'var(--color-text-dark)', fontWeight: 'bold' }}>${venta.total_venta}</td>
                    <td style={{ padding: '10px 15px', textAlign: 'center', color: 'var(--color-text-dark)' }}>
                      <button onClick={() => toggleDetalles(venta.id)} style={{
                        padding: '5px 10px', backgroundColor: 'var(--color-secondary)',
                        color: 'var(--color-text-dark)', border: 'none', borderRadius: '4px', cursor: 'pointer',
                        fontSize: '0.8em'
                      }}>
                        {ventaExpandida === venta.id ? 'Ocultar' : 'Ver'}
                      </button>
                    </td>
                  </tr>
                  {ventaExpandida === venta.id && (
                    <tr>
                      <td colSpan="6" style={{ padding: '15px', backgroundColor: '#f9f9f9', borderBottom: '1px solid #ddd' }}>
                        <h4 style={{ margin: '0 0 10px 0', color: 'var(--color-primary)' }}>Detalle de Venta #{venta.id}:</h4>
                        <ul style={{ listStyleType: 'none', padding: 0, margin: 0 }}>
                          {venta.detalles.map((detalle, index) => (
                            <li key={index} style={{ marginBottom: '5px', color: 'var(--color-text-dark)' }}>
                              {detalle.medicamento_nombre} ({detalle.presentacion || 'N/A'}) - Cantidad: {detalle.cantidad} x ${parseFloat(detalle.precio_unitario).toFixed(2)} = <strong>${(detalle.cantidad * parseFloat(detalle.precio_unitario)).toFixed(2)}</strong>
                            </li>
                          ))}
                        </ul>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default HistorialVentasView;
