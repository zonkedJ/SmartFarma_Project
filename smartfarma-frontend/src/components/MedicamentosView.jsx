// smartfarma-frontend/src/components/MedicamentosView.jsx

import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';

// Constantes para los umbrales de alerta
const LOW_STOCK_THRESHOLD = 20; // Si el stock es <= 20, se considera bajo
const EXPIRATION_WARNING_DAYS = 90; // Si vence en los próximos 90 días, se considera próximo a vencer

function MedicamentosView({ mostrarMensaje }) {
  const [medicamentos, setMedicamentos] = useState([]);
  const [nuevoMedicamento, setNuevoMedicamento] = useState({
    nombre: '',
    principio_activo: '',
    laboratorio: '',
    presentacion: '',
    stock: '',
    precio: '',
    fecha_vencimiento: '' // Formato YYYY-MM-DD
  });
  const [editingMedicamentoId, setEditingMedicamentoId] = useState(null); // ID del medicamento que se está editando
  const [editedMedicamentoData, setEditedMedicamentoData] = useState(null); // Datos del medicamento en edición

  // Función para cargar todos los medicamentos
  const cargarMedicamentos = async () => {
    try {
      const response = await axios.get('http://localhost:5000/medicamentos');
      setMedicamentos(response.data);
      mostrarMensaje('Medicamentos cargados exitosamente.');
    } catch (error) {
      console.error('Error al cargar medicamentos:', error);
      mostrarMensaje('Error al cargar medicamentos.');
    }
  };

  // Cargar medicamentos al inicio y cada vez que se necesite recargar
  useEffect(() => {
    cargarMedicamentos();
  }, []); // Se ejecuta solo una vez al montar el componente

  // --- Lógica para Notificaciones de Inventario ---
  const { lowStockItems, expiringItems } = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Para comparar solo la fecha

    const lowStock = [];
    const expiring = [];

    medicamentos.forEach(med => {
      // Verificar stock bajo
      if (med.stock <= LOW_STOCK_THRESHOLD) {
        lowStock.push(med);
      }

      // Verificar fecha de vencimiento
      if (med.fecha_vencimiento) {
        const expirationDate = new Date(med.fecha_vencimiento);
        expirationDate.setHours(0, 0, 0, 0); // Para comparar solo la fecha

        const diffTime = expirationDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays <= EXPIRATION_WARNING_DAYS && diffDays >= 0) { // Si vence en los próximos N días o hoy
          expiring.push(med);
        } else if (diffDays < 0) { // Si ya venció
          // Podrías tener una categoría separada para 'vencidos'
          // Por ahora, los incluimos en los que 'expiran' para resaltarlos
          expiring.push(med);
        }
      }
    });
    return { lowStockItems: lowStock, expiringItems: expiring };
  }, [medicamentos]); // Recalcular cuando la lista de medicamentos cambia

  // Manejar cambios en el formulario de nuevo medicamento
  const handleChange = (e) => {
    const { name, value } = e.target;
    setNuevoMedicamento({ ...nuevoMedicamento, [name]: value });
  };

  // Manejar cambios en el formulario de edición
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditedMedicamentoData({ ...editedMedicamentoData, [name]: value });
  };

  // Función para agregar un nuevo medicamento
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/medicamentos', nuevoMedicamento);
      mostrarMensaje(`Medicamento ${response.data.nombre} agregado exitosamente.`);
      setNuevoMedicamento({ // Limpiar formulario
        nombre: '', principio_activo: '', laboratorio: '', presentacion: '',
        stock: '', precio: '', fecha_vencimiento: ''
      });
      cargarMedicamentos(); // Recargar la lista de medicamentos
    } catch (error) {
      console.error('Error al agregar medicamento:', error);
      if (error.response && error.response.data && error.response.data.message) {
        mostrarMensaje(`Error: ${error.response.data.message}`);
      } else {
        mostrarMensaje('Error al agregar medicamento.');
      }
    }
  };

  // Función para iniciar la edición de un medicamento
  const handleEditClick = (medicamento) => {
    setEditingMedicamentoId(medicamento.id);
    // Clonar los datos del medicamento para edición
    // Asegurarse de que la fecha_vencimiento esté en formato YYYY-MM-DD para el input type="date"
    const fechaVencimiento = medicamento.fecha_vencimiento ? new Date(medicamento.fecha_vencimiento).toISOString().split('T')[0] : '';
    setEditedMedicamentoData({ ...medicamento, fecha_vencimiento: fechaVencimiento });
  };

  // Función para guardar los cambios de un medicamento editado
  const handleSaveEdit = async () => {
    try {
      const response = await axios.put(`http://localhost:5000/medicamentos/${editingMedicamentoId}`, editedMedicamentoData);
      mostrarMensaje(`Medicamento ${response.data.nombre} actualizado exitosamente.`);
      setEditingMedicamentoId(null); // Salir del modo edición
      setEditedMedicamentoData(null);
      cargarMedicamentos(); // Recargar la lista
    } catch (error) {
      console.error('Error al actualizar medicamento:', error);
      if (error.response && error.response.data && error.response.data.message) {
        mostrarMensaje(`Error al actualizar: ${error.response.data.message}`);
      } else {
        mostrarMensaje('Error al actualizar medicamento.');
      }
    }
  };

  // Función para cancelar la edición
  const handleCancelEdit = () => {
    setEditingMedicamentoId(null);
    setEditedMedicamentoData(null);
  };

  // Función para eliminar un medicamento
  const handleDeleteClick = async (id, nombre) => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar el medicamento ${nombre}?`)) {
      try {
        await axios.delete(`http://localhost:5000/medicamentos/${id}`);
        mostrarMensaje(`Medicamento ${nombre} eliminado exitosamente.`);
        cargarMedicamentos(); // Recargar la lista
      } catch (error) {
        console.error('Error al eliminar medicamento:', error);
        mostrarMensaje('Error al eliminar medicamento.');
      }
    }
  };

  return (
    <div>
      <h2>Gestión de Medicamentos</h2>

      {/* Sección de Alertas de Inventario */}
      {(lowStockItems.length > 0 || expiringItems.length > 0) && (
        <div style={alertContainerStyle}>
          {lowStockItems.length > 0 && (
            <div style={lowStockAlertStyle}>
              <h3>⚠️ Stock Bajo ({lowStockItems.length})</h3>
              <ul>
                {lowStockItems.map(item => (
                  <li key={`low-stock-${item.id}`}>
                    {item.nombre} (Stock: {item.stock})
                  </li>
                ))}
              </ul>
            </div>
          )}
          {expiringItems.length > 0 && (
            <div style={expiringAlertStyle}>
              <h3>⏰ Próximos a Vencer ({expiringItems.length})</h3>
              <ul>
                {expiringItems.map(item => (
                  <li key={`expiring-${item.id}`}>
                    {item.nombre} (Vence: {new Date(item.fecha_vencimiento).toLocaleDateString()})
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Formulario para agregar nuevo medicamento */}
      <div style={{
        marginBottom: '30px', padding: '20px', border: '1px solid var(--color-primary)',
        borderRadius: '8px', backgroundColor: 'var(--color-text-light)', boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <h3>Agregar Nuevo Medicamento</h3>
        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
          <input type="text" name="nombre" placeholder="Nombre" value={nuevoMedicamento.nombre} onChange={handleChange} required style={inputStyle} />
          <input type="text" name="principio_activo" placeholder="Principio Activo" value={nuevoMedicamento.principio_activo} onChange={handleChange} style={inputStyle} />
          <input type="text" name="laboratorio" placeholder="Laboratorio" value={nuevoMedicamento.laboratorio} onChange={handleChange} style={inputStyle} />
          <input type="text" name="presentacion" placeholder="Presentación" value={nuevoMedicamento.presentacion} onChange={handleChange} style={inputStyle} />
          <input type="number" name="stock" placeholder="Stock" value={nuevoMedicamento.stock} onChange={handleChange} required style={inputStyle} />
          <input type="number" name="precio" placeholder="Precio" value={nuevoMedicamento.precio} onChange={handleChange} step="0.01" required style={inputStyle} />
          <input type="date" name="fecha_vencimiento" placeholder="Fecha de Vencimiento" value={nuevoMedicamento.fecha_vencimiento} onChange={handleChange} style={inputStyle} />
          <button type="submit" style={{ ...buttonStyle, gridColumn: '1 / 3' }}>Agregar Medicamento</button>
        </form>
      </div>

      {/* Tabla de medicamentos */}
      <h3>Listado de Medicamentos</h3>
      {medicamentos.length === 0 ? (
        <p>No hay medicamentos registrados.</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={tableStyle}>
            <thead>
              <tr style={tableHeaderRowStyle}>
                <th style={tableHeaderStyle}>ID</th>
                <th style={tableHeaderStyle}>Nombre</th>
                <th style={tableHeaderStyle}>Principio Activo</th>
                <th style={tableHeaderStyle}>Laboratorio</th>
                <th style={tableHeaderStyle}>Presentación</th> {/* ¡COLUMNA AÑADIDA AQUÍ! */}
                <th style={tableHeaderStyle}>Stock</th>
                <th style={tableHeaderStyle}>Precio</th>
                <th style={tableHeaderStyle}>Vencimiento</th>
                <th style={tableHeaderStyle}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {medicamentos.map(medicamento => {
                // Determinar el estilo de la fila basado en las alertas
                let rowAlertStyle = {};
                if (lowStockItems.some(item => item.id === medicamento.id)) {
                  rowAlertStyle = { backgroundColor: '#ffe0b2' }; // Naranja claro para stock bajo
                }
                if (expiringItems.some(item => item.id === medicamento.id)) {
                  rowAlertStyle = { ...rowAlertStyle, backgroundColor: '#ffcdd2' }; // Rojo claro para vencimiento
                }
                // Si está en ambas categorías, el color de vencimiento prevalece o se mezcla
                // Podrías definir un color específico para "ambos" si lo deseas

                return (
                  <React.Fragment key={medicamento.id}>
                    <tr style={{ ...tableRowStyle, ...rowAlertStyle }}>
                      <td style={tableCellStyle}>{medicamento.id}</td>
                      <td style={tableCellStyle}>{medicamento.nombre}</td>
                      <td style={tableCellStyle}>{medicamento.principio_activo || 'N/A'}</td>
                      <td style={tableCellStyle}>{medicamento.laboratorio || 'N/A'}</td>
                      <td style={tableCellStyle}>{medicamento.presentacion || 'N/A'}</td> {/* ¡DATO AÑADIDO AQUÍ! */}
                      <td style={tableCellStyle}>{medicamento.stock}</td>
                      <td style={tableCellStyle}>${parseFloat(medicamento.precio).toFixed(2)}</td>
                      <td style={tableCellStyle}>{medicamento.fecha_vencimiento ? new Date(medicamento.fecha_vencimiento).toLocaleDateString() : 'N/A'}</td>
                      <td style={tableCellStyle}>
                        <button onClick={() => handleEditClick(medicamento)} style={{ ...buttonStyleSmall, backgroundColor: 'var(--color-edit)', marginRight: '5px' }}>
                          Editar
                        </button>
                        <button onClick={() => handleDeleteClick(medicamento.id, medicamento.nombre)} style={{ ...buttonStyleSmall, backgroundColor: 'var(--color-delete)' }}>
                          Eliminar
                        </button>
                      </td>
                    </tr>
                    {/* Formulario de edición (aparece si editingMedicamentoId coincide) */}
                    {editingMedicamentoId === medicamento.id && (
                      <tr>
                        <td colSpan="9" style={editFormContainerStyle}> {/* colSpan ajustado a 9 */}
                          <h4>Editar Medicamento {medicamento.nombre}</h4>
                          <form style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                            <input type="text" name="nombre" placeholder="Nombre" value={editedMedicamentoData.nombre} onChange={handleEditChange} required style={inputStyle} />
                            <input type="text" name="principio_activo" placeholder="Principio Activo" value={editedMedicamentoData.principio_activo || ''} onChange={handleEditChange} style={inputStyle} />
                            <input type="text" name="laboratorio" placeholder="Laboratorio" value={editedMedicamentoData.laboratorio || ''} onChange={handleEditChange} style={inputStyle} />
                            <input type="text" name="presentacion" placeholder="Presentación" value={editedMedicamentoData.presentacion || ''} onChange={handleEditChange} style={inputStyle} />
                            <input type="number" name="stock" placeholder="Stock" value={editedMedicamentoData.stock} onChange={handleEditChange} required style={inputStyle} />
                            <input type="number" name="precio" placeholder="Precio" value={editedMedicamentoData.precio} onChange={handleEditChange} step="0.01" required style={inputStyle} />
                            <input type="date" name="fecha_vencimiento" placeholder="Fecha de Vencimiento" value={editedMedicamentoData.fecha_vencimiento || ''} onChange={handleEditChange} style={inputStyle} />
                            <button type="button" onClick={handleSaveEdit} style={{ ...buttonStyle, gridColumn: '1 / 2', backgroundColor: 'var(--color-primary)' }}>Guardar Cambios</button>
                            <button type="button" onClick={handleCancelEdit} style={{ ...buttonStyle, gridColumn: '2 / 3', backgroundColor: 'var(--color-cancel)' }}>Cancelar</button>
                          </form>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// Estilos internos para los componentes (puedes moverlos a index.css si prefieres)
const inputStyle = {
  padding: '10px',
  border: '1px solid #ddd',
  borderRadius: '4px',
  width: '100%',
  boxSizing: 'border-box', // Asegura que el padding no aumente el ancho total
};

const buttonStyle = {
  padding: '10px 20px',
  backgroundColor: 'var(--color-primary)',
  color: 'var(--color-text-light)',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer',
  fontWeight: 'bold',
  transition: 'background-color 0.3s ease',
};

const buttonStyleSmall = {
  padding: '6px 12px',
  backgroundColor: 'var(--color-secondary)',
  color: 'var(--color-text-dark)',
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

const editFormContainerStyle = {
  padding: '15px',
  backgroundColor: '#e6f7ff', // Un color diferente para el formulario de edición
  borderBottom: '1px solid #b3e0ff',
  color: 'var(--color-text-dark)',
};

// Estilos para las alertas de inventario
const alertContainerStyle = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '20px',
  marginBottom: '30px',
  padding: '20px',
  border: '1px solid #ccc',
  borderRadius: '8px',
  backgroundColor: '#f0f0f0',
  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
};

const lowStockAlertStyle = {
  flex: '1',
  minWidth: '280px',
  backgroundColor: '#fff3e0', // Naranja muy claro
  border: '1px solid #ffb74d', // Naranja
  borderRadius: '8px',
  padding: '15px',
  boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
  color: 'var(--color-text-dark)',
};

const expiringAlertStyle = {
  flex: '1',
  minWidth: '280px',
  backgroundColor: '#ffebee', // Rojo muy claro
  border: '1px solid #ef5350', // Rojo
  borderRadius: '8px',
  padding: '15px',
  boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
  color: 'var(--color-text-dark)',
};

export default MedicamentosView;