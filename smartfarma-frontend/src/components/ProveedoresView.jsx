// smartfarma-frontend/src/components/ProveedoresView.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios'; // Importa axios

function ProveedoresView({ mostrarMensaje }) {
  const [proveedores, setProveedores] = useState([]); // Inicializa vacío para cargar desde la API
  const [nuevoProveedor, setNuevoProveedor] = useState({
    nombre: '',
    contacto: '',
    telefono: '',
    email: ''
  });
  const [editingProveedorId, setEditingProveedorId] = useState(null);
  const [editedProveedorData, setEditedProveedorData] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [proveedorToDelete, setProveedorToDelete] = useState(null);

  // --- Funciones para la interacción con el Backend ---

  // Función para cargar todos los proveedores
  const cargarProveedores = async () => {
    try {
      const response = await axios.get('http://localhost:5000/proveedores');
      setProveedores(response.data);
      mostrarMensaje('Proveedores cargados exitosamente.');
    } catch (error) {
      console.error('Error al cargar proveedores:', error);
      mostrarMensaje('Error al cargar proveedores.');
    }
  };

  // Cargar proveedores al inicio, como lo haces con pacientes
  useEffect(() => {
    cargarProveedores();
  }, []); // Se ejecuta solo una vez al montar el componente

  // Maneja los cambios en los campos del formulario "Agregar Nuevo Proveedor"
  const handleChange = (e) => {
    const { name, value } = e.target;
    setNuevoProveedor({ ...nuevoProveedor, [name]: value });
  };

  // Maneja los cambios en los campos del formulario de edición en línea
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditedProveedorData({ ...editedProveedorData, [name]: value });
  };

  // Maneja el envío del formulario para agregar un nuevo proveedor (con API)
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/proveedores', nuevoProveedor);
      mostrarMensaje(`Proveedor ${response.data.nombre} agregado exitosamente.`);
      setNuevoProveedor({ // Limpia el formulario
        nombre: '',
        contacto: '',
        telefono: '',
        email: ''
      });
      cargarProveedores(); // Recarga la lista después de agregar
    } catch (error) {
      console.error('Error al agregar proveedor:', error);
      if (error.response && error.response.data && error.response.data.message) {
        mostrarMensaje(`Error: ${error.response.data.message}`);
      } else {
        mostrarMensaje('Error al agregar proveedor.');
      }
    }
  };

  // Activa el modo de edición para un proveedor específico
  const handleEditClick = (proveedor) => {
    setEditingProveedorId(proveedor.id);
    setEditedProveedorData({ ...proveedor });
  };

  // Guarda los cambios realizados en el modo de edición (con API)
  const handleSaveEdit = async (e) => {
    e.preventDefault(); // Asegúrate de prevenir el comportamiento por defecto del formulario
    try {
      const response = await axios.put(`http://localhost:5000/proveedores/${editingProveedorId}`, editedProveedorData);
      mostrarMensaje(`Proveedor ${response.data.nombre} actualizado exitosamente.`);
      setEditingProveedorId(null); // Sale del modo de edición
      setEditedProveedorData(null);
      cargarProveedores(); // Recarga la lista
    } catch (error) {
      console.error('Error al actualizar proveedor:', error);
      if (error.response && error.response.data && error.response.data.message) {
        mostrarMensaje(`Error al actualizar: ${error.response.data.message}`);
      } else {
        mostrarMensaje('Error al actualizar proveedor.');
      }
    }
  };

  // Cancela el modo de edición
  const handleCancelEdit = () => {
    setEditingProveedorId(null);
    setEditedProveedorData(null);
  };

  // Muestra el modal de confirmación para eliminar un proveedor
  const handleDeleteClick = (proveedor) => {
    setProveedorToDelete(proveedor);
    setShowModal(true);
  };
  
  // Confirma la eliminación del proveedor (con API)
  const handleConfirmDelete = async () => {
    if (proveedorToDelete) {
      try {
        await axios.delete(`http://localhost:5000/proveedores/${proveedorToDelete.id}`);
        mostrarMensaje(`Proveedor ${proveedorToDelete.nombre} eliminado exitosamente.`);
        setShowModal(false);
        setProveedorToDelete(null);
        cargarProveedores(); // Recarga la lista
      } catch (error) {
        console.error('Error al eliminar proveedor:', error);
        mostrarMensaje('Error al eliminar proveedor.');
      }
    }
  };

  // Cancela la eliminación del proveedor
  const handleCancelDelete = () => {
    setShowModal(false);
    setProveedorToDelete(null);
  };

  return (
    <div>
      <h2>Gestión de Proveedores</h2>

      {/* Formulario para agregar nuevo proveedor */}
      <div style={{
        marginBottom: '30px', padding: '20px', border: '1px solid var(--color-primary)',
        borderRadius: '8px', backgroundColor: 'var(--color-text-light)', boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <h3>Agregar Nuevo Proveedor</h3>
        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
          <input type="text" name="nombre" placeholder="Nombre de la empresa" value={nuevoProveedor.nombre} onChange={handleChange} required style={inputStyle} />
          <input type="text" name="contacto" placeholder="Nombre de contacto" value={nuevoProveedor.contacto} onChange={handleChange} style={inputStyle} />
          <input type="text" name="telefono" placeholder="Teléfono" value={nuevoProveedor.telefono} onChange={handleChange} style={inputStyle} />
          <input type="email" name="email" placeholder="Email" value={nuevoProveedor.email} onChange={handleChange} style={inputStyle} />
          {/* El botón ocupa las dos columnas */}
          <button type="submit" style={{ ...buttonStyle, gridColumn: '1 / 3' }}>Agregar Proveedor</button>
        </form>
      </div>

      {/* Tabla de proveedores */}
      <h3>Listado de Proveedores</h3>
      {proveedores.length === 0 ? (
        <p>No hay proveedores registrados.</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={tableStyle}>
            <thead>
              <tr style={tableHeaderRowStyle}>
                <th style={tableHeaderStyle}>ID</th>
                <th style={tableHeaderStyle}>Nombre</th>
                <th style={tableHeaderStyle}>Contacto</th>
                <th style={tableHeaderStyle}>Teléfono</th>
                <th style={tableHeaderStyle}>Email</th>
                <th style={tableHeaderStyle}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {proveedores.map(proveedor => (
                <React.Fragment key={proveedor.id}>
                  <tr style={tableRowStyle}>
                    <td style={tableCellStyle}>{proveedor.id}</td>
                    <td style={tableCellStyle}>{proveedor.nombre}</td>
                    <td style={tableCellStyle}>{proveedor.contacto}</td>
                    <td style={tableCellStyle}>{proveedor.telefono}</td>
                    <td style={tableCellStyle}>{proveedor.email}</td>
                    <td style={tableCellStyle}>
                      <button onClick={() => handleEditClick(proveedor)} style={{ ...buttonStyleSmall, backgroundColor: 'var(--color-edit)', marginRight: '5px' }}>
                        Editar
                      </button>
                      <button
                        onClick={() => handleDeleteClick(proveedor)}
                        style={{ ...buttonStyleSmall, backgroundColor: 'var(--color-delete)', color: 'var(--color-text-light)' }}
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                  {/* Formulario de edición (aparece si editingProveedorId coincide) */}
                  {editingProveedorId === proveedor.id && (
                    <tr>
                      <td colSpan="6" style={editFormContainerStyle}>
                        <h4>Editar Proveedor {proveedor.nombre}</h4>
                        <form onSubmit={handleSaveEdit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                          <input type="text" name="nombre" value={editedProveedorData.nombre} onChange={handleEditChange} required style={inputStyle} />
                          <input type="text" name="contacto" value={editedProveedorData.contacto} onChange={handleEditChange} style={inputStyle} />
                          <input type="text" name="telefono" value={editedProveedorData.telefono} onChange={handleEditChange} style={inputStyle} />
                          <input type="email" name="email" value={editedProveedorData.email} onChange={handleEditChange} style={inputStyle} />
                          <button type="submit" style={{ ...buttonStyle, gridColumn: '1 / 2', backgroundColor: 'var(--color-primary)' }}>Guardar Cambios</button>
                          <button type="button" onClick={handleCancelEdit} style={{ ...buttonStyle, gridColumn: '2 / 3', backgroundColor: 'var(--color-cancel)' }}>Cancelar</button>
                        </form>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal de confirmación para eliminar */}
      {showModal && proveedorToDelete && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>Confirmar Eliminación</h3>
            <p style={{ color: 'var(--color-text-dark)', marginBottom: '1.5rem' }}>
              ¿Estás seguro de que quieres eliminar al proveedor <span style={{ fontWeight: 'semibold' }}>{proveedorToDelete.nombre}</span>?
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button
                onClick={handleConfirmDelete}
                style={{ ...buttonStyle, backgroundColor: 'var(--color-delete)', padding: '0.5rem 1rem', borderRadius: '0.375rem' }}
              >
                Eliminar
              </button>
              <button
                onClick={handleCancelDelete}
                style={{ ...buttonStyle, backgroundColor: 'var(--color-cancel)', padding: '0.5rem 1rem', borderRadius: '0.375rem' }}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Estilos internos para los componentes (copiados de PacientesView.jsx)
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
  color: 'var(--color-text-dark)', // Color de texto por defecto para botones pequeños
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

const editFormContainerStyle = {
  padding: '15px',
  backgroundColor: '#e6f7ff', // Un color diferente para el formulario de edición
  borderBottom: '1px solid #b3e0ff',
  color: 'var(--color-text-dark)',
};

// Estilos adicionales para el modal de confirmación
const modalOverlayStyle = {
  position: 'fixed',
  inset: 0,
  backgroundColor: 'rgba(0,0,0,0.5)',
  overflowY: 'auto',
  height: '100%',
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000, // Asegura que esté por encima de otros elementos
};

const modalContentStyle = {
  padding: '24px',
  backgroundColor: 'white',
  borderRadius: '8px',
  boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
  maxWidth: '400px',
  margin: 'auto',
};


export default ProveedoresView;