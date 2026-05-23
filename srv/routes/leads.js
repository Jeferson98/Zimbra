const express = require('express');
const router = express.Router();
const Connect = require('../Connection/SQLConnect');

// ==========================================
// CREAR LEAD
// POST http://localhost:3000/api/LeadsMaestro/Lead
// ==========================================
router.post('/Lead', async (req, res) => {
  try {

    const {
      nombre,
      email,
      empresa,
      telefono,
      estado,
      score
    } = req.body;

    if (!nombre || !email || !empresa || !telefono) {
      return res.status(400).json({
        success: false,
        error: 'Faltan datos requeridos'
      });
    }

    const sql = `
      INSERT INTO leads
      (
        nombre,
        email,
        empresa,
        telefono,
        estado,
        score
      )
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    const values = [
      nombre,
      email,
      empresa,
      telefono,
      estado || 'nuevo',
      score || 0
    ];

    const result = await Connect(sql, values);

    console.log("Resultado INSERT:", result);

    res.status(201).json({
      success: true,
      message: 'Lead creado exitosamente',
      lead: {
        id: result.insertId || result[0]?.insertId || null,
        nombre,
        email,
        empresa,
        telefono,
        estado: estado || 'nuevo',
        score: score || 0
      }
    });

  } catch (error) {

    console.error("Error al crear lead:", error);

    res.status(500).json({
      success: false,
      error: 'Error al crear lead'
    });

  }
});

// ==========================================
// CONSULTAR TODOS LOS LEADS
// GET http://localhost:3000/api/LeadsMaestro/Lead
// ==========================================
router.get('/Lead', async (req, res) => {
  try {

    const sql = `SELECT * FROM leads`;

    const result = await Connect(sql, []);

    res.status(200).json({
      success: true,
      leads: result
    });

  } catch (error) {

    console.error("Error al obtener leads:", error);

    res.status(500).json({
      success: false,
      error: 'Error al obtener leads'
    });

  }
});

// ==========================================
// CONSULTAR LEAD POR ID
// GET http://localhost:3000/api/LeadsMaestro/Lead/:id
// ==========================================
router.get('/Lead/:id', async (req, res) => {
  try {

    const { id } = req.params;

    const sql = `SELECT * FROM leads WHERE id = ?`;

    const result = await Connect(sql, [id]);

    if (result.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Lead no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      lead: result[0]
    });

  } catch (error) {

    console.error("Error al obtener lead:", error);

    res.status(500).json({
      success: false,
      error: 'Error al obtener lead'
    });

  }
});

// ==========================================
// ACTUALIZAR LEAD
// PUT http://localhost:3000/api/LeadsMaestro/Lead/:id
// ==========================================
router.put('/Lead/:id', async (req, res) => {
  try {

    const { id } = req.params;

    const {
      nombre,
      email,
      empresa,
      telefono,
      estado,
      score
    } = req.body;

    if (
      !id ||
      !nombre ||
      !email ||
      !empresa ||
      !telefono ||
      !estado ||
      score === undefined
    ) {
      return res.status(400).json({
        success: false,
        error: 'Faltan datos requeridos'
      });
    }

    const sql = `
      UPDATE leads
      SET
        nombre = ?,
        email = ?,
        empresa = ?,
        telefono = ?,
        estado = ?,
        score = ?
      WHERE id = ?
    `;

    const values = [
      nombre,
      email,
      empresa,
      telefono,
      estado,
      score,
      id
    ];

    const result = await Connect(sql, values);

    console.log("Resultado UPDATE:", result);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: 'Lead no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Lead actualizado exitosamente',
      lead: {
        id,
        nombre,
        email,
        empresa,
        telefono,
        estado,
        score
      }
    });

  } catch (error) {

    console.error("Error al actualizar lead:", error);

    res.status(500).json({
      success: false,
      error: 'Error al actualizar lead'
    });

  }
});

// ==========================================
// ELIMINAR LEAD
// DELETE http://localhost:3000/api/LeadsMaestro/Lead/:id
// ==========================================
router.delete('/Lead/:id', async (req, res) => {
  try {

    const { id } = req.params;

    const sql = `DELETE FROM leads WHERE id = ?`;

    const result = await Connect(sql, [id]);

    console.log("Resultado DELETE:", result);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: 'Lead no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Lead eliminado exitosamente'
    });

  } catch (error) {

    console.error("Error al eliminar lead:", error);

    res.status(500).json({
      success: false,
      error: 'Error al eliminar lead'
    });

  }
});

module.exports = router;