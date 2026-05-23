const express = require('express');
const router = express.Router();
const Connect = require('../Connection/SQLConnect');

// ==========================================
// CREAR ENVÍO FORMULARIO
// POST http://localhost:3000/api/EnvioFormulariosMaestro/EnvioFormulario
// ==========================================
router.post('/EnvioFormulario', async (req, res) => {
  try {

    const {
      formulario_id,
      lead_id,
      datos
    } = req.body;

    if (
      !formulario_id ||
      !datos
    ) {
      return res.status(400).json({
        success: false,
        error: 'Faltan datos requeridos'
      });
    }

    const sql = `
      INSERT INTO envio_formularios
      (
        formulario_id,
        lead_id,
        datos
      )
      VALUES (?, ?, ?)
    `;

    const values = [
      formulario_id,
      lead_id || null,
      JSON.stringify(datos)
    ];

    const result = await Connect(sql, values);

    console.log("Resultado INSERT:", result);

    res.status(201).json({
      success: true,
      message: 'Envío formulario creado exitosamente',
      envio_formulario: {
        id: result.insertId || result[0]?.insertId || null,
        formulario_id,
        lead_id: lead_id || null,
        datos
      }
    });

  } catch (error) {

    console.error("Error al crear envío formulario:", error);

    res.status(500).json({
      success: false,
      error: 'Error al crear envío formulario'
    });

  }
});

// ==========================================
// CONSULTAR TODOS LOS ENVÍOS FORMULARIOS
// GET http://localhost:3000/api/EnvioFormulariosMaestro/EnvioFormulario
// ==========================================
router.get('/EnvioFormulario', async (req, res) => {
  try {

    const sql = `
      SELECT
        ef.*,
        f.nombre AS formulario_nombre,
        l.nombre AS lead_nombre
      FROM envio_formularios ef
      INNER JOIN formularios f
        ON ef.formulario_id = f.id
      LEFT JOIN leads l
        ON ef.lead_id = l.id
    `;

    const result = await Connect(sql, []);

    res.status(200).json({
      success: true,
      envio_formularios: result
    });

  } catch (error) {

    console.error("Error al obtener envío formularios:", error);

    res.status(500).json({
      success: false,
      error: 'Error al obtener envío formularios'
    });

  }
});

// ==========================================
// CONSULTAR ENVÍO FORMULARIO POR ID
// GET http://localhost:3000/api/EnvioFormulariosMaestro/EnvioFormulario/:id
// ==========================================
router.get('/EnvioFormulario/:id', async (req, res) => {
  try {

    const { id } = req.params;

    const sql = `
      SELECT
        ef.*,
        f.nombre AS formulario_nombre,
        l.nombre AS lead_nombre
      FROM envio_formularios ef
      INNER JOIN formularios f
        ON ef.formulario_id = f.id
      LEFT JOIN leads l
        ON ef.lead_id = l.id
      WHERE ef.id = ?
    `;

    const result = await Connect(sql, [id]);

    if (result.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Envío formulario no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      envio_formulario: result[0]
    });

  } catch (error) {

    console.error("Error al obtener envío formulario:", error);

    res.status(500).json({
      success: false,
      error: 'Error al obtener envío formulario'
    });

  }
});

// ==========================================
// ACTUALIZAR ENVÍO FORMULARIO
// PUT http://localhost:3000/api/EnvioFormulariosMaestro/EnvioFormulario/:id
// ==========================================
router.put('/EnvioFormulario/:id', async (req, res) => {
  try {

    const { id } = req.params;

    const {
      formulario_id,
      lead_id,
      datos
    } = req.body;

    if (
      !id ||
      !formulario_id ||
      !datos
    ) {
      return res.status(400).json({
        success: false,
        error: 'Faltan datos requeridos'
      });
    }

    const sql = `
      UPDATE envio_formularios
      SET
        formulario_id = ?,
        lead_id = ?,
        datos = ?
      WHERE id = ?
    `;

    const values = [
      formulario_id,
      lead_id || null,
      JSON.stringify(datos),
      id
    ];

    const result = await Connect(sql, values);

    console.log("Resultado UPDATE:", result);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: 'Envío formulario no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Envío formulario actualizado exitosamente',
      envio_formulario: {
        id,
        formulario_id,
        lead_id: lead_id || null,
        datos
      }
    });

  } catch (error) {

    console.error("Error al actualizar envío formulario:", error);

    res.status(500).json({
      success: false,
      error: 'Error al actualizar envío formulario'
    });

  }
});

// ==========================================
// ELIMINAR ENVÍO FORMULARIO
// DELETE http://localhost:3000/api/EnvioFormulariosMaestro/EnvioFormulario/:id
// ==========================================
router.delete('/EnvioFormulario/:id', async (req, res) => {
  try {

    const { id } = req.params;

    const sql = `DELETE FROM envio_formularios WHERE id = ?`;

    const result = await Connect(sql, [id]);

    console.log("Resultado DELETE:", result);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: 'Envío formulario no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Envío formulario eliminado exitosamente'
    });

  } catch (error) {

    console.error("Error al eliminar envío formulario:", error);

    res.status(500).json({
      success: false,
      error: 'Error al eliminar envío formulario'
    });

  }
});

module.exports = router;