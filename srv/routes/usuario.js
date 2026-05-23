const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const Connect = require('../Connection/SQLConnect');

// 🔐 Función para hashear contraseña
const hashPassword = (password) => {
  return crypto.createHash('sha256').update(password).digest('hex');
};


// http://localhost:3000/api/usuario
// ✅ Crear usuario
router.post('/user', async (req, res) => {
  try {
    const { nombre, email, password } = req.body;

    if (!nombre || !email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Faltan datos requeridos'
      });
    }

    const hashedPassword = hashPassword(password);

    const sql = `
      INSERT INTO usuarios (nombre, email, password)
      VALUES (?, ?, ?)
    `;

    const values = [
      nombre,
      email,
      hashedPassword
    ];

    const result = await Connect(sql, values);

    res.status(201).json({
      success: true,
      message: 'Usuario creado exitosamente',
      usuario: {
        id: result.insertId || result[0]?.insertId || null,
        nombre,
        email
      }
    });

  } catch (error) {
    console.error('Error al crear usuario:', error);
    res.status(500).json({
      success: false,
      error: 'Error al crear el usuario'
    });
  }
});


// ✅ Obtener usuarios
router.get('/user', async (req, res) => {
  try {
    const sql = `
      SELECT id, nombre, email, rol_id, estado
      FROM usuarios
    `;

    const result = await Connect(sql, []);

    res.status(200).json({
      success: true,
      usuarios: result
    });

  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener usuarios'
    });
  }
});


// ✅ Obtener usuario por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const sql = `
      SELECT id, nombre, email, rol_id, estado
      FROM usuarios
      WHERE id = ?
    `;

    const result = await Connect(sql, [id]);

    res.status(200).json({
      success: true,
      usuario: result[0] || null
    });

  } catch (error) {
    console.error('Error al obtener usuario:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener usuario'
    });
  }
});


// ✅ Actualizar usuario
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, email, password, rol_id, estado } = req.body;

    if (!id || !nombre || !email) {
      return res.status(400).json({
        success: false,
        error: 'Faltan datos requeridos'
      });
    }

    let sql = `
      UPDATE usuarios 
      SET nombre = ?, email = ?, rol_id = ?, estado = ?
    `;

    let values = [nombre, email, rol_id || null, estado ?? 1];

    // 🔐 Si envían contraseña → actualizarla
    if (password) {
      sql += `, password = ?`;
      values.push(hashPassword(password));
    }

    sql += ` WHERE id = ?`;
    values.push(id);

    await Connect(sql, values);

    res.status(200).json({
      success: true,
      message: 'Usuario actualizado exitosamente'
    });

  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    res.status(500).json({
      success: false,
      error: 'Error al actualizar usuario'
    });
  }
});


// ✅ Eliminar (soft delete recomendado)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const sql = `
      UPDATE usuarios SET estado = 0 WHERE id = ?
    `;

    await Connect(sql, [id]);

    res.status(200).json({
      success: true,
      message: 'Usuario desactivado'
    });

  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    res.status(500).json({
      success: false,
      error: 'Error al eliminar usuario'
    });
  }
});

module.exports = router;