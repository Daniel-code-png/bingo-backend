// controllers/bingoController.js

// Estado global del juego
// Para una aplicación de producción, esto debería estar en una base de datos o un almacén de estado distribuido.
// Para este prototipo, un objeto en memoria es suficiente.
let game = {
    type: null, // 'americano', 'britanico', 'keno'
    numbersStatus: [], // [{ number: 1, drawn: false, letter: 'B' }, ...] - Estado de cada número
    drawnNumbersHistory: [], // [10, 25, 42] - Historial de números sacados (para bingo tradicional)
    currentNumber: null, // El último número sacado
    currentLetter: null, // La letra asociada al currentNumber (solo para americano)
    lastThreeNumbers: [], 
    kenoRoundNumbers: [] // Array de los 20 números sorteados en la última ronda de Keno
};

// --- Funciones Auxiliares ---

/**
 * Inicializa los números para un tipo de bingo específico.
 * @param {string} type - 'americano', 'britanico', 'keno'
 * @returns {Array} Un arreglo de objetos { number, drawn: false, letter? }
 */
const initializeNumbers = (type) => {
    let maxNumber;
    switch (type) {
        case 'americano':
            maxNumber = 75;
            break;
        case 'britanico':
            maxNumber = 90;
            break;
        case 'keno':
            maxNumber = 80;
            break;
        default:
            maxNumber = 75; // Por defecto americano si no se especifica
    }

    const numbers = [];
    for (let i = 1; i <= maxNumber; i++) {
        const numberObj = { number: i, drawn: false };
        // Si es americano, añadir la letra desde el inicio para la tabla del frontend
        if (type === 'americano') {
            numberObj.letter = getBingoLetter(i, type);
        }
        numbers.push(numberObj);
    }
    return numbers;
};

/**
 * Asigna la letra B-I-N-G-O a un número de bingo americano.
 * Esta función es solo para bingo americano.
 * @param {number} num - El número de bingo.
 * @param {string} gameType - El tipo de juego actual.
 * @returns {string} La letra correspondiente (B, I, N, G, O) o una cadena vacía/nula si no aplica.
 */
const getBingoLetter = (num, gameType) => {
    if (gameType !== 'americano') {
        return null; // O un string vacío, según cómo el frontend lo maneje
    }
    if (num >= 1 && num <= 15) return 'B';
    if (num >= 16 && num <= 30) return 'I';
    if (num >= 31 && num <= 45) return 'N';
    if (num >= 46 && num <= 60) return 'G';
    if (num >= 61 && num <= 75) return 'O';
    return null; // En caso de número fuera de rango para americano, aunque no debería ocurrir
};

/**
 * Actualiza los últimos tres números sacados.
 * Esto solo aplica para bingo tradicional (americano, británico).
 * @param {number} newNumber - El número recién sacado.
 */
const updateLastThreeNumbers = (newNumber) => {
    if (game.type === 'americano' || game.type === 'britanico') {
        game.lastThreeNumbers.push(newNumber);
        if (game.lastThreeNumbers.length > 3) {
            game.lastThreeNumbers.shift(); // Elimina el número más antiguo si hay más de 3
        }
    } else {
        game.lastThreeNumbers = []; // No aplica para Keno
    }
};

// --- Controladores de API ---

/**
 * Inicia una nueva partida de bingo.
 * POST /api/game/new
 */
exports.startNewGame = (req, res) => {
    const { type } = req.body;

    if (!type || !['americano', 'britanico', 'keno'].includes(type.toLowerCase())) {
        return res.status(400).json({
            message: 'Tipo de bingo inválido. Debe ser "americano", "britanico" o "keno".'
        });
    }

    // Reiniciar el estado del juego
    game.type = type.toLowerCase();
    game.numbersStatus = initializeNumbers(game.type); // Inicializa con o sin letras
    game.drawnNumbersHistory = []; // Para bingo tradicional
    game.currentNumber = null;
    game.currentLetter = null;
    game.lastThreeNumbers = [];
    game.kenoRoundNumbers = []; // Asegurarse de que esté vacío para un nuevo juego

    res.status(200).json({
        message: `Nueva partida de bingo ${game.type} iniciada.`,
        gameType: game.type,
        numbersStatus: game.numbersStatus, // Incluye la propiedad 'letter' si es americano
        currentNumber: game.currentNumber,
        currentLetter: game.currentLetter,
        lastThreeNumbers: game.lastThreeNumbers,
        kenoRoundNumbers: game.kenoRoundNumbers // Vacío al inicio
    });
};

/**
 * Saca el siguiente número(s) aleatorio(s) sin repetir.
 * La lógica varía para Keno.
 * POST /api/game/draw
 */
