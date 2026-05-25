const express = require('express');
const router = express.Router();
const pool = require('../Connection/SQLConnect');

// ==========================================
// CREAR FORMULARIO + TRANSACCIÓN
// POST http://localhost:3000/api/FormulariosMaestro/Formulario
// ==========================================
router.post('/Formulario', async (req, res) => {

  let connection;

  try {

    const {
      nombre,
      descripcion
    } = req.body;

    // ==========================================
    // VALIDACIONES
    // ==========================================
    if (!nombre) {
      return res.status(400).json({
        success: false,
        error: 'El nombre del formulario es requerido'
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
    // INSERT FORMULARIO
    // ==========================================
    const sqlFormulario = `
      INSERT INTO formularios
      (
        nombre,
        descripcion,
        fecha_creacion
      )
      VALUES (?, ?, NOW())
    `;

    const valuesFormulario = [
      nombre,
      descripcion || null
    ];

    const [formularioResult] = await connection.query(
      sqlFormulario,
      valuesFormulario
    );

    console.log("Resultado FORMULARIO:", formularioResult);

    // ==========================================
    // OBTENER ID FORMULARIO
    // ==========================================
    const formulario_id = formularioResult.insertId;

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
      message: 'Formulario creado correctamente',
      formulario: {
        id: formulario_id,
        nombre,
        descripcion
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
      error: 'Error al crear formulario'
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
// CONSULTAR TODOS LOS FORMULARIOS
// GET http://localhost:3000/api/FormulariosMaestro/Formulario
// ==========================================
router.get('/Formulario', async (req, res) => {

  try {

    const sql = `
      SELECT *
      FROM formularios
      ORDER BY fecha_creacion DESC
    `;

    const [result] = await pool.query(sql);

    res.status(200).json({
      success: true,
      formularios: result
    });

  } catch (error) {

    console.error("Error al obtener formularios:", error);

    res.status(500).json({
      success: false,
      error: 'Error al obtener formularios'
    });

  }

});

// ==========================================
// CONSULTAR FORMULARIO POR ID
// GET http://localhost:3000/api/FormulariosMaestro/Formulario/:id
// ==========================================
router.get('/Formulario/:id', async (req, res) => {

  try {

    const { id } = req.params;

    const sql = `
      SELECT *
      FROM formularios
      WHERE id = ?
    `;

    const [result] = await pool.query(
      sql,
      [id]
    );

    if (result.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Formulario no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      formulario: result[0]
    });

  } catch (error) {

    console.error("Error al obtener formulario:", error);

    res.status(500).json({
      success: false,
      error: 'Error al obtener formulario'
    });

  }

});

// ==========================================
// ACTUALIZAR FORMULARIO
// PUT http://localhost:3000/api/FormulariosMaestro/Formulario/:id
// ==========================================
router.put('/Formulario/:id', async (req, res) => {

  try {

    const { id } = req.params;

    const {
      nombre,
      descripcion
    } = req.body;

    // ==========================================
    // VALIDACIONES
    // ==========================================
    if (!nombre) {
      return res.status(400).json({
        success: false,
        error: 'El nombre del formulario es requerido'
      });
    }

    // ==========================================
    // UPDATE FORMULARIO
    // ==========================================
    const sql = `
      UPDATE formularios
      SET
        nombre = ?,
        descripcion = ?
      WHERE id = ?
    `;

    const values = [
      nombre,
      descripcion || null,
      id
    ];

    const [result] = await pool.query(
      sql,
      values
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: 'Formulario no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Formulario actualizado exitosamente',
      formulario: {
        id,
        nombre,
        descripcion
      }
    });

  } catch (error) {

    console.error("Error al actualizar formulario:", error);

    res.status(500).json({
      success: false,
      error: 'Error al actualizar formulario'
    });

  }

});

// ==========================================
// ELIMINAR FORMULARIO
// DELETE http://localhost:3000/api/FormulariosMaestro/Formulario/:id
// ==========================================
router.delete('/Formulario/:id', async (req, res) => {

  try {

    const { id } = req.params;

    const sql = `
      DELETE FROM formularios
      WHERE id = ?
    `;

    const [result] = await pool.query(
      sql,
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: 'Formulario no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Formulario eliminado exitosamente'
    });

  } catch (error) {

    console.error("Error al eliminar formulario:", error);

    res.status(500).json({
      success: false,
      error: 'Error al eliminar formulario'
    });

  }

});

module.exports = router;