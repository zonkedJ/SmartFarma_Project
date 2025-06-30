// smartfarma-frontend/src/components/MedicamentosView.jsx

import React, { useState, useEffect } from 'react'; // Importa useEffect
import axios from 'axios';

function MedicamentosView({ mostrarMensaje }) {
  // Estado para la lista de medicamentos
  const [medicamentos, setMedicamentos] = useState([]); // NUEVO: Estado para guardar los medicamentos

  // Estados para los campos del nuevo medicamento (ya lo tenías)
  const [nuevoMedicamento, setNuevoMedicamento] = useState({
    nombre: '',
    principio_activo: '',
    laboratorio: '',
    presentacion: '',
    stock: '',
    precio: '',
    fecha_vencimiento: ''
  });

  // NUEVO: Función para cargar los medicamentos desde el backend
  const cargarMedicamentos = async () => {
    try {
      const response = await axios.get('http://localhost:5000/medicamentos'); // Petición GET al backend
      setMedicamentos(response.data); // Guarda los medicamentos en el estado
      mostrarMensaje('Medicamentos cargados exitosamente.');
    } catch (error) {
      console.error('Error al cargar medicamentos:', error);
      mostrarMensaje('Error al cargar medicamentos. Verifica que el backend tenga la ruta GET /medicamentos.');
    }
  };

  // NUEVO: Cargar medicamentos al inicio de la aplicación y cada vez que cambie algo relevante
  useEffect(() => {
    cargarMedicamentos();
  }, []); // El array vacío asegura que se ejecute solo una vez al montar el componente

  // Manejar cambios en los campos del formulario de medicamento (ya lo tenías)
  const handleChangeMedicamento = (e) => {
    const { name, value } = e.target;
    setNuevoMedicamento(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  // Manejar el envío del formulario para agregar un medicamento (ya lo tenías, con pequeña mejora)
  const handleSubmitMedicamento = async (e) => {
    e.preventDefault();
    try {
      const medicamentoAEnviar = {
        ...nuevoMedicamento,
        precio: parseFloat(nuevoMedicamento.precio),
        stock: parseInt(nuevoMedicamento.stock, 10)
      };

      const response = await axios.post('http://localhost:5000/medicamentos', medicamentoAEnviar);
      mostrarMensaje(`Medicamento "${response.data.nombre}" agregado (ID: ${response.data.id}).`);
      setNuevoMedicamento({ // Limpiar el formulario después de agregar
        nombre: '',
        principio_activo: '',
        laboratorio: '',
        presentacion: '',
        stock: '',
        precio: '',
        fecha_vencimiento: ''
      });
      cargarMedicamentos(); // Recargar la lista para mostrar el nuevo medicamento
    } catch (error) {
      console.error('Error al agregar medicamento:', error);
      if (error.response && error.response.status === 409) {
        mostrarMensaje(`Error: ${error.response.data.message}`);
      } else {
        mostrarMensaje('Error al agregar medicamento. Verifica que el backend esté funcionando y tenga la ruta /medicamentos.');
      }
    }
  };

  return (
    <div>
      <h2>Registrar Nuevo Medicamento:</h2>
      <form onSubmit={handleSubmitMedicamento} style={{
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
          <label htmlFor="medicamentoNombre" style={{ marginBottom: '5px', fontWeight: 'bold' }}>Nombre:</label>
          <input type="text" id="medicamentoNombre" name="nombre" value={nuevoMedicamento.nombre} onChange={handleChangeMedicamento} required style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <label htmlFor="principio_activo" style={{ marginBottom: '5px', fontWeight: 'bold' }}>Principio Activo:</label>
          <input type="text" id="principio_activo" name="principio_activo" value={nuevoMedicamento.principio_activo} onChange={handleChangeMedicamento} style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <label htmlFor="laboratorio" style={{ marginBottom: '5px', fontWeight: 'bold' }}>Laboratorio:</label>
          <input type="text" id="laboratorio" name="laboratorio" value={nuevoMedicamento.laboratorio} onChange={handleChangeMedicamento} style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <label htmlFor="presentacion" style={{ marginBottom: '5px', fontWeight: 'bold' }}>Presentación:</label>
          <input type="text" id="presentacion" name="presentacion" value={nuevoMedicamento.presentacion} onChange={handleChangeMedicamento} style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <label htmlFor="medicamentoStock" style={{ marginBottom: '5px', fontWeight: 'bold' }}>Stock:</label>
          <input type="number" id="medicamentoStock" name="stock" value={nuevoMedicamento.stock} onChange={handleChangeMedicamento} required min="0" style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <label htmlFor="medicamentoPrecio" style={{ marginBottom: '5px', fontWeight: 'bold' }}>Precio:</label>
          <input type="number" id="medicamentoPrecio" name="precio" value={nuevoMedicamento.precio} onChange={handleChangeMedicamento} required min="0" step="0.01" style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gridColumn: '1 / -1' }}>
          <label htmlFor="medicamentoFechaVencimiento" style={{ marginBottom: '5px', fontWeight: 'bold' }}>Fecha de Vencimiento:</label>
          <input type="date" id="medicamentoFechaVencimiento" name="fecha_vencimiento" value={nuevoMedicamento.fecha_vencimiento} onChange={handleChangeMedicamento} required style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }} />
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
          Registrar Medicamento
        </button>
      </form>

      {/* NUEVO: Sección para listar medicamentos */}
      <h2 style={{ marginTop: '40px' }}>Lista de Medicamentos:</h2>
      {medicamentos.length === 0 ? (
        <p>No hay medicamentos registrados.</p>
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
                <th style={{ padding: '12px 15px', textAlign: 'left', backgroundColor: 'var(--color-primary)', color: 'var(--color-text-light)' }}>Nombre</th>
                <th style={{ padding: '12px 15px', textAlign: 'left', backgroundColor: 'var(--color-primary)', color: 'var(--color-text-light)' }}>Principio Activo</th>
                <th style={{ padding: '12px 15px', textAlign: 'left', backgroundColor: 'var(--color-primary)', color: 'var(--color-text-light)' }}>Laboratorio</th>
                <th style={{ padding: '12px 15px', textAlign: 'left', backgroundColor: 'var(--color-primary)', color: 'var(--color-text-light)' }}>Presentación</th>
                <th style={{ padding: '12px 15px', textAlign: 'left', backgroundColor: 'var(--color-primary)', color: 'var(--color-text-light)' }}>Stock</th>
                <th style={{ padding: '12px 15px', textAlign: 'left', backgroundColor: 'var(--color-primary)', color: 'var(--color-text-light)' }}>Precio</th>
                <th style={{ padding: '12px 15px', textAlign: 'left', backgroundColor: 'var(--color-primary)', color: 'var(--color-text-light)', borderTopRightRadius: '8px' }}>Vencimiento</th>
              </tr>
            </thead>
            <tbody>
              {medicamentos.map(medicamento => (
                <tr key={medicamento.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '10px 15px', textAlign: 'left', color: 'var(--color-text-dark)' }}>{medicamento.id}</td>
                  <td style={{ padding: '10px 15px', textAlign: 'left', color: 'var(--color-text-dark)' }}>{medicamento.nombre}</td>
                  <td style={{ padding: '10px 15px', textAlign: 'left', color: 'var(--color-text-dark)' }}>{medicamento.principio_activo || 'N/A'}</td>
                  <td style={{ padding: '10px 15px', textAlign: 'left', color: 'var(--color-text-dark)' }}>{medicamento.laboratorio || 'N/A'}</td>
                  <td style={{ padding: '10px 15px', textAlign: 'left', color: 'var(--color-text-dark)' }}>{medicamento.presentacion || 'N/A'}</td>
                  <td style={{ padding: '10px 15px', textAlign: 'left', color: 'var(--color-text-dark)' }}>{medicamento.stock}</td>
                  <td style={{ padding: '10px 15px', textAlign: 'left', color: 'var(--color-text-dark)' }}>${medicamento.precio ? parseFloat(medicamento.precio).toFixed(2) : '0.00'}</td>
                  <td style={{ padding: '10px 15px', textAlign: 'left', color: 'var(--color-text-dark)' }}>
                    {medicamento.fecha_vencimiento ? new Date(medicamento.fecha_vencimiento).toLocaleDateString() : 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default MedicamentosView;