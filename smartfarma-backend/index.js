// smartfarma-backend/index.js

const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
const port = 5000;

// Configuración de la conexión a PostgreSQL
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'smartfarma_db',
    password: 'smartfarma123', // ¡CAMBIA ESTO por tu contraseña real de PostgreSQL!
    port: 5432,
});

// Capas intermedias
app.use(cors()); // Habilita CORS para permitir solicitudes desde el frontend
app.use(express.json()); //Habilita el uso de JSON en las solicitudes

// --- Rutas para Pacientes ---

// Ruta para obtener todos los pacientes
app.get('/pacientes', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM pacientes ORDER BY id ASC');
        res.json(result.rows);
    } catch (err) {
        console.error('Error al obtener pacientes:', err);
        res.status(500).json({ message: 'Error interno del servidor al obtener pacientes.' });
    }
});

// Ruta para agregar un nuevo paciente
app.post('/pacientes', async (req, res) => {
    const { nombre, apellido, cedula, fecha_nacimiento, direccion, telefono, email, historial_medico } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO pacientes (nombre, apellido, cedula, fecha_nacimiento, direccion, telefono, email, historial_medico) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
            [nombre, apellido, cedula, fecha_nacimiento, direccion, telefono, email, historial_medico]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Error al agregar paciente:', err);
        // Manejo de errores específicos, por ejemplo, cédula o email duplicados
        if (err.code === '23505') { // Código de error para violación de unicidad
            if (err.constraint === 'pacientes_cedula_key') {
                return res.status(400).json({ message: 'La cédula ya está registrada.' });
            }
            if (err.constraint === 'pacientes_email_key') {
                return res.status(400).json({ message: 'El email ya está registrado.' });
            }
        }
        res.status(500).json({ message: 'Error interno del servidor al agregar paciente.' });
    }
});

// Ruta: Actualizar un paciente por ID
app.put('/pacientes/:id', async (req, res) => {
    const { id } = req.params; // ID del paciente a actualizar
    const { nombre, apellido, cedula, fecha_nacimiento, direccion, telefono, email, historial_medico } = req.body;
    try {
        const result = await pool.query(
            `UPDATE pacientes SET
                nombre = $1,
                apellido = $2,
                cedula = $3,
                fecha_nacimiento = $4,
                direccion = $5,
                telefono = $6,
                email = $7,
                historial_medico = $8
             WHERE id = $9 RETURNING *`,
            [nombre, apellido, cedula, fecha_nacimiento, direccion, telefono, email, historial_medico, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Paciente no encontrado.' });
        }
        res.json(result.rows[0]); // Devuelve el paciente actualizado
    } catch (err) {
        console.error('Error al actualizar paciente:', err);
        if (err.code === '23505') { // Manejo de errores de unicidad (cédula o email)
            if (err.constraint === 'pacientes_cedula_key') {
                return res.status(400).json({ message: 'La cédula ya está registrada para otro paciente.' });
            }
            if (err.constraint === 'pacientes_email_key') {
                return res.status(400).json({ message: 'El email ya está registrado para otro paciente.' });
            }
        }
        res.status(500).json({ message: 'Error interno del servidor al actualizar paciente.' });
    }
});

// Ruta: Eliminar un paciente por ID
app.delete('/pacientes/:id', async (req, res) => {
    const { id } = req.params; // ID del paciente a eliminar
    try {
        const result = await pool.query('DELETE FROM pacientes WHERE id = $1 RETURNING *', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Paciente no encontrado.' });
        }
        res.json({ message: 'Paciente eliminado exitosamente.', pacienteEliminado: result.rows[0] });
    } catch (err) {
        console.error('Error al eliminar paciente:', err);
        res.status(500).json({ message: 'Error interno del servidor al eliminar paciente.' });
    }
});


// --- Rutas para Medicamentos ---

// Ruta para obtener todos los medicamentos
app.get('/medicamentos', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM medicamentos ORDER BY id ASC');
        res.json(result.rows);
    } catch (err) {
        console.error('Error al obtener medicamentos:', err);
        res.status(500).json({ message: 'Error interno del servidor al obtener medicamentos.' });
    }
});

// Ruta para agregar un nuevo medicamento
app.post('/medicamentos', async (req, res) => {
    const { nombre, principio_activo, laboratorio, presentacion, stock, precio, fecha_vencimiento } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO medicamentos (nombre, principio_activo, laboratorio, presentacion, stock, precio, fecha_vencimiento) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
            [nombre, principio_activo, laboratorio, presentacion, stock, precio, fecha_vencimiento]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Error al agregar medicamento:', err);
        if (err.code === '23505') { // Código de error para violación de unicidad (nombre del medicamento)
            return res.status(400).json({ message: 'Ya existe un medicamento con ese nombre.' });
        }
        res.status(500).json({ message: 'Error interno del servidor al agregar medicamento.' });
    }
});

