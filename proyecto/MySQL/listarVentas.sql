USE gamestore;

DELIMITER //

DROP PROCEDURE IF EXISTS sp_listar_ventas//

CREATE PROCEDURE sp_listar_ventas()
BEGIN
    SELECT 
        v.venta_id,
        CONCAT(pc.nombre, ' ', pc.apellido_p, ' ', pc.apellido_m) as nombre_cliente,
        CONCAT(pe.nombre, ' ', pe.apellido_p) as nombre_empleado,
        s.nombre as nombre_sucursal,
        v.fecha_venta,
        CAST(v.total_venta AS DECIMAL(10,2)) as total_venta,
        v.metodo_pago,
        v.estado_venta
    FROM Ventas v
    INNER JOIN Persona pc ON v.cliente_id = pc.DNI
    INNER JOIN Persona pe ON v.empleado_id = pe.DNI
    INNER JOIN Sucursales s ON v.sucursal_id = s.sucursal_id
    ORDER BY v.fecha_venta DESC;
END //

DELIMITER ;