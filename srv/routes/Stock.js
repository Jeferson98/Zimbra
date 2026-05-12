const express = require('express');
const router = express.Router();
const  Connect  = require('../Connection/SQLConnect'); // importa tu función Connect

//  http://localhost:3000/api/StockMaestro/Stock
router.post('/Stock', async (req, res) => { // <-- async aquí
    try {
        //console.log("Body recibido:", req.body);
        const { producto_id, sede_id, cantidad } = req.body;

        if (!producto_id || !cantidad || !sede_id) {
            return res.status(400).json({ error: 'Faltan datos requeridos' });
        }
        const sql = `
            INSERT INTO inventario (producto_id, cantidad, sede_id)
            VALUES (?, ?, ?)
        `;

        const values = [producto_id, cantidad, sede_id];
        const inventario = await Connect(sql,values); // await SOLO funciona porque el callback es async

        // Retornar los resultados en JSON
        res.json(inventario);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener inventario' });
    }
});

router.put('/Stock', async (req, res) => { // <-- async aquí
    try {
        //console.log("Body recibido:", req.body);
        const { inventario_id, producto_id, sede_id, cantidad } = req.body;

        if (!inventario_id || !producto_id || !cantidad || !sede_id) {
            return res.status(400).json({ error: 'Faltan datos requeridos' });
        }
        const sql = `
            UPDATE inventario
            SET producto_id = ?, cantidad = ?, sede_id = ?
            WHERE id = ?
        `;

        const values = [producto_id, cantidad, sede_id, inventario_id];
        const inventario = await Connect(sql,values); // await SOLO funciona porque el callback es async

        // Retornar los resultados en JSON
        res.json(inventario);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener inventario' });
    }
});

router.get('/Stock', async (req, res) => { // <-- async aquí
    try {
        const sql = `
            SELECT 
                i.id AS inventario_id,   -- id del inventario
                i.producto_id,
                i.sede_id,
                p.nombre AS producto_nombre,
                p.codigo AS producto_codigo,
                s.nombre AS sede_nombre,
                i.cantidad
            FROM inventario i
            LEFT JOIN productos p ON i.producto_id = p.id
            LEFT JOIN sedes s ON i.sede_id = s.id;
        `;

        const values = [];
        const inventario = await Connect(sql,values); // await SOLO funciona porque el callback es async

        // Retornar los resultados en JSON
        res.json(inventario);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener inventario' });
    }
});

router.delete('/Stock/:id', async (req, res) => { // <-- async aquí
    try {
        console.log("Body recibido:", req.params);
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ error: 'Faltan datos requeridos' });
        }

        const sql = `
            DELETE FROM inventario
            WHERE id = ?
        `;

        // Solo necesitas el id como valor
        const values = [id];
        const inventario = await Connect(sql,values); // await SOLO funciona porque el callback es async

        // Retornar los resultados en JSON
        res.json(inventario);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener inventario' });
    }
});

module.exports = router;