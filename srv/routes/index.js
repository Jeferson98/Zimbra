// routes/index.js
const router = require('express').Router();

router.use('/SedesMaestro', require('./Sedes'));

module.exports = router;