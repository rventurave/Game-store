const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const path = require('path');
const connection = require('./config/database');

const app = express();

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));

// Configuración de EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Rutas
app.get('/', (req, res) => {
    res.render('login');
});

app.get('/register', (req, res) => {
    res.render('register');
});

app.post('/auth/register', async (req, res) => {
    const { 
        DNI, 
        nombre, 
        apellido_p, 
        apellido_m, 
        email, 
        celular, 
        genero, 
        password,
        confirm_password 
    } = req.body;

    // Validar que las contraseñas coincidan
    if (password !== confirm_password) {
        return res.send('Las contraseñas no coinciden');
    }

    try {
        // Verificar si el DNI ya existe
        connection.query('SELECT DNI FROM Persona WHERE DNI = ?', [DNI], async (error, results) => {
            if (error) {
                console.error('Error al verificar DNI:', error);
                return res.send('Error en el registro');
            }

            if (results.length > 0) {
                return res.send('El DNI ya está registrado');
            }

            // Hash de la contraseña
            const hashedPassword = await bcrypt.hash(password, 10);

            // Insertar en la tabla Persona
            connection.query(
                'INSERT INTO Persona (DNI, celular, nombre, email, apellido_p, apellido_m, genero) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [DNI, celular, nombre, email, apellido_p, apellido_m, genero],
                (error, results) => {
                    if (error) {
                        console.error('Error al insertar en Persona:', error);
                        return res.send('Error al registrar usuario');
                    }

                    // Insertar en la tabla Clientes
                    connection.query(
                        'INSERT INTO Clientes (DNI) VALUES (?)',
                        [DNI],
                        (error, results) => {
                            if (error) {
                                console.error('Error al insertar en Clientes:', error);
                                return res.send('Error al registrar cliente');
                            }

                            // Insertar credenciales en la tabla users
                            connection.query(
                                'INSERT INTO users (DNI, password) VALUES (?, ?)',
                                [DNI, hashedPassword],
                                (error, results) => {
                                    if (error) {
                                        console.error('Error al guardar credenciales:', error);
                                        return res.send('Error al guardar credenciales');
                                    }

                                    // Registro exitoso
                                    res.redirect('/client-login');
                                }
                            );
                        }
                    );
                }
            );
        });
    } catch (error) {
        console.error('Error en el proceso de registro:', error);
        res.send('Error en el proceso de registro');
    }
});

app.get('/client-login', (req, res) => {
    res.render('client-login');
});

app.post('/auth/login', (req, res) => {
    const { DNI, password } = req.body;

    connection.query(
        'SELECT u.*, p.nombre FROM users u ' +
        'JOIN Persona p ON u.DNI = p.DNI ' +
        'JOIN Clientes c ON u.DNI = c.DNI ' +
        'WHERE u.DNI = ?',
        [DNI],
        async (error, results) => {
            if (error || results.length === 0) {
                res.send('Usuario o contraseña incorrectos');
                return;
            }

            const match = await bcrypt.compare(password, results[0].password);
            if (match) {
                req.session.loggedin = true;
                req.session.DNI = DNI;
                req.session.nombre = results[0].nombre;
                req.session.tipo = 'cliente';
                res.redirect('/client-dashboard');
            } else {
                res.send('Usuario o contraseña incorrectos');
            }
        }
    );
});

app.get('/client-dashboard', (req, res) => {
    if (req.session.loggedin && req.session.tipo === 'cliente') {
        res.render('client-dashboard', { 
            nombre: req.session.nombre,
            DNI: req.session.DNI 
        });
    } else {
        res.redirect('/client-login');
    }
});

app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

// Ruta para autenticar administrador
app.post('/auth/admin-login', (req, res) => {
    const { username, password } = req.body;
    
    // Verifica las credenciales del administrador MySQL
    if (username === 'root' && password === 'clay7') {
        req.session.loggedin = true;
        req.session.isAdmin = true;
        req.session.username = username;
        res.redirect('/admin-dashboard');
    } else {
        res.send('Credenciales de administrador incorrectas');
    }
});

// Ruta para mostrar el dashboard de administrador
app.get('/admin-dashboard', (req, res) => {
    if (req.session.loggedin && req.session.isAdmin) {
        res.render('admin-dashboard', { 
            username: req.session.username 
        });
    } else {
        res.redirect('/');
    }
});

// Ruta para ver todos los usuarios
app.get('/admin/usuarios', (req, res) => {
    if (req.session.isAdmin) {
        connection.query(
            'SELECT p.*, ' +
            'CASE WHEN c.DNI IS NOT NULL THEN "Cliente" ' +
            'WHEN e.DNI IS NOT NULL THEN "Empleado" END AS tipo ' +
            'FROM Persona p ' +
            'LEFT JOIN Clientes c ON p.DNI = c.DNI ' +
            'LEFT JOIN Empleados e ON p.DNI = e.DNI',
            (error, results) => {
                if (error) {
                    console.error('Error:', error);
                    res.send('Error al obtener usuarios');
                    return;
                }
                res.render('admin/usuarios', { usuarios: results });
            }
        );
    } else {
        res.redirect('/');
    }
});