//  Actualizar un medicamento por ID
app.put('/medicamentos/:id', async (req, res) => {
    const { id } = req.params; // ID del medicamento a actualizar
    const { nombre, principio_activo, laboratorio, presentacion, stock, precio, fecha_vencimiento } = req.body;
    try {
        const result = await pool.query(
            `UPDATE medicamentos SET
                nombre = $1,
                principio_activo = $2,
                laboratorio = $3,
                presentacion = $4,
                stock = $5,
                precio = $6,
                fecha_vencimiento = $7
             WHERE id = $8 RETURNING *`,
            [nombre, principio_activo, laboratorio, presentacion, stock, precio, fecha_vencimiento, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Medicamento no encontrado.' });
        }
        res.json(result.rows[0]); // Devuelve el medicamento actualizado
    } catch (err) {
        console.error('Error al actualizar medicamento:', err);
        if (err.code === '23505') { // Manejo de errores de unicidad (nombre del medicamento)
            return res.status(400).json({ message: 'Ya existe otro medicamento con ese nombre.' });
        }
        res.status(500).json({ message: 'Error interno del servidor al actualizar medicamento.' });
    }
});

// NUEVA RUTA: Eliminar un medicamento por ID
app.delete('/medicamentos/:id', async (req, res) => {
    const { id } = req.params; // ID del medicamento a eliminar
    try {
        const result = await pool.query('DELETE FROM medicamentos WHERE id = $1 RETURNING *', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Medicamento no encontrado.' });
        }
        res.json({ message: 'Medicamento eliminado exitosamente.', medicamentoEliminado: result.rows[0] });
    } catch (err) {
        console.error('Error al eliminar medicamento:', err);
        res.status(500).json({ message: 'Error interno del servidor al eliminar medicamento.' });
    }
});


// --- Rutas para Ventas ---

// Ruta para obtener todos los medicamentos (para el carrito de ventas)
app.get('/medicamentos_venta', async (req, res) => {
    try {
        // Solo obtener medicamentos con stock > 0
        const result = await pool.query('SELECT id, nombre, presentacion, precio, stock FROM medicamentos WHERE stock > 0 ORDER BY nombre ASC');
        res.json(result.rows);
    } catch (err) {
        console.error('Error al obtener medicamentos para venta:', err);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
});

// Ruta para obtener el historial de ventas
app.get('/ventas_historial', async (req, res) => {
    try {
        const query = `
            SELECT
                v.id AS id,
                v.fecha_venta,
                v.total_venta,
                p.nombre AS paciente_nombre,
                p.apellido AS paciente_apellido,
                json_agg(
                    json_build_object(
                        'medicamento_id', m.id,
                        'medicamento_nombre', m.nombre,
                        'presentacion', m.presentacion,
                        'cantidad', vd.cantidad,
                        'precio_unitario', vd.precio_unitario
                    )
                ) AS detalles
            FROM ventas v
            LEFT JOIN pacientes p ON v.paciente_id = p.id
            JOIN venta_detalle vd ON v.id = vd.venta_id
            JOIN medicamentos m ON vd.medicamento_id = m.id
            GROUP BY v.id, v.fecha_venta, v.total_venta, p.nombre, p.apellido
            ORDER BY v.fecha_venta DESC;
        `;
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (err) {
        console.error('Error al obtener historial de ventas:', err);
        res.status(500).json({ message: 'Error interno del servidor al obtener historial de ventas.' });
    }
});


// Ruta para registrar una nueva venta
app.post('/ventas', async (req, res) => {
    const { paciente_id, carrito } = req.body; // carrito es un array de { id: medId, cantidad: qty, precio: medPrecio }
    let client;
    try {
        client = await pool.connect();
        await client.query('BEGIN'); // Iniciar transacción

        let total_venta = 0;
        for (const item of carrito) {
            total_venta += item.cantidad * item.precio;
        }

        // 1. Insertar la venta principal
        const ventaResult = await client.query(
            'INSERT INTO ventas (paciente_id, total_venta) VALUES ($1, $2) RETURNING id',
            [paciente_id, total_venta]
        );
        const venta_id = ventaResult.rows[0].id;

        // 2. Insertar los detalles de la venta y actualizar el stock de medicamentos
        for (const item of carrito) {
            // Insertar detalle de venta
            await client.query(
                'INSERT INTO venta_detalle (venta_id, medicamento_id, cantidad, precio_unitario) VALUES ($1, $2, $3, $4)',
                [venta_id, item.id, item.cantidad, item.precio]
            );

            // Actualizar stock del medicamento
            await client.query(
                'UPDATE medicamentos SET stock = stock - $1 WHERE id = $2',
                [item.cantidad, item.id]
            );
        }

        await client.query('COMMIT'); // Confirmar transacción
        res.status(201).json({ message: 'Venta registrada exitosamente', venta_id: venta_id });

    } catch (err) {
        await client.query('ROLLBACK'); // Revertir transacción en caso de error
        console.error('Error al registrar venta:', err);
        res.status(500).json({ message: 'Error interno del servidor al registrar venta.' });
    } finally {
        if (client) client.release(); // Liberar el cliente de la pool
    }
});


// Iniciar el servidor
app.listen(port, () => {
    console.log(`Servidor de SmartFarma escuchando en http://localhost:${port}`);
});
