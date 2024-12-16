USE gamestore;

DELIMITER //

DROP PROCEDURE IF EXISTS sp_registrar_cliente;

CREATE PROCEDURE sp_registrar_cliente(
    IN p_DNI VARCHAR(8),
    IN p_nombre VARCHAR(30),
    IN p_apellido_p VARCHAR(30),
    IN p_apellido_m VARCHAR(30),
    IN p_email VARCHAR(50),
    IN p_celular VARCHAR(9),
    IN p_genero ENUM('M', 'F', 'Otro'),
    IN p_password VARCHAR(255)
)
BEGIN
    DECLARE mensaje_error VARCHAR(255);

    -- Manejador de errores
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        GET DIAGNOSTICS CONDITION 1 mensaje_error = MESSAGE_TEXT;
        ROLLBACK;
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = mensaje_error;
    END;

    -- Validaciones antes de la transacción
    IF LENGTH(p_DNI) != 8 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El DNI debe tener 8 dígitos';
    END IF;

    IF EXISTS (SELECT 1 FROM Persona WHERE DNI = p_DNI) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El DNI ya está registrado';
    END IF;

    IF EXISTS (SELECT 1 FROM Persona WHERE email = p_email) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El email ya está registrado';
    END IF;

    START TRANSACTION;

    -- Insertar en la tabla Persona
    INSERT INTO Persona (
        DNI,
        nombre,
        apellido_p,
        apellido_m,
        email,
        celular,
        genero
    ) VALUES (
        p_DNI,
        p_nombre,
        p_apellido_p,
        p_apellido_m,
        p_email,
        p_celular,
        p_genero
    );

    -- Insertar en la tabla Clientes
    INSERT INTO Clientes (DNI) VALUES (p_DNI);

    -- Insertar en la tabla users
    INSERT INTO users (DNI, password) VALUES (p_DNI, p_password);

    COMMIT;
END //

DELIMITER ;