// Ruta para ver productos
app.get('/admin/productos', (req, res) => {
    if (req.session.isAdmin) {
        connection.query(
            'SELECT p.*, c.nombre_categoria, pr.nombre_empresa as proveedor ' +
            'FROM Productos p ' +
            'LEFT JOIN Categorias c ON p.categoria_id = c.categoria_id ' +
            'LEFT JOIN Proveedores pr ON p.proveedor_id = pr.DNI',
            (error, results) => {
                if (error) {
                    console.error('Error:', error);
                    res.send('Error al obtener productos');
                    return;
                }
                res.render('admin/productos', { productos: results });
            }
        );
    } else {
        res.redirect('/');
    }
});

// Ruta para ver todas las ventas
app.get('/admin/ventas', (req, res) => {
    if (!req.session.isAdmin) {
        return res.redirect('/');
    }

    connection.query(
        `SELECT v.*, 
         p.nombre as cliente_nombre,
         e.DNI as vendedor_dni,
         s.nombre as sucursal_nombre,
         (SELECT SUM(dv.cantidad) FROM Detalles_Venta dv WHERE dv.venta_id = v.venta_id) as total_productos
         FROM Ventas v
         JOIN Persona p ON v.cliente_id = p.DNI
         JOIN Empleados e ON v.empleado_id = e.DNI
         JOIN Sucursales s ON v.sucursal_id = s.sucursal_id
         ORDER BY v.fecha_venta DESC`,
        (error, ventas) => {
            if (error) {
                console.error('Error:', error);
                return res.send('Error al obtener ventas');
            }
            res.render('admin/ventas', { ventas });
        }
    );
});

// Ruta para mostrar el formulario de nueva venta
app.get('/admin/ventas/nueva', (req, res) => {
    if (!req.session.isAdmin) {
        return res.redirect('/');
    }

    Promise.all([
        // Obtener clientes
        new Promise((resolve, reject) => {
            connection.query(
                'SELECT p.DNI, p.nombre, p.apellido_p FROM Persona p JOIN Clientes c ON p.DNI = c.DNI',
                (error, results) => {
                    if (error) reject(error);
                    resolve(results);
                }
            );
        }),
        // Obtener empleados
        new Promise((resolve, reject) => {
            connection.query(
                'SELECT p.DNI, p.nombre, p.apellido_p FROM Persona p JOIN Empleados e ON p.DNI = e.DNI',
                (error, results) => {
                    if (error) reject(error);
                    resolve(results);
                }
            );
        }),
        // Obtener sucursales
        new Promise((resolve, reject) => {
            connection.query(
                'SELECT * FROM Sucursales',
                (error, results) => {
                    if (error) reject(error);
                    resolve(results);
                }
            );
        }),
        // Obtener productos
        new Promise((resolve, reject) => {
            connection.query(
                'SELECT * FROM Productos WHERE stock > 0',
                (error, results) => {
                    if (error) reject(error);
                    resolve(results);
                }
            );
        })
    ]).then(([clientes, empleados, sucursales, productos]) => {
        res.render('admin/nueva-venta', {
            clientes,
            empleados,
            sucursales,
            productos
        });
    }).catch(error => {
        console.error('Error:', error);
        res.send('Error al cargar el formulario de venta');
    });
});

// Ruta para procesar nueva venta
app.post('/admin/ventas/crear', (req, res) => {
    if (!req.session.isAdmin) {
        return res.redirect('/');
    }

    const {
        cliente_id,
        empleado_id,
        sucursal_id,
        productos,
        cantidades,
        total_venta,
        metodo_pago
    } = req.body;

    // Iniciar transacción
    connection.beginTransaction(err => {
        if (err) {
            return res.status(500).json({ error: 'Error al iniciar la transacción' });
        }

        // Insertar la venta
        connection.query(
            'INSERT INTO Ventas (cliente_id, empleado_id, sucursal_id, total_venta, metodo_pago, estado_venta) VALUES (?, ?, ?, ?, ?, "procesada")',
            [cliente_id, empleado_id, sucursal_id, total_venta, metodo_pago],
            (error, results) => {
                if (error) {
                    return connection.rollback(() => {
                        res.status(500).json({ error: 'Error al crear la venta' });
                    });
                }

                const venta_id = results.insertId;
                const detalles = [];

                // Preparar detalles de venta
                for (let i = 0; i < productos.length; i++) {
                    detalles.push([
                        venta_id,
                        productos[i],
                        cantidades[i],
                        // Aquí deberías obtener el precio actual del producto
                        0, // precio_unitario (se actualizará en la siguiente consulta)
                        0  // subtotal (se actualizará en la siguiente consulta)
                    ]);
                }

                // Insertar detalles de venta
                connection.query(
                    'INSERT INTO Detalles_Venta (venta_id, producto_id, cantidad, precio_unitario, subtotal) VALUES ?',
                    [detalles],
                    (error) => {
                        if (error) {
                            return connection.rollback(() => {
                                res.status(500).json({ error: 'Error al crear los detalles de la venta' });
                            });
                        }

                        // Actualizar stock
                        const actualizaciones = productos.map((producto_id, index) => {
                            return new Promise((resolve, reject) => {
                                connection.query(
                                    'UPDATE Productos SET stock = stock - ? WHERE producto_id = ?',
                                    [cantidades[index], producto_id],
                                    (error) => {
                                        if (error) reject(error);
                                        resolve();
                                    }
                                );
                            });
                        });

                        Promise.all(actualizaciones)
                            .then(() => {
                                connection.commit(err => {
                                    if (err) {
                                        return connection.rollback(() => {
                                            res.status(500).json({ error: 'Error al finalizar la venta' });
                                        });
                                    }
                                    res.redirect('/admin/ventas');
                                });
                            })
                            .catch(error => {
                                connection.rollback(() => {
                                    res.status(500).json({ error: 'Error al actualizar el stock' });
                                });
                            });
                    }
                );
            }
        );
    });
});

