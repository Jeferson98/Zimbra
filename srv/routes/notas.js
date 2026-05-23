const express = require('express');
const router = express.Router();
const Connect = require('../Connection/SQLConnect');

// ==========================================
// CREAR NOTA
// POST http://localhost:3000/api/NotasMaestro/Nota
// ==========================================
router.post('/Nota', async (req, res) => {
  try {

    const {
      lead_id,
      usuario_id,
      contenido
    } = req.body;

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

    const sql = `
      INSERT INTO notas
      (
        lead_id,
        usuario_id,
        contenido
      )
      VALUES (?, ?, ?)
    `;

    const values = [
      lead_id,
      usuario_id,
      contenido
    ];

    const result = await Connect(sql, values);

    console.log("Resultado INSERT:", result);

    res.status(201).json({
      success: true,
      message: 'Nota creada exitosamente',
      nota: {
        id: result.insertId || result[0]?.insertId || null,
        lead_id,
        usuario_id,
        contenido
      }
    });

  } catch (error) {

    console.error("Error al crear nota:", error);

    res.status(500).json({
      success: false,
      error: 'Error al crear nota'
    });

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
    `;

    const result = await Connect(sql, []);

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

    const result = await Connect(sql, [id]);

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
// ACTUALIZAR NOTA
// PUT http://localhost:3000/api/NotasMaestro/Nota/:id
// ==========================================
router.put('/Nota/:id', async (req, res) => {
  try {

    const { id } = req.params;

    const {
      lead_id,
      usuario_id,
      contenido
    } = req.body;

    if (
      !id ||
      !lead_id ||
      !usuario_id ||
      !contenido
    ) {
      return res.status(400).json({
        success: false,
        error: 'Faltan datos requeridos'
      });
    }

    const sql = `
      UPDATE notas
      SET
        lead_id = ?,
        usuario_id = ?,
        contenido = ?
      WHERE id = ?
    `;

    const values = [
      lead_id,
      usuario_id,
      contenido,
      id
    ];

    const result = await Connect(sql, values);

    console.log("Resultado UPDATE:", result);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: 'Nota no encontrada'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Nota actualizada exitosamente',
      nota: {
        id,
        lead_id,
        usuario_id,
        contenido
      }
    });

  } catch (error) {

    console.error("Error al actualizar nota:", error);

    res.status(500).json({
      success: false,
      error: 'Error al actualizar nota'
    });

  }
});

// ==========================================
// ELIMINAR NOTA
// DELETE http://localhost:3000/api/NotasMaestro/Nota/:id
// ==========================================
router.delete('/Nota/:id', async (req, res) => {
  try {

    const { id } = req.params;

    const sql = `DELETE FROM notas WHERE id = ?`;

    const result = await Connect(sql, [id]);

    console.log("Resultado DELETE:", result);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: 'Nota no encontrada'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Nota eliminada exitosamente'
    });

  } catch (error) {

    console.error("Error al eliminar nota:", error);

    res.status(500).json({
      success: false,
      error: 'Error al eliminar nota'
    });

  }
});

module.exports = router;