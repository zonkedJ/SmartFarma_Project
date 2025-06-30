// smartfarma-backend/index.js

// Importa las librerías necesarias
const express = require('express'); // Framework web para construir la API
const cors = require('cors');     // Para permitir comunicación entre tu frontend y backend
const { Pool } = require('pg');   // Cliente para interactuar con PostgreSQL

const app = express();
const port = 5000; // Puerto donde correrá tu servidor backend

// --- Configuración de la base de datos PostgreSQL ---
// ¡MUY IMPORTANTE! Usa la contraseña del usuario 'postgres' que estableciste al instalar PostgreSQL
// o la nueva contraseña si la restableciste.
const pool = new Pool({
    user: 'postgres',           // El usuario por defecto de PostgreSQL
    host: 'localhost',          // La base de datos está en tu misma computadora
    database: 'smartfarma_db',  // El nombre de la base de datos que creaste en pgAdmin
    password: 'smartfarma123', // <<<<<<< ¡¡¡CAMBIA ESTO por tu contraseña real!!!
    port: 5432,                 // El puerto por defecto de PostgreSQL
});

// Middlewares: Funciones que se ejecutan antes de que las peticiones lleguen a tus rutas
app.use(cors()); // Permite peticiones de otros orígenes (para que tu frontend pueda hablar con el backend)
app.use(express.json()); // Permite que el servidor entienda datos en formato JSON en las peticiones

// --- Rutas de la API para Pacientes ---

// Ruta principal: Verifica que el servidor está corriendo
app.get('/', (req, res) => {
  res.send('¡Servidor de SmartFarma funcionando y conectado a la DB!');
});

// Ruta para obtener todos los pacientes
app.get('/pacientes', async (req, res) => {
    try {
        // Ejecuta una consulta SQL para seleccionar todos los pacientes, ordenados por ID descendente
        const result = await pool.query('SELECT * FROM pacientes ORDER BY id DESC');
        // Envía los resultados como una respuesta JSON
        res.json(result.rows);
    } catch (err) {
        // Manejo de errores: imprime en consola y envía una respuesta de error al cliente
        console.error('Error al obtener pacientes:', err.message);
        res.status(500).send('Error del servidor al obtener pacientes');
    }
});

// Ruta para agregar un nuevo paciente
app.post('/pacientes', async (req, res) => {
    try {
        // Extrae los datos del paciente del cuerpo de la petición (req.body)
        const { nombre, apellido, cedula, fecha_nacimiento, direccion, telefono, email, historial_medico } = req.body;
        // Ejecuta una consulta SQL para insertar un nuevo paciente.
        // $1, $2, etc., son marcadores de posición para evitar inyección SQL (parametrización)
        const result = await pool.query(
            'INSERT INTO pacientes (nombre, apellido, cedula, fecha_nacimiento, direccion, telefono, email, historial_medico) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
            [nombre, apellido, cedula, fecha_nacimiento, direccion, telefono, email, historial_medico]
        );
        // Envía el paciente recién insertado con su ID como respuesta (código 201 Created)
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Error al agregar paciente:', err.message);
        // Si el error es por violación de restricción UNIQUE (ej. cédula o email duplicados)
        if (err.code === '23505') { // Código de error de PostgreSQL para violación de unicidad
            return res.status(409).json({ message: 'Cédula o email ya existen. Por favor, usa datos únicos.' });
        }
        res.status(500).send('Error del servidor al agregar paciente');
    }
});

// --- Rutas de la API para Medicamentos ---

// Ruta para agregar un nuevo medicamento
app.post('/medicamentos', async (req, res) => {
    try {
        // Extrae los datos del medicamento del cuerpo de la petición
        const { nombre, principio_activo, laboratorio, presentacion, stock, precio, fecha_vencimiento } = req.body;
        // Ejecuta la consulta SQL para insertar
        const result = await pool.query(
            'INSERT INTO medicamentos (nombre, principio_activo, laboratorio, presentacion, stock, precio, fecha_vencimiento) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
            [nombre, principio_activo, laboratorio, presentacion, stock, precio, fecha_vencimiento]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Error al agregar medicamento:', err.message);
        // Puedes añadir una verificación para nombre duplicado si lo necesitas, similar a pacientes
        if (err.code === '23505') { // Si tienes un UNIQUE constraint en el nombre del medicamento
            return res.status(409).json({ message: 'El medicamento con este nombre ya existe. Por favor, usa un nombre único.' });
        }
        res.status(500).send('Error del servidor al agregar medicamento');
    }
});

// Ruta para obtener todos los medicamentos
app.get('/medicamentos', async (req, res) => {
    try {
        // Ejecuta una consulta SQL para seleccionar todos los medicamentos
        const result = await pool.query('SELECT * FROM medicamentos ORDER BY id DESC');
        res.json(result.rows);
    } catch (err) {
        console.error('Error al obtener medicamentos:', err.message);
        res.status(500).send('Error del servidor al obtener medicamentos');
    }
});

// NUEVO: Ruta para obtener un medicamento por ID (útil para añadir al carrito de ventas)
app.get('/medicamentos/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('SELECT * FROM medicamentos WHERE id = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Medicamento no encontrado.' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error al obtener medicamento por ID:', err.message);
        res.status(500).send('Error del servidor al obtener medicamento.');
    }
});

