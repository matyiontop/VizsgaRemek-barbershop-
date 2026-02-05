const getDb = require('../db');

exports.getWorkHours = async (req, res) => {
    try {
        const db = await getDb();
        const rows = await db.all('SELECT * FROM munkaido');
        res.status(200).json(rows);
    } catch (error) {
        console.error('Hiba a munkaidő lekérdezésekor:', error);
        res.status(500).json({ error: 'Szerveroldali hiba' });
    }
};