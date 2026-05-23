const express = require('express');
const router = express.Router();
const Connect = require('../Connection/SQLConnect');


// ==============================
// ✅ ENVIAR CORREO (TRANSACCIÓN COMPLETA + SAVEPOINT)
// ==============================
router.post('/correos', async (req, res) => {
  const connection = await Connect();

  try {
    const { remitente_id, asunto, cuerpo, destinatarios } = req.body;

    if (!remitente_id || !asunto || !cuerpo || !destinatarios || destinatarios.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Datos incompletos'
      });
    }

    await connection.query('START TRANSACTION');

    // 🔎 Validar remitente
    const [remitente] = await connection.query(
      `SELECT id FROM usuarios WHERE id = ?`,
      [remitente_id]
    );

    if (remitente.length === 0) {
      await connection.query('ROLLBACK');
      return res.status(404).json({
        success: false,
        error: 'Remitente no existe'
      });
    }

    // 🧩 Crear mensaje
    const [mensajeResult] = await connection.query(`
      INSERT INTO detalle_mensaje (remitente_id, asunto, cuerpo)
      VALUES (?, ?, ?)
    `, [remitente_id, asunto, cuerpo]);

    const detalle_mensaje_id = mensajeResult.insertId;

    // 💾 Savepoint antes de destinatarios
    await connection.query('SAVEPOINT sp_destinatarios');

    // 👥 Insertar destinatarios
    for (const destinatario_id of destinatarios) {

      // Validar destinatario
      const [destinatario] = await connection.query(
        `SELECT id FROM usuarios WHERE id = ?`,
        [destinatario_id]
      );

      if (destinatario.length === 0) {
        await connection.query('ROLLBACK TO sp_destinatarios');

        return res.status(400).json({
          success: false,
          error: `Destinatario ${destinatario_id} no existe`
        });
      }

      await connection.query(`
        INSERT INTO correos_enviados (remitente_id, destinatario_id, detalle_mensaje_id)
        VALUES (?, ?, ?)
      `, [remitente_id, destinatario_id, detalle_mensaje_id]);
    }

    await connection.query('COMMIT');

    res.status(201).json({
      success: true,
      message: 'Correo enviado correctamente',
      detalle_mensaje_id
    });

  } catch (error) {
    await connection.query('ROLLBACK');
    console.error('Error al enviar correo:', error);

    res.status(500).json({
      success: false,
      error: 'Error al enviar correo'
    });
  } finally {
    connection.release();
  }
});


// ==============================
// ✅ OBTENER BANDEJA DE ENTRADA
// ==============================
router.get('/correos/recibidos/:usuario_id', async (req, res) => {
  try {
    const { usuario_id } = req.params;

    const result = await Connect(`
      SELECT dm.id, dm.asunto, dm.cuerpo, dm.fecha_envio, u.nombre AS remitente
      FROM correos_enviados ce
      JOIN detalle_mensaje dm ON ce.detalle_mensaje_id = dm.id
      JOIN usuarios u ON dm.remitente_id = u.id
      WHERE ce.destinatario_id = ?
      ORDER BY dm.fecha_envio DESC
    `, [usuario_id]);

    res.status(200).json({
      success: true,
      correos: result
    });

  } catch (error) {
    console.error('Error al obtener bandeja:', error);

    res.status(500).json({
      success: false,
      error: 'Error al obtener correos'
    });
  }
});


// ==============================
// ✅ OBTENER ENVIADOS
// ==============================
router.get('/correos/enviados/:usuario_id', async (req, res) => {
  try {
    const { usuario_id } = req.params;

    const result = await Connect(`
      SELECT dm.id, dm.asunto, dm.cuerpo, dm.fecha_envio
      FROM detalle_mensaje dm
      WHERE dm.remitente_id = ?
      ORDER BY dm.fecha_envio DESC
    `, [usuario_id]);

    res.status(200).json({
      success: true,
      correos: result
    });

  } catch (error) {
    console.error('Error al obtener enviados:', error);

    res.status(500).json({
      success: false,
      error: 'Error al obtener correos'
    });
  }
});


// ==============================
// ✅ ELIMINAR CORREO (LÓGICO POR USUARIO)
// ==============================
router.delete('/correos/:detalle_id/:usuario_id', async (req, res) => {
  const connection = await Connect();

  try {
    const { detalle_id, usuario_id } = req.params;

    await connection.query('START TRANSACTION');

    // Validar existencia
    const [correo] = await connection.query(`
      SELECT * FROM correos_enviados
      WHERE detalle_mensaje_id = ? AND destinatario_id = ?
    `, [detalle_id, usuario_id]);

    if (correo.length === 0) {
      await connection.query('ROLLBACK');
      return res.status(404).json({
        success: false,
        error: 'Correo no encontrado para este usuario'
      });
    }

    await connection.query(`
      DELETE FROM correos_enviados
      WHERE detalle_mensaje_id = ? AND destinatario_id = ?
    `, [detalle_id, usuario_id]);

    await connection.query('COMMIT');

    res.status(200).json({
      success: true,
      message: 'Correo eliminado de la bandeja'
    });

  } catch (error) {
    await connection.query('ROLLBACK');
    console.error('Error al eliminar correo:', error);

    res.status(500).json({
      success: false,
      error: 'Error al eliminar correo'
    });
  } finally {
    connection.release();
  }
});

module.exports = router;