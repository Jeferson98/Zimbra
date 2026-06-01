const express = require('express');
const router = express.Router();
const Connect = require('../Connection/SQLConnect');
const mysql = require('mysql2/promise');


// ==============================
// ✅ CREAR EVENTO + PARTICIPANTES (CON SAVEPOINT)
// ==============================

router.post('/eventos', async (req, res) => {
  let connection;

  try {
    // Crear conexión directa (sin usar Connect)
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'zimbra',
      port: 3306,
      multipleStatements: true
    });

    const { creador_id, titulo, descripcion, fecha_inicio, fecha_fin, participantes, leads } = req.body;

    if (!creador_id || !titulo || !descripcion || !fecha_inicio || !fecha_fin || !Array.isArray(participantes)) {
      return res.status(400).json({ success: false, error: 'Faltan datos obligatorios' });
    }

    // Construir SQL completo en una sola cadena
    let SQL = `
      START TRANSACTION;

      INSERT INTO eventos (creador_id, titulo, descripcion, fecha_inicio, fecha_fin)
      VALUES (${connection.escape(creador_id)}, ${connection.escape(titulo)}, ${connection.escape(descripcion)}, ${connection.escape(fecha_inicio)}, ${connection.escape(fecha_fin)});

      SET @evento_id = LAST_INSERT_ID();

      INSERT INTO participantes_evento (evento_id, usuario_id, estado) VALUES
      ${participantes.map(u => `(@evento_id, ${connection.escape(u)}, 'pendiente')`).join(", ")};

      -- Aumentar score al lead creador
      UPDATE leads SET score = score + 10 WHERE id = ${connection.escape(creador_id)};

      INSERT INTO score_historial (lead_id, puntos, motivo) VALUES
      (${connection.escape(creador_id)}, 10, 'Participación en evento');

      COMMIT;
    `;


    // Ejecutar toda la transacción en una sola llamada
    const [results] = await connection.query(SQL);

    res.status(201).json({
      success: true,
      message: 'Evento creado correctamente con transacción única'
    });

  } catch (error) {
    if (connection) await connection.query('ROLLBACK');
    console.error('Error en transacción evento:', error);
    res.status(500).json({ success: false, error: 'Error al crear evento' });
  } finally {
    if (connection) await connection.end(); // cerrar conexión
  }
});


router.get('/eventos', async (req, res) => {
  let connection;
  try {
    // Crear conexión directa
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'zimbra',
      port: 3306
    });

    // Consultar todos los eventos
    const [rows] = await connection.query('SELECT * FROM eventos');

    res.json({
      success: true,
      data: rows
    });

  } catch (error) {
    console.error('Error obteniendo eventos:', error);
    res.status(500).json({ success: false, error: 'Error al obtener eventos' });
  } finally {
    if (connection) await connection.end();
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