const express = require('express');
const router = express.Router();
const pool = require('../Connection/SQLConnect');

// ==========================================
// CREAR DEMO + TRANSACCIÓN
// POST http://localhost:3000/api/DemoMaestro/Demo
// ==========================================
router.post('/Demo', async (req, res) => {

  let connection;

  try {

    const {
      lead_id,
      fecha_inicio,
      fecha_fin,
      estado
    } = req.body;

    // ==========================================
    // VALIDACIONES
    // ==========================================
    if (
      !lead_id ||
      !fecha_inicio ||
      !fecha_fin
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
    // START TRANSACTION
    // ==========================================
    const sqlStartTransaction = `
      START TRANSACTION
    `;

    await connection.query(sqlStartTransaction);

    console.log("TRANSACCIÓN iniciada");

    // ==========================================
    // INSERT DEMO
    // ==========================================
    const sqlInsertDemo = `
      INSERT INTO demo
      (
        lead_id,
        fecha_inicio,
        fecha_fin,
        estado
      )
      VALUES (?, ?, ?, ?)
    `;

    const valuesDemo = [
      lead_id,
      fecha_inicio,
      fecha_fin,
      estado || 'activa'
    ];

    const [demoResult] = await connection.query(
      sqlInsertDemo,
      valuesDemo
    );

    console.log("Resultado INSERT DEMO:", demoResult);

    // ==========================================
    // OBTENER ID DEMO
    // ==========================================
    const demo_id = demoResult.insertId;

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
      message: 'Demo creada correctamente',
      demo: {
        id: demo_id,
        lead_id,
        fecha_inicio,
        fecha_fin,
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

      console.log("ROLLBACK ejecutado");

    }

    console.error("ERROR TRANSACCIÓN DEMO:", error);

    res.status(500).json({
      success: false,
      error: 'Error al crear demo',
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
// CONSULTAR TODAS LAS DEMOS
// GET http://localhost:3000/api/DemoMaestro/Demo
// ==========================================
router.get('/Demo', async (req, res) => {

  try {

    const sql = `
      SELECT
        d.*,
        l.nombre AS lead_nombre,
        l.email AS lead_email
      FROM demo d
      INNER JOIN leads l
        ON d.lead_id = l.id
      ORDER BY d.fecha_inicio DESC
    `;

    const [result] = await pool.query(sql);

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
        l.nombre AS lead_nombre,
        l.email AS lead_email
      FROM demo d
      INNER JOIN leads l
        ON d.lead_id = l.id
      WHERE d.id = ?
    `;

    const [result] = await pool.query(
      sql,
      [id]
    );

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

    // ==========================================
    // VALIDACIONES
    // ==========================================
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

    // ==========================================
    // UPDATE DEMO
    // ==========================================
    const sqlUpdateDemo = `
      UPDATE demo
      SET
        lead_id = ?,
        fecha_inicio = ?,
        fecha_fin = ?,
        estado = ?
      WHERE id = ?
    `;

    const valuesDemo = [
      lead_id,
      fecha_inicio,
      fecha_fin,
      estado,
      id
    ];

    const [result] = await pool.query(
      sqlUpdateDemo,
      valuesDemo
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: 'Demo no encontrada'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Demo actualizada correctamente',
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
// ELIMINAR DEMO + TRANSACCIÓN
// DELETE http://localhost:3000/api/DemoMaestro/Demo/:id
// ==========================================
router.delete('/Demo/:id', async (req, res) => {

  let connection;

  try {

    const { id } = req.params;

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
    // DELETE DEMO
    // ==========================================
    const sqlDeleteDemo = `
      DELETE FROM demo
      WHERE id = ?
    `;

    const [result] = await connection.query(
      sqlDeleteDemo,
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
        error: 'Demo no encontrada'
      });

    }

    console.log("Resultado DELETE DEMO:", result);

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
      message: 'Demo eliminada correctamente'
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

    console.error("ERROR DELETE DEMO:", error);

    res.status(500).json({
      success: false,
      error: 'Error al eliminar demo',
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