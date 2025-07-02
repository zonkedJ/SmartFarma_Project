// smartfarma-frontend/src/components/PacientesView.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';

function PacientesView({ mostrarMensaje }) {
  const [pacientes, setPacientes] = useState([]);
  const [nuevoPaciente, setNuevoPaciente] = useState({
    nombre: '',
    apellido: '',
    cedula: '',
    fecha_nacimiento: '', // Formato YYYY-MM-DD
    direccion: '',
    telefono: '',
    email: '',
    historial_medico: ''
  });
  const [pacienteExpandido, setPacienteExpandido] = useState(null); // Para ver detalles
  const [editingPacienteId, setEditingPacienteId] = useState(null); // ID del paciente que se está editando
  const [editedPacienteData, setEditedPacienteData] = useState(null); // Datos del paciente en edición

  // Función para cargar todos los pacientes
  const cargarPacientes = async () => {
    try {
      const response = await axios.get('http://localhost:5000/pacientes');
      setPacientes(response.data);
      mostrarMensaje('Pacientes cargados exitosamente.');
    } catch (error) {
      console.error('Error al cargar pacientes:', error);
      mostrarMensaje('Error al cargar pacientes.');
    }
  };

  // Cargar pacientes al inicio y cada vez que se necesite recargar
  useEffect(() => {
    cargarPacientes();
  }, []); // Se ejecuta solo una vez al montar el componente

  // Manejar cambios en el formulario de nuevo paciente
  const handleChange = (e) => {
    const { name, value } = e.target;
    setNuevoPaciente({ ...nuevoPaciente, [name]: value });
  };

  // Manejar cambios en el formulario de edición
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditedPacienteData({ ...editedPacienteData, [name]: value });
  };

  // Función para agregar un nuevo paciente
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/pacientes', nuevoPaciente);
      mostrarMensaje(`Paciente ${response.data.nombre} agregado exitosamente.`);
      setNuevoPaciente({ // Limpiar formulario
        nombre: '', apellido: '', cedula: '', fecha_nacimiento: '',
        direccion: '', telefono: '', email: '', historial_medico: ''
      });
      cargarPacientes(); // Recargar la lista de pacientes
    } catch (error) {
      console.error('Error al agregar paciente:', error);
      if (error.response && error.response.data && error.response.data.message) {
        mostrarMensaje(`Error: ${error.response.data.message}`);
      } else {
        mostrarMensaje('Error al agregar paciente.');
      }
    }
  };

  // Función para iniciar la edición de un paciente
  const handleEditClick = (paciente) => {
    setEditingPacienteId(paciente.id);
    // Clonar los datos del paciente para edición
    // Asegurarse de que la fecha_nacimiento esté en formato YYYY-MM-DD para el input type="date"
    const fechaNacimiento = paciente.fecha_nacimiento ? new Date(paciente.fecha_nacimiento).toISOString().split('T')[0] : '';
    setEditedPacienteData({ ...paciente, fecha_nacimiento: fechaNacimiento });
  };

  // Función para guardar los cambios de un paciente editado
  const handleSaveEdit = async () => {
    try {
      const response = await axios.put(`http://localhost:5000/pacientes/${editingPacienteId}`, editedPacienteData);
      mostrarMensaje(`Paciente ${response.data.nombre} actualizado exitosamente.`);
      setEditingPacienteId(null); // Salir del modo edición
      setEditedPacienteData(null);
      cargarPacientes(); // Recargar la lista
    } catch (error) {
      console.error('Error al actualizar paciente:', error);
      if (error.response && error.response.data && error.response.data.message) {
        mostrarMensaje(`Error al actualizar: ${error.response.data.message}`);
      } else {
        mostrarMensaje('Error al actualizar paciente.');
      }
    }
  };

  // Función para cancelar la edición
  const handleCancelEdit = () => {
    setEditingPacienteId(null);
    setEditedPacienteData(null);
  };

  // Función para eliminar un paciente
  const handleDeleteClick = async (id, nombre) => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar al paciente ${nombre}?`)) {
      try {
        await axios.delete(`http://localhost:5000/pacientes/${id}`);
        mostrarMensaje(`Paciente ${nombre} eliminado exitosamente.`);
        cargarPacientes(); // Recargar la lista
      } catch (error) {
        console.error('Error al eliminar paciente:', error);
        mostrarMensaje('Error al eliminar paciente.');
      }
    }
  };

  // Función para expandir/colapsar los detalles del paciente
  const toggleDetalles = (pacienteId) => {
    setPacienteExpandido(pacienteExpandido === pacienteId ? null : pacienteId);
  };

  return (
    <div>
      <h2>Gestión de Pacientes</h2>

      {/* Formulario para agregar nuevo paciente */}
      <div style={{
        marginBottom: '30px', padding: '20px', border: '1px solid var(--color-primary)',
        borderRadius: '8px', backgroundColor: 'var(--color-text-light)', boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <h3>Agregar Nuevo Paciente</h3>
        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
          <input type="text" name="nombre" placeholder="Nombre" value={nuevoPaciente.nombre} onChange={handleChange} required style={inputStyle} />
          <input type="text" name="apellido" placeholder="Apellido" value={nuevoPaciente.apellido} onChange={handleChange} required style={inputStyle} />
          <input type="text" name="cedula" placeholder="Cédula" value={nuevoPaciente.cedula} onChange={handleChange} required style={inputStyle} />
          <input type="date" name="fecha_nacimiento" placeholder="Fecha de Nacimiento" value={nuevoPaciente.fecha_nacimiento} onChange={handleChange} style={inputStyle} />
          <input type="text" name="direccion" placeholder="Dirección" value={nuevoPaciente.direccion} onChange={handleChange} style={inputStyle} />
          <input type="text" name="telefono" placeholder="Teléfono" value={nuevoPaciente.telefono} onChange={handleChange} style={inputStyle} />
          <input type="email" name="email" placeholder="Email" value={nuevoPaciente.email} onChange={handleChange} style={inputStyle} />
          <textarea name="historial_medico" placeholder="Historial Médico" value={nuevoPaciente.historial_medico} onChange={handleChange} style={{ ...inputStyle, gridColumn: '1 / 3', minHeight: '80px' }}></textarea>
          <button type="submit" style={{ ...buttonStyle, gridColumn: '1 / 3' }}>Agregar Paciente</button>
        </form>
      </div>

      {/* Tabla de pacientes */}
      <h3>Listado de Pacientes</h3>
      {pacientes.length === 0 ? (
        <p>No hay pacientes registrados.</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={tableStyle}>
            <thead>
              <tr style={tableHeaderRowStyle}>
                <th style={tableHeaderStyle}>ID</th>
                <th style={tableHeaderStyle}>Nombre Completo</th>
                <th style={tableHeaderStyle}>Cédula</th>
                <th style={tableHeaderStyle}>Teléfono</th>
                <th style={tableHeaderStyle}>Email</th>
                <th style={tableHeaderStyle}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {pacientes.map(paciente => (
                <React.Fragment key={paciente.id}>
                  <tr style={tableRowStyle}>
                    <td style={tableCellStyle}>{paciente.id}</td>
                    <td style={tableCellStyle}>{paciente.nombre} {paciente.apellido}</td>
                    <td style={tableCellStyle}>{paciente.cedula}</td>
                    <td style={tableCellStyle}>{paciente.telefono}</td>
                    <td style={tableCellStyle}>{paciente.email}</td>
                    <td style={tableCellStyle}>
                      <button onClick={() => toggleDetalles(paciente.id)} style={{ ...buttonStyleSmall, marginRight: '5px' }}>
                        {pacienteExpandido === paciente.id ? 'Ocultar' : 'Detalles'}
                      </button>
                      <button onClick={() => handleEditClick(paciente)} style={{ ...buttonStyleSmall, backgroundColor: 'var(--color-edit)', marginRight: '5px' }}>
                        Editar
                      </button>
                      <button onClick={() => handleDeleteClick(paciente.id, paciente.nombre)} style={{ ...buttonStyleSmall, backgroundColor: 'var(--color-delete)' }}>
                        Eliminar
                      </button>
                    </td>
                  </tr>
                  {/* Detalles expandidos del paciente */}
                  {pacienteExpandido === paciente.id && (
                    <tr>
                      <td colSpan="6" style={expandedDetailStyle}>
                        <h4>Detalles de {paciente.nombre} {paciente.apellido}:</h4>
                        <p><strong>Fecha Nacimiento:</strong> {paciente.fecha_nacimiento ? new Date(paciente.fecha_nacimiento).toLocaleDateString() : 'N/A'}</p>
                        <p><strong>Dirección:</strong> {paciente.direccion || 'N/A'}</p>
                        <p><strong>Historial Médico:</strong> {paciente.historial_medico || 'N/A'}</p>
                      </td>
                    </tr>
                  )}
                  {/* Formulario de edición (aparece si editingPacienteId coincide) */}
                  {editingPacienteId === paciente.id && (
                    <tr>
                      <td colSpan="6" style={editFormContainerStyle}>
                        <h4>Editar Paciente {paciente.nombre} {paciente.apellido}</h4>
                        <form style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                          <input type="text" name="nombre" placeholder="Nombre" value={editedPacienteData.nombre} onChange={handleEditChange} required style={inputStyle} />
                          <input type="text" name="apellido" placeholder="Apellido" value={editedPacienteData.apellido} onChange={handleEditChange} required style={inputStyle} />
                          <input type="text" name="cedula" placeholder="Cédula" value={editedPacienteData.cedula} onChange={handleEditChange} required style={inputStyle} />
                          <input type="date" name="fecha_nacimiento" placeholder="Fecha de Nacimiento" value={editedPacienteData.fecha_nacimiento} onChange={handleEditChange} style={inputStyle} />
                          <input type="text" name="direccion" placeholder="Dirección" value={editedPacienteData.direccion} onChange={handleEditChange} style={inputStyle} />
                          <input type="text" name="telefono" placeholder="Teléfono" value={editedPacienteData.telefono} onChange={handleEditChange} style={inputStyle} />
                          <input type="email" name="email" placeholder="Email" value={editedPacienteData.email} onChange={handleEditChange} style={inputStyle} />
                          <textarea name="historial_medico" placeholder="Historial Médico" value={editedPacienteData.historial_medico} onChange={handleEditChange} style={{ ...inputStyle, gridColumn: '1 / 3', minHeight: '60px' }}></textarea>
                          <button type="button" onClick={handleSaveEdit} style={{ ...buttonStyle, gridColumn: '1 / 2', backgroundColor: 'var(--color-primary)' }}>Guardar Cambios</button>
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

export default PacientesView;
