const express = require('express');
const router = express.Router();
const Connect = require('../Connection/SQLConnect');

// ==========================================
// CREAR FORMULARIO
// POST http://localhost:3000/api/FormulariosMaestro/Formulario
// ==========================================
router.post('/Formulario', async (req, res) => {
  try {

    const {
      nombre,
      descripcion
    } = req.body;

    if (
      !nombre ||
      !descripcion
    ) {
      return res.status(400).json({
        success: false,
        error: 'Faltan datos requeridos'
      });
    }

    const sql = `
      INSERT INTO formularios
      (
        nombre,
        descripcion
      )
      VALUES (?, ?)
    `;

    const values = [
      nombre,
      descripcion
    ];

    const result = await Connect(sql, values);

    console.log("Resultado INSERT:", result);

    res.status(201).json({
      success: true,
      message: 'Formulario creado exitosamente',
      formulario: {
        id: result.insertId || result[0]?.insertId || null,
        nombre,
        descripcion
      }
    });

  } catch (error) {

    console.error("Error al crear formulario:", error);

    res.status(500).json({
      success: false,
      error: 'Error al crear formulario'
    });

  }
});

// ==========================================
// CONSULTAR TODOS LOS FORMULARIOS
// GET http://localhost:3000/api/FormulariosMaestro/Formulario
// ==========================================
router.get('/Formulario', async (req, res) => {
  try {

    const sql = `SELECT * FROM formularios`;

    const result = await Connect(sql, []);

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

    const sql = `SELECT * FROM formularios WHERE id = ?`;

    const result = await Connect(sql, [id]);

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

    if (
      !id ||
      !nombre ||
      !descripcion
    ) {
      return res.status(400).json({
        success: false,
        error: 'Faltan datos requeridos'
      });
    }

    const sql = `
      UPDATE formularios
      SET
        nombre = ?,
        descripcion = ?
      WHERE id = ?
    `;

    const values = [
      nombre,
      descripcion,
      id
    ];

    const result = await Connect(sql, values);

    console.log("Resultado UPDATE:", result);

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

    const sql = `DELETE FROM formularios WHERE id = ?`;

    const result = await Connect(sql, [id]);

    console.log("Resultado DELETE:", result);

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