const mysql = require('mysql2');

// Configuración de la conexión a la base de datos
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'clay7',
    database: 'gamestore'
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

