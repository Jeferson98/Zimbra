const express = require('express');
const router = express.Router();
const pool = require('../Connection/SQLConnect');

// ==========================================
// CREAR CAMPAÑA + TRANSACCIÓN
// POST http://localhost:3000/api/CampanasMaestro/Campana
// ==========================================
router.post('/Campana', async (req, res) => {

  let connection;

  try {

    const {
      nombre,
      tipo,
      estado
    } = req.body;

    // ==========================================
    // VALIDACIONES
    // ==========================================
    if (
      !nombre ||
      !tipo
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
    // INSERT CAMPAÑA
    // ==========================================
    const sqlCampana = `
      INSERT INTO campanas
      (
        nombre,
        tipo,
        estado,
        fecha_creacion
      )
      VALUES (?, ?, ?, NOW())
    `;

    const valuesCampana = [
      nombre,
      tipo,
      estado || 'activa'
    ];

    const [campanaResult] = await connection.query(
      sqlCampana,
      valuesCampana
    );

    console.log("Resultado CAMPAÑA:", campanaResult);

    // ==========================================
    // OBTENER ID CAMPAÑA
    // ==========================================
    const campana_id = campanaResult.insertId;

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
      message: 'Campaña creada correctamente',
      campana: {
        id: campana_id,
        nombre,
        tipo,
        estado: estado || 'activa'
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
      error: 'Error al crear campaña'
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
// CONSULTAR TODAS LAS CAMPAÑAS
// GET http://localhost:3000/api/CampanasMaestro/Campana
// ==========================================
router.get('/Campana', async (req, res) => {

  try {

    const sql = `
      SELECT *
      FROM campanas
      ORDER BY fecha_creacion DESC
    `;

    const [result] = await pool.query(sql);

    res.status(200).json({
      success: true,
      campanas: result
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

    const sql = `
      SELECT *
      FROM campanas
      WHERE id = ?
    `;

    const [result] = await pool.query(
      sql,
      [id]
    );

    if (result.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Campaña no encontrada'
      });
    }

    res.status(200).json({
      success: true,
      campana: result[0]
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

    // ==========================================
    // VALIDACIONES
    // ==========================================
    if (
      !nombre ||
      !tipo ||
      !estado
    ) {
      return res.status(400).json({
        success: false,
        error: 'Faltan datos requeridos'
      });
    }

    // ==========================================
    // UPDATE CAMPAÑA
    // ==========================================
    const sql = `
      UPDATE campanas
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

    const [result] = await pool.query(
      sql,
      values
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: 'Campaña no encontrada'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Campaña actualizada exitosamente',
      campana: {
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

    const sql = `
      DELETE FROM campanas
      WHERE id = ?
    `;

    const [result] = await pool.query(
      sql,
      [id]
    );

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