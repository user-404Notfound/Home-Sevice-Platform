const pool = require('./db');

async function seedFlowData() {
  try {
    console.log('Starting seed for Providers and Subservices...');

    // 1. Clear existing data
    await pool.query('DELETE FROM provider_services;');
    await pool.query('DELETE FROM subservices;');
    await pool.query('DELETE FROM service_providers;');
    await pool.query('DELETE FROM reviews;');

    await pool.query('ALTER SEQUENCE service_providers_provider_id_seq RESTART WITH 1;');
    await pool.query('ALTER SEQUENCE subservices_subservice_id_seq RESTART WITH 1;');

    // 2. Insert Service Providers
    const providers = [
      { name: "John's Elite Cleaning", email: "john@elitecleaning.com", phone: "+1234567890", city: "New York", area: "Downtown", desc: "Top-rated cleaning professionals." },
      { name: "Sarah Fixes", email: "sarah@fixes.com", phone: "+1987654321", city: "New York", area: "Brooklyn", desc: "Expert in home improvements and repairs." },
      { name: "Quick AC Techs", email: "support@quickactechs.com", phone: "+1122334455", city: "New York", area: "Queens", desc: "Certified AC technicians with 10+ years experience." },
      { name: "Pest Busters", email: "hello@pestbusters.org", phone: "+1555666777", city: "New York", area: "Manhattan", desc: "Guaranteed pest elimination." },
      { name: "Apex Relocation", email: "move@apex.com", phone: "+1888999000", city: "New York", area: "All", desc: "Safe and secure moving services." }
    ];

    console.log('Inserting Providers...');
    for (let p of providers) {
      await pool.query(
        'INSERT INTO service_providers (name, email, phone, city, area, description) VALUES ($1, $2, $3, $4, $5, $6)',
        [p.name, p.email, p.phone, p.city, p.area, p.desc]
      );
    }

    // 3. Map Providers to Services and ADD REVIEWS!
    // Categories/Services reference: 
    // 1: Deep Home Cleaning, 2: Pest Control & Removal, 3: AC Service
    // 4: Washing Machine Repair, 5: Wiring, 6: Fans, 7: Home Relocation
    console.log('Mapping Providers to Services...');
    const mappings = [
      // John -> Deep Home Cleaning (1)
      { provider_id: 1, service_id: 1, base_price: 50.00, experience: 8, rating: 4.8 },
      // Sarah -> Deep Home Cleaning (1)
      { provider_id: 2, service_id: 1, base_price: 45.00, experience: 3, rating: 4.2 },
      
      // Pest Busters -> Pest Control (2)
      { provider_id: 4, service_id: 2, base_price: 80.00, experience: 12, rating: 5.0 },
      // John -> Pest Control (2)
      { provider_id: 1, service_id: 2, base_price: 60.00, experience: 8, rating: 4.0 },

      // Quick AC Techs -> AC Service (3)
      { provider_id: 3, service_id: 3, base_price: 30.00, experience: 10, rating: 4.9 },
      // Sarah -> AC Service (3)
      { provider_id: 2, service_id: 3, base_price: 35.00, experience: 5, rating: 4.5 },
      
      // Apex Relocation -> Relocation (7)
      { provider_id: 5, service_id: 7, base_price: 200.00, experience: 15, rating: 4.7 }
    ];

    for (let m of mappings) {
      await pool.query(
        'INSERT INTO provider_services (provider_id, service_id, base_price, experience_years) VALUES ($1, $2, $3, $4)',
        [m.provider_id, m.service_id, m.base_price, m.experience]
      );
      
      // Add dummy review for rating calc test! (User id 1 might not exist, but let's insert a dummy user if needed or just skip user fk safely if possible)
      // Actually `reviews` has `user_id` FK, let's just insert one user first
    }

    // Ensure dummy user exists for review simulation
    try {
      await pool.query("INSERT INTO users (user_id, name, email, phone, password_hash) VALUES (999, 'Dummy', 'dummy@dummy.com', '00000', 'hash') ON CONFLICT DO NOTHING;");
      
      for (let m of mappings) {
          await pool.query(
            "INSERT INTO reviews (user_id, provider_id, rating, comment) VALUES ($1, $2, $3, 'Great service!')",
            [999, m.provider_id, Math.round(m.rating)]
          );
      }
    } catch(e) { console.log('Skipping reviews, FK issue with user'); }

    // 4. Insert Subservices for Deep Cleaning (Service 1) and AC Service (Service 3)
    console.log('Inserting Subservices...');
    const subservices = [
      // Deep Cleaning (1)
      { service_id: 1, name: "1 BHK Empty Flat Cleaning", price: 120.00, desc: "Full deep cleaning of 1 bedroom, 1 bathroom, and kitchen." },
      { service_id: 1, name: "2 BHK Furnished Deep Cleaning", price: 180.00, desc: "Intensive cleaning including sofa shampooing." },
      { service_id: 1, name: "Premium Bathroom Cleaning", price: 40.00, desc: "Hard water stain removal and tile scrubbing." },
      
      // AC Service (3)
      { service_id: 3, name: "Foam Jet Cleaning (Split AC)", price: 25.00, desc: "Deep cleaning of filters and indoor unit using pressurized foam." },
      { service_id: 3, name: "AC Gas Leak Fix & Refill", price: 45.00, desc: "Locating leakages, brazing, and complete R32/R410 refill." },
      { service_id: 3, name: "AC Installation / Uninstallation", price: 30.00, desc: "Professional mounting or removal of AC unit." }
    ];

    for (let sub of subservices) {
      await pool.query(
        'INSERT INTO subservices (service_id, name, price, description) VALUES ($1, $2, $3, $4)',
        [sub.service_id, sub.name, sub.price, sub.desc]
      );
    }

    console.log('Successfully seeded Providers, Mappings, and Subservices!');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding data:', err);
    process.exit(1);
  }
}

seedFlowData();
