const express = require('express');
const router = express.Router();
const Connect = require('../Connection/SQLConnect');

// ==========================================
// CREAR EMAIL ENVIADO
// POST http://localhost:3000/api/EmailsEnviadosMaestro/EmailEnviado
// ==========================================
router.post('/EmailEnviado', async (req, res) => {
  try {

    const {
      lead_id,
      campaña_id,
      asunto,
      contenido,
      abierto,
      clic
    } = req.body;

    if (
      !lead_id ||
      !campaña_id ||
      !asunto ||
      !contenido
    ) {
      return res.status(400).json({
        success: false,
        error: 'Faltan datos requeridos'
      });
    }

    const sql = `
      INSERT INTO emails_enviados
      (
        lead_id,
        campaña_id,
        asunto,
        contenido,
        abierto,
        clic
      )
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    const values = [
      lead_id,
      campaña_id,
      asunto,
      contenido,
      abierto ?? false,
      clic ?? false
    ];

    const result = await Connect(sql, values);

    console.log("Resultado INSERT:", result);

    res.status(201).json({
      success: true,
      message: 'Email enviado creado exitosamente',
      email_enviado: {
        id: result.insertId || result[0]?.insertId || null,
        lead_id,
        campaña_id,
        asunto,
        contenido,
        abierto: abierto ?? false,
        clic: clic ?? false
      }
    });

  } catch (error) {

    console.error("Error al crear email enviado:", error);

    res.status(500).json({
      success: false,
      error: 'Error al crear email enviado'
    });

  }
});

// ==========================================
// CONSULTAR TODOS LOS EMAILS ENVIADOS
// GET http://localhost:3000/api/EmailsEnviadosMaestro/EmailEnviado
// ==========================================
router.get('/EmailEnviado', async (req, res) => {
  try {

    const sql = `
      SELECT 
        ee.*,
        l.nombre AS lead_nombre,
        c.nombre AS campaña_nombre
      FROM emails_enviados ee
      INNER JOIN leads l ON ee.lead_id = l.id
      INNER JOIN campañas c ON ee.campaña_id = c.id
    `;

    const result = await Connect(sql, []);

    res.status(200).json({
      success: true,
      emails_enviados: result
    });

  } catch (error) {

    console.error("Error al obtener emails enviados:", error);

    res.status(500).json({
      success: false,
      error: 'Error al obtener emails enviados'
    });

  }
});

// ==========================================
// CONSULTAR EMAIL ENVIADO POR ID
// GET http://localhost:3000/api/EmailsEnviadosMaestro/EmailEnviado/:id
// ==========================================
router.get('/EmailEnviado/:id', async (req, res) => {
  try {

    const { id } = req.params;

    const sql = `
      SELECT 
        ee.*,
        l.nombre AS lead_nombre,
        c.nombre AS campaña_nombre
      FROM emails_enviados ee
      INNER JOIN leads l ON ee.lead_id = l.id
      INNER JOIN campañas c ON ee.campaña_id = c.id
      WHERE ee.id = ?
    `;

    const result = await Connect(sql, [id]);

    if (result.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Email enviado no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      email_enviado: result[0]
    });

  } catch (error) {

    console.error("Error al obtener email enviado:", error);

    res.status(500).json({
      success: false,
      error: 'Error al obtener email enviado'
    });

  }
});

// ==========================================
// ACTUALIZAR EMAIL ENVIADO
// PUT http://localhost:3000/api/EmailsEnviadosMaestro/EmailEnviado/:id
// ==========================================
router.put('/EmailEnviado/:id', async (req, res) => {
  try {

    const { id } = req.params;

    const {
      lead_id,
      campaña_id,
      asunto,
      contenido,
      abierto,
      clic
    } = req.body;

    if (
      !id ||
      !lead_id ||
      !campaña_id ||
      !asunto ||
      !contenido ||
      abierto === undefined ||
      clic === undefined
    ) {
      return res.status(400).json({
        success: false,
        error: 'Faltan datos requeridos'
      });
    }

    const sql = `
      UPDATE emails_enviados
      SET
        lead_id = ?,
        campaña_id = ?,
        asunto = ?,
        contenido = ?,
        abierto = ?,
        clic = ?
      WHERE id = ?
    `;

    const values = [
      lead_id,
      campaña_id,
      asunto,
      contenido,
      abierto,
      clic,
      id
    ];

    const result = await Connect(sql, values);

    console.log("Resultado UPDATE:", result);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: 'Email enviado no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Email enviado actualizado exitosamente',
      email_enviado: {
        id,
        lead_id,
        campaña_id,
        asunto,
        contenido,
        abierto,
        clic
      }
    });

  } catch (error) {

    console.error("Error al actualizar email enviado:", error);

    res.status(500).json({
      success: false,
      error: 'Error al actualizar email enviado'
    });

  }
});

// ==========================================
// ELIMINAR EMAIL ENVIADO
// DELETE http://localhost:3000/api/EmailsEnviadosMaestro/EmailEnviado/:id
// ==========================================
router.delete('/EmailEnviado/:id', async (req, res) => {
  try {

    const { id } = req.params;

    const sql = `DELETE FROM emails_enviados WHERE id = ?`;

    const result = await Connect(sql, [id]);

    console.log("Resultado DELETE:", result);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: 'Email enviado no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Email enviado eliminado exitosamente'
    });

  } catch (error) {

    console.error("Error al eliminar email enviado:", error);

    res.status(500).json({
      success: false,
      error: 'Error al eliminar email enviado'
    });

  }
});

module.exports = router;