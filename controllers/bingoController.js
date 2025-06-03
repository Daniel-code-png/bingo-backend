let game = {
    type: null, 
    numbersStatus: [], 
    drawnNumbersHistory: [], 
    currentNumber: null, // El último número sacado
    currentLetter: null, 
    lastThreeNumbers: [], 
    kenoRoundNumbers: [] 
};



/**
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
            maxNumber = 75; 
    }

    const numbers = [];
    for (let i = 1; i <= maxNumber; i++) {
        const numberObj = { number: i, drawn: false };
        if (type === 'americano') {
            numberObj.letter = getBingoLetter(i, type);
        }
        numbers.push(numberObj);
    }
    return numbers;
};

/**
 * @param {number} num - El número de bingo.
 * @param {string} gameType - El tipo de juego actual.
 * @returns {string} La letra correspondiente (B, I, N, G, O) o una cadena vacía/nula si no aplica.
 */
const getBingoLetter = (num, gameType) => {
    if (gameType !== 'americano') {
        return null; 
    }
    if (num >= 1 && num <= 15) return 'B';
    if (num >= 16 && num <= 30) return 'I';
    if (num >= 31 && num <= 45) return 'N';
    if (num >= 46 && num <= 60) return 'G';
    if (num >= 61 && num <= 75) return 'O';
    return null; 
};

/**

 * @param {number} newNumber - El número recién sacado.
 */
const updateLastThreeNumbers = (newNumber) => {
    if (game.type === 'americano' || game.type === 'britanico') {
        game.lastThreeNumbers.push(newNumber);
        if (game.lastThreeNumbers.length > 3) {
            game.lastThreeNumbers.shift(); // Elimina el número más antiguo si hay más de 3
        }
    } else {
        game.lastThreeNumbers = []; 
    }
};


exports.startNewGame = (req, res) => {
    const { type } = req.body;

    if (!type || !['americano', 'britanico', 'keno'].includes(type.toLowerCase())) {
        return res.status(400).json({
            message: 'Tipo de bingo inválido. Debe ser "americano", "britanico" o "keno".'
        });
    }

    // Reiniciar el estado del juego
    game.type = type.toLowerCase();
    game.numbersStatus = initializeNumbers(game.type); 
    game.drawnNumbersHistory = []; 
    game.currentNumber = null;
    game.currentLetter = null;
    game.lastThreeNumbers = [];
    game.kenoRoundNumbers = []; 

    res.status(200).json({
        message: `Nueva partida de bingo ${game.type} iniciada.`,
        gameType: game.type,
        numbersStatus: game.numbersStatus, 
        currentNumber: game.currentNumber,
        currentLetter: game.currentLetter,
        lastThreeNumbers: game.lastThreeNumbers,
        kenoRoundNumbers: game.kenoRoundNumbers 
    });
};


exports.drawNextNumber = (req, res) => {
    if (!game.type) {
        return res.status(400).json({
            message: 'No hay una partida iniciada. Por favor, inicie una nueva partida.'
        });
    }

    
    if (game.type === 'keno') {
        
        const allNumbers = Array.from({ length: 80 }, (_, i) => i + 1); 
        const drawnKenoNumbers = [];
        const tempAvailableNumbers = [...allNumbers]; 

        
        for (let i = 0; i < 20; i++) {
            if (tempAvailableNumbers.length === 0) {
                
                break;
            }
            const randomIndex = Math.floor(Math.random() * tempAvailableNumbers.length);
            const drawn = tempAvailableNumbers.splice(randomIndex, 1)[0]; 
            drawnKenoNumbers.push(drawn);
        }

        
        game.kenoRoundNumbers = drawnKenoNumbers.sort((a, b) => a - b); 
        game.drawnNumbersHistory = drawnKenoNumbers; 
        game.currentNumber = null; 
        game.currentLetter = null; 
        game.lastThreeNumbers = []; 

        
        game.numbersStatus.forEach(num => num.drawn = false); // Resetear estado anterior
        game.kenoRoundNumbers.forEach(num => {
            const index = game.numbersStatus.findIndex(n => n.number === num);
            if (index !== -1) {
                game.numbersStatus[index].drawn = true;
            }
        });

        return res.status(200).json({
            message: `Ronda de Keno finalizada. Se sacaron ${drawnKenoNumbers.length} números.`,
            drawnKenoNumbers: game.kenoRoundNumbers, 
            gameType: game.type,
            numbersStatus: game.numbersStatus, 
            currentNumber: null,
            currentLetter: null,
            lastThreeNumbers: []
        });
    }

  
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

    
    const randomIndex = Math.floor(Math.random() * availableNumbers.length);
    const drawnNumberObj = availableNumbers[randomIndex];
    const drawnNumber = drawnNumberObj.number; // El número
    const drawnLetter = getBingoLetter(drawnNumber, game.type); 

   
    const indexInStatus = game.numbersStatus.findIndex(num => num.number === drawnNumber);
    if (indexInStatus !== -1) {
        game.numbersStatus[indexInStatus].drawn = true;
    }

    
    game.drawnNumbersHistory.push(drawnNumber);
    game.currentNumber = drawnNumber;
    game.currentLetter = drawnLetter; 
    updateLastThreeNumbers(drawnNumber); 

    res.status(200).json({
        message: 'Número sacado exitosamente.',
        drawnNumber: drawnNumber, 
        drawnLetter: drawnLetter, 
        gameType: game.type,
        numbersStatus: game.numbersStatus,
        currentNumber: game.currentNumber,
        currentLetter: game.currentLetter,
        lastThreeNumbers: game.lastThreeNumbers
    });
};


exports.getGameStatus = (req, res) => {
    if (!game.type) {
        return res.status(400).json({
            message: 'No hay una partida iniciada.'
        });
    }

    
    if (game.type === 'keno') {
        return res.status(200).json({
            gameType: game.type,
            numbersStatus: game.numbersStatus, 
            kenoRoundNumbers: game.kenoRoundNumbers, 
            currentNumber: null, 
            currentLetter: null, 
            lastThreeNumbers: [] 
        });
    }

   
    res.status(200).json({
        gameType: game.type,
        numbersStatus: game.numbersStatus,
        currentNumber: game.currentNumber,
        currentLetter: game.currentLetter, 
        lastThreeNumbers: game.lastThreeNumbers
    });
};


exports.resetGame = (req, res) => {
    if (!game.type) {
        return res.status(400).json({
            message: 'No hay una partida activa para reiniciar.'
        });
    }

    // Reiniciar el estado del juego
    const currentType = game.type; 
    game.type = currentType;
    game.numbersStatus = initializeNumbers(currentType); 
    game.drawnNumbersHistory = [];
    game.currentNumber = null;
    game.currentLetter = null;
    game.lastThreeNumbers = [];
    game.kenoRoundNumbers = []; 

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