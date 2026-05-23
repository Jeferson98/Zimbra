const express = require('express');
const router = express.Router();
const Connect = require('../Connection/SQLConnect');

// ==========================================
// CREAR CAMPAÑA
// POST http://localhost:3000/api/CampanasMaestro/Campana
// ==========================================
router.post('/Campana', async (req, res) => {
  try {

    const {
      nombre,
      tipo,
      estado
    } = req.body;

    if (!nombre || !tipo || !estado) {
      return res.status(400).json({
        success: false,
        error: 'Faltan datos requeridos'
      });
    }

    const sql = `
      INSERT INTO campañas
      (
        nombre,
        tipo,
        estado
      )
      VALUES (?, ?, ?)
    `;

    const values = [
      nombre,
      tipo,
      estado
    ];

    const result = await Connect(sql, values);

    console.log("Resultado INSERT:", result);

    res.status(201).json({
      success: true,
      message: 'Campaña creada exitosamente',
      campaña: {
        id: result.insertId || result[0]?.insertId || null,
        nombre,
        tipo,
        estado
      }
    });

  } catch (error) {

    console.error("Error al crear campaña:", error);

    res.status(500).json({
      success: false,
      error: 'Error al crear campaña'
    });

  }
});

// ==========================================
// CONSULTAR TODAS LAS CAMPAÑAS
// GET http://localhost:3000/api/CampanasMaestro/Campana
// ==========================================
router.get('/Campana', async (req, res) => {
  try {

    const sql = `SELECT * FROM campañas`;

    const result = await Connect(sql, []);

    res.status(200).json({
      success: true,
      campañas: result
    });

  } catch (error) {

    console.error("Error al obtener campañas:", error);

    res.status(500).json({
      success: false,
      error: 'Error al obtener campañas'
    });

  }
});

// ==========================================
// CONSULTAR CAMPAÑA POR ID
// GET http://localhost:3000/api/CampanasMaestro/Campana/:id
// ==========================================
router.get('/Campana/:id', async (req, res) => {
  try {

    const { id } = req.params;

    const sql = `SELECT * FROM campañas WHERE id = ?`;

    const result = await Connect(sql, [id]);

    if (result.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Campaña no encontrada'
      });
    }

    res.status(200).json({
      success: true,
      campaña: result[0]
    });

  } catch (error) {

    console.error("Error al obtener campaña:", error);

    res.status(500).json({
      success: false,
      error: 'Error al obtener campaña'
    });

  }
});

// ==========================================
// ACTUALIZAR CAMPAÑA
// PUT http://localhost:3000/api/CampanasMaestro/Campana/:id
// ==========================================
router.put('/Campana/:id', async (req, res) => {
  try {

    const { id } = req.params;

    const {
      nombre,
      tipo,
      estado
    } = req.body;

    if (!id || !nombre || !tipo || !estado) {
      return res.status(400).json({
        success: false,
        error: 'Faltan datos requeridos'
      });
    }

    const sql = `
      UPDATE campañas
      SET
        nombre = ?,
        tipo = ?,
        estado = ?
      WHERE id = ?
    `;

    const values = [
      nombre,
      tipo,
      estado,
      id
    ];

    const result = await Connect(sql, values);

    console.log("Resultado UPDATE:", result);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: 'Campaña no encontrada'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Campaña actualizada exitosamente',
      campaña: {
        id,
        nombre,
        tipo,
        estado
      }
    });

  } catch (error) {

    console.error("Error al actualizar campaña:", error);

    res.status(500).json({
      success: false,
      error: 'Error al actualizar campaña'
    });

  }
});

// ==========================================
// ELIMINAR CAMPAÑA
// DELETE http://localhost:3000/api/CampanasMaestro/Campana/:id
// ==========================================
router.delete('/Campana/:id', async (req, res) => {
  try {

    const { id } = req.params;

    const sql = `DELETE FROM campañas WHERE id = ?`;

    const result = await Connect(sql, [id]);

    console.log("Resultado DELETE:", result);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: 'Campaña no encontrada'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Campaña eliminada exitosamente'
    });

  } catch (error) {

    console.error("Error al eliminar campaña:", error);

    res.status(500).json({
      success: false,
      error: 'Error al eliminar campaña'
    });

  }
});

module.exports = router;