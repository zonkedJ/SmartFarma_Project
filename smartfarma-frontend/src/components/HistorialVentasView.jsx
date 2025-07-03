// smartfarma-frontend/src/components/HistorialVentasView.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';

function HistorialVentasView({ mostrarMensaje }) {
  const [ventas, setVentas] = useState([]);
  const [ventaExpandida, setVentaExpandida] = useState(null); // Para ver detalles de una venta

  // Función para cargar el historial de ventas
  const cargarHistorialVentas = async () => {
    try {
      const response = await axios.get('http://localhost:5000/ventas_historial');
      setVentas(response.data);
      mostrarMensaje('Historial de ventas cargado exitosamente.');
    } catch (error) {
      console.error('Error al cargar historial de ventas:', error);
      mostrarMensaje('Error al cargar historial de ventas.');
    }
  };

  // Cargar historial al inicio
  useEffect(() => {
    cargarHistorialVentas();
  }, []);

  // Función para expandir/colapsar los detalles de la venta
  const toggleDetalles = (ventaId) => {
    setVentaExpandida(ventaExpandida === ventaId ? null : ventaId);
  };

  return (
    <div>
      <h2>Historial de Ventas</h2>

      {ventas.length === 0 ? (
        <p>No hay ventas registradas.</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={tableStyle}>
            <thead>
              <tr style={tableHeaderRowStyle}>
                <th style={tableHeaderStyle}>ID Venta</th>
                <th style={tableHeaderStyle}>Fecha</th>
                <th style={tableHeaderStyle}>Paciente</th>
                <th style={tableHeaderStyle}>Total</th>
                <th style={tableHeaderStyle}>Detalles</th>
              </tr>
            </thead>
            <tbody>
              {ventas.map(venta => (
                <React.Fragment key={venta.id}>
                  <tr style={tableRowStyle}>
                    <td style={tableCellStyle}>{venta.id}</td>
                    <td style={tableCellStyle}>{new Date(venta.fecha_venta).toLocaleString()}</td>
                    <td style={tableCellStyle}>{venta.paciente_nombre ? `${venta.paciente_nombre} ${venta.paciente_apellido || ''}` : 'Consumidor Final'}</td>
                    <td style={tableCellStyle}>${parseFloat(venta.total_venta).toFixed(2)}</td>
                    <td style={tableCellStyle}>
                      <button
                        onClick={() => toggleDetalles(venta.id)}
                        style={{ ...buttonStyleSmall, backgroundColor: 'var(--color-secondary)', color: 'var(--color-text-light)' }} /* ¡AJUSTE DE COLOR AQUÍ! */
                      >
                        {ventaExpandida === venta.id ? 'Ocultar' : 'Ver'}
                      </button>
                    </td>
                  </tr>
                  {/* Detalles expandidos de la venta */}
                  {ventaExpandida === venta.id && (
                    <tr>
                      <td colSpan="5" style={expandedDetailStyle}>
                        <h4>Medicamentos Vendidos:</h4>
                        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
                          <thead>
                            <tr>
                              <th style={nestedTableHeaderStyle}>Medicamento</th>
                              <th style={nestedTableHeaderStyle}>Cantidad</th>
                              <th style={nestedTableHeaderStyle}>P. Unit.</th>
                              <th style={nestedTableHeaderStyle}>Subtotal</th>
                            </tr>
                          </thead>
                          <tbody>
                            {venta.detalles.map((detalle, index) => (
                              <tr key={index}>
                                <td style={nestedTableCellStyle}>{detalle.medicamento_nombre} ({detalle.presentacion})</td>
                                <td style={nestedTableCellStyle}>{detalle.cantidad}</td>
                                <td style={nestedTableCellStyle}>${parseFloat(detalle.precio_unitario).toFixed(2)}</td>
                                <td style={nestedTableCellStyle}>${(detalle.cantidad * parseFloat(detalle.precio_unitario)).toFixed(2)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
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

// Estilos internos (puedes moverlos a index.css si prefieres)
const buttonStyleSmall = {
  padding: '6px 12px',
  // backgroundColor: 'var(--color-secondary)', // Se define en el componente para permitir override
  // color: 'var(--color-text-dark)', // Se define en el componente para permitir override
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  fontSize: '0.85em',
  fontWeight: 'bold',
  transition: 'background-color 0.3s ease',
};

const tableStyle = {
  width: '100%',
  borderCollapse: 'collapse',
  marginTop: '20px',
  backgroundColor: 'var(--color-text-light)',
  borderRadius: '8px',
  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
};

const tableHeaderRowStyle = {
  borderBottom: '2px solid var(--color-primary)',
};

const tableHeaderStyle = {
  padding: '12px 15px',
  textAlign: 'left',
  backgroundColor: 'var(--color-primary)',
  color: 'var(--color-text-light)',
};

const tableRowStyle = {
  borderBottom: '1px solid #eee',
};

const tableCellStyle = {
  padding: '10px 15px',
  textAlign: 'left',
  color: 'var(--color-text-dark)',
};

const expandedDetailStyle = {
  padding: '15px',
  backgroundColor: '#f9f9f9',
  borderBottom: '1px solid #ddd',
  color: 'var(--color-text-dark)',
};

const nestedTableHeaderStyle = {
  padding: '8px 10px',
  textAlign: 'left',
  backgroundColor: '#e0e0e0', // Un gris más claro para encabezados anidados
  color: 'var(--color-text-dark)',
  borderBottom: '1px solid #ccc',
};

const nestedTableCellStyle = {
  padding: '8px 10px',
  textAlign: 'left',
  borderBottom: '1px solid #eee',
  color: 'var(--color-text-dark)',
};

export default HistorialVentasView;

