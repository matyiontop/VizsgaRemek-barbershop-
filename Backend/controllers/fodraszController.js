const getDb = require('../db');

exports.getAllHairdressers = async (req, res) => {
    try {
        const db = await getDb();
        // Lekérjük az összes fodrászt
        const rows = await db.all('SELECT * FROM fodrasz');
        res.status(200).json(rows);
    } catch (error) {
        console.error('Hiba a fodrászok lekérdezésekor:', error);
        res.status(500).json({ error: 'Szerveroldali hiba' });
    }
};