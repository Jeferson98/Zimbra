const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const Connect = require('../Connection/SQLConnect');
const jwt = require('jsonwebtoken');

// 🔐 Hash de contraseña
const hashPassword = async (password) => {
  return await bcrypt.hash(password, 10);
};

// 📧 Validación básica de email
const isValidEmail = (email) => /\S+@\S+\.\S+/.test(email);

// ==============================
// ✅ CREAR USUARIO
// ==============================
router.post('/usuarios', async (req, res) => {
  try {
    const { nombre, email, password } = req.body;

    if (!nombre || !email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Faltan datos requeridos'
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        error: 'Email inválido'
      });
    }

    const hashedPassword = await hashPassword(password);

    const sql = `
      INSERT INTO usuarios (nombre, email, password)
      VALUES (?, ?, ?)
    `;

    const result = await Connect(sql, [nombre, email, hashedPassword]);

    res.status(201).json({
      success: true,
      message: 'Usuario creado exitosamente',
      usuario: {
        id: result.insertId,
        nombre,
        email
      }
    });

  } catch (error) {
    console.error('Error al crear usuario:', error);

    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({
        success: false,
        error: 'El email ya está registrado'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// Login

router.post('/login', async (req, res) => {

  try {

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email y contraseña son obligatorios'
      });
    }

    const sql = `
      SELECT *
      FROM usuarios
      WHERE email = ?
    `;

    const result = await Connect(sql, [email]);

    if (result.length === 0) {
      return res.status(401).json({
        success: false,
        error: 'Usuario no encontrado'
      });
    }

    const usuario = result[0];

    const passwordMatch = await bcrypt.compare(
      password,
      usuario.password
    );

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        error: 'Contraseña incorrecta'
      });
    }

    const token = jwt.sign(
      {
        id: usuario.id,
        email: usuario.email
      },
      'zimbra_secret',
      {
        expiresIn: '8h'
      }
    );

    res.status(200).json({
      success: true,
      token,
      user: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol_id: 1
      }
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      success: false,
      error: 'Error en login'
    });

  }

});

// ==============================
// ✅ OBTENER USUARIOS
// ==============================
router.get('/usuarios', async (req, res) => {
  try {
    const sql = `
      SELECT id, nombre, email
      FROM usuarios
    `;

    const result = await Connect(sql);

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


// ==============================
// ✅ OBTENER USUARIO POR ID
// ==============================
router.get('/usuarios/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const sql = `
      SELECT id, nombre, email
      FROM usuarios
      WHERE id = ?
    `;

    const result = await Connect(sql, [id]);

    if (result.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Usuario no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      usuario: result[0]
    });

  } catch (error) {
    console.error('Error al obtener usuario:', error);

    res.status(500).json({
      success: false,
      error: 'Error al obtener usuario'
    });
  }
});


// ==============================
// ✅ ACTUALIZAR USUARIO
// ==============================
router.put('/usuarios/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, email, password } = req.body;

    if (!nombre || !email) {
      return res.status(400).json({
        success: false,
        error: 'Nombre y email son obligatorios'
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        error: 'Email inválido'
      });
    }

    let sql = `
      UPDATE usuarios 
      SET nombre = ?, email = ?
    `;

    let values = [nombre, email];

    // 🔐 Si envían contraseña → actualizar
    if (password) {
      const hashedPassword = await hashPassword(password);
      sql += `, password = ?`;
      values.push(hashedPassword);
    }

    sql += ` WHERE id = ?`;
    values.push(id);

    await Connect(sql, values);

    res.status(200).json({
      success: true,
      message: 'Usuario actualizado correctamente'
    });

  } catch (error) {
    console.error('Error al actualizar usuario:', error);

    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({
        success: false,
        error: 'El email ya está en uso'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Error al actualizar usuario'
    });
  }
});


// ==============================
// ✅ ELIMINAR USUARIO (REAL)
// ==============================
router.delete('/usuarios/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const sql = `DELETE FROM usuarios WHERE id = ?`;

    await Connect(sql, [id]);

    res.status(200).json({
      success: true,
      message: 'Usuario eliminado correctamente'
    });

  } catch (error) {
    console.error('Error al eliminar usuario:', error);

    res.status(500).json({
      success: false,
      error: 'Error al eliminar usuario'
    });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // 🔎 Validación básica
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email y contraseña son requeridos'
      });
    }

    // 🔐 Hashear contraseña
    const hashedPassword = crypto
      .createHash('sha256')
      .update(password)
      .digest('hex');

    // 🔎 Buscar usuario
    const result = await Connect(`
      SELECT id, nombre, email, password, estado
      FROM usuarios
      WHERE email = ?
      LIMIT 1
    `, [email]);

    const usuario = result[0];

    // ❌ Usuario no existe
    if (!usuario) {
      return res.status(401).json({
        success: false,
        error: 'Credenciales inválidas'
      });
    }

    // ❌ Usuario inactivo
    if (usuario.estado === 0) {
      return res.status(403).json({
        success: false,
        error: 'Usuario desactivado'
      });
    }

    // ❌ Contraseña incorrecta
    if (usuario.password !== hashedPassword) {
      return res.status(401).json({
        success: false,
        error: 'Credenciales inválidas'
      });
    }

    // ✅ Login exitoso
    res.status(200).json({
      success: true,
      message: 'Login exitoso',
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email
      }
    });

  } catch (error) {
    console.error('Error en login:', error);

    res.status(500).json({
      success: false,
      error: 'Error en el servidor'
    });
  }
});

module.exports = router;