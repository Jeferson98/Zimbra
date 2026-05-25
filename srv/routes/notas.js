const express = require('express');
const router = express.Router();
const pool = require('../Connection/SQLConnect');

// ==========================================
// CREAR NOTA + TRANSACCIÓN
// POST http://localhost:3000/api/NotasMaestro/Nota
// ==========================================
router.post('/Nota', async (req, res) => {

  let connection;

  try {

    const {
      lead_id,
      usuario_id,
      contenido
    } = req.body;

    // ==========================================
    // VALIDACIONES
    // ==========================================
    if (
      !lead_id ||
      !usuario_id ||
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
    // INSERT NOTA
    // ==========================================
    const sqlNota = `
      INSERT INTO notas
      (
        lead_id,
        usuario_id,
        contenido,
        fecha
      )
      VALUES (?, ?, ?, NOW())
    `;

    const valuesNota = [
      lead_id,
      usuario_id,
      contenido
    ];

    const [notaResult] = await connection.query(
      sqlNota,
      valuesNota
    );

    console.log("Resultado NOTA:", notaResult);

    // ==========================================
    // OBTENER ID NOTA
    // ==========================================
    const nota_id = notaResult.insertId;

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
      message: 'Nota registrada correctamente',
      nota: {
        id: nota_id,
        lead_id,
        usuario_id,
        contenido
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
      error: 'Error al registrar nota'
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
// CONSULTAR TODAS LAS NOTAS
// GET http://localhost:3000/api/NotasMaestro/Nota
// ==========================================
router.get('/Nota', async (req, res) => {

  try {

    const sql = `
      SELECT
        n.*,
        l.nombre AS lead_nombre,
        u.nombre AS usuario_nombre
      FROM notas n
      INNER JOIN leads l
        ON n.lead_id = l.id
      INNER JOIN usuarios u
        ON n.usuario_id = u.id
      ORDER BY n.fecha DESC
    `;

    const [result] = await pool.query(sql);

    res.status(200).json({
      success: true,
      notas: result
    });

  } catch (error) {

    console.error("Error al obtener notas:", error);

    res.status(500).json({
      success: false,
      error: 'Error al obtener notas'
    });

  }

});

// ==========================================
// CONSULTAR NOTA POR ID
// GET http://localhost:3000/api/NotasMaestro/Nota/:id
// ==========================================
router.get('/Nota/:id', async (req, res) => {

  try {

    const { id } = req.params;

    const sql = `
      SELECT
        n.*,
        l.nombre AS lead_nombre,
        u.nombre AS usuario_nombre
      FROM notas n
      INNER JOIN leads l
        ON n.lead_id = l.id
      INNER JOIN usuarios u
        ON n.usuario_id = u.id
      WHERE n.id = ?
    `;

    const [result] = await pool.query(
      sql,
      [id]
    );

    if (result.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Nota no encontrada'
      });
    }

    res.status(200).json({
      success: true,
      nota: result[0]
    });

  } catch (error) {

    console.error("Error al obtener nota:", error);

    res.status(500).json({
      success: false,
      error: 'Error al obtener nota'
    });

  }

});

// ==========================================
// ACTUALIZAR NOTA + TRANSACCIÓN
// PUT http://localhost:3000/api/NotasMaestro/Nota/:id
// ==========================================
router.put('/Nota/:id', async (req, res) => {

  let connection;

  try {

    const { id } = req.params;

    const {
      contenido
    } = req.body;

    // ==========================================
    // VALIDACIONES
    // ==========================================
    if (!contenido) {
      return res.status(400).json({
        success: false,
        error: 'El contenido es requerido'
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
    // UPDATE NOTA
    // ==========================================
    const sqlUpdateNota = `
      UPDATE notas
      SET contenido = ?
      WHERE id = ?
    `;

    const [result] = await connection.query(
      sqlUpdateNota,
      [
        contenido,
        id
      ]
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
        error: 'Nota no encontrada'
      });

    }

    console.log("Resultado UPDATE NOTA:", result);

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
      message: 'Nota actualizada correctamente',
      nota: {
        id,
        contenido
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
      error: 'Error al actualizar nota'
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
// ELIMINAR NOTA + TRANSACCIÓN
// DELETE http://localhost:3000/api/NotasMaestro/Nota/:id
// ==========================================
router.delete('/Nota/:id', async (req, res) => {

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
    // DELETE NOTA
    // ==========================================
    const sqlDeleteNota = `
      DELETE FROM notas
      WHERE id = ?
    `;

    const [result] = await connection.query(
      sqlDeleteNota,
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
        error: 'Nota no encontrada'
      });

    }

    console.log("Resultado DELETE NOTA:", result);

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
      message: 'Nota eliminada correctamente'
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
      error: 'Error al eliminar nota'
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