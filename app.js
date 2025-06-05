const express = require('express');               // ✅ Primero se importa express
const app = express();                            // ✅ Luego se usa
const PORT = process.env.PORT || 3000;

const cors = require('cors');                     // Middleware para permitir CORS
const bingoRoutes = require('./routes/bingo');    // Importar rutas

// --- Middlewares ---
app.use(cors());
app.use(express.json());

// --- Rutas ---
// Montamos las rutas de bingo bajo el prefijo /api
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
