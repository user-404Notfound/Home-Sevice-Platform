const pool = require('./db');

async function seedDatabase() {
  try {
    console.log('Starting execution...');

    // 1. Alter the services table to add visual elements
    console.log('Altering services table to include UI elements...');
    await pool.query(`
      ALTER TABLE services ADD COLUMN IF NOT EXISTS icon VARCHAR(10);
      ALTER TABLE services ADD COLUMN IF NOT EXISTS is_popular BOOLEAN DEFAULT false;
    `);

    // 2. Clear existing data to prevent conflicts during seeding
    console.log('Clearing old mocked data if any...');
    await pool.query(`DELETE FROM services;`);
    await pool.query(`DELETE FROM categories;`);

    // Reset sequences so IDs look clean
    await pool.query(`ALTER SEQUENCE categories_category_id_seq RESTART WITH 1;`);
    await pool.query(`ALTER SEQUENCE services_service_id_seq RESTART WITH 1;`);

    // 3. Insert Categories
    console.log('Inserting Categories...');
    await pool.query(`
      INSERT INTO categories (category_name) VALUES 
      ('Cleaning & Pest Control'),
      ('Appliance Repair'),
      ('Electrical Services'),
      ('Movers & Storage'),
      ('Handyman Services'),
      ('Painting & Wall Makeover'),
      ('Renovation & fabrication');
    `);

    // 4. Insert Services
    console.log('Inserting Services mapping to Categories...');
    const services = [
      { category: 1, name: "Deep Home Cleaning", desc: "Intensive 360° deep cleaning of all rooms, bathrooms, and kitchen.", icon: "✨", pop: true },
      { category: 1, name: "Pest Control & Removal", desc: "Safe, chemical-free removal of bugs, rodents, and termites.", icon: "🛡️", pop: false },
      { category: 2, name: "AC Service & Repair", desc: "Expert diagnostics, deep cleaning, and gas refilling for all brands.", icon: "❄️", pop: true },
      { category: 2, name: "Washing Machine Repair", desc: "Fixing drums, motors, and drainage systems reliably.", icon: "🧺", pop: false },
      { category: 3, name: "Wiring & Switchboards", desc: "Complete home rewiring and MCB box installation.", icon: "⚡", pop: false },
      { category: 3, name: "Fans & Lighting", desc: "Installation of ceiling fans, chandeliers, and wall lighting.", icon: "💡", pop: false },
      { category: 4, name: "Full Home Relocation", desc: "Safe packing, moving, and unpacking handled end-to-end.", icon: "📦", pop: true },
      { category: 4, name: "Secure Storage Vaults", desc: "Climate-controlled temporary storage for your belongings.", icon: "🏗️", pop: false },
      { category: 5, name: "Furniture Assembly", desc: "Quick and structurally sound IKEA and custom furniture assembly.", icon: "🪑", pop: false },
      { category: 5, name: "Drilling & TV Mounting", desc: "Televisions, shelves, and heavy frames properly mounted.", icon: "🔨", pop: false },
      { category: 6, name: "Interior Painting", desc: "Premium textured finishes and flat wall painting services.", icon: "🎨", pop: false },
      { category: 7, name: "Bathroom Remodeling", desc: "Full overhaul of tiling, plumbing, and aesthetic fixtures.", icon: "🚿", pop: true },
    ];

    for (let s of services) {
      await pool.query(
        'INSERT INTO services (category_id, service_name, description, icon, is_popular) VALUES ($1, $2, $3, $4, $5)',
        [s.category, s.name, s.desc, s.icon, s.pop]
      );
    }

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
