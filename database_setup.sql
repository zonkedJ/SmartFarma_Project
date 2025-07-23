-- database_setup.sql

-- Este archivo contiene los comandos SQL para crear las tablas
-- necesarias para la aplicación SmartFarma en PostgreSQL.

-- Asegúrate de haber creado una base de datos llamada 'smartfarma_db'
-- antes de ejecutar estos comandos.

-- Tabla para Pacientes
CREATE TABLE IF NOT EXISTS pacientes (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    cedula VARCHAR(20) UNIQUE NOT NULL,
    fecha_nacimiento DATE,
    direccion VARCHAR(255),
    telefono VARCHAR(20),
    email VARCHAR(100) UNIQUE,
    historial_medico TEXT
);

-- Tabla para Medicamentos
CREATE TABLE IF NOT EXISTS medicamentos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) UNIQUE NOT NULL,
    principio_activo VARCHAR(100),
    laboratorio VARCHAR(100),
    presentacion VARCHAR(100),
    stock INT NOT NULL DEFAULT 0,
    precio DECIMAL(10, 2) NOT NULL,
    fecha_vencimiento DATE
);

-- Tabla para registrar cada venta
CREATE TABLE IF NOT EXISTS ventas (
    id SERIAL PRIMARY KEY,
    fecha_venta TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    total_venta DECIMAL(10, 2) NOT NULL,
    paciente_id INT,
    FOREIGN KEY (paciente_id) REFERENCES pacientes(id) ON DELETE SET NULL
);

-- Tabla para el detalle de cada venta (qué medicamentos se vendieron)
CREATE TABLE IF NOT EXISTS venta_detalle (
    id SERIAL PRIMARY KEY,
    venta_id INT NOT NULL,
    medicamento_id INT NOT NULL,
    cantidad INT NOT NULL,
    precio_unitario DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (venta_id) REFERENCES ventas(id) ON DELETE CASCADE,
    FOREIGN KEY (medicamento_id) REFERENCES medicamentos(id) ON DELETE RESTRICT
);
