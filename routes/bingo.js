// routes/bingo.js

const express = require('express');
const router = express.Router();

// Por ahora, no importamos el controlador porque aún no existe.
// const bingoController = require('../controllers/bingoController');

// Ruta de prueba simple para verificar que el router funciona
router.get('/test', (req, res) => {
    res.status(200).json({ message: "Rutas de bingo funcionando (test)" });
});

module.exports = router;