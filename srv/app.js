const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());

// Middleware para JSON
app.use(express.json());

// Ruta de prueba
app.get('/', (req, res) => {
    res.send('Servidor funcionando 🚀');
});

// IMPORTAS SOLO UNA VEZ
const routes = require('./routes');

// USAS TODO EL BLOQUE
app.use('/api', routes);

// Puerto
const PORT = 3000;

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});