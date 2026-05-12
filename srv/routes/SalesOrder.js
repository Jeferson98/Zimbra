const express = require('express');
const router = express.Router();
const Connect = require('../Connection/SQLConnect'); // importa la función

router.get('/AllOrders', async (req, res) => {
  try {

    const sql = `SELECT 
    p.id AS pedido_id,
    p.mesa,
    p.estado,
    p.fecha_finalizacion,

    s.id AS sede_id,
    s.nombre AS sede_nombre,

    u.id AS mesero_id,
    u.nombre AS mesero_nombre,

    SUM(dp.cantidad * dp.precio_venta) AS total_pedido

FROM pedidos p

INNER JOIN sedes s 
    ON p.sede_id = s.id

INNER JOIN usuarios u 
    ON p.mesero_id = u.id

INNER JOIN detalle_pedido dp 
    ON dp.pedido_id = p.id

GROUP BY 
    p.id, p.mesa, p.estado, p.fecha_finalizacion,
    s.id, s.nombre,
    u.id, u.nombre;`;
    const result = await Connect(sql);

    res.status(201).json({
      success: true,
      message: "Producto creado exitosamente",
      Orders: result                
    });
  } catch (error) {
    console.error("Error al crear producto:", error.message, error.stack);
    res.status(500).json({ success: false, error: 'Error en el servidor' });
  }
});

router.get('/OrderDetail', async (req, res) => {
  try {

    const { pedido_id } = req.query;

    const sql = `SELECT 
    -- PEDIDO
    p.id AS pedido_id,
    p.mesa,
    p.estado AS pedido_estado,
    p.fecha_finalizacion,
    p.sede_id,
    p.mesero_id,

    -- SEDE
    s.nombre AS sede_nombre,
    s.direccion AS sede_direccion,
    s.ciudad AS sede_ciudad,

    -- MESERO (USUARIO)
    u.nombre AS mesero_nombre,
    u.username AS mesero_username,
    u.rol_id,

    -- DETALLE PEDIDO
    dp.id AS detalle_id,
    dp.producto_id,
    dp.cantidad,
    dp.precio_venta,

    -- PRODUCTO
    pr.codigo AS producto_codigo,
    pr.nombre AS producto_nombre,
    pr.precio_compra,
    pr.precio_venta AS producto_precio_venta,

    -- CALCULOS
    (dp.cantidad * dp.precio_venta) AS subtotal

FROM pedidos p

LEFT JOIN sedes s 
    ON p.sede_id = s.id

LEFT JOIN usuarios u 
    ON p.mesero_id = u.id

LEFT JOIN detalle_pedido dp 
    ON dp.pedido_id = p.id

LEFT JOIN productos pr 
    ON dp.producto_id = pr.id

WHERE p.id = ?;`;

    const values = [pedido_id];
    const result = await Connect(sql, values);

    const consolideResult = {
      pedido_id : 0,
      mesa: "",
      fecha_finalizacion: "",

      sede_id: 0,
      sede_nombre: "",
      sede_direccion: "",
      sede_ciudad: "",

      mesero_id: 0,
      mesero_nombre: "",
      mesero_username: "",
      rol_id: "",

      detalles: [], 
    };

    result.forEach(el => {
      consolideResult.pedido_id = el.pedido_id,
      consolideResult.mesa = el.mesa,
      consolideResult.pedido_estado = el.pedido_estado,
      consolideResult.fecha_finalizacion = el.fecha_finalizacion,

      consolideResult.sede_id = el.sede_id,
      consolideResult.sede_nombre = el.sede_nombre,
      consolideResult.sede_direccion = el.sede_direccion,
      consolideResult.sede_ciudad = el.sede_ciudad,
      consolideResult.sede_estado = el.sede_estado,

      consolideResult.mesero_id = el.mesero_id,
      consolideResult.mesero_nombre = el.mesero_nombre,
      consolideResult.mesero_username = el.mesero_username,
      consolideResult.mesero_estado = el.mesero_estado,
      consolideResult.rol_id = el.rol_id,
      consolideResult.detalles.push({
        detalle_id: el.detalle_id,
        producto_id: el.producto_id,
        producto_codigo: el.producto_codigo,
        producto_nombre: el.producto_nombre,
        cantidad: el.cantidad,
        precio_venta: el.precio_venta,
        precio_compra: el.precio_compra,
        producto_precio_venta: el.producto_precio_venta,
        producto_estado: el.producto_estado,
        subtotal: el.subtotal
      });
    });

    res.status(201).json({
      success: true,
      message: "Consulta de pedido exitosa!",
      Orders: consolideResult                
    });
  } catch (error) {
    console.error("Error al crear producto:", error.message, error.stack);
    res.status(500).json({ success: false, error: 'Error en el servidor' });
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
