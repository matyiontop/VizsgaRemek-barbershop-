const express = require('express');
const cors = require('cors');
const ugyfelRoutes = require('./routes/ugyfelRoutes');
// const fodraszRoutes = require('./routes/fodraszRoutes'); // Ha majd lesz
// const idopontRoutes = require('./routes/idopontRoutes'); // Ha majd lesz

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware-ek
app.use(cors()); // Engedélyezi a kommunikációt a Frontenddel
app.use(express.json()); // Engedélyezi a JSON adatok fogadását

// Útvonalak csatolása
// Minden, ami '/api/ugyfelek'-kel kezdődik, az ugyfelRoutes-ba megy
app.use('/api/ugyfelek', ugyfelRoutes);

// app.use('/api/fodraszok', fodraszRoutes); // Későbbi használatra
// app.use('/api/idopontok', idopontRoutes); // Későbbi használatra

// Alapértelmezett hibaüzenet, ha rossz címre küldünk kérést
app.use((req, res) => {
    res.status(404).json({ error: 'Az oldal nem található (404)' });
});

// Szerver indítása
app.listen(PORT, () => {
    console.log(`Szerver fut a http://localhost:${PORT} címen`);
});