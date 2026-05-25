const express = require('express');
const router = express.Router();
const pool = require('../Connection/SQLConnect');

// ==========================================
// CREAR ENVÍO FORMULARIO + TRANSACCIÓN
// POST http://localhost:3000/api/EnvioFormulariosMaestro/EnvioFormulario
// ==========================================
router.post('/EnvioFormulario', async (req, res) => {

  let connection;

  try {

    const {
      formulario_id,
      lead_id,
      visitante_id,
      datos
    } = req.body;

    // ==========================================
    // VALIDACIONES
    // ==========================================
    if (
      !formulario_id ||
      !datos
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
    // INSERT ENVÍO FORMULARIO
    // ==========================================
    const sqlEnvioFormulario = `
      INSERT INTO envio_formularios
      (
        formulario_id,
        lead_id,
        visitante_id,
        datos,
        fecha_envio
      )
      VALUES (?, ?, ?, ?, NOW())
    `;

    const valuesEnvioFormulario = [
      formulario_id,
      lead_id || null,
      visitante_id || null,
      JSON.stringify(datos)
    ];

    const [envioResult] = await connection.query(
      sqlEnvioFormulario,
      valuesEnvioFormulario
    );

    console.log("Resultado ENVÍO FORMULARIO:", envioResult);

    // ==========================================
    // OBTENER ID ENVÍO
    // ==========================================
    const envio_formulario_id = envioResult.insertId;

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
      message: 'Formulario enviado correctamente',
      envio_formulario: {
        id: envio_formulario_id,
        formulario_id,
        lead_id,
        visitante_id,
        datos
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
      error: 'Error al registrar envío de formulario'
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
// CONSULTAR TODOS LOS ENVÍOS FORMULARIOS
// GET http://localhost:3000/api/EnvioFormulariosMaestro/EnvioFormulario
// ==========================================
router.get('/EnvioFormulario', async (req, res) => {

  try {

    const sql = `
      SELECT
        ef.*,
        f.nombre AS formulario_nombre,
        l.nombre AS lead_nombre
      FROM envio_formularios ef
      INNER JOIN formularios f
        ON ef.formulario_id = f.id
      LEFT JOIN leads l
        ON ef.lead_id = l.id
      ORDER BY ef.fecha_envio DESC
    `;

    const [result] = await pool.query(sql);

    res.status(200).json({
      success: true,
      envios_formularios: result
    });

  } catch (error) {

    console.error("Error al obtener envíos formularios:", error);

    res.status(500).json({
      success: false,
      error: 'Error al obtener envíos formularios'
    });

  }

});

// ==========================================
// CONSULTAR ENVÍO FORMULARIO POR ID
// GET http://localhost:3000/api/EnvioFormulariosMaestro/EnvioFormulario/:id
// ==========================================
router.get('/EnvioFormulario/:id', async (req, res) => {

  try {

    const { id } = req.params;

    const sql = `
      SELECT
        ef.*,
        f.nombre AS formulario_nombre,
        l.nombre AS lead_nombre
      FROM envio_formularios ef
      INNER JOIN formularios f
        ON ef.formulario_id = f.id
      LEFT JOIN leads l
        ON ef.lead_id = l.id
      WHERE ef.id = ?
    `;

    const [result] = await pool.query(
      sql,
      [id]
    );

    if (result.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Envío formulario no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      envio_formulario: result[0]
    });

  } catch (error) {

    console.error("Error al obtener envío formulario:", error);

    res.status(500).json({
      success: false,
      error: 'Error al obtener envío formulario'
    });

  }

});

// ==========================================
// ACTUALIZAR ENVÍO FORMULARIO
// PUT http://localhost:3000/api/EnvioFormulariosMaestro/EnvioFormulario/:id
// ==========================================
router.put('/EnvioFormulario/:id', async (req, res) => {

  try {

    const { id } = req.params;

    const {
      formulario_id,
      lead_id,
      visitante_id,
      datos
    } = req.body;

    // ==========================================
    // VALIDACIONES
    // ==========================================
    if (
      !formulario_id ||
      !datos
    ) {
      return res.status(400).json({
        success: false,
        error: 'Faltan datos requeridos'
      });
    }

    // ==========================================
    // UPDATE ENVÍO FORMULARIO
    // ==========================================
    const sql = `
      UPDATE envio_formularios
      SET
        formulario_id = ?,
        lead_id = ?,
        visitante_id = ?,
        datos = ?
      WHERE id = ?
    `;

    const values = [
      formulario_id,
      lead_id || null,
      visitante_id || null,
      JSON.stringify(datos),
      id
    ];

    const [result] = await pool.query(
      sql,
      values
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: 'Envío formulario no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Envío formulario actualizado exitosamente',
      envio_formulario: {
        id,
        formulario_id,
        lead_id,
        visitante_id,
        datos
      }
    });

  } catch (error) {

    console.error("Error al actualizar envío formulario:", error);

    res.status(500).json({
      success: false,
      error: 'Error al actualizar envío formulario'
    });

  }

});

// ==========================================
// ELIMINAR ENVÍO FORMULARIO
// DELETE http://localhost:3000/api/EnvioFormulariosMaestro/EnvioFormulario/:id
// ==========================================
router.delete('/EnvioFormulario/:id', async (req, res) => {

  try {

    const { id } = req.params;

    const sql = `
      DELETE FROM envio_formularios
      WHERE id = ?
    `;

    const [result] = await pool.query(
      sql,
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: 'Envío formulario no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Envío formulario eliminado exitosamente'
    });

  } catch (error) {

    console.error("Error al eliminar envío formulario:", error);

    res.status(500).json({
      success: false,
      error: 'Error al eliminar envío formulario'
    });

  }

});

module.exports = router;