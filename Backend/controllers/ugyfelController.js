const db = require('../db');
const bcrypt = require('bcrypt');

// Új ügyfél regisztrálása
exports.regisztracio = async (req, res) => {
    const { nev, email, jelszo } = req.body;

    // Alapvető validáció
    if (!nev || !email || !jelszo) {
        return res.status(400).json({ error: 'Minden mező kitöltése kötelező (név, email, jelszó)!' });
    }

    try {
        // 1. Ellenőrizzük, hogy létezik-e már az email cím
        const [existing] = await db.query('SELECT ugyfel_id FROM ügyfél WHERE email = ?', [email]);
        if (existing.length > 0) {
            return res.status(409).json({ error: 'Ezzel az email címmel már regisztráltak!' });
        }

        // 2. Jelszó titkosítása (hash)
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(jelszo, saltRounds);

        // 3. Mentés az adatbázisba (alapértelmezett engedély: 'ugyfel')
        const sql = 'INSERT INTO ügyfél (név, email, jelszó, engedély) VALUES (?, ?, ?, ?)';
        const [result] = await db.query(sql, [nev, email, hashedPassword, 'ugyfel']);

        res.status(201).json({ message: 'Sikeres regisztráció!', userId: result.insertId });
    } catch (error) {
        console.error('Hiba a regisztráció során:', error);
        res.status(500).json({ error: 'Szerveroldali hiba történt.' });
    }
};

// Bejelentkezés
exports.bejelentkezes = async (req, res) => {
    const { email, jelszo } = req.body;

    if (!email || !jelszo) {
        return res.status(400).json({ error: 'Email és jelszó megadása kötelező!' });
    }

    try {
        const [users] = await db.query('SELECT * FROM ügyfél WHERE email = ?', [email]);
        
        if (users.length === 0) return res.status(401).json({ error: 'Hibás email vagy jelszó!' });

        const user = users[0];
        const isMatch = await bcrypt.compare(jelszo, user.jelszó);

        if (!isMatch) return res.status(401).json({ error: 'Hibás email vagy jelszó!' });

        res.status(200).json({ message: 'Sikeres bejelentkezés!', ugyfel_id: user.ugyfel_id, nev: user.név, jogosultsag: user.engedély });
    } catch (error) {
        console.error('Hiba a bejelentkezéskor:', error);
        res.status(500).json({ error: 'Szerveroldali hiba történt.' });
    }
};