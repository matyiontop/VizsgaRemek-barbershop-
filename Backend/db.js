// db.js
require('dotenv').config();

// Környezeti változók betöltése a .env fájlból
const ACCOUNT_ID = process.env.CF_ACCOUNT_ID;
const DATABASE_ID = process.env.CF_DATABASE_ID;
const API_TOKEN = process.env.CF_API_TOKEN;

if (!ACCOUNT_ID || !DATABASE_ID || !API_TOKEN) {
    console.error("HIBA: Hiányzó Cloudflare adatok a .env fájlból (CF_ACCOUNT_ID, CF_DATABASE_ID, CF_API_TOKEN)!");
}

// Segédfüggvény a Cloudflare API hívásához
async function executeD1(sql, params = []) {
    const url = `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/d1/database/${DATABASE_ID}/query`;
    console.log(`[DB REQUEST] SQL: ${sql} | Params: ${JSON.stringify(params)}`);
    
    try {
        // Node.js 18+ verzióban a 'fetch' már beépített
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${API_TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ sql, params })
        });

        const data = await response.json();

        if (!data.success) {
            throw new Error(`Cloudflare D1 API Hiba: ${JSON.stringify(data.errors)}`);
        }

        console.log(`[DB RESPONSE] Success: ${data.success} | Rows: ${data.result[0].results ? data.result[0].results.length : 0}`);

        // A D1 API válasza egy tömb, az első elem az eredmény
        return data.result[0]; 
    } catch (error) {
        console.error("Hiba az adatbázis kérés során:", error);
        throw error;
    }
}

// A controller-ek számára biztosítjuk a megszokott felületet (all, get, run)
const dbInterface = {
    all: async (sql, params) => {
        const result = await executeD1(sql, params);
        return result.results || [];
    },
    get: async (sql, params) => {
        const result = await executeD1(sql, params);
        return (result.results && result.results.length > 0) ? result.results[0] : undefined;
    },
    run: async (sql, params) => {
        const result = await executeD1(sql, params);
        return { 
            lastID: result.meta ? result.meta.last_row_id : null, // D1 így adja vissza az ID-t
            changes: result.meta ? result.meta.changes : 0
        };
    }
};

module.exports = async () => dbInterface;