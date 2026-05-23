// routes/index.js
const router = require('express').Router();

/*
router.use('/contactos', require('./contactos'));
router.use('/destinatarios', require('./destinatarios'));
*/
router.use('/Usuarios', require('./usuario'));
router.use('/eventos', require('./eventos'));
router.use('/archivos', require('./archivos'));
router.use('/correos', require('./correos'));

module.exports = router;