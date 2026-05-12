const mysql = require('mysql2/promise'); // versión con Promesas
require('dotenv').config();

async function Connect(SentenceSQL, values) {
    try {

        // Validación para DELETE sin WHERE
        const sqlTrim = SentenceSQL.trim().toUpperCase();
        if (sqlTrim.startsWith("DELETE") && !sqlTrim.includes("WHERE")) {
            console.error("ERROR: DELETE sin WHERE no permitido");
            return { error: "DELETE sin WHERE no permitido" };
        }
        // Crear la conexión
        const connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '',
            database: process.env.database,
            port: process.env.port
        });

        // Ejecutar la consulta
        const [rows] = await connection.execute(SentenceSQL, values);

        // Cerrar la conexión
        await connection.end();

        // Retornar los resultados como JSON
        return rows;
    } catch (error) {
        console.error("Error en la base de datos:", error);
        throw error;
    }
}

module.exports = Connect;