const express = require('express');
const router = express.Router();
const Connect = require('../Connection/SQLConnect');

// ==========================================
// CREAR REGLA SCORING
// POST http://localhost:3000/api/ReglasScoringMaestro/ReglaScoring
// ==========================================
router.post('/ReglaScoring', async (req, res) => {
  try {

    const {
      tipo_evento,
      condicion,
      puntos
    } = req.body;

    if (
      !tipo_evento ||
      !condicion ||
      puntos === undefined
    ) {
      return res.status(400).json({
        success: false,
        error: 'Faltan datos requeridos'
      });
    }

    const sql = `
      INSERT INTO reglas_scoring
      (
        tipo_evento,
        condicion,
        puntos
      )
      VALUES (?, ?, ?)
    `;

    const values = [
      tipo_evento,
      condicion,
      puntos
    ];

    const result = await Connect(sql, values);

    console.log("Resultado INSERT:", result);

    res.status(201).json({
      success: true,
      message: 'Regla scoring creada exitosamente',
      regla_scoring: {
        id: result.insertId || result[0]?.insertId || null,
        tipo_evento,
        condicion,
        puntos
      }
    });

  } catch (error) {

    console.error("Error al crear regla scoring:", error);

    res.status(500).json({
      success: false,
      error: 'Error al crear regla scoring'
    });

  }
});

// ==========================================
// CONSULTAR TODAS LAS REGLAS SCORING
// GET http://localhost:3000/api/ReglasScoringMaestro/ReglaScoring
// ==========================================
router.get('/ReglaScoring', async (req, res) => {
  try {

    const sql = `SELECT * FROM reglas_scoring`;

    const result = await Connect(sql, []);

    res.status(200).json({
      success: true,
      reglas_scoring: result
    });

  } catch (error) {

    console.error("Error al obtener reglas scoring:", error);

    res.status(500).json({
      success: false,
      error: 'Error al obtener reglas scoring'
    });

  }
});

// ==========================================
// CONSULTAR REGLA SCORING POR ID
// GET http://localhost:3000/api/ReglasScoringMaestro/ReglaScoring/:id
// ==========================================
router.get('/ReglaScoring/:id', async (req, res) => {
  try {

    const { id } = req.params;

    const sql = `
      SELECT *
      FROM reglas_scoring
      WHERE id = ?
    `;

    const result = await Connect(sql, [id]);

    if (result.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Regla scoring no encontrada'
      });
    }

    res.status(200).json({
      success: true,
      regla_scoring: result[0]
    });

  } catch (error) {

    console.error("Error al obtener regla scoring:", error);

    res.status(500).json({
      success: false,
      error: 'Error al obtener regla scoring'
    });

  }
});

// ==========================================
// ACTUALIZAR REGLA SCORING
// PUT http://localhost:3000/api/ReglasScoringMaestro/ReglaScoring/:id
// ==========================================
router.put('/ReglaScoring/:id', async (req, res) => {
  try {

    const { id } = req.params;

    const {
      tipo_evento,
      condicion,
      puntos
    } = req.body;

    if (
      !id ||
      !tipo_evento ||
      !condicion ||
      puntos === undefined
    ) {
      return res.status(400).json({
        success: false,
        error: 'Faltan datos requeridos'
      });
    }

    const sql = `
      UPDATE reglas_scoring
      SET
        tipo_evento = ?,
        condicion = ?,
        puntos = ?
      WHERE id = ?
    `;

    const values = [
      tipo_evento,
      condicion,
      puntos,
      id
    ];

    const result = await Connect(sql, values);

    console.log("Resultado UPDATE:", result);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: 'Regla scoring no encontrada'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Regla scoring actualizada exitosamente',
      regla_scoring: {
        id,
        tipo_evento,
        condicion,
        puntos
      }
    });

  } catch (error) {

    console.error("Error al actualizar regla scoring:", error);

    res.status(500).json({
      success: false,
      error: 'Error al actualizar regla scoring'
    });

  }
});

// ==========================================
// ELIMINAR REGLA SCORING
// DELETE http://localhost:3000/api/ReglasScoringMaestro/ReglaScoring/:id
// ==========================================
router.delete('/ReglaScoring/:id', async (req, res) => {
  try {

    const { id } = req.params;

    const sql = `DELETE FROM reglas_scoring WHERE id = ?`;

    const result = await Connect(sql, [id]);

    console.log("Resultado DELETE:", result);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: 'Regla scoring no encontrada'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Regla scoring eliminada exitosamente'
    });

  } catch (error) {

    console.error("Error al eliminar regla scoring:", error);

    res.status(500).json({
      success: false,
      error: 'Error al eliminar regla scoring'
    });

  }
});

module.exports = router;