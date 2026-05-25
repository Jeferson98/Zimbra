const express = require('express');
const router = express.Router();
const pool = require('../Connection/SQLConnect');

// ==========================================
// CREAR LEAD + SAVEPOINT + ROLLBACK TO SAVEPOINT
// POST http://localhost:3000/api/LeadsMaestro/LeadSavepoint
// ==========================================
router.post('/LeadSavepoint', async (req, res) => {

  let connection;

  try {

    const {
      nombre,
      email,
      empresa,
      telefono
    } = req.body;

    // ==========================================
    // VALIDACIONES
    // ==========================================
    if (
      !nombre ||
      !email
    ) {
      return res.status(400).json({
        success: false,
        error: 'Nombre y email son requeridos'
      });
    }

    // ==========================================
    // OBTENER CONEXIÓN
    // ==========================================
    connection = await pool.getConnection();

    // ==========================================
    // START TRANSACTION
    // ==========================================
    const sqlStartTransaction = `
      START TRANSACTION
    `;

    await connection.query(sqlStartTransaction);

    // ==========================================
    // INSERT LEAD
    // ==========================================
    const sqlInsertLead = `
      INSERT INTO leads
      (
        nombre,
        email,
        empresa,
        telefono,
        estado,
        score,
        fecha_creacion
      )
      VALUES (?, ?, ?, ?, ?, ?, NOW())
    `;

    const valuesLead = [
      nombre,
      email,
      empresa || null,
      telefono || null,
      'nuevo',
      5
    ];

    const [leadResult] = await connection.query(
      sqlInsertLead,
      valuesLead
    );

    console.log("Resultado INSERT LEAD:", leadResult);

    // ==========================================
    // OBTENER ID LEAD
    // ==========================================
    const lead_id = leadResult.insertId;

    // ==========================================
    // SAVEPOINT
    // ==========================================
    const sqlSavepoint = `
      SAVEPOINT punto_seguro
    `;

    await connection.query(sqlSavepoint);

    console.log("SAVEPOINT creado correctamente");

    // ==========================================
    // UPDATE SCORE
    // ==========================================
    const sqlUpdateLead = `
      UPDATE leads
      SET score = score + 20
      WHERE id = ?
    `;

    const [updateResult] = await connection.query(
      sqlUpdateLead,
      [lead_id]
    );

    console.log("Resultado UPDATE SCORE:", updateResult);

    // ==========================================
    // CONSULTAR SCORE MODIFICADO
    // ==========================================
    const sqlLeadUpdate = `
      SELECT *
      FROM leads
      WHERE id = ?
    `;

    const [leadUpdateData] = await connection.query(
      sqlLeadUpdate,
      [lead_id]
    );

    console.log("Lead después UPDATE:", leadUpdateData[0]);

    // ==========================================
    // ROLLBACK TO SAVEPOINT
    // ==========================================
    const sqlRollbackSavepoint = `
      ROLLBACK TO punto_seguro
    `;

    await connection.query(sqlRollbackSavepoint);

    console.log("Rollback al SAVEPOINT ejecutado");

    // ==========================================
    // CONSULTAR LEAD FINAL
    // ==========================================
    const sqlLeadFinal = `
      SELECT *
      FROM leads
      WHERE id = ?
    `;

    const [leadFinalData] = await connection.query(
      sqlLeadFinal,
      [lead_id]
    );

    console.log("Lead final después rollback:", leadFinalData[0]);

    // ==========================================
    // COMMIT
    // ==========================================
    const sqlCommit = `
      COMMIT
    `;

    await connection.query(sqlCommit);

    console.log("COMMIT ejecutado correctamente");

    // ==========================================
    // RESPUESTA EXITOSA
    // ==========================================
    res.status(201).json({
      success: true,
      message: 'Lead creado con SAVEPOINT correctamente',
      lead: {
        id: leadFinalData[0].id,
        nombre: leadFinalData[0].nombre,
        email: leadFinalData[0].email,
        empresa: leadFinalData[0].empresa,
        telefono: leadFinalData[0].telefono,
        estado: leadFinalData[0].estado,
        score: leadFinalData[0].score
      },
      transaccion: {
        savepoint: 'punto_seguro',
        update_realizado: true,
        rollback_savepoint: true,
        score_original: 5,
        score_despues_update: 25,
        score_final: leadFinalData[0].score
      }
    });

  } catch (error) {

    // ==========================================
    // ROLLBACK GENERAL
    // ==========================================
    if (connection) {

      const sqlRollback = `
        ROLLBACK
      `;

      await connection.query(sqlRollback);

      console.log("ROLLBACK GENERAL ejecutado");

    }

    console.error("ERROR TRANSACCIÓN SAVEPOINT:", error);

    res.status(500).json({
      success: false,
      error: 'Error en transacción con SAVEPOINT',
      detalle: error.message
    });

  } finally {

    // ==========================================
    // LIBERAR CONEXIÓN
    // ==========================================
    if (connection) {

      connection.release();

      console.log("Conexión liberada");

    }

  }

});

