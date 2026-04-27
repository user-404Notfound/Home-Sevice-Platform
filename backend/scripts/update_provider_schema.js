const pool = require('../db');
const bcrypt = require('bcryptjs');

async function updateProviderSchema() {
  try {
    console.log('Adding password_hash to service_providers...');
    await pool.query(`
      ALTER TABLE service_providers ADD COLUMN IF NOT EXISTS password_hash TEXT;
    `);
    
    console.log('Generating default passwords for existing providers...');
    const providers = await pool.query('SELECT provider_id FROM service_providers WHERE password_hash IS NULL');
    
    if (providers.rows.length > 0) {
      const salt = await bcrypt.genSalt(10);
      const defaultHash = await bcrypt.hash('password123', salt);
      
      for (let p of providers.rows) {
        await pool.query('UPDATE service_providers SET password_hash = $1 WHERE provider_id = $2', [defaultHash, p.provider_id]);
      }
      console.log(`Updated passwords for ${providers.rows.length} providers. Default password is 'password123'`);
    } else {
      console.log('No providers needed a password update.');
    }
    
    console.log('Database updated successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Error updating schema:', error);
    process.exit(1);
  }
}

updateProviderSchema();
