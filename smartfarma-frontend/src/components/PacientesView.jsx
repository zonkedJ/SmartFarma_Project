// smartfarma-frontend/src/components/PacientesView.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';

function PacientesView({ mostrarMensaje }) { // Recibe mostrarMensaje como prop
  const [pacientes, setPacientes] = useState([]);

  // Estados para los campos del nuevo paciente
  const [nuevoPaciente, setNuevoPaciente] = useState({
    nombre: '',
    apellido: '',
    cedula: '',
    fecha_nacimiento: '',
    direccion: '',
    telefono: '',
    email: '',
    historial_medico: ''
  });

  // Función para cargar los pacientes desde el backend
  const cargarPacientes = async () => {
    try {
      const response = await axios.get('http://localhost:5000/pacientes');
      setPacientes(response.data);
      mostrarMensaje('Pacientes cargados exitosamente.');
    } catch (error) {
      console.error('Error al cargar pacientes:', error);
      mostrarMensaje('Error al cargar pacientes. Verifica que el backend esté funcionando.');
    }
  };

  // Cargar pacientes al inicio de la aplicación
  useEffect(() => {
    cargarPacientes();
  }, []); // El array vacío asegura que se ejecute solo una vez al montar el componente

  // Manejar cambios en los campos del formulario de paciente
  const handleChangePaciente = (e) => {
    const { name, value } = e.target;
    setNuevoPaciente(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  // Manejar el envío del formulario para agregar un paciente
  const handleSubmitPaciente = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/pacientes', nuevoPaciente);
      mostrarMensaje(`Paciente "${response.data.nombre} ${response.data.apellido}" agregado (ID: ${response.data.id}).`);
      setNuevoPaciente({ // Limpiar el formulario después de agregar
        nombre: '',
        apellido: '',
        cedula: '',
        fecha_nacimiento: '',
        direccion: '',
        telefono: '',
        email: '',
        historial_medico: ''
      });
      cargarPacientes(); // Recargar la lista para mostrar el nuevo paciente
    } catch (error) {
      console.error('Error al agregar paciente:', error);
      if (error.response && error.response.status === 409) {
        mostrarMensaje(`Error: ${error.response.data.message}`);
      } else {
        mostrarMensaje('Error al agregar paciente. Verifica que el backend esté funcionando.');
      }
    }
  };

  return (
    <div>
      <h2>Registrar Nuevo Paciente:</h2>
      <form onSubmit={handleSubmitPaciente} style={{
        backgroundColor: 'var(--color-text-light)',
        padding: '25px',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        marginBottom: '30px',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '20px'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <label htmlFor="nombre" style={{ marginBottom: '5px', fontWeight: 'bold' }}>Nombre:</label>
          <input type="text" id="nombre" name="nombre" value={nuevoPaciente.nombre} onChange={handleChangePaciente} required style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <label htmlFor="apellido" style={{ marginBottom: '5px', fontWeight: 'bold' }}>Apellido:</label>
          <input type="text" id="apellido" name="apellido" value={nuevoPaciente.apellido} onChange={handleChangePaciente} required style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <label htmlFor="cedula" style={{ marginBottom: '5px', fontWeight: 'bold' }}>Cédula:</label>
          <input type="text" id="cedula" name="cedula" value={nuevoPaciente.cedula} onChange={handleChangePaciente} required style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <label htmlFor="fecha_nacimiento" style={{ marginBottom: '5px', fontWeight: 'bold' }}>Fecha de Nacimiento:</label>
          <input type="date" id="fecha_nacimiento" name="fecha_nacimiento" value={nuevoPaciente.fecha_nacimiento} onChange={handleChangePaciente} required style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gridColumn: '1 / -1' }}>
          <label htmlFor="direccion" style={{ marginBottom: '5px', fontWeight: 'bold' }}>Dirección:</label>
          <input type="text" id="direccion" name="direccion" value={nuevoPaciente.direccion} onChange={handleChangePaciente} required style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <label htmlFor="telefono" style={{ marginBottom: '5px', fontWeight: 'bold' }}>Teléfono:</label>
          <input type="tel" id="telefono" name="telefono" value={nuevoPaciente.telefono} onChange={handleChangePaciente} required style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <label htmlFor="email" style={{ marginBottom: '5px', fontWeight: 'bold' }}>Email:</label>
          <input type="email" id="email" name="email" value={nuevoPaciente.email} onChange={handleChangePaciente} required style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gridColumn: '1 / -1' }}>
          <label htmlFor="historial_medico" style={{ marginBottom: '5px', fontWeight: 'bold' }}>Historial Médico:</label>
          <textarea id="historial_medico" name="historial_medico" value={nuevoPaciente.historial_medico} onChange={handleChangePaciente} rows="4" style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ddd', resize: 'vertical' }}></textarea>
        </div>
        <button type="submit" style={{
          gridColumn: '1 / -1',
          padding: '12px 25px',
          backgroundColor: 'var(--color-primary)',
          color: 'var(--color-text-light)',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          fontSize: '1.1em',
          fontWeight: 'bold',
          marginTop: '10px'
        }}>
          Registrar Paciente
        </button>
      </form>

      <h2>Lista de Pacientes:</h2>
      {pacientes.length === 0 ? (
        <p>No hay pacientes registrados.</p>
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
                <th style={{ padding: '12px 15px', textAlign: 'left', backgroundColor: 'var(--color-primary)', color: 'var(--color-text-light)', borderTopLeftRadius: '8px' }}>ID</th>
                <th style={{ padding: '12px 15px', textAlign: 'left', backgroundColor: 'var(--color-primary)', color: 'var(--color-text-light)' }}>Nombre Completo</th>
                <th style={{ padding: '12px 15px', textAlign: 'left', backgroundColor: 'var(--color-primary)', color: 'var(--color-text-light)' }}>Cédula</th>
                <th style={{ padding: '12px 15px', textAlign: 'left', backgroundColor: 'var(--color-primary)', color: 'var(--color-text-light)' }}>Fecha Nac.</th>
                <th style={{ padding: '12px 15px', textAlign: 'left', backgroundColor: 'var(--color-primary)', color: 'var(--color-text-light)' }}>Teléfono</th>
                <th style={{ padding: '12px 15px', textAlign: 'left', backgroundColor: 'var(--color-primary)', color: 'var(--color-text-light)', borderTopRightRadius: '8px' }}>Email</th>
              </tr>
            </thead>
            <tbody>
              {pacientes.map(paciente => (
                <tr key={paciente.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '10px 15px', textAlign: 'left', color: 'var(--color-text-dark)' }}>{paciente.id}</td>
                  <td style={{ padding: '10px 15px', textAlign: 'left', color: 'var(--color-text-dark)' }}>{paciente.nombre} {paciente.apellido}</td>
                  <td style={{ padding: '10px 15px', textAlign: 'left', color: 'var(--color-text-dark)' }}>{paciente.cedula}</td>
                  <td style={{ padding: '10px 15px', textAlign: 'left', color: 'var(--color-text-dark)' }}>{new Date(paciente.fecha_nacimiento).toLocaleDateString()}</td>
                  <td style={{ padding: '10px 15px', textAlign: 'left', color: 'var(--color-text-dark)' }}>{paciente.telefono}</td>
                  <td style={{ padding: '10px 15px', textAlign: 'left', color: 'var(--color-text-dark)' }}>{paciente.email}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default PacientesView;