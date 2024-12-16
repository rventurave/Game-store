USE gamestore;
DELIMITER //

-- Procedimiento para registrar venta
CREATE PROCEDURE sp_registrar_venta(
    IN p_cliente_dni VARCHAR(8),
    IN p_empleado_dni VARCHAR(8),
    IN p_total DECIMAL(10,2)
)
BEGIN
    DECLARE v_venta_id INT;
    
    INSERT INTO Ventas (cliente_dni, empleado_dni, fecha, total)
    VALUES (p_cliente_dni, p_empleado_dni, NOW(), p_total);
    
    SET v_venta_id = LAST_INSERT_ID();
    
    SELECT v_venta_id as venta_id;
END //

-- Procedimiento para listar ventas
CREATE PROCEDURE sp_listar_ventas()
BEGIN
    SELECT v.*, 
           CONCAT(pc.nombre, ' ', pc.apellido_p) as cliente,
           CONCAT(pe.nombre, ' ', pe.apellido_p) as empleado
    FROM Ventas v
    JOIN Persona pc ON v.cliente_dni = pc.DNI
    JOIN Persona pe ON v.empleado_dni = pe.DNI;
END //

DELIMITER ;