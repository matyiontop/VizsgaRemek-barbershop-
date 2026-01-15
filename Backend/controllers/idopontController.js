const db = require('../db');

// Időpontok listázása (JOIN-okkal, hogy neveket lássunk ID-k helyett)
exports.getAllAppointments = async (req, res) => {
    try {
        const sql = `
            SELECT 
                időpont.időpont_id, 
                ügyfél.név AS ugyfel_nev, 
                fodrász.fodrász_id, 
                szolgáltatás.típus AS szolgaltatas_nev, 
                szolgáltatás.ár,
                időpont.időpont_dátuma, 
                időpont.kezdési_idő,
                időpont.befejezési_idő,
                időpont.állapot
            FROM időpont
            JOIN ügyfél ON időpont.ügyfél_id = ügyfél.ugyfel_id
            JOIN fodrász ON időpont.fodrász_id = fodrász.fodrász_id
            JOIN szolgáltatás ON időpont.szolgáltatás_id = szolgáltatás.szolgáltatás_id
        `;
        const [rows] = await db.query(sql);
        res.status(200).json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Hiba a listázáskor" });
    }
};

// Új időpont foglalása
exports.createAppointment = async (req, res) => {
    // A React ezeket az adatokat küldi majd
    const { ugyfel_id, fodrasz_id, szolgaltatas_id, datum, kezdes } = req.body;

    try {
        // 1. Lekérjük, mennyi ideig tart a szolgáltatás (a diagramod alapján a 'szolgáltatás' táblában van 'idő' oszlop)
        const [szolg] = await db.query('SELECT idő FROM szolgáltatás WHERE szolgáltatás_id = ?', [szolgaltatas_id]);
        
        if (szolg.length === 0) return res.status(404).json({ error: "Nincs ilyen szolgáltatás" });

        const idotartam = szolg[0].idő; // pl. 30 (perc)

        // 2. Kiszámoljuk a befejezési időt
        // (Ez egy egyszerűsített megoldás, a vizsgán lehet, hogy elég szövegként kezelni az időt, 
        // de profibb, ha Date objektummal számolsz. Most maradjunk az egyszerűségnél:)
        // Tipp: A MySQL 'ADDTIME' függvényét is használhatnánk, de most egyszerűsítsünk:
        
        // SQL beszúrás a diagram szerinti oszlopnevekkel
        const sql = `
            INSERT INTO időpont 
            (ügyfél_id, fodrász_id, szolgáltatás_id, időpont_dátuma, kezdési_idő, befejezési_idő, állapot) 
            VALUES (?, ?, ?, ?, ?, ADDTIME(?, SEC_TO_TIME(? * 60)), 'foglalt')
        `;
        
        // Itt a MySQL-re bízzuk az idő összeadását (ADDTIME)
        await db.query(sql, [ugyfel_id, fodrasz_id, szolgaltatas_id, datum, kezdes, kezdes, idotartam]);

        res.status(201).json({ message: "Sikeres foglalás!" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Hiba a mentéskor" });
    }
};
