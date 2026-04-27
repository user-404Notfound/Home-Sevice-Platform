const pool = require('./db');

async function alterCart() {
  try {
    console.log('Altering cart_items table...');
    
    await pool.query(`
      ALTER TABLE cart_items 
      ADD COLUMN IF NOT EXISTS provider_id INTEGER REFERENCES service_providers(provider_id) ON DELETE CASCADE,
      ADD COLUMN IF NOT EXISTS service_id INTEGER REFERENCES services(service_id) ON DELETE CASCADE;
    `);

    console.log('Successfully added provider_id and service_id to cart_items!');
    process.exit(0);
  } catch (err) {
    console.error('Error altering table:', err);
    process.exit(1);
  }
}

alterCart();
