USE gamestore;
DELIMITER //

-- Procedimiento para listar todos los usuarios (clientes y empleados)
CREATE PROCEDURE sp_listar_usuarios()
BEGIN
    SELECT p.*, 
           CASE 
               WHEN c.DNI IS NOT NULL THEN 'Cliente'
               WHEN e.DNI IS NOT NULL THEN 'Empleado'
           END as tipo_usuario
    FROM Persona p
    LEFT JOIN Clientes c ON p.DNI = c.DNI
    LEFT JOIN Empleados e ON p.DNI = e.DNI;
END //

-- Procedimiento para agregar empleado
CREATE PROCEDURE sp_agregar_empleado(
    IN p_DNI VARCHAR(8),
    IN p_nombre VARCHAR(30),
    IN p_apellido_p VARCHAR(30),
    IN p_apellido_m VARCHAR(30),
    IN p_email VARCHAR(50),
    IN p_celular VARCHAR(9),
    IN p_genero ENUM('M', 'F', 'Otro'),
    IN p_cargo VARCHAR(30),
    IN p_salario DECIMAL(10,2)
)
BEGIN
    DECLARE mensaje_error VARCHAR(255);
    
    START TRANSACTION;
    
    INSERT INTO Persona VALUES (p_DNI, p_nombre, p_apellido_p, p_apellido_m, p_email, p_celular, p_genero);
    INSERT INTO Empleados VALUES (p_DNI, p_cargo, p_salario, 'Activo');
    
    COMMIT;
END //

-- Procedimiento para eliminar usuario
CREATE PROCEDURE sp_eliminar_usuario(
    IN p_DNI VARCHAR(8)
)
BEGIN
    DELETE FROM Persona WHERE DNI = p_DNI;
END //

DELIMITER ;