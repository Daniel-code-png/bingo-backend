// routes/bingo.js

const express = require('express');
const router = express.Router();
const bingoController = require('../controllers/bingoController');


router.post('/game/new', bingoController.startNewGame);


module.exports = router;