// routes/index.js
const router = require('express').Router();

router.use('/SedesMaestro', require('./Sedes'));
router.use('/ProductosMaestro', require('./Productos'));
router.use('/UsuariosMaestro', require('./Usuarios'));
router.use('/StockMaestro', require('./Stock'));
router.use('/SalesOrder', require('./SalesOrder'));

module.exports = router;