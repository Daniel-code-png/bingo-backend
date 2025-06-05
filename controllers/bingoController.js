// Variables globales
let numerosDisponibles = [];
let numerosSacados = [];

// --- Cartón Americano ---
function generarCartonAmericano(req, res) {
  const columnas = ['B', 'I', 'N', 'G', 'O'];
  const limites = [[1, 15], [16, 30], [31, 45], [46, 60], [61, 75]];
  const carton = {};

  columnas.forEach((letra, i) => {
    let numeros = new Set();
    while (numeros.size < 5) {
      numeros.add(Math.floor(Math.random() * (limites[i][1] - limites[i][0] + 1)) + limites[i][0]);
    }
    carton[letra] = Array.from(numeros);
  });

  carton['N'][2] = 'FREE'; // Espacio libre
  res.json(carton);
}

// --- Iniciar juego ---
function iniciarJuego(req, res) {
  const tipo = req.body.type;

  if (!tipo || !['americano', 'britanico', 'keno'].includes(tipo)) {
    return res.status(400).json({ error: 'Tipo de juego inválido' });
  }

  if (tipo === 'keno') {
    numerosDisponibles = Array.from({ length: 80 }, (_, i) => i + 1);
  } else {
    numerosDisponibles = Array.from({ length: 75 }, (_, i) => i + 1);
  }

  numerosSacados = [];
  res.json({ message: `Juego ${tipo} iniciado correctamente.` });
}

// --- Cartón Británico ---
function generarCartonBritanico(req, res) {
  const carton = Array(3).fill(null).map(() => Array(9).fill(null));
  let disponibles = Array.from({ length: 90 }, (_, i) => i + 1);
  let usados = [];

  for (let fila = 0; fila < 3; fila++) {
    let columnas = new Set();
    while (columnas.size < 5) {
      columnas.add(Math.floor(Math.random() * 9));
    }
    columnas = Array.from(columnas);

    columnas.forEach(col => {
      let min = col * 10 + 1;
      let max = col === 8 ? 90 : (col + 1) * 10;
      let num;
      do {
        num = Math.floor(Math.random() * (max - min + 1)) + min;
      } while (usados.includes(num));
      usados.push(num);
      carton[fila][col] = num;
    });
  }

  res.json(carton);
}

// --- Cartón Keno ---
function generarCartonKeno(req, res) {
  const carton = new Set();
  while (carton.size < 10) {
    carton.add(Math.floor(Math.random() * 80) + 1);
  }
  res.json({ keno: Array.from(carton) });
}

// --- Sacar número ---
function sacarNumero(req, res) {
  if (numerosDisponibles.length === 0) {
    return res.status(400).json({ error: 'Ya no hay más números disponibles' });
  }

  const index = Math.floor(Math.random() * numerosDisponibles.length);
  const numero = numerosDisponibles.splice(index, 1)[0];
  numerosSacados.push(numero);

  const letra = getLetraBingo(numero);
  res.json({ numero, letra, restantes: numerosDisponibles.length });
}

const reiniciarJuego = (req, res) => {
  numeros = [];
  ultimosNumeros = [];
  tipoJuego = '';
  console.log('♻️ Juego reiniciado');
  return res.status(200).json({ message: 'Juego reiniciado correctamente' });
};

function getLetraBingo(num) {
  if (num >= 1 && num <= 15) return 'B';
  if (num >= 16 && num <= 30) return 'I';
  if (num >= 31 && num <= 45) return 'N';
  if (num >= 46 && num <= 60) return 'G';
  if (num >= 61 && num <= 75) return 'O';
  return '';
}

// Exportar funciones
module.exports = {
  generarCartonAmericano,
  generarCartonBritanico,
  generarCartonKeno,
  sacarNumero,
  iniciarJuego,
  reiniciarJuego

};

