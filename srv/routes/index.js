// routes/index.js
const router = require('express').Router();

/*
router.use('/contactos', require('./contactos'));
router.use('/destinatarios', require('./destinatarios'));
*/
router.use('/Archivos', require('./archivos'));
router.use('/Campanas', require('./campanas'));
router.use('/Correos', require('./correos'));
router.use('/Demo', require('./demo'));
router.use('/Emails_enviados', require('./emails_enviados'));
router.use('/Envio_formularios', require('./envio_formularios'));
router.use('/Eventos', require('./eventos'));
router.use('/Formularios', require('./formularios'));
router.use('/Leads', require('./leads'));
router.use('/Notas', require('./notas'));
router.use('/Notificaciones', require('./notificaciones'));
router.use('/Reglas_scoring', require('./Reglas_scoring'));
router.use('/Score_Historial', require('./Score_historial'));
router.use('/Usuarios', require('./usuario'));

module.exports = router;