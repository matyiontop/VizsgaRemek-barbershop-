const bcrypt = require('bcrypt');
const getDb = require('../db');

// Új ügyfél regisztrálása
exports.regisztracio = async (req, res) => {
    const nev = req.body.nev ? req.body.nev.trim() : null;
    const email = req.body.email ? req.body.email.trim().toLowerCase() : null;
    const jelszo = req.body.jelszo;
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
        // Explicit módon beállítjuk a 'szerep' oszlopot 'U'-ra (User)
        const sql = 'INSERT INTO felhasznalo (nev, email, jelszo, szerep, engedely) VALUES (?, ?, ?, ?, ?)';
        const result = await db.run(sql, [nev, email, hashedPassword, 'U', 1]);
        console.log('Adatbázis beszúrás eredménye:', result);

        res.status(201).json({ message: 'Sikeres regisztráció!', userId: result.lastID });
    } catch (error) {
        console.error('Hiba a regisztráció során:', error);
        res.status(500).json({ error: 'Szerveroldali hiba történt.' });
    }
};

// Bejelentkezés
exports.bejelentkezes = async (req, res) => {
    const email = req.body.email ? req.body.email.trim().toLowerCase() : null;
    const jelszo = req.body.jelszo;
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

        // Ellenőrizzük, hogy a felhasználó le van-e tiltva
        if (user.engedely === 0) {
            return res.status(403).json({ error: 'A fiókod le van tiltva!' });
        }

        // A 'jogosultsag' a 'szerep' oszlopból jön az adatbázis séma alapján
        res.status(200).json({ message: 'Sikeres bejelentkezés!', felhasznalo_id: user.felhasznalo_id, nev: user.nev, jogosultsag: user.szerep });
    } catch (error) {
        console.error('Hiba a bejelentkezéskor:', error);
        res.status(500).json({ error: 'Szerveroldali hiba történt.' });
    }
};

// --- ADMIN FUNKCIÓK ---

// Összes felhasználó lekérése
exports.getAllUsers = async (req, res) => {
    try {
        const db = await getDb();
        const users = await db.all('SELECT felhasznalo_id, nev, email, szerep, engedely FROM felhasznalo');
        res.status(200).json(users);
    } catch (error) {
        console.error('Hiba a felhasználók lekérdezésekor:', error);
        res.status(500).json({ error: 'Szerveroldali hiba' });
    }
};

// Felhasználó módosítása (Név, Email, Jelszó, Szerep/Tiltás)
exports.updateUser = async (req, res) => {
    const { id } = req.params;
    const { nev, email, jelszo, szerep, engedely } = req.body;

    try {
        const db = await getDb();
        
        if (jelszo && jelszo.trim() !== "") {
            // Ha van új jelszó, azt is frissítjük (hash-elve)
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(jelszo, saltRounds);
            
            await db.run(
                'UPDATE felhasznalo SET nev = ?, email = ?, jelszo = ?, szerep = ?, engedely = ? WHERE felhasznalo_id = ?',
                [nev, email, hashedPassword, szerep, engedely, id]
            );
        } else {
            // Ha nincs jelszó, csak a többi adatot frissítjük
            await db.run(
                'UPDATE felhasznalo SET nev = ?, email = ?, szerep = ?, engedely = ? WHERE felhasznalo_id = ?',
                [nev, email, szerep, engedely, id]
            );
        }

        res.status(200).json({ message: 'Sikeres módosítás!' });
    } catch (error) {
        console.error('Hiba a módosításkor:', error);
        res.status(500).json({ error: 'Szerveroldali hiba' });
    }
};

// Felhasználó törlése
exports.deleteUser = async (req, res) => {
    const { id } = req.params;
    try {
        const db = await getDb();
        await db.run('DELETE FROM felhasznalo WHERE felhasznalo_id = ?', [id]);
        res.status(200).json({ message: 'Sikeres törlés!' });
    } catch (error) {
        console.error('Hiba a törléskor:', error);
        res.status(500).json({ error: 'Szerveroldali hiba' });
    }
};