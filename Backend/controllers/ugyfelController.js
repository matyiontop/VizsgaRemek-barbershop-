const bcrypt = require('bcrypt');
const getDb = require('../db');

// Új ügyfél regisztrálása
exports.regisztracio = async (req, res) => {
    const { nev, email, jelszo } = req.body;
    console.log('Regisztrációs kérés érkezett:', { nev, email });

    // Alapvető validáció
    if (!nev || !email || !jelszo) {
        return res.status(400).json({ error: 'Minden mező kitöltése kötelező (név, email, jelszó)!' });
    }

    try {
        const db = await getDb();
        // 1. Ellenőrizzük, hogy létezik-e már az email cím
        const existing = await db.get('SELECT felhasznalo_id FROM felhasznalo WHERE email = ?', [email]);
        if (existing) {
            return res.status(409).json({ error: 'Ezzel az email címmel már regisztráltak!' });
        }

        // 2. Jelszó titkosítása (hash)
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(jelszo, saltRounds);

        // 3. Mentés az adatbázisba
        const sql = 'INSERT INTO felhasznalo (nev, email, jelszo) VALUES (?, ?, ?)';
        const result = await db.run(sql, [nev, email, hashedPassword]);
        console.log('Adatbázis beszúrás eredménye:', result);

        res.status(201).json({ message: 'Sikeres regisztráció!', userId: result.lastID });
    } catch (error) {
        console.error('Hiba a regisztráció során:', error);
        res.status(500).json({ error: 'Szerveroldali hiba történt.' });
    }
};

// Bejelentkezés
exports.bejelentkezes = async (req, res) => {
    const { email, jelszo } = req.body;
    console.log('Bejelentkezési kérés:', email);

    if (!email || !jelszo) {
        return res.status(400).json({ error: 'Email és jelszó megadása kötelező!' });
    }

    try {
        const db = await getDb();
        const user = await db.get('SELECT * FROM felhasznalo WHERE email = ?', [email]);
        console.log('Adatbázisból lekért felhasználó:', user);
        
        if (!user) {
            console.log('Nincs ilyen felhasználó az adatbázisban.');
            return res.status(401).json({ error: 'Hibás email vagy jelszó!' });
        }

        const isMatch = await bcrypt.compare(jelszo, user.jelszo);
        console.log('Jelszó egyezés:', isMatch);

        if (!isMatch) {
            console.log('Hibás jelszó.');
            return res.status(401).json({ error: 'Hibás email vagy jelszó!' });
        }

        // A 'jogosultsag' a 'szerep' oszlopból jön az adatbázis séma alapján
        res.status(200).json({ message: 'Sikeres bejelentkezés!', felhasznalo_id: user.felhasznalo_id, nev: user.nev, jogosultsag: user.szerep });
    } catch (error) {
        console.error('Hiba a bejelentkezéskor:', error);
        res.status(500).json({ error: 'Szerveroldali hiba történt.' });
    }
};