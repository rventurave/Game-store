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
        password 
    } = req.body;

    try {
        // Validaciones básicas
        if (!DNI || DNI.length !== 8) {
            throw new Error('El DNI debe tener 8 dígitos');
        }

        if (!celular || celular.length !== 9) {
            throw new Error('El celular debe tener 9 dígitos');
        }

        if (!['M', 'F', 'Otro'].includes(genero)) {
            throw new Error('Género no válido. Debe ser M, F u Otro');
        }

        // Validar que todos los campos requeridos estén presentes
        if (!nombre || !apellido_p || !apellido_m || !email || !password) {
            throw new Error('Todos los campos son obligatorios');
        }

        // Validar formato de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            throw new Error('Formato de email no válido');
        }

        // Hash de la contraseña antes de enviarla al procedimiento
        const hashedPassword = await bcrypt.hash(password, 10);

        // Llamar al procedimiento almacenado
        await connection.promise().query(
            'CALL sp_registrar_cliente(?, ?, ?, ?, ?, ?, ?, ?)',
            [
                DNI,
                nombre,
                apellido_p,
                apellido_m,
                email,
                celular,
                genero,
                hashedPassword // Enviamos la contraseña hasheada
            ]
        );

        // Si llegamos aquí, el registro fue exitoso
        req.flash('success', 'Registro exitoso. Por favor inicia sesión.');
        res.redirect('/client-login');

    } catch (error) {
        console.error('Error en el registro:', error);
        
        let mensajeError = error.message;
        
        // Manejar errores específicos del procedimiento almacenado
        if (error.sqlMessage) {
            mensajeError = error.sqlMessage;
        }

        // Si el error es del procedimiento almacenado (código 45000)
        if (error.sqlState === '45000') {
            mensajeError = error.sqlMessage;
        }

        // Renderizar la página de registro con el error y mantener los datos del formulario
        res.render('register', { 
            error: mensajeError,
            formData: {
                DNI,
                nombre,
                apellido_p,
                apellido_m,
                email,
                celular,
                genero
            }
        });
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
        // Obtener productos y categorías de la base de datos
        Promise.all([
            new Promise((resolve, reject) => {
                connection.query(
                    `SELECT p.*, c.nombre_categoria
                     FROM Productos p 
                     LEFT JOIN Categorias c ON p.categoria_id = c.categoria_id
                     WHERE p.stock > 0`,
                    (error, productos) => {
                        if (error) reject(error);
                        resolve(productos);
                    }
                );
            }),
            new Promise((resolve, reject) => {
                connection.query('SELECT * FROM Categorias', (error, categorias) => {
                    if (error) reject(error);
                    resolve(categorias);
                });
            })
        ]).then(([productos, categorias]) => {
            res.render('tienda', {
                nombre: req.session.nombre,
                productos: productos,
                categorias: categorias
            });
        }).catch(error => {
            console.error('Error:', error);
            res.send('Error al cargar la tienda');
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

// Rutas del Panel de Administrador

// 1. Gestión de Usuarios
app.get('/admin/usuarios', async (req, res) => {
    try {
        if (!req.session.isAdmin) return res.redirect('/');
        const [result] = await connection.promise().query('CALL sp_listar_usuarios()');
        res.render('admin/usuarios', { 
            usuarios: result[0],
            username: req.session.username 
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Error al cargar usuarios');
    }
});

app.post('/admin/empleados/agregar', async (req, res) => {
    try {
        if (!req.session.isAdmin) return res.redirect('/');
        const { DNI, nombre, apellido_p, apellido_m, email, celular, genero, cargo, salario } = req.body;
        
        await connection.promise().query(
            'CALL sp_agregar_empleado(?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [DNI, nombre, apellido_p, apellido_m, email, celular, genero, cargo, salario]
        );
        
        res.redirect('/admin/usuarios');
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Error al agregar empleado');
    }
});

// 2. Gestión de Productos
app.get('/admin/productos', async (req, res) => {
    try {
        if (!req.session.isAdmin) return res.redirect('/');
        const [result] = await connection.promise().query('CALL sp_listar_productos()');
        res.render('admin/productos', { 
            productos: result[0],
            username: req.session.username 
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Error al cargar productos');
    }
});

app.post('/admin/productos/agregar', async (req, res) => {
    try {
        if (!req.session.isAdmin) return res.redirect('/');
        const { nombre, descripcion, precio, stock, categoria } = req.body;
        
        await connection.promise().query(
            'CALL sp_agregar_producto(?, ?, ?, ?, ?)',
            [nombre, descripcion, precio, stock, categoria]
        );
        
        res.redirect('/admin/productos');
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Error al agregar producto');
    }
});

// 3. Gestión de Ventas
app.get('/admin/ventas', async (req, res) => {
    try {
        if (!req.session.isAdmin) return res.redirect('/');
        
        // Ejecutar el procedimiento almacenado
        const [results] = await connection.promise().query('CALL sp_listar_ventas()');
        
        // Para depuración
        console.log('Resultados de ventas:', results[0]);
        
        res.render('admin/ventas', { 
            ventas: results[0] || [],
            username: req.session.username,
            error: null
        });
        
    } catch (error) {
        console.error('Error al cargar ventas:', error);
        res.render('admin/ventas', {
            ventas: [],
            username: req.session.username,
            error: 'Error al cargar las ventas: ' + error.message
        });
    }
});

app.post('/admin/ventas/registrar', async (req, res) => {
    try {
        if (!req.session.isAdmin) return res.redirect('/');
        
        const { cliente_dni, producto_id, cantidad } = req.body;
        await connection.promise().query(
            'CALL sp_registrar_venta(?, ?, ?, ?)',
            [cliente_dni, req.session.DNI, producto_id, cantidad]
        );
        
        res.redirect('/admin/ventas');
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Error al registrar venta');
    }
});

// 4. Reportes
app.get('/admin/reportes', async (req, res) => {
    try {
        if (!req.session.isAdmin) return res.redirect('/');
        
        const fechaFin = new Date();
        const fechaInicio = new Date(Date.now() - 30*24*60*60*1000); // 30 días atrás
        
        // Obtener reportes
        const [results] = await connection.promise().query(
            'CALL sp_reporte_ventas_periodo(?, ?)',
            [fechaInicio, fechaFin]
        );

        // Los resultados vienen en múltiples conjuntos de datos
        const ventasPorPeriodo = results[0] || [];
        const productosMasVendidos = results[1] || [];
        const resumenGeneral = results[2]?.[0] || {
            total_ventas: 0,
            total_clientes: 0,
            monto_total_periodo: 0,
            ticket_promedio: 0
        };

        res.render('admin/reportes', {
            ventasPeriodo: ventasPorPeriodo,
            productosVendidos: productosMasVendidos,
            totalVentas: resumenGeneral.monto_total_periodo || 0,
            totalProductos: productosMasVendidos.reduce((sum, p) => sum + p.unidades_vendidas, 0),
            totalClientes: resumenGeneral.total_clientes || 0,
            username: req.session.username
        });

    } catch (error) {
        console.error('Error al cargar reportes:', error);
        res.render('admin/reportes', {
            ventasPeriodo: [],
            productosVendidos: [],
            totalVentas: 0,
            totalProductos: 0,
            totalClientes: 0,
            username: req.session.username,
            error: 'Error al cargar los reportes: ' + error.message
        });
    }
});

// 5. Sucursales
app.get('/admin/sucursales', async (req, res) => {
    try {
        if (!req.session.isAdmin) return res.redirect('/');
        const [result] = await connection.promise().query('CALL sp_listar_sucursales()');
        res.render('admin/sucursales', { 
            sucursales: result[0],
            username: req.session.username 
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Error al cargar sucursales');
    }
});

app.post('/admin/sucursales/agregar', async (req, res) => {
    try {
        if (!req.session.isAdmin) return res.redirect('/');
        const { nombre, direccion, telefono } = req.body;
        
        await connection.promise().query(
            'CALL sp_agregar_sucursal(?, ?, ?)',
            [nombre, direccion, telefono]
        );
        
        res.redirect('/admin/sucursales');
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Error al agregar sucursal');
    }
});

// 6. Servicio Técnico
app.get('/admin/servicio-tecnico', async (req, res) => {
    try {
        if (!req.session.isAdmin) return res.redirect('/');
        const [result] = await connection.promise().query('CALL sp_listar_reparaciones()');
        res.render('admin/servicio-tecnico', { 
            reparaciones: result[0],
            username: req.session.username 
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Error al cargar reparaciones');
    }
});

app.post('/admin/reparaciones/registrar', async (req, res) => {
    try {
        if (!req.session.isAdmin) return res.redirect('/');
        const { cliente_dni, descripcion, costo } = req.body;
        
        await connection.promise().query(
            'CALL sp_registrar_reparacion(?, ?, ?)',
            [cliente_dni, descripcion, costo]
        );
        
        res.redirect('/admin/servicio-tecnico');
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Error al registrar reparación');
    }
});

// Ruta principal del panel de administrador
app.get('/admin-dashboard', (req, res) => {
    if (!req.session.isAdmin) {
        return res.redirect('/');
    }
    res.render('admin-dashboard', { username: req.session.username });
});

// Iniciar servidor
const PORT = process.env.PORT || 3001;
app.listen(3001, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
});
