const express = require('express');
const router = express.Router();
const pool = require('../Connection/SQLConnect');

// ==========================================
// CREAR NOTIFICACIÓN + TRANSACCIÓN
// POST http://localhost:3000/api/NotificacionesMaestro/Notificacion
// ==========================================
router.post('/Notificacion', async (req, res) => {

  let connection;

  try {

    const {
      lead_id,
      mensaje,
      atendido
    } = req.body;

    // ==========================================
    // VALIDACIONES
    // ==========================================
    if (
      !lead_id ||
      !mensaje
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
    // INSERT NOTIFICACIÓN
    // ==========================================
    const sqlNotificacion = `
      INSERT INTO notificaciones
      (
        lead_id,
        mensaje,
        atendido,
        fecha
      )
      VALUES (?, ?, ?, NOW())
    `;

    const valuesNotificacion = [
      lead_id,
      mensaje,
      atendido ?? false
    ];

    const [notificacionResult] = await connection.query(
      sqlNotificacion,
      valuesNotificacion
    );

    console.log("Resultado NOTIFICACIÓN:", notificacionResult);

    // ==========================================
    // OBTENER ID NOTIFICACIÓN
    // ==========================================
    const notificacion_id = notificacionResult.insertId;

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
      message: 'Notificación creada correctamente',
      notificacion: {
        id: notificacion_id,
        lead_id,
        mensaje,
        atendido: atendido ?? false
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
      error: 'Error al crear notificación'
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
// CONSULTAR TODAS LAS NOTIFICACIONES
// GET http://localhost:3000/api/NotificacionesMaestro/Notificacion
// ==========================================
router.get('/Notificacion', async (req, res) => {

  try {

    const sql = `
      SELECT
        n.*,
        l.nombre AS lead_nombre
      FROM notificaciones n
      INNER JOIN leads l
        ON n.lead_id = l.id
      ORDER BY n.fecha DESC
    `;

    const [result] = await pool.query(sql);

    res.status(200).json({
      success: true,
      notificaciones: result
    });

  } catch (error) {

    console.error("Error al obtener notificaciones:", error);

    res.status(500).json({
      success: false,
      error: 'Error al obtener notificaciones'
    });

  }

});

// ==========================================
// CONSULTAR NOTIFICACIÓN POR ID
// GET http://localhost:3000/api/NotificacionesMaestro/Notificacion/:id
// ==========================================
router.get('/Notificacion/:id', async (req, res) => {

  try {

    const { id } = req.params;

    const sql = `
      SELECT
        n.*,
        l.nombre AS lead_nombre
      FROM notificaciones n
      INNER JOIN leads l
        ON n.lead_id = l.id
      WHERE n.id = ?
    `;

    const [result] = await pool.query(
      sql,
      [id]
    );

    if (result.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Notificación no encontrada'
      });
    }

    res.status(200).json({
      success: true,
      notificacion: result[0]
    });

  } catch (error) {

    console.error("Error al obtener notificación:", error);

    res.status(500).json({
      success: false,
      error: 'Error al obtener notificación'
    });

  }

});

// ==========================================
// ACTUALIZAR NOTIFICACIÓN
// PUT http://localhost:3000/api/NotificacionesMaestro/Notificacion/:id
// ==========================================
router.put('/Notificacion/:id', async (req, res) => {

  try {

    const { id } = req.params;

    const {
      lead_id,
      mensaje,
      atendido
    } = req.body;

    // ==========================================
    // VALIDACIONES
    // ==========================================
    if (
      !lead_id ||
      !mensaje
    ) {
      return res.status(400).json({
        success: false,
        error: 'Faltan datos requeridos'
      });
    }

    // ==========================================
    // UPDATE NOTIFICACIÓN
    // ==========================================
    const sql = `
      UPDATE notificaciones
      SET
        lead_id = ?,
        mensaje = ?,
        atendido = ?
      WHERE id = ?
    `;

    const values = [
      lead_id,
      mensaje,
      atendido ?? false,
      id
    ];

    const [result] = await pool.query(
      sql,
      values
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: 'Notificación no encontrada'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Notificación actualizada exitosamente',
      notificacion: {
        id,
        lead_id,
        mensaje,
        atendido: atendido ?? false
      }
    });

  } catch (error) {

    console.error("Error al actualizar notificación:", error);

    res.status(500).json({
      success: false,
      error: 'Error al actualizar notificación'
    });

  }

});

// ==========================================
// ELIMINAR NOTIFICACIÓN
// DELETE http://localhost:3000/api/NotificacionesMaestro/Notificacion/:id
// ==========================================
router.delete('/Notificacion/:id', async (req, res) => {

  try {

    const { id } = req.params;

    const sql = `
      DELETE FROM notificaciones
      WHERE id = ?
    `;

    const [result] = await pool.query(
      sql,
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: 'Notificación no encontrada'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Notificación eliminada exitosamente'
    });

  } catch (error) {

    console.error("Error al eliminar notificación:", error);

    res.status(500).json({
      success: false,
      error: 'Error al eliminar notificación'
    });

  }

});

module.exports = router;