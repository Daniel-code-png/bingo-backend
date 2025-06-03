// app.js

const express = require('express');
const cors = require('cors');
// Importaremos las rutas de bingo (por ahora no existe el controlador, pero la ruta sí)
const bingoRoutes = require('./routes/bingo'); 

const app = express();
const PORT = process.env.PORT || 3000;

// --- Middlewares ---
app.use(cors());
app.use(express.json());

// --- Rutas ---
// Montamos las rutas de bingo. El controlador todavía no existe.
app.use('/api', bingoRoutes);

// Ruta de prueba simple
app.get('/', (req, res) => {
    const nowInCali = new Date().toLocaleString('es-CO', { timeZone: 'America/Bogota' });
    console.log(`Petición a la raíz recibida. Hora en Cali: ${nowInCali}`);
    res.send('¡Bienvenido al Backend de Bingo! Accede a /api para las funcionalidades del juego.');
});

// --- Iniciar el Servidor ---
app.listen(PORT, () => {
    const nowInCali = new Date().toLocaleString('es-CO', { timeZone: 'America/Bogota' });
    console.log(`Servidor de Bingo ejecutándose en http://localhost:${PORT}`);
    console.log(`Hora actual en Cali: ${nowInCali}`);
});