// Ruta para mostrar el formulario de nuevo producto
app.get('/admin/productos/nuevo', (req, res) => {
    if (!req.session.isAdmin) {
        return res.redirect('/');
    }

    // Obtener categorías y proveedores para los selectores
    Promise.all([
        new Promise((resolve, reject) => {
            connection.query('SELECT * FROM Categorias', (error, results) => {
                if (error) reject(error);
                resolve(results);
            });
        }),
        new Promise((resolve, reject) => {
            connection.query('SELECT * FROM Proveedores', (error, results) => {
                if (error) reject(error);
                resolve(results);
            });
        })
    ]).then(([categorias, proveedores]) => {
        res.render('admin/nuevo-producto', { categorias, proveedores });
    }).catch(error => {
        console.error('Error:', error);
        res.send('Error al cargar el formulario');
    });
});

// Ruta para procesar la creación del producto
app.post('/admin/productos/crear', (req, res) => {
    if (!req.session.isAdmin) {
        return res.redirect('/');
    }

    const {
        descripcion,
        categoria_id,
        proveedor_id,
        precio_compra,
        precio_venta,
        marca,
        stock
    } = req.body;

    connection.query(
        'INSERT INTO Productos (descripcion, categoria_id, proveedor_id, precio_compra, precio_venta, marca, stock) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [descripcion, categoria_id, proveedor_id, precio_compra, precio_venta, marca, stock],
        (error, results) => {
            if (error) {
                console.error('Error al insertar producto:', error);
                res.send('Error al crear el producto');
                return;
            }
            res.redirect('/admin/productos');
        }
    );
});

// Ruta principal de reportes
app.get('/admin/reportes', (req, res) => {
    if (!req.session.isAdmin) {
        return res.redirect('/');
    }

    Promise.all([
        // Reporte de ventas totales
        new Promise((resolve, reject) => {
            connection.query(
                'SELECT SUM(total_venta) as ventas_totales FROM Ventas WHERE MONTH(fecha_venta) = MONTH(CURRENT_DATE())',
                (error, results) => {
                    if (error) reject(error);
                    resolve(results[0]);
                }
            );
        }),
        // Productos más vendidos
        new Promise((resolve, reject) => {
            connection.query(
                `SELECT p.producto_id, p.descripcion, p.marca, 
                 SUM(dv.cantidad) as total_vendido,
                 SUM(dv.subtotal) as ingresos_totales
                 FROM Productos p
                 JOIN Detalles_Venta dv ON p.producto_id = dv.producto_id
                 GROUP BY p.producto_id
                 ORDER BY total_vendido DESC
                 LIMIT 5`,
                (error, results) => {
                    if (error) reject(error);
                    resolve(results);
                }
            );
        }),
        // Stock bajo
        new Promise((resolve, reject) => {
            connection.query(
                'SELECT * FROM Productos WHERE stock < 10 ORDER BY stock ASC',
                (error, results) => {
                    if (error) reject(error);
                    resolve(results);
                }
            );
        }),
        // Ventas por sucursal
        new Promise((resolve, reject) => {
            connection.query(
                `SELECT s.nombre, COUNT(v.venta_id) as total_ventas, 
                 SUM(v.total_venta) as ingresos
                 FROM Sucursales s
                 LEFT JOIN Ventas v ON s.sucursal_id = v.sucursal_id
                 GROUP BY s.sucursal_id`,
                (error, results) => {
                    if (error) reject(error);
                    resolve(results);
                }
            );
        })
    ]).then(([ventasTotales, productosPopulares, stockBajo, ventasPorSucursal]) => {
        res.render('admin/reportes', {
            ventasTotales,
            productosPopulares,
            stockBajo,
            ventasPorSucursal
        });
    }).catch(error => {
        console.error('Error en reportes:', error);
        res.send('Error al generar reportes');
    });
});

// Iniciar servidor
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
});
