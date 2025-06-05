const express = require('express');
const router = express.Router();

const {
  generarCartonAmericano,
  generarCartonBritanico,
  generarCartonKeno,
  sacarNumero,
  iniciarJuego,
  reiniciarJuego
} = require('../controllers/bingoController');

// 🎲 Rutas para generar cartones
router.get('/americano', generarCartonAmericano);
router.get('/britanico', generarCartonBritanico);
router.get('/keno', generarCartonKeno);

// 🔁 Rutas para lógica del juego
router.post('/bingo/start', iniciarJuego);       // Iniciar juego
router.get('/bingo/numero', sacarNumero);        // Sacar número
router.post('/bingo/reset', reiniciarJuego);
// Sacar número

// ← nueva ruta

// Ruta para iniciar el juego
router.post('/bingo/start', (req, res) => {
  const { type } = req.body;

  if (!type) {
    return res.status(400).json({ error: 'Tipo de juego no especificado' });
  }

  console.log(`✅ Iniciando juego tipo: ${type}`);
  res.status(200).json({ message: `Juego tipo ${type} iniciado correctamente` });
});

module.exports = router;

