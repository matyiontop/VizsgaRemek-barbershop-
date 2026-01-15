const db = require('../db');

exports.getAllServices = async (req, res) => {
    try {
        // Lekérjük az összes szolgáltatást az adatbázisból
        const [rows] = await db.query('SELECT * FROM szolgáltatás');
        res.status(200).json(rows);
    } catch (error) {
        console.error('Hiba a szolgáltatások lekérdezésekor:', error);
        res.status(500).json({ error: 'Szerveroldali hiba' });
    }
};