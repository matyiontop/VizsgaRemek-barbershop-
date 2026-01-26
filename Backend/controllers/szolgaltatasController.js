const getDb = require('../db');

exports.getAllServices = async (req, res) => {
    try {
        const db = await getDb();
        // Lekérjük az összes szolgáltatást az adatbázisból
        const rows = await db.all('SELECT * FROM szolgaltatas');
        res.status(200).json(rows);
    } catch (error) {
        console.error('Hiba a szolgáltatások lekérdezésekor:', error);
        res.status(500).json({ error: 'Szerveroldali hiba' });
    }
};