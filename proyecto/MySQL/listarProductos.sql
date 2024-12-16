USE gamestore;
DELIMITER //

-- Procedimiento para listar productos
CREATE PROCEDURE sp_listar_productos()
BEGIN
    SELECT * FROM Productos;
END //

-- Procedimiento para agregar producto
CREATE PROCEDURE sp_agregar_producto(
    IN p_nombre VARCHAR(100),
    IN p_descripcion TEXT,
    IN p_precio DECIMAL(10,2),
    IN p_stock INT,
    IN p_categoria VARCHAR(50)
)
BEGIN
    INSERT INTO Productos (nombre, descripcion, precio, stock, categoria)
    VALUES (p_nombre, p_descripcion, p_precio, p_stock, p_categoria);
END //

-- Procedimiento para actualizar stock
CREATE PROCEDURE sp_actualizar_stock(
    IN p_producto_id INT,
    IN p_cantidad INT
)
BEGIN
    UPDATE Productos 
    SET stock = stock + p_cantidad 
    WHERE producto_id = p_producto_id;
END //

DELIMITER ;