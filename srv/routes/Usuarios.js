const express = require('express');
const router = express.Router();
const  Connect  = require('../Connection/SQLConnect'); // importa tu función Connect
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// POST http://localhost:3000/api/UsuariosMaestro/login
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: 'Usuario y contraseña requeridos' });
        }

        // Buscar usuario por username
        const sql = `SELECT id, nombre, username, password, rol_id, sede_id FROM usuarios WHERE username = ? AND estado = 1`;
        const values = [username];
        const result = await Connect(sql, values);

        if (result.length === 0) {
            return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
        }

        const user = result[0];

        // Verificar contraseña (asumiendo que está hasheada con bcrypt)
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
        }

        // Generar token JWT
        const token = jwt.sign(
            { id: user.id, username: user.username, rol_id: user.rol_id },
            process.env.JWT_SECRET || 'tu_secreto_jwt', // Usa una variable de entorno
            { expiresIn: '24h' }
        );

        // Retornar token y datos del usuario (sin contraseña)
        res.json({
            token,
            user: {
                id: user.id,
                nombre: user.nombre,
                username: user.username,
                rol_id: user.rol_id,
                sede_id: user.sede_id
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
});

// PUT http://localhost:3000/api/UsuariosMaestro/Usuario
router.post('/Usuario', async (req, res) => { // <-- async aquí
    try {
        //console.log("Body recibido:", req.body);
        const { nombre, username, password, rol_id, sede_id } = req.body;

        if (!nombre || !username || !password || !rol_id || !sede_id) {
            return res.status(400).json({ error: 'Faltan datos requeridos' });
        }

        // Hashear la contraseña
        const hashedPassword = await bcrypt.hash(password, 10);

        const sql = `
            INSERT INTO usuarios (nombre, username, password, rol_id, sede_id)
            VALUES (?, ?, ?, ?, ?)
        `;

        const values = [nombre, username, hashedPassword, rol_id, sede_id];
        const usuarios = await Connect(sql,values); // await SOLO funciona porque el callback es async

        // Retornar los resultados en JSON
        res.json(usuarios);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al crear usuario' });
    }
});

router.put('/Usuario', async (req, res) => { // <-- async aquí
    try {
        //console.log("Body recibido:", req.body);
        const { nombre, username, password, rol_id, sede_id, id } = req.body;

        if (!nombre || !username || !password || !rol_id || !sede_id || !id) {
            return res.status(400).json({ error: 'Faltan datos requeridos' });
        }

        // Hashear la contraseña
        const hashedPassword = await bcrypt.hash(password, 10);

        const sql = `
            UPDATE usuarios
            SET nombre = ?, username = ?, password = ?, rol_id = ?, sede_id = ?
            WHERE id = ?
        `;

        // Valores en el mismo orden que los placeholders
        const values = [nombre, username, hashedPassword, rol_id, sede_id, id];
        const usuarios = await Connect(sql,values); // await SOLO funciona porque el callback es async

        // Retornar los resultados en JSON
        res.json(usuarios);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al actualizar usuario' });
    }
});

router.get('/Usuario', async (req, res) => { // <-- async aquí
    try {
        const sql = `
            SELECT * FROM usuarios 
        `;

        const values = [];
        const usuarios = await Connect(sql,values); // await SOLO funciona porque el callback es async

        // Retornar los resultados en JSON
        res.json(usuarios);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener usuarios' });
    }
});

router.delete('/Usuario/:id', async (req, res) => { // <-- async aquí
    try {
        //console.log("Body recibido:", req.body);
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ error: 'Faltan datos requeridos' });
        }

        const sql = `
            DELETE FROM usuarios
            WHERE id = ?
        `;

        // Solo necesitas el id como valor
        const values = [id];
        const usuarios = await Connect(sql,values); // await SOLO funciona porque el callback es async

        // Retornar los resultados en JSON
        res.json(usuarios);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener usuarios' });
    }
});

module.exports = router;