// --- Rutas de la API para Ventas ---

// Ruta para registrar una nueva venta
app.post('/ventas', async (req, res) => {
    const client = await pool.connect(); // Obtener un cliente del pool para transacciones
    try {
        await client.query('BEGIN'); // Iniciar la transacción

        const { paciente_id, items } = req.body; // 'items' es un array de { medicamento_id, cantidad }

        // 1. Insertar la venta principal
        const ventaResult = await client.query(
            'INSERT INTO ventas (total_venta, paciente_id) VALUES ($1, $2) RETURNING id, fecha_venta',
            [0, paciente_id || null] // Total inicial 0, lo actualizaremos después. Si no hay paciente_id, guarda NULL.
        );
        const ventaId = ventaResult.rows[0].id;
        let totalVentaCalculado = 0;

        // 2. Insertar los detalles de la venta y actualizar el stock
        for (const item of items) {
            const { medicamento_id, cantidad } = item;

            // Obtener el precio y stock actual del medicamento, bloqueando la fila para esta transacción (FOR UPDATE)
            const medResult = await client.query('SELECT nombre, precio, stock FROM medicamentos WHERE id = $1 FOR UPDATE', [medicamento_id]);
            if (medResult.rows.length === 0) {
                throw new Error(`Medicamento con ID ${medicamento_id} no encontrado.`);
            }
            const medicamento = medResult.rows[0];
            if (medicamento.stock < cantidad) {
                throw new Error(`Stock insuficiente para ${medicamento.nombre}. Disponible: ${medicamento.stock}, Solicitado: ${cantidad}.`);
            }

            // Insertar detalle de la venta
            await client.query(
                'INSERT INTO venta_detalle (venta_id, medicamento_id, cantidad, precio_unitario) VALUES ($1, $2, $3, $4)',
                [ventaId, medicamento_id, cantidad, medicamento.precio]
            );

            // Actualizar stock del medicamento
            await client.query(
                'UPDATE medicamentos SET stock = stock - $1 WHERE id = $2',
                [cantidad, medicamento_id]
            );

            totalVentaCalculado += cantidad * parseFloat(medicamento.precio);
        }

        // 3. Actualizar el total de la venta principal
        await client.query(
            'UPDATE ventas SET total_venta = $1 WHERE id = $2',
            [totalVentaCalculado.toFixed(2), ventaId]
        );

        await client.query('COMMIT'); // Confirmar la transacción
        res.status(201).json({
            message: 'Venta registrada exitosamente',
            ventaId: ventaId,
            fecha_venta: ventaResult.rows[0].fecha_venta,
            total_venta: totalVentaCalculado.toFixed(2)
        });

    } catch (err) {
        await client.query('ROLLBACK'); // Deshacer la transacción en caso de error
        console.error('Error al registrar venta:', err.message);
        res.status(500).json({ message: err.message || 'Error del servidor al registrar la venta.' });
    } finally {
        client.release(); // Liberar el cliente a la pool
    }
});

// NUEVO: Ruta para obtener el historial completo de ventas con detalles
app.get('/ventas_historial', async (req, res) => {
    try {
        // Obtener todas las ventas principales
        const ventasPrincipales = await pool.query('SELECT id, fecha_venta, total_venta, paciente_id FROM ventas ORDER BY fecha_venta DESC');

        const historialCompleto = [];

        // Para cada venta, obtener sus detalles y el nombre del paciente
        for (const venta of ventasPrincipales.rows) {
            const detalles = await pool.query(
                `SELECT vd.cantidad, vd.precio_unitario, m.nombre AS medicamento_nombre, m.presentacion
                 FROM venta_detalle vd
                 JOIN medicamentos m ON vd.medicamento_id = m.id
                 WHERE vd.venta_id = $1`,
                [venta.id]
            );

            let nombrePaciente = 'Cliente Anónimo'; // Valor por defecto
            if (venta.paciente_id) {
                const pacienteInfo = await pool.query('SELECT nombre, apellido FROM pacientes WHERE id = $1', [venta.paciente_id]);
                if (pacienteInfo.rows.length > 0) {
                    nombrePaciente = `${pacienteInfo.rows[0].nombre} ${pacienteInfo.rows[0].apellido}`;
                }
            }

            historialCompleto.push({
                id: venta.id,
                fecha_venta: venta.fecha_venta,
                total_venta: parseFloat(venta.total_venta).toFixed(2),
                paciente_id: venta.paciente_id,
                paciente_nombre: nombrePaciente,
                detalles: detalles.rows
            });
        }

        res.json(historialCompleto);
    } catch (err) {
        console.error('Error al obtener el historial de ventas:', err.message);
        res.status(500).send('Error del servidor al obtener el historial de ventas.');
    }
});


// Iniciar el servidor Express en el puerto especificado
app.listen(port, () => {
  console.log(`Servidor de SmartFarma escuchando en http://localhost:${port}`);
});
