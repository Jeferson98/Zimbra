const express = require('express');
const router = express.Router();
const Connect = require('../Connection/SQLConnect');

// ==========================================
// CREAR SCORE HISTORIAL
// POST http://localhost:3000/api/ScoreHistorialMaestro/ScoreHistorial
// ==========================================
router.post('/ScoreHistorial', async (req, res) => {
  try {

    const {
      lead_id,
      puntos,
      motivo
    } = req.body;

    if (
      !lead_id ||
      puntos === undefined ||
      !motivo
    ) {
      return res.status(400).json({
        success: false,
        error: 'Faltan datos requeridos'
      });
    }

    const sql = `
      INSERT INTO score_historial
      (
        lead_id,
        puntos,
        motivo
      )
      VALUES (?, ?, ?)
    `;

    const values = [
      lead_id,
      puntos,
      motivo
    ];

    const result = await Connect(sql, values);

    console.log("Resultado INSERT:", result);

    res.status(201).json({
      success: true,
      message: 'Score historial creado exitosamente',
      score_historial: {
        id: result.insertId || result[0]?.insertId || null,
        lead_id,
        puntos,
        motivo
      }
    });

  } catch (error) {

    console.error("Error al crear score historial:", error);

    res.status(500).json({
      success: false,
      error: 'Error al crear score historial'
    });

  }
});

// ==========================================
// CONSULTAR TODOS LOS SCORES HISTORIAL
// GET http://localhost:3000/api/ScoreHistorialMaestro/ScoreHistorial
// ==========================================
router.get('/ScoreHistorial', async (req, res) => {
  try {

    const sql = `
      SELECT
        sh.*,
        l.nombre AS lead_nombre
      FROM score_historial sh
      INNER JOIN leads l
        ON sh.lead_id = l.id
    `;

    const result = await Connect(sql, []);

    res.status(200).json({
      success: true,
      score_historial: result
    });

  } catch (error) {

    console.error("Error al obtener score historial:", error);

    res.status(500).json({
      success: false,
      error: 'Error al obtener score historial'
    });

  }
});

// ==========================================
// CONSULTAR SCORE HISTORIAL POR ID
// GET http://localhost:3000/api/ScoreHistorialMaestro/ScoreHistorial/:id
// ==========================================
router.get('/ScoreHistorial/:id', async (req, res) => {
  try {

    const { id } = req.params;

    const sql = `
      SELECT
        sh.*,
        l.nombre AS lead_nombre
      FROM score_historial sh
      INNER JOIN leads l
        ON sh.lead_id = l.id
      WHERE sh.id = ?
    `;

    const result = await Connect(sql, [id]);

    if (result.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Score historial no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      score_historial: result[0]
    });

  } catch (error) {

    console.error("Error al obtener score historial:", error);

    res.status(500).json({
      success: false,
      error: 'Error al obtener score historial'
    });

  }
});

// ==========================================
// ACTUALIZAR SCORE HISTORIAL
// PUT http://localhost:3000/api/ScoreHistorialMaestro/ScoreHistorial/:id
// ==========================================
router.put('/ScoreHistorial/:id', async (req, res) => {
  try {

    const { id } = req.params;

    const {
      lead_id,
      puntos,
      motivo
    } = req.body;

    if (
      !id ||
      !lead_id ||
      puntos === undefined ||
      !motivo
    ) {
      return res.status(400).json({
        success: false,
        error: 'Faltan datos requeridos'
      });
    }

    const sql = `
      UPDATE score_historial
      SET
        lead_id = ?,
        puntos = ?,
        motivo = ?
      WHERE id = ?
    `;

    const values = [
      lead_id,
      puntos,
      motivo,
      id
    ];

    const result = await Connect(sql, values);

    console.log("Resultado UPDATE:", result);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: 'Score historial no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Score historial actualizado exitosamente',
      score_historial: {
        id,
        lead_id,
        puntos,
        motivo
      }
    });

  } catch (error) {

    console.error("Error al actualizar score historial:", error);

    res.status(500).json({
      success: false,
      error: 'Error al actualizar score historial'
    });

  }
});

// ==========================================
// ELIMINAR SCORE HISTORIAL
// DELETE http://localhost:3000/api/ScoreHistorialMaestro/ScoreHistorial/:id
// ==========================================
router.delete('/ScoreHistorial/:id', async (req, res) => {
  try {

    const { id } = req.params;

    const sql = `DELETE FROM score_historial WHERE id = ?`;

    const result = await Connect(sql, [id]);

    console.log("Resultado DELETE:", result);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: 'Score historial no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Score historial eliminado exitosamente'
    });

  } catch (error) {

    console.error("Error al eliminar score historial:", error);

    res.status(500).json({
      success: false,
      error: 'Error al eliminar score historial'
    });

  }
});

module.exports = router;