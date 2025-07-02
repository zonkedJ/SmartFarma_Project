// smartfarma-frontend/src/components/VentasView.jsx

import React, { useState, useEffect } from 'react'; // ¡CORRECCIÓN AQUÍ!
import axios from 'axios';

function VentasView({ mostrarMensaje }) {
  const [medicamentosDisponibles, setMedicamentosDisponibles] = useState([]);
  const [pacientesDisponibles, setPacientesDisponibles] = useState([]);
  const [selectedPacienteId, setSelectedPacienteId] = useState('');
  const [searchMedicamento, setSearchMedicamento] = useState('');
  const [carrito, setCarrito] = useState([]);
  const [totalVenta, setTotalVenta] = useState(0);

  // Nuevos estados para el recibo
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [receiptData, setReceiptData] = useState(null);

  // Cargar medicamentos y pacientes al inicio
  useEffect(() => {
    cargarMedicamentosDisponibles();
    cargarPacientesDisponibles();
  }, []);

  // Recalcular total de venta cada vez que el carrito cambia
  useEffect(() => {
    const newTotal = carrito.reduce((sum, item) => sum + (item.cantidad * item.precio), 0);
    setTotalVenta(newTotal);
  }, [carrito]);

  // Función para cargar medicamentos disponibles para la venta
  const cargarMedicamentosDisponibles = async () => {
    try {
      const response = await axios.get('http://localhost:5000/medicamentos_venta');
      setMedicamentosDisponibles(response.data);
    } catch (error) {
      console.error('Error al cargar medicamentos para venta:', error);
      mostrarMensaje('Error al cargar medicamentos disponibles.');
    }
  };

  // Función para cargar pacientes disponibles
  const cargarPacientesDisponibles = async () => {
    try {
      const response = await axios.get('http://localhost:5000/pacientes');
      setPacientesDisponibles(response.data);
    } catch (error) {
      console.error('Error al cargar pacientes:', error);
      mostrarMensaje('Error al cargar pacientes.');
    }
  };

  // Añadir medicamento al carrito
  const handleAddMedicamentoToCart = (medicamento) => {
    const existingItem = carrito.find(item => item.id === medicamento.id);
    if (existingItem) {
      // Si ya está en el carrito, aumentar cantidad si hay stock
      if (existingItem.cantidad < medicamento.stock) {
        setCarrito(carrito.map(item =>
          item.id === medicamento.id ? { ...item, cantidad: item.cantidad + 1 } : item
        ));
      } else {
        mostrarMensaje(`No hay suficiente stock de ${medicamento.nombre}. Stock actual: ${medicamento.stock}`);
      }
    } else {
      // Si no está en el carrito, añadirlo con cantidad 1
      if (medicamento.stock > 0) {
        setCarrito([...carrito, { ...medicamento, cantidad: 1 }]);
      } else {
        mostrarMensaje(`El medicamento ${medicamento.nombre} no tiene stock disponible.`);
      }
    }
  };

  // Aumentar cantidad en el carrito
  const handleIncreaseQuantity = (medicamentoId) => {
    setCarrito(carrito.map(item => {
      if (item.id === medicamentoId) {
        const medicamentoOriginal = medicamentosDisponibles.find(med => med.id === medicamentoId);
        if (item.cantidad < medicamentoOriginal.stock) {
          return { ...item, cantidad: item.cantidad + 1 };
        } else {
          mostrarMensaje(`No hay más stock de ${item.nombre}.`);
        }
      }
      return item;
    }).filter(Boolean)); // Filter out undefined if a message was shown
  };

  // Disminuir cantidad en el carrito
  const handleDecreaseQuantity = (medicamentoId) => {
    setCarrito(carrito.map(item =>
      item.id === medicamentoId ? { ...item, cantidad: item.cantidad - 1 } : item
    ).filter(item => item.cantidad > 0)); // Eliminar si la cantidad llega a 0
  };

  // Eliminar medicamento del carrito
  const handleRemoveFromCart = (medicamentoId) => {
    setCarrito(carrito.filter(item => item.id !== medicamentoId));
  };

  // Procesar la venta
  const handleSubmitVenta = async () => {
    if (carrito.length === 0) {
      mostrarMensaje('El carrito está vacío. Agrega medicamentos para realizar una venta.');
      return;
    }

    const ventaData = {
      paciente_id: selectedPacienteId || null, // Si no hay paciente seleccionado, enviar null
      carrito: carrito.map(item => ({
        id: item.id,
        cantidad: item.cantidad,
        precio: item.precio
      }))
    };

    try {
      const response = await axios.post('http://localhost:5000/ventas', ventaData);
      mostrarMensaje('Venta registrada exitosamente.');
      
      // Preparar datos para el recibo
      const pacienteInfo = pacientesDisponibles.find(p => p.id === parseInt(selectedPacienteId));
      setReceiptData({
        venta_id: response.data.venta_id,
        fecha_venta: new Date().toLocaleString(),
        paciente_nombre: pacienteInfo ? `${pacienteInfo.nombre} ${pacienteInfo.apellido}` : 'Consumidor Final',
        items: carrito.map(item => ({
          nombre: item.nombre,
          presentacion: item.presentacion,
          cantidad: item.cantidad,
          precio_unitario: item.precio,
          subtotal: item.cantidad * item.precio
        })),
        total_venta: totalVenta
      });
      setShowReceiptModal(true); // Mostrar el modal del recibo

      // Limpiar carrito y recargar medicamentos disponibles
      setCarrito([]);
      setSelectedPacienteId('');
      setSearchMedicamento('');
      cargarMedicamentosDisponibles(); // Recargar stock actualizado
    } catch (error) {
      console.error('Error al registrar venta:', error);
      mostrarMensaje('Error al registrar venta.');
    }
  };

  // Filtrar medicamentos disponibles por búsqueda
  const filteredMedicamentos = medicamentosDisponibles.filter(med =>
    med.nombre.toLowerCase().includes(searchMedicamento.toLowerCase())
  );

  // Función para imprimir el recibo
  const handlePrintReceipt = () => {
    const printContent = document.getElementById('receipt-modal-content');
    const originalContents = document.body.innerHTML;
    const printWindow = window.open('', '_blank');
    printWindow.document.write('<html><head><title>Recibo de Venta</title>');
    // Estilos para la impresión
    printWindow.document.write(`
        <style>
            body { font-family: 'Inter', sans-serif; margin: 20px; }
            .receipt-header { text-align: center; margin-bottom: 20px; }
            .receipt-header h1 { font-size: 24px; margin: 0; }
            .receipt-header p { font-size: 14px; margin: 5px 0; }
            .receipt-details, .receipt-items { margin-bottom: 20px; border-bottom: 1px dashed #ccc; padding-bottom: 10px; }
            .receipt-details p { margin: 5px 0; font-size: 14px; }
            .receipt-items table { width: 100%; border-collapse: collapse; }
            .receipt-items th, .receipt-items td { border-bottom: 1px solid #eee; padding: 8px 0; text-align: left; font-size: 13px; }
            .receipt-items th { background-color: #f2f2f2; }
            .receipt-total { text-align: right; font-size: 16px; font-weight: bold; margin-top: 10px; }
            @media print {
                body { margin: 0; }
                .receipt-modal-overlay { display: none; }
                .receipt-modal-content {
                    width: 100%;
                    max-width: none;
                    box-shadow: none;
                    border-radius: 0;
                    padding: 0;
                    margin: 0;
                }
            }
        </style>
    `);
    printWindow.document.write('</head><body>');
    printWindow.document.write(printContent.innerHTML);
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };


  return (
    <div>
      <h2>Realizar Venta</h2>

      {/* Selector de Paciente */}
      <div style={{ marginBottom: '20px', padding: '20px', border: '1px solid var(--color-primary)', borderRadius: '8px', backgroundColor: 'var(--color-text-light)', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <h3>Seleccionar Paciente (Opcional)</h3>
        <select
          value={selectedPacienteId}
          onChange={(e) => setSelectedPacienteId(e.target.value)}
          style={inputStyle}
        >
          <option value="">Seleccionar Paciente</option>
          {pacientesDisponibles.map(paciente => (
            <option key={paciente.id} value={paciente.id}>
              {paciente.nombre} {paciente.apellido} ({paciente.cedula})
            </option>
          ))}
        </select>
      </div>

      {/* Búsqueda y adición de medicamentos */}
      <div style={{ marginBottom: '20px', padding: '20px', border: '1px solid var(--color-primary)', borderRadius: '8px', backgroundColor: 'var(--color-text-light)', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <h3>Buscar y Añadir Medicamentos</h3>
        <input
          type="text"
          placeholder="Buscar medicamento por nombre..."
          value={searchMedicamento}
          onChange={(e) => setSearchMedicamento(e.target.value)}
          style={inputStyle}
        />
        <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid #eee', borderRadius: '4px', marginTop: '10px' }}>
          {filteredMedicamentos.length === 0 ? (
            <p style={{ padding: '10px', textAlign: 'center', color: 'var(--color-text-dark)' }}>No se encontraron medicamentos o no hay stock.</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--color-secondary-light)' }}>
                  <th style={tableHeaderStyleSmall}>Nombre</th>
                  <th style={tableHeaderStyleSmall}>Presentación</th>
                  <th style={tableHeaderStyleSmall}>Stock</th>
                  <th style={tableHeaderStyleSmall}>Precio</th>
                  <th style={tableHeaderStyleSmall}>Acción</th>
                </tr>
              </thead>
              <tbody>
                {filteredMedicamentos.map(med => (
                  <tr key={med.id} style={tableRowStyleSmall}>
                    <td style={tableCellStyleSmall}>{med.nombre}</td>
                    <td style={tableCellStyleSmall}>{med.presentacion}</td>
                    <td style={tableCellStyleSmall}>{med.stock}</td>
                    <td style={tableCellStyleSmall}>${parseFloat(med.precio).toFixed(2)}</td>
                    <td style={tableCellStyleSmall}>
                      <button
                        onClick={() => handleAddMedicamentoToCart(med)}
                        disabled={med.stock <= 0}
                        style={{ ...buttonStyleSmall, backgroundColor: med.stock <= 0 ? '#ccc' : 'var(--color-add)' }}
                      >
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

      {/* Carrito de compras */}
      <div style={{ marginBottom: '30px', padding: '20px', border: '1px solid var(--color-primary)', borderRadius: '8px', backgroundColor: 'var(--color-text-light)', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <h3>Carrito de Compras</h3>
        {carrito.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--color-text-dark)' }}>El carrito está vacío.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--color-secondary-light)' }}>
                  <th style={tableHeaderStyleSmall}>Medicamento</th>
                  <th style={tableHeaderStyleSmall}>Cantidad</th>
                  <th style={tableHeaderStyleSmall}>Precio Unitario</th>
                  <th style={tableHeaderStyleSmall}>Subtotal</th>
                  <th style={tableHeaderStyleSmall}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {carrito.map(item => (
                  <tr key={item.id} style={tableRowStyleSmall}>
                    <td style={tableCellStyleSmall}>{item.nombre} ({item.presentacion})</td>
                    <td style={tableCellStyleSmall}>
                      <button onClick={() => handleDecreaseQuantity(item.id)} style={quantityButtonStyle}>-</button>
                      <span style={{ margin: '0 8px', color: 'var(--color-text-dark)' }}>{item.cantidad}</span>
                      <button onClick={() => handleIncreaseQuantity(item.id)} style={quantityButtonStyle}>+</button>
                    </td>
                    <td style={tableCellStyleSmall}>${parseFloat(item.precio).toFixed(2)}</td>
                    <td style={tableCellStyleSmall}>${(item.cantidad * parseFloat(item.precio)).toFixed(2)}</td>
                    <td style={tableCellStyleSmall}>
                      <button onClick={() => handleRemoveFromCart(item.id)} style={{ ...buttonStyleSmall, backgroundColor: 'var(--color-delete)' }}>
                        Quitar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <h3 style={{ textAlign: 'right', marginTop: '20px', color: 'var(--color-primary)' }}>Total: ${totalVenta.toFixed(2)}</h3>
        <button onClick={handleSubmitVenta} style={{ ...buttonStyle, width: '100%' }} disabled={carrito.length === 0}>
          Registrar Venta
        </button>
      </div>

      {/* Modal del Recibo */}
      {showReceiptModal && receiptData && (
        <div style={receiptModalOverlayStyle}>
          <div id="receipt-modal-content" style={receiptModalContentStyle}>
            {/* Botón de cerrar (la 'X') */}
            <button
              onClick={() => setShowReceiptModal(false)}
              style={closeButtonStyle}
              aria-label="Cerrar recibo"
            >
              &times; {/* Esto es el carácter 'x' */}
            </button>

            <div style={receiptHeaderStyle}>
              <h1>Recibo de Venta</h1>
              <p>SmartFarma - Tu Farmacia de Confianza</p>
              <p>Fecha: {receiptData.fecha_venta}</p>
              <p>ID Venta: {receiptData.venta_id}</p>
              <p>Paciente: {receiptData.paciente_nombre}</p>
            </div>
            <div style={receiptItemsStyle}>
              <h3 style={{ marginBottom: '10px' }}>Detalles de la Compra:</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={{ borderBottom: '1px solid #eee', padding: '8px 0', textAlign: 'left' }}>Medicamento</th>
                    <th style={{ borderBottom: '1px solid #eee', padding: '8px 0', textAlign: 'right' }}>Cant.</th>
                    <th style={{ borderBottom: '1px solid #eee', padding: '8px 0', textAlign: 'right' }}>P. Unit.</th>
                    <th style={{ borderBottom: '1px solid #eee', padding: '8px 0', textAlign: 'right' }}>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {receiptData.items.map((item, index) => (
                    <tr key={index}>
                      <td style={{ borderBottom: '1px solid #eee', padding: '8px 0', textAlign: 'left' }}>{item.nombre} ({item.presentacion})</td>
                      <td style={{ borderBottom: '1px solid #eee', padding: '8px 0', textAlign: 'right' }}>{item.cantidad}</td>
                      <td style={{ borderBottom: '1px solid #eee', padding: '8px 0', textAlign: 'right' }}>${parseFloat(item.precio_unitario).toFixed(2)}</td>
                      <td style={{ borderBottom: '1px solid #eee', padding: '8px 0', textAlign: 'right' }}>${parseFloat(item.subtotal).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={receiptTotalStyle}>
              <strong>Total de la Venta: ${receiptData.total_venta.toFixed(2)}</strong>
            </div>
            <div style={{ textAlign: 'center', marginTop: '30px' }}>
              <button onClick={handlePrintReceipt} style={{ ...buttonStyle, marginRight: '10px' }}>
                Imprimir Recibo
              </button>
              <button onClick={() => setShowReceiptModal(false)} style={{ ...buttonStyle, backgroundColor: 'var(--color-cancel)' }}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Estilos internos (puedes moverlos a index.css si prefieres)
const inputStyle = {
  padding: '10px',
  border: '1px solid #ddd',
  borderRadius: '4px',
  width: '100%',
  boxSizing: 'border-box',
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

const quantityButtonStyle = {
  padding: '2px 8px',
  backgroundColor: 'var(--color-secondary)',
  color: 'var(--color-text-dark)',
  border: '1px solid #ccc',
  borderRadius: '4px',
  cursor: 'pointer',
  fontSize: '0.9em',
};

const tableHeaderStyleSmall = {
  padding: '8px 10px',
  textAlign: 'left',
  backgroundColor: 'var(--color-primary)',
  color: 'var(--color-text-light)',
};

const tableRowStyleSmall = {
  borderBottom: '1px solid #eee',
};

const tableCellStyleSmall = {
  padding: '8px 10px',
  textAlign: 'left',
  color: 'var(--color-text-dark)',
};

// Estilos para el modal del recibo
const receiptModalOverlayStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.7)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 1000,
};

const receiptModalContentStyle = {
  backgroundColor: 'var(--color-text-light)',
  padding: '30px',
  borderRadius: '8px',
  boxShadow: '0 5px 15px rgba(0, 0, 0, 0.3)',
  maxWidth: '500px',
  width: '90%',
  maxHeight: '90vh',
  overflowY: 'auto',
  position: 'relative', // Importante para posicionar el botón de cerrar
};

const receiptHeaderStyle = {
  textAlign: 'center',
  marginBottom: '20px',
  borderBottom: '1px dashed #ccc',
  paddingBottom: '15px',
};

const receiptItemsStyle = {
  marginBottom: '20px',
};

const receiptTotalStyle = {
  textAlign: 'right',
  fontSize: '1.2em',
  fontWeight: 'bold',
  marginTop: '15px',
  paddingTop: '10px',
  borderTop: '1px dashed #ccc',
};

const closeButtonStyle = {
  position: 'absolute',
  top: '10px',
  right: '15px',
  backgroundColor: 'transparent',
  border: 'none',
  fontSize: '1.5em',
  fontWeight: 'bold',
  color: 'var(--color-text-dark)',
  cursor: 'pointer',
  padding: '5px',
  lineHeight: '1',
  transition: 'color 0.2s ease',
};

export default VentasView;
