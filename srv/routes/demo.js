const express = require('express');
const router = express.Router();
const Connect = require('../Connection/SQLConnect');

// ==========================================
// CREAR DEMO
// POST http://localhost:3000/api/DemoMaestro/Demo
// ==========================================
router.post('/Demo', async (req, res) => {
  try {

    const {
      lead_id,
      fecha_inicio,
      fecha_fin,
      estado
    } = req.body;

    if (
      !lead_id ||
      !fecha_inicio ||
      !fecha_fin ||
      !estado
    ) {
      return res.status(400).json({
        success: false,
        error: 'Faltan datos requeridos'
      });
    }

    const sql = `
      INSERT INTO demo
      (
        lead_id,
        fecha_inicio,
        fecha_fin,
        estado
      )
      VALUES (?, ?, ?, ?)
    `;

    const values = [
      lead_id,
      fecha_inicio,
      fecha_fin,
      estado
    ];

    const result = await Connect(sql, values);

    console.log("Resultado INSERT:", result);

    res.status(201).json({
      success: true,
      message: 'Demo creada exitosamente',
      demo: {
        id: result.insertId || result[0]?.insertId || null,
        lead_id,
        fecha_inicio,
        fecha_fin,
        estado
      }
    });

  } catch (error) {

    console.error("Error al crear demo:", error);

    res.status(500).json({
      success: false,
      error: 'Error al crear demo'
    });

  }
});

// ==========================================
// CONSULTAR TODAS LAS DEMOS
// GET http://localhost:3000/api/DemoMaestro/Demo
// ==========================================
router.get('/Demo', async (req, res) => {
  try {

    const sql = `
      SELECT
        d.*,
        l.nombre AS lead_nombre
      FROM demo d
      INNER JOIN leads l
        ON d.lead_id = l.id
    `;

    const result = await Connect(sql, []);

    res.status(200).json({
      success: true,
      demos: result
    });

  } catch (error) {

    console.error("Error al obtener demos:", error);

    res.status(500).json({
      success: false,
      error: 'Error al obtener demos'
    });

  }
});

// ==========================================
// CONSULTAR DEMO POR ID
// GET http://localhost:3000/api/DemoMaestro/Demo/:id
// ==========================================
router.get('/Demo/:id', async (req, res) => {
  try {

    const { id } = req.params;

    const sql = `
      SELECT
        d.*,
        l.nombre AS lead_nombre
      FROM demo d
      INNER JOIN leads l
        ON d.lead_id = l.id
      WHERE d.id = ?
    `;

    const result = await Connect(sql, [id]);

    if (result.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Demo no encontrada'
      });
    }

    res.status(200).json({
      success: true,
      demo: result[0]
    });

  } catch (error) {

    console.error("Error al obtener demo:", error);

    res.status(500).json({
      success: false,
      error: 'Error al obtener demo'
    });

  }
});

// ==========================================
// ACTUALIZAR DEMO
// PUT http://localhost:3000/api/DemoMaestro/Demo/:id
// ==========================================
router.put('/Demo/:id', async (req, res) => {
  try {

    const { id } = req.params;

    const {
      lead_id,
      fecha_inicio,
      fecha_fin,
      estado
    } = req.body;

    if (
      !id ||
      !lead_id ||
      !fecha_inicio ||
      !fecha_fin ||
      !estado
    ) {
      return res.status(400).json({
        success: false,
        error: 'Faltan datos requeridos'
      });
    }

    const sql = `
      UPDATE demo
      SET
        lead_id = ?,
        fecha_inicio = ?,
        fecha_fin = ?,
        estado = ?
      WHERE id = ?
    `;

    const values = [
      lead_id,
      fecha_inicio,
      fecha_fin,
      estado,
      id
    ];

    const result = await Connect(sql, values);

    console.log("Resultado UPDATE:", result);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: 'Demo no encontrada'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Demo actualizada exitosamente',
      demo: {
        id,
        lead_id,
        fecha_inicio,
        fecha_fin,
        estado
      }
    });

  } catch (error) {

    console.error("Error al actualizar demo:", error);

    res.status(500).json({
      success: false,
      error: 'Error al actualizar demo'
    });

  }
});

// ==========================================
// ELIMINAR DEMO
// DELETE http://localhost:3000/api/DemoMaestro/Demo/:id
// ==========================================
router.delete('/Demo/:id', async (req, res) => {
  try {

    const { id } = req.params;

    const sql = `DELETE FROM demo WHERE id = ?`;

    const result = await Connect(sql, [id]);

    console.log("Resultado DELETE:", result);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: 'Demo no encontrada'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Demo eliminada exitosamente'
    });

  } catch (error) {

    console.error("Error al eliminar demo:", error);

    res.status(500).json({
      success: false,
      error: 'Error al eliminar demo'
    });

  }
});

module.exports = router;