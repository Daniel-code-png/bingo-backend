const express = require('express');
const cors = require('cors');
const bingoRoutes = require('./routes/bingoRoutes');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/bingo', bingoRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
