USE gamestore;
DELIMITER //

-- Procedimiento para listar sucursales
CREATE PROCEDURE sp_listar_sucursales()
BEGIN
    SELECT * FROM Sucursales;
END //

-- Procedimiento para agregar sucursal
CREATE PROCEDURE sp_agregar_sucursal(
    IN p_nombre VARCHAR(100),
    IN p_direccion VARCHAR(200),
    IN p_telefono VARCHAR(9)
)
BEGIN
    INSERT INTO Sucursales (nombre, direccion, telefono, estado)
    VALUES (p_nombre, p_direccion, p_telefono, 'Activo');
END //

DELIMITER ;