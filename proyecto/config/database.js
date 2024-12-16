const mysql = require('mysql2');

// Configuración de la conexión a la base de datos
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'clay7',
    database: 'gamestore',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    connectTimeout: 60000,
    acquireTimeout: 60000,
    timeout: 60000
});

// Conectar a la base de datos
connection.connect((error) => {
    if (error) {
        console.error('Error conectando a la base de datos: ' + error.stack);
        return;
    }
    console.log('Conexión establecida con la base de datos gamestore.');
});

module.exports = connection;

