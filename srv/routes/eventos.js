const express = require('express');
const router = express.Router();
const Connect = require('../Connection/SQLConnect');


// ==============================
// ✅ CREAR EVENTO + PARTICIPANTES (CON SAVEPOINT)
// ==============================
router.post('/eventos', async (req, res) => {
  const connection = await Connect();

  try {
    const { creador_id, titulo, descripcion, fecha_inicio, fecha_fin, participantes } = req.body;

    if (!creador_id || !titulo || !fecha_inicio || !fecha_fin) {
      return res.status(400).json({
        success: false,
        error: 'Faltan datos obligatorios'
      });
    }

    await connection.query('START TRANSACTION');

    // 🔎 Validar que el creador exista
    const [usuario] = await connection.query(
      `SELECT id FROM usuarios WHERE id = ?`,
      [creador_id]
    );

    if (usuario.length === 0) {
      await connection.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        error: 'El usuario creador no existe'
      });
    }

    // 🧩 Crear evento
    const [eventoResult] = await connection.query(`
      INSERT INTO eventos (creador_id, titulo, descripcion, fecha_inicio, fecha_fin)
      VALUES (?, ?, ?, ?, ?)
    `, [creador_id, titulo, descripcion, fecha_inicio, fecha_fin]);

    const evento_id = eventoResult.insertId;

    // 💾 Savepoint antes de participantes
    await connection.query('SAVEPOINT sp_participantes');

    // 👥 Insertar participantes
    if (participantes && participantes.length > 0) {
      for (const usuario_id of participantes) {

        // Validar usuario participante
        const [userExists] = await connection.query(
          `SELECT id FROM usuarios WHERE id = ?`,
          [usuario_id]
        );

        if (userExists.length === 0) {
          // 🔥 rollback parcial
          await connection.query('ROLLBACK TO sp_participantes');

          return res.status(400).json({
            success: false,
            error: `Usuario participante ${usuario_id} no existe`
          });
        }

        await connection.query(`
          INSERT INTO participantes_evento (evento_id, usuario_id, estado)
          VALUES (?, ?, 'pendiente')
        `, [evento_id, usuario_id]);
      }
    }

    await connection.query('COMMIT');

    res.status(201).json({
      success: true,
      message: 'Evento creado correctamente',
      evento_id
    });

  } catch (error) {
    await connection.query('ROLLBACK');
    console.error('Error en transacción evento:', error);

    res.status(500).json({
      success: false,
      error: 'Error al crear evento'
    });
  } finally {
    connection.release();
  }
});


// ==============================
// ✅ RESPONDER INVITACIÓN (TRANSACCIÓN)
// ==============================
router.put('/eventos/:id/responder', async (req, res) => {
  const connection = await Connect();

  try {
    const { id } = req.params;
    const { usuario_id, estado } = req.body;

    if (!usuario_id || !estado) {
      return res.status(400).json({
        success: false,
        error: 'Datos incompletos'
      });
    }

    await connection.query('START TRANSACTION');

    // Validar existencia
    const [registro] = await connection.query(`
      SELECT * FROM participantes_evento
      WHERE evento_id = ? AND usuario_id = ?
    `, [id, usuario_id]);

    if (registro.length === 0) {
      await connection.query('ROLLBACK');
      return res.status(404).json({
        success: false,
        error: 'Invitación no encontrada'
      });
    }

    await connection.query(`
      UPDATE participantes_evento
      SET estado = ?
      WHERE evento_id = ? AND usuario_id = ?
    `, [estado, id, usuario_id]);

    await connection.query('COMMIT');

    res.status(200).json({
      success: true,
      message: 'Respuesta registrada'
    });

  } catch (error) {
    await connection.query('ROLLBACK');
    console.error(error);

    res.status(500).json({
      success: false,
      error: 'Error al responder invitación'
    });
  } finally {
    connection.release();
  }
});


// ==============================
// ✅ ACTUALIZAR EVENTO (CON SAVEPOINT)
// ==============================
router.put('/eventos/:id', async (req, res) => {
  const connection = await Connect();

  try {
    const { id } = req.params;
    const { titulo, descripcion, fecha_inicio, fecha_fin } = req.body;

    await connection.query('START TRANSACTION');

    // Validar existencia
    const [evento] = await connection.query(
      `SELECT id FROM eventos WHERE id = ?`,
      [id]
    );

    if (evento.length === 0) {
      await connection.query('ROLLBACK');
      return res.status(404).json({
        success: false,
        error: 'Evento no existe'
      });
    }

    // Savepoint antes de update
    await connection.query('SAVEPOINT sp_update');

    await connection.query(`
      UPDATE eventos
      SET titulo = ?, descripcion = ?, fecha_inicio = ?, fecha_fin = ?
      WHERE id = ?
    `, [titulo, descripcion, fecha_inicio, fecha_fin, id]);

    await connection.query('COMMIT');

    res.status(200).json({
      success: true,
      message: 'Evento actualizado'
    });

  } catch (error) {
    await connection.query('ROLLBACK');
    console.error(error);

    res.status(500).json({
      success: false,
      error: 'Error al actualizar evento'
    });
  } finally {
    connection.release();
  }
});


// ==============================
// ✅ ELIMINAR EVENTO (TRANSACCIÓN)
// ==============================
router.delete('/eventos/:id', async (req, res) => {
  const connection = await Connect();

  try {
    const { id } = req.params;

    await connection.query('START TRANSACTION');

    // Validar existencia
    const [evento] = await connection.query(
      `SELECT id FROM eventos WHERE id = ?`,
      [id]
    );

    if (evento.length === 0) {
      await connection.query('ROLLBACK');
      return res.status(404).json({
        success: false,
        error: 'Evento no encontrado'
      });
    }

    await connection.query(
      `DELETE FROM eventos WHERE id = ?`,
      [id]
    );

    await connection.query('COMMIT');

    res.status(200).json({
      success: true,
      message: 'Evento eliminado'
    });

  } catch (error) {
    await connection.query('ROLLBACK');
    console.error(error);

    res.status(500).json({
      success: false,
      error: 'Error al eliminar evento'
    });
  } finally {
    connection.release();
  }
});

module.exports = router;