
const express = require('express');
const router = express.Router();
const bingoController = require('../controllers/bingoController');

// Definición de rutas
router.post('/game/new', bingoController.startNewGame);
router.post('/game/draw', bingoController.drawNextNumber);
router.get('/game/status', bingoController.getGameStatus);
router.post('/game/reset', bingoController.resetGame);

module.exports = router;