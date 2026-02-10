const getDb = require('../db');

// Időpontok listázása (JOIN-okkal, hogy neveket lássunk ID-k helyett)
exports.getAllAppointments = async (req, res) => {
    try {
        const db = await getDb();
        const sql = `
            SELECT 
                idopont.idopont_id, 
                felhasznalo.nev AS ugyfel_nev, 
                fodrasz.nev AS fodrasz_nev, 
                idopont.fodrasz_id,
                szolgaltatas.tipus AS szolgaltatas_nev, 
                szolgaltatas.ido,
                szolgaltatas.ar,
                idopont.idopont_datuma, 
                idopont.kezdesi_ido,
                idopont.allapot
            FROM idopont
            JOIN felhasznalo ON idopont.felhasznalo_id = felhasznalo.felhasznalo_id
            JOIN fodrasz ON idopont.fodrasz_id = fodrasz.fodrasz_id
            JOIN szolgaltatas ON idopont.szolgaltatas_id = szolgaltatas.szolgaltatas_id
        `;
        const rows = await db.all(sql);
        res.status(200).json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Hiba a listázáskor" });
    }
};

// Új időpont foglalása
exports.createAppointment = async (req, res) => {
    // A React ezeket az adatokat küldi majd
    const { felhasznalo_id, fodrasz_id, szolgaltatas_id, idopont_datuma, kezdesi_ido } = req.body;

    try {
        const db = await getDb();
        // 1. Lekérjük a szolgáltatást
        const szolg = await db.get('SELECT ido FROM szolgaltatas WHERE szolgaltatas_id = ?', [szolgaltatas_id]);
        
        if (!szolg) return res.status(404).json({ error: "Nincs ilyen szolgáltatás" });

        // Az adatbázis séma ('Adatbazis.txt') alapján az 'idopont' táblának nincs 'befejezesi_ido' oszlopa.
        // Ha szeretnéd tárolni, add hozzá az oszlopot a CREATE TABLE parancshoz.
        // Például: befejezesi_ido TEXT
        // A számításhoz használhatod a 'strftime' SQLite függvényt:
        // const befejezesi_ido = await db.get("SELECT strftime('%H:%M:%S', ?, ? || ' minutes')", [kezdesi_ido, szolg.ido]);

        const sql = `
            INSERT INTO idopont 
            (felhasznalo_id, fodrasz_id, szolgaltatas_id, idopont_datuma, kezdesi_ido, allapot) 
            VALUES (?, ?, ?, ?, ?, 'foglalva')
        `;
        
        await db.run(sql, [felhasznalo_id, fodrasz_id, szolgaltatas_id, idopont_datuma, kezdesi_ido]);

        res.status(201).json({ message: "Sikeres foglalás!" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Hiba a mentéskor" });
    }
};

// Időpont törlése
exports.deleteAppointment = async (req, res) => {
    const { id } = req.params;
    try {
        const db = await getDb();
        await db.run('DELETE FROM idopont WHERE idopont_id = ?', [id]);
        res.status(200).json({ message: 'Időpont törölve!' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Hiba a törléskor" });
    }
};

// Belső függvény a tisztításhoz (nem igényel req/res objektumot)
exports.performCleanup = async () => {
    const db = await getDb();
    const sql = "DELETE FROM idopont WHERE idopont_datuma < date('now', '-1 day')";
    return await db.run(sql);
};

// Régi (1 napnál régebbi) időpontok törlése
exports.deleteOldAppointments = async (req, res) => {
    try {
        // Meghívjuk a fenti közös függvényt
        const result = await exports.performCleanup();
        res.status(200).json({ message: 'Régi időpontok törölve!', torolt_adatok: result.changes });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Hiba a tisztításkor" });
    }
};

// Felhasználó saját időpontjainak lekérése
exports.getAppointmentsByUser = async (req, res) => {
    const { id } = req.params;
    try {
        const db = await getDb();
        const sql = `
            SELECT 
                idopont.idopont_id, 
                fodrasz.nev AS fodrasz_nev, 
                szolgaltatas.tipus AS szolgaltatas_nev, 
                szolgaltatas.ar,
                idopont.idopont_datuma, 
                idopont.kezdesi_ido
            FROM idopont
            JOIN fodrasz ON idopont.fodrasz_id = fodrasz.fodrasz_id
            JOIN szolgaltatas ON idopont.szolgaltatas_id = szolgaltatas.szolgaltatas_id
            WHERE idopont.felhasznalo_id = ?
            ORDER BY idopont.idopont_datuma, idopont.kezdesi_ido
        `;
        const rows = await db.all(sql, [id]);
        res.status(200).json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Hiba a lekérdezéskor" });
    }
};

// Időpont lemondása (User által, 24 órás szabállyal)
exports.cancelAppointment = async (req, res) => {
    const { id } = req.params;

    try {
        const db = await getDb();
        
        // 1. Időpont adatainak lekérése az időellenőrzéshez
        const appointment = await db.get('SELECT idopont_datuma, kezdesi_ido FROM idopont WHERE idopont_id = ?', [id]);
        
        if (!appointment) {
            return res.status(404).json({ error: "Az időpont nem található." });
        }

        // 2. 24 órás szabály ellenőrzése
        const appointmentDate = new Date(`${appointment.idopont_datuma}T${appointment.kezdesi_ido}`);
        const now = new Date();
        // Különbség milliszekundumban -> órában
        const diffInHours = (appointmentDate - now) / (1000 * 60 * 60);

        if (diffInHours < 24) {
            return res.status(400).json({ error: "A foglalás csak legalább 24 órával az időpont előtt mondható le." });
        }

        // 3. Logolás
        console.log(`[LEMONDÁS] Időpont ID: ${id} lemondva a felhasználó által.`);

        // 4. Törlés
        await db.run('DELETE FROM idopont WHERE idopont_id = ?', [id]);
        
        res.status(200).json({ message: 'Időpont sikeresen lemondva.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Hiba a lemondáskor" });
    }
};
