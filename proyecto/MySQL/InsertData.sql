USE gamestore;
-- Sucursales
INSERT INTO Sucursales (nombre, direccion, telefono, ciudad) VALUES
('Sucursal Centro', 'Av. Central 123', '555-1234', 'Lima'),
('Sucursal Norte', 'Calle 45, 789', '555-5678', 'Lima'),
('Sucursal Sur', 'Av. Sur 99', '555-9876', 'Arequipa');

-- Personas (30 registros: 15 empleados y 15 clientes)
INSERT INTO Persona (DNI, celular, nombre, email, apellido_p, apellido_m, genero) VALUES
(1, '987654321', 'Juan Perez', 'juan.perez@mail.com', 'Perez', 'Gomez', 'M'),  -- Empleado
(2, '912345678', 'Maria Lopez', 'maria.lopez@mail.com', 'Lopez', 'Sanchez', 'F'),  -- Cliente
(3, '923456789', 'Carlos Ruiz', 'carlos.ruiz@mail.com', 'Ruiz', 'Fernandez', 'M'),  -- Empleado
(4, '934567890', 'Ana Martinez', 'ana.martinez@mail.com', 'Martinez', 'Garcia', 'F'),  -- Cliente
(5, '945678901', 'Pedro Jimenez', 'pedro.jimenez@mail.com', 'Jimenez', 'Hernandez', 'M'),  -- Empleado
(6, '956789012', 'Laura Fernandez', 'laura.fernandez@mail.com', 'Fernandez', 'Moreno', 'F'),  -- Cliente
(7, '967890123', 'Luis Gonzalez', 'luis.gonzalez@mail.com', 'Gonzalez', 'Diaz', 'M'),  -- Empleado
(8, '978901234', 'Isabel Torres', 'isabel.torres@mail.com', 'Torres', 'Lopez', 'F'),  -- Cliente
(9, '989012345', 'Ricardo Cruz', 'ricardo.cruz@mail.com', 'Cruz', 'Rios', 'M'),  -- Empleado
(10, '990123456', 'Patricia Silva', 'patricia.silva@mail.com', 'Silva', 'Lopez', 'F'),  -- Cliente
(11, '991234567', 'Eduardo Alvarez', 'eduardo.alvarez@mail.com', 'Alvarez', 'Moreno', 'M'),  -- Empleado
(12, '992345678', 'Mariana Herrera', 'mariana.herrera@mail.com', 'Herrera', 'Gomez', 'F'),  -- Cliente
(13, '993456789', 'Gabriel Garcia', 'gabriel.garcia@mail.com', 'Garcia', 'Diaz', 'M'),  -- Empleado
(14, '994567890', 'Luisa Perez', 'luisa.perez@mail.com', 'Perez', 'Torres', 'F'),  -- Cliente
(15, '995678901', 'Javier Ramirez', 'javier.ramirez@mail.com', 'Ramirez', 'Gomez', 'M'),  -- Empleado
(16, '996789012', 'Lidia Sánchez', 'lidia.sanchez@mail.com', 'Sanchez', 'Fernandez', 'F'),  -- Cliente
(17, '997890123', 'Pedro Morales', 'pedro.morales@mail.com', 'Morales', 'Lopez', 'M'),  -- Empleado
(18, '998901234', 'Carla Martínez', 'carla.martinez@mail.com', 'Martinez', 'Diaz', 'F'),  -- Cliente
(19, '999012345', 'Rosa Gómez', 'rosa.gomez@mail.com', 'Gomez', 'Moreno', 'F'),  -- Empleado
(20, '100123456', 'José Torres', 'jose.torres@mail.com', 'Torres', 'Ruiz', 'M'),  -- Cliente
(21, '101234567', 'Felipe Fernández', 'felipe.fernandez@mail.com', 'Fernandez', 'Lopez', 'M'),  -- Empleado
(22, '102345678', 'Sofía Martínez', 'sofia.martinez@mail.com', 'Martinez', 'Torres', 'F'),  -- Cliente
(23, '103456789', 'David Romero', 'david.romero@mail.com', 'Romero', 'Ruiz', 'M'),  -- Empleado
(24, '104567890', 'Paula García', 'paula.garcia@mail.com', 'Garcia', 'Diaz', 'F'),  -- Cliente
(25, '105678901', 'Antonio López', 'antonio.lopez@mail.com', 'López', 'Fernandez', 'M'),  -- Empleado
(26, '106789012', 'Verónica González', 'veronica.gonzalez@mail.com', 'Gonzalez', 'Torres', 'F'),  -- Cliente
(27, '107890123', 'Eduardo Ruiz', 'eduardo.ruiz@mail.com', 'Ruiz', 'Sánchez', 'M'),  -- Empleado
(28, '108901234', 'Carmen López', 'carmen.lopez@mail.com', 'López', 'Pérez', 'F'),  -- Cliente
(29, '109012345', 'Manuel García', 'manuel.garcia@mail.com', 'García', 'Romero', 'M'),  -- Empleado
(30, '110123456', 'Elena Torres', 'elena.torres@mail.com', 'Torres', 'Moreno', 'F');  -- Cliente


