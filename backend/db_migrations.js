const pool = require('./db');

async function migrate() {
    try {
        console.log("Starting db migration...");
        await pool.query(`
            CREATE TABLE IF NOT EXISTS provider_subservices (
                id SERIAL PRIMARY KEY,
                provider_id INT REFERENCES service_providers(provider_id) ON DELETE CASCADE,
                service_id INT REFERENCES services(service_id) ON DELETE CASCADE,
                subservice_id INT REFERENCES subservices(subservice_id) ON DELETE CASCADE,
                custom_name VARCHAR(255),
                price DECIMAL
            );
        `);
        console.log("provider_subservices table created successfully!");
        process.exit(0);
    } catch(err) {
        console.error("Migration failed:", err);
        process.exit(1);
    }
}

migrate();