// ==========================================
// VALIDACIÓN DE DUPLICADOS + ROLLBACK
// POST http://localhost:3000/api/LeadsMaestro/ValidarDuplicado
// ==========================================
router.post('/ValidarDuplicado', async (req, res) => {

  let connection;

  try {

    const {
      nombre,
      email,
      empresa,
      telefono
    } = req.body;

    // ==========================================
    // VALIDACIONES
    // ==========================================
    if (
      !nombre ||
      !email
    ) {
      return res.status(400).json({
        success: false,
        error: 'Nombre y email son requeridos'
      });
    }

    // ==========================================
    // OBTENER CONEXIÓN
    // ==========================================
    connection = await pool.getConnection();

    // ==========================================
    // START TRANSACTION
    // ==========================================
    const sqlStartTransaction = `
      START TRANSACTION
    `;

    await connection.query(sqlStartTransaction);

    console.log("TRANSACCIÓN iniciada");

    // ==========================================
    // VALIDAR EMAIL DUPLICADO
    // ==========================================
    const sqlValidarDuplicado = `
      SELECT *
      FROM leads
      WHERE email = ?
    `;

    const [leadDuplicado] = await connection.query(
      sqlValidarDuplicado,
      [email]
    );

    // ==========================================
    // SI EXISTE DUPLICADO
    // ==========================================
    if (leadDuplicado.length > 0) {

      console.log("Lead duplicado detectado");

      // ==========================================
      // ROLLBACK
      // ==========================================
      const sqlRollback = `
        ROLLBACK
      `;

      await connection.query(sqlRollback);

      console.log("ROLLBACK ejecutado por duplicado");

      return res.status(409).json({
        success: false,
        error: 'El email ya existe',
        duplicado: true,
        lead_existente: leadDuplicado[0]
      });

    }

    // ==========================================
    // INSERT LEAD
    // ==========================================
    const sqlInsertLead = `
      INSERT INTO leads
      (
        nombre,
        email,
        empresa,
        telefono,
        estado,
        score,
        fecha_creacion
      )
      VALUES (?, ?, ?, ?, ?, ?, NOW())
    `;

    const valuesLead = [
      nombre,
      email,
      empresa || null,
      telefono || null,
      'nuevo',
      5
    ];

    const [leadResult] = await connection.query(
      sqlInsertLead,
      valuesLead
    );

    console.log("Resultado INSERT LEAD:", leadResult);

    // ==========================================
    // OBTENER ID LEAD
    // ==========================================
    const lead_id = leadResult.insertId;

    // ==========================================
    // COMMIT
    // ==========================================
    const sqlCommit = `
      COMMIT
    `;

    await connection.query(sqlCommit);

    console.log("COMMIT ejecutado correctamente");

    // ==========================================
    // RESPUESTA EXITOSA
    // ==========================================
    res.status(201).json({
      success: true,
      message: 'Lead creado correctamente',
      duplicado: false,
      lead: {
        id: lead_id,
        nombre,
        email,
        empresa,
        telefono,
        estado: 'nuevo',
        score: 5
      }
    });

  } catch (error) {

    // ==========================================
    // ROLLBACK GENERAL
    // ==========================================
    if (connection) {

      const sqlRollback = `
        ROLLBACK
      `;

      await connection.query(sqlRollback);

      console.log("ROLLBACK GENERAL ejecutado");

    }

    console.error("ERROR VALIDACIÓN DUPLICADOS:", error);

    res.status(500).json({
      success: false,
      error: 'Error en validación de duplicados',
      detalle: error.message
    });

  } finally {

    // ==========================================
    // LIBERAR CONEXIÓN
    // ==========================================
    if (connection) {

      connection.release();

      console.log("Conexión liberada");

    }

  }

});

