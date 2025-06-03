let game = {
    type: null, 
    numbersStatus: [], 
    drawnNumbersHistory: [], 
    currentNumber: null, 
    currentLetter: null, 
    lastThreeNumbers: [], 
    kenoRoundNumbers: [] 
};



/**
 * 
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
 * @param {number} num 
 * @param {string} gameType 
 * @returns {string} 
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
 
 * @param {number} newNumber 
 */
const updateLastThreeNumbers = (newNumber) => {
    if (game.type === 'americano' || game.type === 'britanico') {
        game.lastThreeNumbers.push(newNumber);
        if (game.lastThreeNumbers.length > 3) {
            game.lastThreeNumbers.shift(); 
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