-- Empleados (relacionados con la tabla Persona)
INSERT INTO Empleados (DNI, sucursal_id, fecha_contratacion, salario, tipo) VALUES
(1, 1, '2023-06-01', 2500.00, 'vendedor'),
(3, 1, '2022-04-15', 3000.00, 'gerente'),
(5, 2, '2021-12-10', 3500.00, 'vendedor'),
(7, 2, '2022-05-01', 2600.00, 'técnico'),
(9, 1, '2023-08-15', 2700.00, 'vendedor'),
(11, 2, '2024-03-01', 3000.00, 'técnico'),
(13, 3, '2021-07-20', 2300.00, 'vendedor'),
(15, 1, '2022-10-10', 2900.00, 'gerente'),
(17, 3, '2023-02-01', 3100.00, 'vendedor'),
(19, 1, '2023-11-05', 2800.00, 'gerente'),
(21, 2, '2023-12-01', 2400.00, 'vendedor'),
(23, 3, '2022-07-11', 2200.00, 'vendedor'),
(25, 1, '2024-01-01', 2600.00, 'vendedor'),
(27, 2, '2024-06-15', 2800.00, 'vendedor'),
(29, 3, '2024-02-10', 3200.00, 'gerente');


-- Clientes (relacionados con la tabla Persona)
INSERT INTO Clientes (DNI) VALUES
(2),
(4),
(6),
(8),
(10),
(12),
(14),
(16),
(18),
(20),
(22),
(24),
(26),
(28),
(30);




-- Categorías
INSERT INTO Categorias (nombre_categoria) VALUES
('Electrónica'),
('Muebles'),
('Juguetes'),
('Ropa'),
('Herramientas');


-- Proveedores
INSERT INTO Proveedores (DNI, nombre_empresa, contacto_nombre) VALUES
(101, 'Proveedor A', 'Carlos Pérez'),
(102, 'Proveedor B', 'Maria Gómez'),
(103, 'Proveedor C', 'Luis García');


-- Productos
INSERT INTO Productos (descripcion, categoria_id, proveedor_id, precio_compra, precio_venta, marca, stock) VALUES
('Laptop HP', 1, 101, 1500.00, 2000.00, 'HP', 50),
('Silla de oficina', 2, 102, 100.00, 150.00, 'IKEA', 100),
('Pelota de fútbol', 3, 103, 10.00, 20.00, 'Nike', 200),
('Camiseta deportiva', 4, 101, 15.00, 30.00, 'Adidas', 150),
('Taladro eléctrico', 5, 102, 50.00, 80.00, 'Bosch', 80);


-- Inventarios
INSERT INTO Inventario (sucursal_id, producto_id, cantidad, ubicacion_fisica) VALUES
(1, 1, 30, 'Estante A1'),
(1, 2, 50, 'Estante B1'),
(2, 3, 100, 'Estante A1'),
(2, 4, 60, 'Estante B2'),
(3, 5, 40, 'Estante C1');


-- Ventas
INSERT INTO Ventas (cliente_id, empleado_id, sucursal_id, total_venta, metodo_pago, estado_venta) VALUES
(2, 1, 1, 2100.00, 'tarjeta', 'procesada'),
(4, 3, 2, 150.00, 'efectivo', 'procesada'),
(6, 5, 1, 400.00, 'transferencia', 'pendiente'),
(8, 7, 3, 60.00, 'efectivo', 'procesada'),
(10, 9, 2, 2300.00, 'tarjeta', 'procesada');


-- Detalles de Venta
INSERT INTO Detalles_Venta (venta_id, producto_id, cantidad, precio_unitario, subtotal) VALUES
(1, 1, 1, 2000.00, 2000.00),
(1, 2, 1, 150.00, 150.00),
(2, 3, 2, 20.00, 40.00),
(3, 4, 3, 30.00, 90.00),
(4, 5, 1, 80.00, 80.00);


-- Mantenimiento
INSERT INTO Mantenimiento (producto_id, cliente_id, fecha_ingreso, fecha_salida, descripcion_problema, estado, costo_reparacion) VALUES
(1, 2, '2023-11-01', '2023-11-05', 'Pantalla rota', 'reparado', 200.00),
(3, 4, '2023-08-10', '2023-08-15', 'Balón desinflado', 'reparado', 10.00),
(5, 6, '2023-12-05', '2023-12-10', 'Motor defectuoso', 'en_proceso', 150.00);


-- Devoluciones
INSERT INTO Devoluciones (venta_id, producto_id, cantidad, motivo, estado) VALUES
(1, 1, 1, 'Producto defectuoso', 'procesada'),
(2, 3, 1, 'Cambio de talla', 'pendiente'),
(3, 4, 2, 'Producto no requerido', 'rechazada');


-- Administradores
INSERT INTO Admin (DNI, tipo_usuario) VALUES
(1, 'dueño'),
(5, 'dueño'),
(9, 'dueño');

INSERT INTO Categorias (nombre_categoria) VALUES 
('Videojuegos'),
('Consolas'),
('Accesorios'),
('PC Gaming'),
('Retro'),
('Merchandising');

INSERT INTO Proveedores (DNI, nombre_empresa, contacto_nombre) VALUES 
(20345678, 'Nintendo Perú', 'Juan Pérez'),
(20345679, 'Sony Gaming', 'María García'),
(20345680, 'Microsoft Gaming', 'Pedro López'),
(20345681, 'Gaming Imports', 'Ana Torres'),
(20345682, 'Tech Supplies', 'Carlos Ruiz');