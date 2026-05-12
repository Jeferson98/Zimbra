const express = require('express');
const router = express.Router();
const Connect = require('../Connection/SQLConnect'); // importa la función

router.post('/Producto', async (req, res) => {
  try {
    const { codigo, nombre, precioCompra, precioVenta } = req.body;
    if (!codigo || !nombre || !precioCompra || !precioVenta) {
      return res.status(400).json({ success: false, error: 'Faltan datos requeridos' });
    }

    const sql = `INSERT INTO productos (codigo, nombre, precio_compra, precio_venta) VALUES (?, ?, ?, ?)`;
    const values = [codigo, nombre, parseFloat(precioCompra), parseFloat(precioVenta)];
    const result = await Connect(sql, values);

    console.log("Resultado de INSERT:", result);

    res.status(201).json({
      success: true,
      message: "Producto creado exitosamente",
      producto: {
        id: result.insertId || null,   // id autoincremental
        code: codigo,                  // el código enviado por el frontend
        name: nombre,
        purchasePrice: parseFloat(precioCompra),
        salePrice: parseFloat(precioVenta),
        status: 1                      // estado por defecto (activo)
      }
    });
  } catch (error) {
    console.error("Error al crear producto:", error.message, error.stack);
    res.status(500).json({ success: false, error: 'Error en el servidor' });
  }
});

router.get('/Producto', async (req, res) => {
  try {
    const sql = `SELECT * FROM productos`;
    const result = await Connect(sql, []);

    res.status(200).json({
      success: true,
      productos: result
    });
  } catch (error) {
    console.error("Error al obtener productos:", error);
    res.status(500).json({ success: false, error: "Error al obtener los productos" });
  }
});

router.put('/Producto/:id', async (req, res) => {
  try {
    const { codigo, nombre, precioCompra, precioVenta, estado } = req.body;
    const { id } = req.params; // el id viene de la URL

    if (!id || !codigo || !nombre || !precioCompra || !precioVenta) {
      return res.status(400).json({ success: false, error: 'Faltan datos requeridos' });
    }

    const sql = `UPDATE productos SET codigo = ?, nombre = ?, precio_compra = ?, precio_venta = ?, estado = ? WHERE id = ?`;
    const values = [codigo, nombre, parseFloat(precioCompra), parseFloat(precioVenta), estado, id];
    const result = await Connect(sql, values);

    console.log("Resultado de UPDATE:", result);

    res.status(200).json({
      success: true,
      message: "Producto actualizado exitosamente",
      producto: {
        id,
        codigo,
        nombre,
        precioCompra: parseFloat(precioCompra),
        precioVenta: parseFloat(precioVenta),
        estado
      }
    });
  } catch (error) {
    console.error("Error al actualizar el producto:", error);
    res.status(500).json({ success: false, error: "Error al actualizar el producto" });
  }
});

module.exports = router;
