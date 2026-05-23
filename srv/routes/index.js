// routes/index.js
const router = require('express').Router();

/*router.use('/archivos', require('./archivos'));
router.use('/contactos', require('./contactos'));
router.use('/correos', require('./correos'));
router.use('/destinatarios', require('./destinatarios'));
router.use('/eventos', require('./eventos'));
router.use('/mensajes', require('./mensajes'));
router.use('/roles', require('./roles'));
*/router.use('/Usuarios', require('./usuario'));

module.exports = router;