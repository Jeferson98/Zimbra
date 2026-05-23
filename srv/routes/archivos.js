const express = require('express');
const router = express.Router();
const Connect = require('../Connection/SQLConnect');


// ==============================
// ✅ SUBIR ARCHIVO
// ==============================
router.post('/archivos', async (req, res) => {
  const connection = await Connect();

  try {
    const { usuario_id, nombre, ruta } = req.body;

    if (!usuario_id || !nombre || !ruta) {
      return res.status(400).json({
        success: false,
        error: 'Datos incompletos'
      });
    }

    await connection.query('START TRANSACTION');

    // 🔎 Validar usuario
    const [usuario] = await connection.query(
      `SELECT id FROM usuarios WHERE id = ?`,
      [usuario_id]
    );

    if (usuario.length === 0) {
      await connection.query('ROLLBACK');
      return res.status(404).json({
        success: false,
        error: 'Usuario no existe'
      });
    }

    // 📁 Insertar archivo
    const [result] = await connection.query(`
      INSERT INTO archivos (usuario_id, nombre, ruta)
      VALUES (?, ?, ?)
    `, [usuario_id, nombre, ruta]);

    await connection.query('COMMIT');

    res.status(201).json({
      success: true,
      message: 'Archivo subido correctamente',
      archivo_id: result.insertId
    });

  } catch (error) {
    await connection.query('ROLLBACK');
    console.error('Error al subir archivo:', error);

    res.status(500).json({
      success: false,
      error: 'Error al subir archivo'
    });
  } finally {
    connection.release();
  }
});


// ==============================
// ✅ OBTENER ARCHIVOS
// ==============================
router.get('/archivos', async (req, res) => {
  try {
    const result = await Connect(`
      SELECT a.*, u.nombre AS usuario
      FROM archivos a
      JOIN usuarios u ON a.usuario_id = u.id
    `);

    res.status(200).json({
      success: true,
      archivos: result
    });

  } catch (error) {
    console.error('Error al obtener archivos:', error);

    res.status(500).json({
      success: false,
      error: 'Error al obtener archivos'
    });
  }
});


// ==============================
// ✅ OBTENER ARCHIVOS POR USUARIO
// ==============================
router.get('/archivos/usuario/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await Connect(
      `SELECT * FROM archivos WHERE usuario_id = ?`,
      [id]
    );

    res.status(200).json({
      success: true,
      archivos: result
    });

  } catch (error) {
    console.error('Error al obtener archivos del usuario:', error);

    res.status(500).json({
      success: false,
      error: 'Error al obtener archivos'
    });
  }
});


// ==============================
// ✅ ELIMINAR ARCHIVO
// ==============================
router.delete('/archivos/:id', async (req, res) => {
  const connection = await Connect();

  try {
    const { id } = req.params;

    await connection.query('START TRANSACTION');

    // 🔎 Validar existencia
    const [archivo] = await connection.query(
      `SELECT id FROM archivos WHERE id = ?`,
      [id]
    );

    if (archivo.length === 0) {
      await connection.query('ROLLBACK');
      return res.status(404).json({
        success: false,
        error: 'Archivo no existe'
      });
    }

    await connection.query(
      `DELETE FROM archivos WHERE id = ?`,
      [id]
    );

    await connection.query('COMMIT');

    res.status(200).json({
      success: true,
      message: 'Archivo eliminado correctamente'
    });

  } catch (error) {
    await connection.query('ROLLBACK');
    console.error('Error al eliminar archivo:', error);

    res.status(500).json({
      success: false,
      error: 'Error al eliminar archivo'
    });
  } finally {
    connection.release();
  }
});

module.exports = router;