exports.drawNextNumber = (req, res) => {
    if (!game.type) {
        return res.status(400).json({
            message: 'No hay una partida iniciada. Por favor, inicie una nueva partida.'
        });
    }

    // --- Lógica para Keno ---
    if (game.type === 'keno') {
        // En Keno, se sacan 20 números en una "ronda"
        const allNumbers = Array.from({ length: 80 }, (_, i) => i + 1); // Números del 1 al 80
        const drawnKenoNumbers = [];
        const tempAvailableNumbers = [...allNumbers]; // Copia para sacar números

        // Sacar 20 números aleatorios sin repetir
        for (let i = 0; i < 20; i++) {
            if (tempAvailableNumbers.length === 0) {
                // Esto no debería pasar en Keno a menos que se intente sacar más de 80 números
                break;
            }
            const randomIndex = Math.floor(Math.random() * tempAvailableNumbers.length);
            const drawn = tempAvailableNumbers.splice(randomIndex, 1)[0]; // Saca y elimina
            drawnKenoNumbers.push(drawn);
        }

        // Actualizar el estado del juego para Keno
        game.kenoRoundNumbers = drawnKenoNumbers.sort((a, b) => a - b); // Ordenar para fácil lectura
        game.drawnNumbersHistory = drawnKenoNumbers; // El historial de Keno es la última ronda
        game.currentNumber = null; // No hay un solo "currentNumber" en Keno
        game.currentLetter = null; // No aplica
        game.lastThreeNumbers = []; // No aplica

        // Actualizar numbersStatus para reflejar cuáles de los 80 salieron en esta ronda
        game.numbersStatus.forEach(num => num.drawn = false); // Resetear estado anterior
        game.kenoRoundNumbers.forEach(num => {
            const index = game.numbersStatus.findIndex(n => n.number === num);
            if (index !== -1) {
                game.numbersStatus[index].drawn = true;
            }
        });

        return res.status(200).json({
            message: `Ronda de Keno finalizada. Se sacaron ${drawnKenoNumbers.length} números.`,
            drawnKenoNumbers: game.kenoRoundNumbers, // Los 20 números sorteados
            gameType: game.type,
            numbersStatus: game.numbersStatus, // Muestra el estado de los 80 números para Keno
            currentNumber: null,
            currentLetter: null,
            lastThreeNumbers: []
        });
    }

    // --- Lógica para Bingo Americano/Británico (tradicional) ---

    // Filtrar números no sacados
    const availableNumbers = game.numbersStatus.filter(num => !num.drawn);

    if (availableNumbers.length === 0) {
        return res.status(200).json({
            message: '¡Todos los números han sido sacados! La partida ha terminado.',
            gameType: game.type,
            numbersStatus: game.numbersStatus,
            currentNumber: game.currentNumber,
            currentLetter: game.currentLetter,
            lastThreeNumbers: game.lastThreeNumbers
        });
    }

    // Seleccionar un número aleatorio de los disponibles
    const randomIndex = Math.floor(Math.random() * availableNumbers.length);
    const drawnNumberObj = availableNumbers[randomIndex];
    const drawnNumber = drawnNumberObj.number; // El número
    const drawnLetter = getBingoLetter(drawnNumber, game.type); // Su letra (si aplica)

    // Marcar el número como sacado en el estado general
    const indexInStatus = game.numbersStatus.findIndex(num => num.number === drawnNumber);
    if (indexInStatus !== -1) {
        game.numbersStatus[indexInStatus].drawn = true;
    }

    // Actualizar historial y números recientes para bingo tradicional
    game.drawnNumbersHistory.push(drawnNumber);
    game.currentNumber = drawnNumber;
    game.currentLetter = drawnLetter; // Asignar la letra al número actual
    updateLastThreeNumbers(drawnNumber); // Actualiza los últimos 3

    res.status(200).json({
        message: 'Número sacado exitosamente.',
        drawnNumber: drawnNumber, // El número recién sacado (para voz)
        drawnLetter: drawnLetter, // La letra recién sacada (para voz si es americano)
        gameType: game.type,
        numbersStatus: game.numbersStatus,
        currentNumber: game.currentNumber,
        currentLetter: game.currentLetter,
        lastThreeNumbers: game.lastThreeNumbers
    });
};

/**
 * Obtiene el estado actual de la partida.
 * GET /api/game/status
 */
exports.getGameStatus = (req, res) => {
    if (!game.type) {
        return res.status(400).json({
            message: 'No hay una partida iniciada.'
        });
    }

    // La respuesta varía ligeramente si es Keno
    if (game.type === 'keno') {
        return res.status(200).json({
            gameType: game.type,
            numbersStatus: game.numbersStatus, // Estado de los 80 números
            kenoRoundNumbers: game.kenoRoundNumbers, // Los 20 números de la última ronda
            currentNumber: null, // No aplica
            currentLetter: null, // No aplica
            lastThreeNumbers: [] // No aplica
        });
    }

    // Para Bingo Americano/Británico
    res.status(200).json({
        gameType: game.type,
        numbersStatus: game.numbersStatus,
        currentNumber: game.currentNumber,
        currentLetter: game.currentLetter, // Incluye la letra del número actual
        lastThreeNumbers: game.lastThreeNumbers
    });
};

/**
 * Reinicia la partida actual.
 * POST /api/game/reset
 */
exports.resetGame = (req, res) => {
    if (!game.type) {
        return res.status(400).json({
            message: 'No hay una partida activa para reiniciar.'
        });
    }

    // Reiniciar el estado del juego, manteniendo el tipo de bingo actual
    const currentType = game.type; // Guardar el tipo antes de resetear
    game.type = currentType;
    game.numbersStatus = initializeNumbers(currentType); // Reinicializar con el mismo tipo y letras si aplica
    game.drawnNumbersHistory = [];
    game.currentNumber = null;
    game.currentLetter = null;
    game.lastThreeNumbers = [];
    game.kenoRoundNumbers = []; // Limpiar también para Keno

    res.status(200).json({
        message: 'Partida reiniciada exitosamente.',
        gameType: game.type,
        numbersStatus: game.numbersStatus,
        currentNumber: game.currentNumber,
        currentLetter: game.currentLetter,
        lastThreeNumbers: game.lastThreeNumbers,
        kenoRoundNumbers: game.kenoRoundNumbers
    });
};