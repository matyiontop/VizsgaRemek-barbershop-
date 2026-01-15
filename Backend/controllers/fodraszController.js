const db = require('../db');

exports.getAllHairdressers = async (req, res) => {
    try {
        // Lekérjük az összes fodrászt
        const [rows] = await db.query('SELECT * FROM fodrász');
        res.status(200).json(rows);
    } catch (error) {
        console.error('Hiba a fodrászok lekérdezésekor:', error);
        res.status(500).json({ error: 'Szerveroldali hiba' });
    }
};