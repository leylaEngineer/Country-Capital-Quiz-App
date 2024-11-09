import fs from 'fs';
import path from 'path';
import pg from 'pg';
import fastcsv from 'fast-csv';
import { fileURLToPath } from 'url';

// Get the directory name from the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

        const filePath = path.join(__dirname, 'capitals.csv');

        const promises = []; // Array to hold promises

        fs.createReadStream(filePath)
            .pipe(fastcsv.parse({ headers: true }))
            .on('data', (row) => {
                const { country, capital } = row;
                // Push each insert promise to the array
                promises.push(
                    db.query(
                        'INSERT INTO capitals (country, capital) VALUES ($1, $2) ON CONFLICT (country) DO NOTHING',
                        [country, capital]
                    )
                );
            })
            .on('end', async () => {
                console.log('CSV file successfully processed');
                // Wait for all insert operations to complete
                await Promise.all(promises);
                console.log('All data inserted successfully');
                await db.end(); // Close the connection here
            })
            .on('error', async (error) => {
                console.error("Error processing CSV file", error);
                await db.end(); // Close connection on error
            });
    } catch (err) {
        console.error("Error connecting to the database", err);
        await db.end(); // Ensure connection is closed on error
    }
}

importCapitals();