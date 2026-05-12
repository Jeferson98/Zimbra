const express = require('express');
const router = express.Router();
const Connect = require('../Connection/SQLConnect'); // importa tu función Connect

// http://localhost:3000/api/SedesMaestro/Sede
router.post('/Sede', async (req, res) => {
  try {
    const { name, address, city } = req.body;
    if (!name || !address || !city) {
      return res.status(400).json({ success: false, error: 'Faltan datos requeridos' });
    }

    const sql = `INSERT INTO sedes (nombre, direccion, ciudad) VALUES (?, ?, ?)`;
    const values = [name, address, city];
    const result = await Connect(sql, values);

    console.log("Resultado de INSERT:", result);

    res.status(201).json({
      success: true,
      message: "Sede creada exitosamente",
      sede: {
        id: result.insertId || result[0]?.insertId || null,
        name,
        address,
        city,
        status: 1 // Asumiendo que el nuevo sitio está activo por defecto
      }
    });
  } catch (error) {
    console.error("Error al crear sede:", error);
    res.status(500).json({ success: false, error: "Error al crear la sede" });
  }
});

router.get('/Sede', async (req, res) => {
  try {
    const sql = `SELECT * FROM sedes`;
    const result = await Connect(sql, []);

    res.status(200).json({
      success: true,
      sedes: result
    });
  } catch (error) {
    console.error("Error al obtener sedes:", error);
    res.status(500).json({ success: false, error: "Error al obtener las sedes" });
  }
});

router.put('/Sede/:id', async (req, res) => {
  try {
    const { name, address, city, status } = req.body;
    const { id } = req.params; // el id viene de la URL

    if (!id || !name || !address || !city ) {
      return res.status(400).json({ success: false, error: 'Faltan datos requeridos' });
    }

    const sql = `UPDATE sedes SET nombre = ?, direccion = ?, ciudad = ?, estado = ? WHERE id = ?`;
    const values = [name, address, city, status, id];
    const result = await Connect(sql, values);

    console.log("Resultado de UPDATE:", result);

    res.status(200).json({
      success: true,
      message: "Sede actualizada exitosamente",
      sede: {
        id,
        name,
        address,
        city,
        status
      }
    });
  } catch (error) {
    console.error("Error al actualizar sede:", error);
    res.status(500).json({ success: false, error: "Error al actualizar la sede" });
  }
});

module.exports = router;
