// smartfarma-frontend/src/components/VentasView.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';

function VentasView({ mostrarMensaje }) {
  const [medicamentosDisponibles, setMedicamentosDisponibles] = useState([]);
  const [carrito, setCarrito] = useState([]);
  const [busquedaMed, setBusquedaMed] = useState('');
  const [pacientes, setPacientes] = useState([]);
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState('');
  const [totalCarrito, setTotalCarrito] = useState(0);

  // Cargar medicamentos disponibles y pacientes al cargar la vista
  useEffect(() => {
    const cargarDatosIniciales = async () => {
      try {
        const medsResponse = await axios.get('http://localhost:5000/medicamentos');
        setMedicamentosDisponibles(medsResponse.data);

        const pacientesResponse = await axios.get('http://localhost:5000/pacientes');
        setPacientes(pacientesResponse.data);

      } catch (error) {
        console.error('Error al cargar datos iniciales de ventas:', error);
        mostrarMensaje('Error al cargar medicamentos o pacientes para la venta.');
      }
    };
    cargarDatosIniciales();
  }, [mostrarMensaje]);

  // Efecto para recalcular el total del carrito cada vez que cambia
  useEffect(() => {
    const total = carrito.reduce((sum, item) => sum + (item.cantidad * item.precio), 0);
    setTotalCarrito(total);
  }, [carrito]);

  const handleBusquedaMedChange = (e) => {
    setBusquedaMed(e.target.value);
  };

  const handlePacienteChange = (e) => {
    setPacienteSeleccionado(e.target.value);
  };

  const agregarAlCarrito = (medicamento) => {
    const itemExistente = carrito.find(item => item.id === medicamento.id);
    if (itemExistente) {
      // Si el medicamento ya está en el carrito, incrementa la cantidad
      setCarrito(carrito.map(item =>
        item.id === medicamento.id
          ? { ...item, cantidad: item.cantidad + 1 }
          : item
      ));
    } else {
      // Si es un medicamento nuevo, agrégalo con cantidad 1
      setCarrito([...carrito, { ...medicamento, cantidad: 1 }]);
    }
    mostrarMensaje(`"${medicamento.nombre}" agregado al carrito.`);
  };

  const ajustarCantidad = (medicamentoId, operacion) => {
    setCarrito(carrito.map(item => {
      if (item.id === medicamentoId) {
        const nuevaCantidad = operacion === 'sumar' ? item.cantidad + 1 : item.cantidad - 1;
        // No permitir cantidad menor a 1 (o eliminar si llega a 0 en el filtro)
        return { ...item, cantidad: Math.max(0, nuevaCantidad) }; // Asegura que no sea negativo
      }
      return item;
    }).filter(item => item.cantidad > 0)); // Eliminar si la cantidad llega a 0
  };

  const removerDelCarrito = (medicamentoId) => {
    setCarrito(carrito.filter(item => item.id !== medicamentoId));
    mostrarMensaje('Medicamento removido del carrito.');
  };

  const finalizarVenta = async () => {
    if (carrito.length === 0) {
      mostrarMensaje('El carrito está vacío. Añade medicamentos para finalizar la venta.');
      return;
    }

    try {
      const itemsParaVenta = carrito.map(item => ({
        medicamento_id: item.id,
        cantidad: item.cantidad
      }));

      const ventaData = {
        items: itemsParaVenta,
        paciente_id: pacienteSeleccionado || null // Puede ser null si no se selecciona paciente
      };

      const response = await axios.post('http://localhost:5000/ventas', ventaData);
      mostrarMensaje(`Venta #${response.data.ventaId} finalizada con éxito. Total: $${response.data.total_venta}`);
      setCarrito([]); // Vaciar carrito
      setPacienteSeleccionado(''); // Limpiar paciente seleccionado
      // Opcional: recargar medicamentos disponibles si el stock se actualizó en el backend
      const medsResponse = await axios.get('http://localhost:5000/medicamentos'); // Recargar para actualizar stock
      setMedicamentosDisponibles(medsResponse.data);
    } catch (error) {
      console.error('Error al finalizar venta:', error);
      mostrarMensaje(`Error al finalizar venta: ${error.response?.data?.message || 'Error de conexión.'}`);
    }
  };

  const medicamentosFiltrados = medicamentosDisponibles.filter(med =>
    med.nombre.toLowerCase().includes(busquedaMed.toLowerCase()) ||
    med.principio_activo?.toLowerCase().includes(busquedaMed.toLowerCase())
  );

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '30px' }}>
      {/* Columna Izquierda: Lista de Medicamentos y Búsqueda */}
      <div>
        <h2>Buscar y Añadir Medicamentos:</h2>
        <input
          type="text"
          placeholder="Buscar medicamento por nombre o principio activo..."
          value={busquedaMed}
          onChange={handleBusquedaMedChange}
          style={{
            width: 'calc(100% - 22px)',
            padding: '10px',
            marginBottom: '20px',
            borderRadius: '4px',
            border: '1px solid #ddd'
          }}
        />
        <div style={{ maxHeight: '400px', overflowY: 'auto', backgroundColor: 'var(--color-text-light)', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          {medicamentosFiltrados.length === 0 ? (
            <p style={{ padding: '20px', textAlign: 'center' }}>No se encontraron medicamentos.</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #eee' }}>
                  <th style={{ padding: '10px', textAlign: 'left' }}>Nombre</th>
                  <th style={{ padding: '10px', textAlign: 'left' }}>Precio</th>
                  <th style={{ padding: '10px', textAlign: 'center' }}>Stock</th>
                  <th style={{ padding: '10px', textAlign: 'center' }}>Acción</th>
                </tr>
              </thead>
              <tbody>
                {medicamentosFiltrados.map(med => (
                  <tr key={med.id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '10px', textAlign: 'left' }}>{med.nombre}</td>
                    <td style={{ padding: '10px', textAlign: 'left' }}>${parseFloat(med.precio).toFixed(2)}</td>
                    <td style={{ padding: '10px', textAlign: 'center', color: med.stock < 10 ? 'red' : 'inherit' }}>{med.stock}</td>
                    <td style={{ padding: '10px', textAlign: 'center' }}>
                      <button onClick={() => agregarAlCarrito(med)} style={{
                        padding: '8px 12px',
                        backgroundColor: 'var(--color-primary)',
                        color: 'var(--color-text-light)',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        opacity: med.stock === 0 ? 0.5 : 1, // Desactivar si no hay stock
                        pointerEvents: med.stock === 0 ? 'none' : 'auto'
                      }} disabled={med.stock === 0}>
                        Añadir
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Columna Derecha: Carrito de Compras */}
      <div style={{ backgroundColor: 'var(--color-text-light)', padding: '25px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <h2>Carrito de Compras:</h2>

        {/* Selector de Paciente */}
        <div style={{ marginBottom: '20px' }}>
          <label htmlFor="pacienteSelect" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Paciente (Opcional):</label>
          <select
            id="pacienteSelect"
            value={pacienteSeleccionado}
            onChange={handlePacienteChange}
            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
          >
            <option value="">-- Seleccionar Paciente --</option>
            {pacientes.map(pac => (
              <option key={pac.id} value={pac.id}>{pac.nombre} {pac.apellido} ({pac.cedula})</option>
            ))}
          </select>
        </div>


        {carrito.length === 0 ? (
          <p>El carrito está vacío.</p>
        ) : (
          <div style={{ maxHeight: '300px', overflowY: 'auto', marginBottom: '20px' }}>
            {carrito.map(item => (
              <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee', padding: '10px 0' }}>
                <span style={{ flexGrow: 1 }}>{item.nombre}</span>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <button onClick={() => ajustarCantidad(item.id, 'restar')} style={{ padding: '5px 8px', backgroundColor: '#ddd', border: 'none', borderRadius: '3px', cursor: 'pointer', marginRight: '5px' }}>-</button>
                  <span>{item.cantidad}</span>
                  <button onClick={() => ajustarCantidad(item.id, 'sumar')} style={{ padding: '5px 8px', backgroundColor: '#ddd', border: 'none', borderRadius: '3px', cursor: 'pointer', marginLeft: '5px' }}>+</button>
                  <span style={{ marginLeft: '10px', fontWeight: 'bold' }}>${(item.cantidad * item.precio).toFixed(2)}</span>
                  <button onClick={() => removerDelCarrito(item.id)} style={{ padding: '5px 8px', backgroundColor: 'var(--color-danger)', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer', marginLeft: '15px' }}>X</button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div style={{ fontSize: '1.5em', fontWeight: 'bold', textAlign: 'right', marginTop: '20px', borderTop: '1px solid #ddd', paddingTop: '10px' }}>
          Total: ${totalCarrito.toFixed(2)}
        </div>

        <button
          onClick={finalizarVenta}
          style={{
            width: '100%',
            padding: '15px',
            backgroundColor: 'var(--color-success)',
            color: 'var(--color-text-light)',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '1.2em',
            fontWeight: 'bold',
            marginTop: '20px'
          }}
        >
          Finalizar Venta
        </button>
      </div>
    </div>
  );
}

export default VentasView;
