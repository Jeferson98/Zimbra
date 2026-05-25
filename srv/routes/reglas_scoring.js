const express = require('express');
const router = express.Router();
const pool = require('../Connection/SQLConnect');

// ==========================================
// CREAR REGLA SCORING + TRANSACCIÓN
// POST http://localhost:3000/api/ReglasScoringMaestro/ReglaScoring
// ==========================================
router.post('/ReglaScoring', async (req, res) => {

  let connection;

  try {

    const {
      tipo_evento,
      condicion,
      puntos
    } = req.body;

    // ==========================================
    // VALIDACIONES
    // ==========================================
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

    // ==========================================
    // OBTENER CONEXIÓN
    // ==========================================
    connection = await pool.getConnection();

    // ==========================================
    // INICIAR TRANSACCIÓN
    // ==========================================
    const sqlStartTransaction = `
      START TRANSACTION
    `;

    await connection.query(sqlStartTransaction);

    // ==========================================
    // INSERT REGLA SCORING
    // ==========================================
    const sqlReglaScoring = `
      INSERT INTO reglas_scoring
      (
        tipo_evento,
        condicion,
        puntos
      )
      VALUES (?, ?, ?)
    `;

    const valuesReglaScoring = [
      tipo_evento,
      condicion,
      puntos
    ];

    const [reglaResult] = await connection.query(
      sqlReglaScoring,
      valuesReglaScoring
    );

    console.log("Resultado REGLA SCORING:", reglaResult);

    // ==========================================
    // OBTENER ID REGLA
    // ==========================================
    const regla_scoring_id = reglaResult.insertId;

    // ==========================================
    // COMMIT
    // ==========================================
    const sqlCommit = `
      COMMIT
    `;

    await connection.query(sqlCommit);

    // ==========================================
    // RESPUESTA EXITOSA
    // ==========================================
    res.status(201).json({
      success: true,
      message: 'Regla scoring creada correctamente',
      regla_scoring: {
        id: regla_scoring_id,
        tipo_evento,
        condicion,
        puntos
      }
    });

  } catch (error) {

    // ==========================================
    // ROLLBACK
    // ==========================================
    if (connection) {

      const sqlRollback = `
        ROLLBACK
      `;

      await connection.query(sqlRollback);

    }

    console.error("ERROR TRANSACCIÓN:", error);

    res.status(500).json({
      success: false,
      error: 'Error al crear regla scoring'
    });

  } finally {

    // ==========================================
    // LIBERAR CONEXIÓN
    // ==========================================
    if (connection) {
      connection.release();
    }

  }

});

// ==========================================
// CONSULTAR TODAS LAS REGLAS SCORING
// GET http://localhost:3000/api/ReglasScoringMaestro/ReglaScoring
// ==========================================
router.get('/ReglaScoring', async (req, res) => {

  try {

    const sql = `
      SELECT *
      FROM reglas_scoring
      ORDER BY id DESC
    `;

    const [result] = await pool.query(sql);

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

    const [result] = await pool.query(
      sql,
      [id]
    );

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

    // ==========================================
    // VALIDACIONES
    // ==========================================
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

    // ==========================================
    // UPDATE REGLA SCORING
    // ==========================================
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

    const [result] = await pool.query(
      sql,
      values
    );

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

  let connection;

  try {

    const { id } = req.params;

    // ==========================================
    // OBTENER CONEXIÓN
    // ==========================================
    connection = await pool.getConnection();

    // ==========================================
    // INICIAR TRANSACCIÓN
    // ==========================================
    const sqlStartTransaction = `
      START TRANSACTION
    `;

    await connection.query(sqlStartTransaction);

    // ==========================================
    // DELETE REGLA SCORING
    // ==========================================
    const sqlDeleteRegla = `
      DELETE FROM reglas_scoring
      WHERE id = ?
    `;

    const [result] = await connection.query(
      sqlDeleteRegla,
      [id]
    );

    // ==========================================
    // VALIDAR EXISTENCIA
    // ==========================================
    if (result.affectedRows === 0) {

      const sqlRollback = `
        ROLLBACK
      `;

      await connection.query(sqlRollback);

      return res.status(404).json({
        success: false,
        error: 'Regla scoring no encontrada'
      });

    }

    console.log("Resultado DELETE REGLA:", result);

    // ==========================================
    // COMMIT
    // ==========================================
    const sqlCommit = `
      COMMIT
    `;

    await connection.query(sqlCommit);

    // ==========================================
    // RESPUESTA EXITOSA
    // ==========================================
    res.status(200).json({
      success: true,
      message: 'Regla scoring eliminada correctamente'
    });

  } catch (error) {

    // ==========================================
    // ROLLBACK
    // ==========================================
    if (connection) {

      const sqlRollback = `
        ROLLBACK
      `;

      await connection.query(sqlRollback);

    }

    console.error("ERROR TRANSACCIÓN:", error);

    res.status(500).json({
      success: false,
      error: 'Error al eliminar regla scoring'
    });

  } finally {

    // ==========================================
    // LIBERAR CONEXIÓN
    // ==========================================
    if (connection) {
      connection.release();
    }

  }

});

module.exports = router;