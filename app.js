// app.js

const express = require('express');
const cors = require('cors');
const bingoRoutes = require('./routes/bingo');

const app = express();
const PORT = process.env.PORT || 3000;


app.use(cors());


app.use(express.json());


app.use('/api', bingoRoutes);


app.get('/', (req, res) => {
    
    const nowInCali = new Date().toLocaleString('es-CO', { timeZone: 'America/Bogota' });
    console.log(`Petición a la raíz recibida. Hora en Cali: ${nowInCali}`);
    res.send('¡Bienvenido al Backend de Bingo! Accede a /api para las funcionalidades del juego.');
});

// Inicia el servidor
app.listen(PORT, () => {
    
    const nowInCali = new Date().toLocaleString('es-CO', { timeZone: 'America/Bogota' });
    console.log(`Servidor de Bingo ejecutándose en http://localhost:${PORT}`);
    console.log(`Hora actual en Cali: ${nowInCali}`);
});