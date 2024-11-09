import pg from 'pg';

const db = new pg.Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

async function createTable() {
    try {
        await db.connect();
        console.log("Connected to the database");

        const createTableQuery = `
            CREATE TABLE IF NOT EXISTS capitals (
                id SERIAL PRIMARY KEY,
                country VARCHAR(100) UNIQUE,
                capital VARCHAR(100)
            );
        `;

        await db.query(createTableQuery);
        console.log("Capitals table created or already exists");
    } catch (err) {
        console.error("Error creating table", err);
    } finally {
        await db.end();
    }
}

createTable();