// ==========================================
// ACTUALIZAR SCORE + GENERAR NOTIFICACIÓN
// POST http://localhost:3000/api/LeadsMaestro/LeadScoreAlerta
// ==========================================
router.post('/LeadScoreAlerta', async (req, res) => {

  let connection;

  try {

    const {
      lead_id,
      nuevo_score
    } = req.body;

    // ==========================================
    // VALIDACIONES
    // ==========================================
    if (
      !lead_id ||
      nuevo_score === undefined
    ) {
      return res.status(400).json({
        success: false,
        error: 'Lead ID y nuevo score son requeridos'
      });
    }

    // ==========================================
    // OBTENER CONEXIÓN
    // ==========================================
    connection = await pool.getConnection();

    // ==========================================
    // START TRANSACTION
    // ==========================================
    const sqlStartTransaction = `
      START TRANSACTION
    `;

    await connection.query(sqlStartTransaction);

    console.log("TRANSACCIÓN iniciada");

    // ==========================================
    // ACTUALIZAR SCORE DEL LEAD
    // ==========================================
    const sqlUpdateLead = `
      UPDATE leads
      SET score = ?
      WHERE id = ?
    `;

    const [updateResult] = await connection.query(
      sqlUpdateLead,
      [
        nuevo_score,
        lead_id
      ]
    );

    // ==========================================
    // VALIDAR EXISTENCIA
    // ==========================================
    if (updateResult.affectedRows === 0) {

      const sqlRollback = `
        ROLLBACK
      `;

      await connection.query(sqlRollback);

      return res.status(404).json({
        success: false,
        error: 'Lead no encontrado'
      });

    }

    console.log("Resultado UPDATE SCORE:", updateResult);

    // ==========================================
    // INSERT NOTIFICACIÓN
    // ==========================================
    const mensajeNotificacion = `
      Lead superó score de 90 puntos
    `;

    const sqlInsertNotificacion = `
      INSERT INTO notificaciones
      (
        lead_id,
        mensaje,
        atendido,
        fecha
      )
      VALUES (?, ?, ?, NOW())
    `;

    const [notificacionResult] = await connection.query(
      sqlInsertNotificacion,
      [
        lead_id,
        mensajeNotificacion.trim(),
        false
      ]
    );

    console.log("Resultado INSERT NOTIFICACIÓN:", notificacionResult);

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

    console.log("COMMIT ejecutado correctamente");

    // ==========================================
    // RESPUESTA EXITOSA
    // ==========================================
    res.status(200).json({
      success: true,
      message: 'Score actualizado y notificación generada correctamente',
      lead: {
        id: lead_id,
        nuevo_score
      },
      notificacion: {
        id: notificacion_id,
        mensaje: mensajeNotificacion.trim(),
        atendido: false
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

      console.log("ROLLBACK ejecutado");

    }

    console.error("ERROR TRANSACCIÓN SCORE ALERTA:", error);

    res.status(500).json({
      success: false,
      error: 'Error al actualizar score y generar notificación',
      detalle: error.message
    });

  } finally {

    // ==========================================
    // LIBERAR CONEXIÓN
    // ==========================================
    if (connection) {

      connection.release();

      console.log("Conexión liberada");

    }

  }

});
// ==========================================
// CONSULTAR HISTORIAL DE SCORE POR LEAD
// GET http://localhost:3000/api/LeadsMaestro/HistorialScore/:lead_id
// ==========================================
router.get('/HistorialScore/:lead_id', async (req, res) => {

  let connection;

  try {

    const { lead_id } = req.params;

    // ==========================================
    // VALIDACIONES
    // ==========================================
    if (!lead_id) {
      return res.status(400).json({
        success: false,
        error: 'Lead ID es requerido'
      });
    }

    // ==========================================
    // OBTENER CONEXIÓN
    // ==========================================
    connection = await pool.getConnection();

    // ==========================================
    // START TRANSACTION
    // ==========================================
    const sqlStartTransaction = `
      START TRANSACTION
    `;

    await connection.query(sqlStartTransaction);

    console.log("TRANSACCIÓN iniciada");

    // ==========================================
    // CONSULTAR HISTORIAL SCORE
    // ==========================================
    const sqlHistorial = `
      SELECT
          l.nombre,
          s.puntos,
          s.motivo,
          s.fecha
      FROM leads l
      INNER JOIN score_historial s
          ON l.id = s.lead_id
      WHERE l.id = ?
      ORDER BY s.fecha DESC
    `;

    const [result] = await connection.query(
      sqlHistorial,
      [lead_id]
    );

    // ==========================================
    // VALIDAR EXISTENCIA
    // ==========================================
    if (result.length === 0) {

      const sqlRollback = `
        ROLLBACK
      `;

      await connection.query(sqlRollback);

      return res.status(404).json({
        success: false,
        error: 'No se encontró historial para este lead'
      });

    }

    console.log("Resultado HISTORIAL SCORE:", result);

    // ==========================================
    // COMMIT
    // ==========================================
    const sqlCommit = `
      COMMIT
    `;

    await connection.query(sqlCommit);

    console.log("COMMIT ejecutado correctamente");

    // ==========================================
    // RESPUESTA EXITOSA
    // ==========================================
    res.status(200).json({
      success: true,
      lead: {
        id: lead_id,
        nombre: result[0].nombre
      },
      historial_score: result.map(item => ({
        puntos: item.puntos,
        motivo: item.motivo,
        fecha: item.fecha
      }))
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

      console.log("ROLLBACK ejecutado");

    }

    console.error("ERROR CONSULTA HISTORIAL:", error);

    res.status(500).json({
      success: false,
      error: 'Error al consultar historial score',
      detalle: error.message
    });

  } finally {

    // ==========================================
    // LIBERAR CONEXIÓN
    // ==========================================
    if (connection) {

      connection.release();

      console.log("Conexión liberada");

    }

  }

});

module.exports = router;