CREATE SCHEMA gamestore;

USE gamestore;

-- Tabla base para personas
CREATE TABLE Persona (
    DNI VARCHAR(8) PRIMARY KEY,
    celular VARCHAR(9),
    nombre VARCHAR(30) NOT NULL,
    email VARCHAR(50),
    apellido_p VARCHAR(30),
    apellido_m VARCHAR(30),
    genero ENUM('M', 'F', 'Otro') NOT NULL
);

-- Tabla para empleados
CREATE TABLE Empleados (
    DNI INT PRIMARY KEY,
    sucursal_id INT NOT NULL,
    fecha_contratacion DATE NOT NULL,
    salario DECIMAL(10,2),
    tipo ENUM('vendedor', 'gerente', 'técnico')
);

-- Tabla para clientes
CREATE TABLE Clientes (
    DNI INT PRIMARY KEY
);

-- Tabla para administradores
CREATE TABLE Admin (
    DNI INT PRIMARY KEY,
    tipo_usuario ENUM('dueño') NOT NULL
);

-- Tabla de sucursales
CREATE TABLE Sucursales (
    sucursal_id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    direccion TEXT NOT NULL,
    telefono VARCHAR(15),
    ciudad VARCHAR(100)
);

-- Tabla de categorías
CREATE TABLE Categorias (
    categoria_id INT AUTO_INCREMENT PRIMARY KEY,
    nombre_categoria VARCHAR(50) NOT NULL
);

-- Tabla de productos
CREATE TABLE Productos (
    producto_id INT AUTO_INCREMENT PRIMARY KEY,
    descripcion TEXT,
    categoria_id INT,
    proveedor_id INT,
    precio_compra DECIMAL(10,2),
    precio_venta DECIMAL(10,2),
    marca VARCHAR(100),
    stock INT NOT NULL
);

-- Tabla de proveedores
CREATE TABLE Proveedores (
    DNI INT PRIMARY KEY,
    nombre_empresa VARCHAR(200) NOT NULL,
    contacto_nombre VARCHAR(100)
);

-- Tabla de inventarios
CREATE TABLE Inventario (
    inventario_id INT AUTO_INCREMENT PRIMARY KEY,
    sucursal_id INT NOT NULL,
    producto_id INT NOT NULL,
    cantidad INT NOT NULL,
    ubicacion_fisica VARCHAR(100)
);

-- Tabla de ventas
CREATE TABLE Ventas (
    venta_id INT AUTO_INCREMENT PRIMARY KEY,
    cliente_id INT NOT NULL,
    empleado_id INT NOT NULL,
    sucursal_id INT NOT NULL,
    fecha_venta TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    total_venta DECIMAL(10,2),
    metodo_pago ENUM('efectivo', 'tarjeta', 'transferencia'),
    estado_venta ENUM('procesada', 'cancelada', 'pendiente')
);

-- Tabla de detalles de venta
CREATE TABLE Detalles_Venta (
    detalle_venta_id INT AUTO_INCREMENT PRIMARY KEY,
    venta_id INT NOT NULL,
    producto_id INT NOT NULL,
    cantidad INT NOT NULL,
    precio_unitario DECIMAL(10,2),
    subtotal DECIMAL(10,2)
);

-- Tabla de mantenimiento
CREATE TABLE Mantenimiento (
    mantenimiento_id INT AUTO_INCREMENT PRIMARY KEY,
    producto_id INT NOT NULL,
    cliente_id INT NOT NULL,
    fecha_ingreso DATE NOT NULL,
    fecha_salida DATE,
    descripcion_problema TEXT,
    estado ENUM('en_proceso', 'reparado', 'no_reparado'),
    costo_reparacion DECIMAL(10,2)
);

-- Tabla de devoluciones
CREATE TABLE Devoluciones (
    devolucion_id INT AUTO_INCREMENT PRIMARY KEY,
    venta_id INT NOT NULL,
    producto_id INT NOT NULL,
    cantidad INT NOT NULL,
    motivo TEXT,
    fecha_devolucion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    estado ENUM('procesada', 'pendiente', 'rechazada')
);

-- Tabla de usuarios
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    DNI VARCHAR(8) UNIQUE NOT NULL,  -- Asegúrate de que el tipo de datos coincida con Persona
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (DNI) REFERENCES Persona(DNI)
);

-- Relaciones para empleados
ALTER TABLE Empleados
ADD CONSTRAINT FK_Empleados_Persona FOREIGN KEY (DNI) REFERENCES Persona(DNI),
ADD CONSTRAINT FK_Empleados_Sucursal FOREIGN KEY (sucursal_id) REFERENCES Sucursales(sucursal_id);

-- Relaciones para clientes
ALTER TABLE Clientes
ADD CONSTRAINT FK_Clientes_Persona FOREIGN KEY (DNI) REFERENCES Persona(DNI);

-- Relaciones para administradores
ALTER TABLE Admin
ADD CONSTRAINT FK_Admin_Persona FOREIGN KEY (DNI) REFERENCES Persona(DNI);

-- Relaciones para productos
ALTER TABLE Productos
ADD CONSTRAINT FK_Productos_Categoria FOREIGN KEY (categoria_id) REFERENCES Categorias(categoria_id),
ADD CONSTRAINT FK_Productos_Proveedor FOREIGN KEY (proveedor_id) REFERENCES Proveedores(DNI);

-- Relaciones para inventarios
ALTER TABLE Inventario
ADD CONSTRAINT FK_Inventario_Sucursal FOREIGN KEY (sucursal_id) REFERENCES Sucursales(sucursal_id),
ADD CONSTRAINT FK_Inventario_Producto FOREIGN KEY (producto_id) REFERENCES Productos(producto_id);

-- Relaciones para ventas
ALTER TABLE Ventas
ADD CONSTRAINT FK_Ventas_Cliente FOREIGN KEY (cliente_id) REFERENCES Clientes(DNI),
ADD CONSTRAINT FK_Ventas_Empleado FOREIGN KEY (empleado_id) REFERENCES Empleados(DNI),
ADD CONSTRAINT FK_Ventas_Sucursal FOREIGN KEY (sucursal_id) REFERENCES Sucursales(sucursal_id);

-- Relaciones para detalles de venta
ALTER TABLE Detalles_Venta
ADD CONSTRAINT FK_DetallesVenta_Venta FOREIGN KEY (venta_id) REFERENCES Ventas(venta_id),
ADD CONSTRAINT FK_DetallesVenta_Producto FOREIGN KEY (producto_id) REFERENCES Productos(producto_id);

-- Relaciones para mantenimiento
ALTER TABLE Mantenimiento
ADD CONSTRAINT FK_Mantenimiento_Producto FOREIGN KEY (producto_id) REFERENCES Productos(producto_id),
ADD CONSTRAINT FK_Mantenimiento_Cliente FOREIGN KEY (cliente_id) REFERENCES Clientes(DNI);

-- Relaciones para devoluciones
ALTER TABLE Devoluciones
ADD CONSTRAINT FK_Devoluciones_Venta FOREIGN KEY (venta_id) REFERENCES Ventas(venta_id),
ADD CONSTRAINT FK_Devoluciones_Producto FOREIGN KEY (producto_id) REFERENCES Productos(producto_id);
