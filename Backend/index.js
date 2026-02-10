const express = require('express');
const cors = require('cors');
const ugyfelRoutes = require('./routes/ugyfelRoutes');
const fodraszRoutes = require('./routes/fodraszRoutes');
const idopontRoutes = require('./routes/idopontRoutes');
const szolgaltatasRoutes = require('./routes/szolgaltatasRoutes');
const munkaidoRoutes = require('./routes/munkaidoRoutes');
const idopontController = require('./controllers/idopontController'); // Kontroller importálása az automatizáláshoz

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware-ek
app.use(cors()); // Engedélyezi a kommunikációt a Frontenddel
app.use(express.json()); // Engedélyezi a JSON adatok fogadását

// Útvonalak csatolása
// Minden, ami '/api/ugyfelek'-kel kezdődik, az ugyfelRoutes-ba megy
app.use('/api/ugyfelek', ugyfelRoutes);

app.use('/api/fodraszok', fodraszRoutes);
app.use('/api/idopontok', idopontRoutes);
app.use('/api/szolgaltatasok', szolgaltatasRoutes);
app.use('/api/munkaido', munkaidoRoutes);

// Alapértelmezett hibaüzenet, ha rossz címre küldünk kérést
app.use((req, res) => {
    res.status(404).json({ error: 'Az oldal nem található (404)' });
});

// Szerver indítása
app.listen(PORT, () => {
    console.log(`Szerver fut a http://localhost:${PORT} címen`);

    // --- AUTOMATIKUS KARBANTARTÁS ---
    // 1. Lefuttatjuk a tisztítást a szerver indulásakor
    idopontController.performCleanup()
        .then(() => console.log('Karbantartás: Régi időpontok sikeresen törölve.'))
        .catch(err => console.error('Karbantartás hiba:', err));

    // 2. Beállítjuk, hogy 24 óránként (86400000 ms) ismétlődjön meg
    setInterval(() => {
        idopontController.performCleanup()
            .then(() => console.log('Napi karbantartás: Régi időpontok törölve.'))
            .catch(err => console.error('Napi karbantartás hiba:', err));
    }, 24 * 60 * 60 * 1000);
});