const express = require('express');
const router = express.Router();
const pool = require('../Connection/SQLConnect');

// ==========================================
// CREAR EMAIL ENVIADO + TRANSACCIÓN
// POST http://localhost:3000/api/EmailsEnviadosMaestro/EmailEnviado
// ==========================================
router.post('/EmailEnviado', async (req, res) => {

  let connection;

  try {

    const {
      lead_id,
      campana_id,
      asunto,
      contenido,
      abierto,
      clic
    } = req.body;

    // ==========================================
    // VALIDACIONES
    // ==========================================
    if (
      !lead_id ||
      !campana_id ||
      !asunto ||
      !contenido
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
    // INSERT EMAIL ENVIADO
    // ==========================================
    const sqlEmail = `
      INSERT INTO emails_enviados
      (
        lead_id,
        campana_id,
        asunto,
        contenido,
        abierto,
        clic,
        fecha_envio
      )
      VALUES (?, ?, ?, ?, ?, ?, NOW())
    `;

    const valuesEmail = [
      lead_id,
      campana_id,
      asunto,
      contenido,
      abierto ?? false,
      clic ?? false
    ];

    const [emailResult] = await connection.query(
      sqlEmail,
      valuesEmail
    );

    console.log("Resultado EMAIL ENVIADO:", emailResult);

    // ==========================================
    // OBTENER ID EMAIL
    // ==========================================
    const email_id = emailResult.insertId;

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
      message: 'Email enviado correctamente',
      email_enviado: {
        id: email_id,
        lead_id,
        campana_id,
        asunto,
        contenido,
        abierto: abierto ?? false,
        clic: clic ?? false
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
      error: 'Error al crear email enviado'
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
// CONSULTAR TODOS LOS EMAILS ENVIADOS
// GET http://localhost:3000/api/EmailsEnviadosMaestro/EmailEnviado
// ==========================================
router.get('/EmailEnviado', async (req, res) => {

  try {

    const sql = `
      SELECT
        ee.*,
        l.nombre AS lead_nombre,
        c.nombre AS campana_nombre
      FROM emails_enviados ee
      INNER JOIN leads l
        ON ee.lead_id = l.id
      INNER JOIN campanas c
        ON ee.campana_id = c.id
      ORDER BY ee.fecha_envio DESC
    `;

    const [result] = await pool.query(sql);

    res.status(200).json({
      success: true,
      emails_enviados: result
    });

  } catch (error) {

    console.error("Error al obtener emails enviados:", error);

    res.status(500).json({
      success: false,
      error: 'Error al obtener emails enviados'
    });

  }

});

// ==========================================
// CONSULTAR EMAIL ENVIADO POR ID
// GET http://localhost:3000/api/EmailsEnviadosMaestro/EmailEnviado/:id
// ==========================================
router.get('/EmailEnviado/:id', async (req, res) => {

  try {

    const { id } = req.params;

    const sql = `
      SELECT
        ee.*,
        l.nombre AS lead_nombre,
        c.nombre AS campana_nombre
      FROM emails_enviados ee
      INNER JOIN leads l
        ON ee.lead_id = l.id
      INNER JOIN campanas c
        ON ee.campana_id = c.id
      WHERE ee.id = ?
    `;

    const [result] = await pool.query(
      sql,
      [id]
    );

    if (result.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Email enviado no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      email_enviado: result[0]
    });

  } catch (error) {

    console.error("Error al obtener email enviado:", error);

    res.status(500).json({
      success: false,
      error: 'Error al obtener email enviado'
    });

  }

});

// ==========================================
// ACTUALIZAR EMAIL ENVIADO
// PUT http://localhost:3000/api/EmailsEnviadosMaestro/EmailEnviado/:id
// ==========================================
router.put('/EmailEnviado/:id', async (req, res) => {

  try {

    const { id } = req.params;

    const {
      lead_id,
      campana_id,
      asunto,
      contenido,
      abierto,
      clic
    } = req.body;

    // ==========================================
    // VALIDACIONES
    // ==========================================
    if (
      !lead_id ||
      !campana_id ||
      !asunto ||
      !contenido
    ) {
      return res.status(400).json({
        success: false,
        error: 'Faltan datos requeridos'
      });
    }

    // ==========================================
    // UPDATE EMAIL ENVIADO
    // ==========================================
    const sql = `
      UPDATE emails_enviados
      SET
        lead_id = ?,
        campana_id = ?,
        asunto = ?,
        contenido = ?,
        abierto = ?,
        clic = ?
      WHERE id = ?
    `;

    const values = [
      lead_id,
      campana_id,
      asunto,
      contenido,
      abierto ?? false,
      clic ?? false,
      id
    ];

    const [result] = await pool.query(
      sql,
      values
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: 'Email enviado no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Email enviado actualizado exitosamente',
      email_enviado: {
        id,
        lead_id,
        campana_id,
        asunto,
        contenido,
        abierto: abierto ?? false,
        clic: clic ?? false
      }
    });

  } catch (error) {

    console.error("Error al actualizar email enviado:", error);

    res.status(500).json({
      success: false,
      error: 'Error al actualizar email enviado'
    });

  }

});

// ==========================================
// ELIMINAR EMAIL ENVIADO
// DELETE http://localhost:3000/api/EmailsEnviadosMaestro/EmailEnviado/:id
// ==========================================
router.delete('/EmailEnviado/:id', async (req, res) => {

  try {

    const { id } = req.params;

    const sql = `
      DELETE FROM emails_enviados
      WHERE id = ?
    `;

    const [result] = await pool.query(
      sql,
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: 'Email enviado no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Email enviado eliminado exitosamente'
    });

  } catch (error) {

    console.error("Error al eliminar email enviado:", error);

    res.status(500).json({
      success: false,
      error: 'Error al eliminar email enviado'
    });

  }

});

module.exports = router;