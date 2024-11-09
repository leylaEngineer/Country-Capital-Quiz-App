import fs from 'fs';
import path from 'path';
import pg from 'pg';
import fastcsv from 'fast-csv';

const db = new pg.Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

async function importCapitals() {
    try {
        await db.connect();
        console.log("Connected to the database");

        const filePath = path.join(__dirname, 'capitals.csv'); // Adjust the path if necessary

        fs.createReadStream(filePath)
            .pipe(fastcsv.parse({ headers: true }))
            .on('data', async (row) => {
                const { country, capital } = row;
                await db.query(
                    'INSERT INTO capitals (country, capital) VALUES ($1, $2) ON CONFLICT (country) DO NOTHING',
                    [country, capital]
                );
            })
            .on('end', () => {
                console.log('CSV file successfully processed');
                db.end();
            })
            .on('error', (error) => {
                console.error("Error processing CSV file", error);
                db.end();
            });
    } catch (err) {
        console.error("Error connecting to the database", err);
    }
}

importCapitals();