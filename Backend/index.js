const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Útvonalak importálása
const ugyfelRoutes = require('./routes/ugyfelRoutes');
const idopontRoutes = require('./routes/idopontRoutes');
const szolgaltatasRoutes = require('./routes/szolgaltatasRoutes');
const fodraszRoutes = require('./routes/fodraszRoutes');

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('A fodrászati API fut!');
});

// Útvonalak használata
app.use('/api/ugyfelek', ugyfelRoutes);
app.use('/api/idopontok', idopontRoutes);
app.use('/api/szolgaltatasok', szolgaltatasRoutes);
app.use('/api/fodraszok', fodraszRoutes);

app.listen(PORT, () => {
    console.log(`Szerver fut a http://localhost:${PORT} címen`);
});