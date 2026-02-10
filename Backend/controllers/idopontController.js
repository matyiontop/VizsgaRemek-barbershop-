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
