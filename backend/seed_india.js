const pool = require('./db');

// --- DATA DICTIONARIES ---
const firstNames = ["Rahul", "Priya", "Amit", "Sneha", "Vikram", "Anjali", "Suresh", "Ramesh", "Pooja", "Arjun", "Neha", "Manoj", "Kavita", "Sanjay", "Riya", "Karan", "Kirti", "Deepak", "Aarti", "Gaurav", "Nitin", "Shweta", "Rajesh", "Nisha", "Rohan", "Meera", "Sameer", "Tanvi", "Vishal", "Sonali"];
const lastNames = ["Patil", "Sharma", "Deshmukh", "Kadam", "Joshi", "Pawar", "Kale", "Gaikwad", "Shinde", "Jadhav", "Bhosale", "Chavan", "Wagh", "Thakur", "Singh", "Yadav", "Verma", "Gupta", "Dixit", "Rathod", "Dubey", "Pandey"];

const mumbaiLocations = ["Andheri", "Bandra", "Powai", "Borivali", "Goregaon", "Juhu", "Kandivali", "Malad", "Colaba", "Worli"];
const puneLocations = ["Kothrud", "Wakad", "Baner", "Kharadi", "Hinjewadi", "Viman Nagar", "Aundh", "Hadapsar", "Kalyani Nagar", "Magarpatta"];

// Prices in INR
const basePrices = [199, 249, 299, 349, 399, 449, 499, 599, 799, 999];

// Review text pool
const reviewComments = [
  "Excellent service, very professional.",
  "Did a decent job but arrived 15 mins late.",
  "Absolutely fantastic! Highly recommend.",
  "Good work, reasonable pricing.",
  "Very polite and got the job done quickly.",
  "Average service, could be better.",
  "Best professional I've hired so far.",
  "Okay experience, nothing special.",
  "The cleanup afterwards was amazing.",
  "Very knowledgeable and fixed the issue easily."
];

// Subservices configurations for the 12 existing services mapped in previous seed
const subserviceConfig = {
  1: [ // Deep Home Cleaning
    { name: "1 BHK Empty Flat Cleaning", price: 2999, desc: "Full deep cleaning of 1 bedroom, bathroom, and kitchen." },
    { name: "2 BHK Furnished Deep Cleaning", price: 4499, desc: "Intensive cleaning including sofa vacuuming." },
    { name: "3 BHK Premium Deep Cleaning", price: 5999, desc: "Includes floor scrubbing and bathroom scaling removal." },
    { name: "Bathroom Deep Clean", price: 599, desc: "Hard water stain removal, tile & grout scrubbing." }
  ],
  2: [ // Pest Control
    { name: "Cockroach & Ant Control (1 BHK)", price: 899, desc: "Gel and spray treatment." },
    { name: "Termite Control (Per Sq Ft)", price: 15, desc: "Drill-fill-seal anti-termite treatment." },
    { name: "Bed Bug Control", price: 1499, desc: "Intensive spray treatment (requires 2 visits)." }
  ],
  3: [ // AC Service
    { name: "AC Foam Jet Cleaning", price: 599, desc: "Deep cleaning of IDU & ODU." },
    { name: "AC Gas Leak Fix & Refill", price: 2499, desc: "Nitrogen testing, brazing, and R32/R410 refill." },
    { name: "AC Installation", price: 1499, desc: "Professional mounting of Split AC unit." }
  ],
  4: [ // Washing Machine
    { name: "Fully Automatic Checkup", price: 299, desc: "Diagnosis of drum, motor, or drainage issues." },
    { name: "Washing Machine Installation", price: 499, desc: "Connecting inlet and outlet pipes safely." },
    { name: "Drum Descaling & Wash", price: 799, desc: "Deep chemical cleaning of washing machine drum." }
  ],
  5: [ // Wiring
    { name: "MCB Box Installation", price: 1200, desc: "Proper fitting and wiring of distribution board." },
    { name: "Switchboard Replacement", price: 250, desc: "Replacing completely burnt or old switchboards." },
    { name: "Inverter Setup", price: 899, desc: "Installing inverter and battery with home wiring." }
  ],
  6: [ // Fans & Lighting
    { name: "Ceiling Fan Installation", price: 299, desc: "Safe ceiling mounting and regulator connection." },
    { name: "Chandelier Hanging", price: 799, desc: "Heavy chandelier bracket fixing and wiring." },
    { name: "LED Tube/Bulb Fitting", price: 150, desc: "Quick installation of wall lighting units." }
  ],
  7: [ // Movers & Storage
    { name: "1 BHK Relocation within City", price: 5500, desc: "Packing, loading, moving, and unloading." },
    { name: "2 BHK Relocation within City", price: 8500, desc: "Includes bubble wrapping fragile items." },
    { name: "Tempo Truck Rental", price: 1500, desc: "Base fare for small goods transport." }
  ],
  8: [ // Vaults
    { name: "100 SqFt Storage (1 Month)", price: 4000, desc: "Secure, CCTV-monitored warehouse storage." },
    { name: "Box Storage (5 boxes/Month)", price: 999, desc: "Safe keeping for household luggage boxes." }
  ],
  9: [ // Furniture Assembly
    { name: "Bed Assembly", price: 599, desc: "King/Queen size wooden or metal bed assembly." },
    { name: "Wardrobe Assembly (3 Door)", price: 999, desc: "Hinges, doors, and shelf alignment." },
    { name: "Office Table Setup", price: 399, desc: "Quick modular desk assembly." }
  ],
  10: [ // Drilling
    { name: "Standard TV Mounting (Up to 55\")", price: 499, desc: "Wall mounting bracket installation." },
    { name: "Shelf & Picture Frame Drilling", price: 199, desc: "Drilling up to 5 holes for home decor." },
    { name: "Mirror Hanging", price: 299, desc: "Safe bathroom or vanity mirror mounting." }
  ],
  11: [ // Painting
    { name: "1 BHK Fresh Painting", price: 8500, desc: "Primer + 2 coats of Premium Emulsion." },
    { name: "Textured Wall Accent", price: 3500, desc: "Designer stencil or textured finish per wall." },
    { name: "Dampness/Waterproofing Fix", price: 2500, desc: "Scraping, waterproofing chemical, and repainting." }
  ],
  12: [ // Bath Remodeling
    { name: "Full Bathroom Tiling Set", price: 15000, desc: "Removal of old tiles and laying new wall/floor tiles (Labor)." },
    { name: "Western Toilet Installation", price: 1800, desc: "Plumbing alignment and commode fixing." },
    { name: "Washbasin & Mirror Vanity", price: 1200, desc: "Mounting and connecting drainage." }
  ]
};

// --- UTILS ---
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randElem = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randDec = (min, max) => (Math.random() * (max - min) + min).toFixed(1);

async function seedIndianData() {
  try {
    console.log('STARTING MEGA SEED: localized to Mumbai/Pune (INR)...');

    // 1. CLEAR EXISTING DYNAMIC TABLES
    console.log('Clearing old provider logic...');
    await pool.query('DELETE FROM reviews;');
    await pool.query('DELETE FROM provider_services;');
    await pool.query('DELETE FROM subservices;');
    await pool.query('DELETE FROM service_providers;');

    await pool.query('ALTER SEQUENCE service_providers_provider_id_seq RESTART WITH 1;');
    await pool.query('ALTER SEQUENCE subservices_subservice_id_seq RESTART WITH 1;');
    await pool.query('ALTER SEQUENCE reviews_review_id_seq RESTART WITH 1;');

    // 2. GENERATE AND INSERT 75 PROVIDERS
    const NUM_PROVIDERS = 75;
    console.log(`Generating ${NUM_PROVIDERS} Indian Providers...`);
    
    for (let i = 1; i <= NUM_PROVIDERS; i++) {
        const fn = randElem(firstNames);
        const ln = randElem(lastNames);
        const fullName = `${fn} ${ln}`;
        const phone = `+91 ${randInt(9000, 9999)}${randInt(100000, 999999)}`;
        const email = `${fn.toLowerCase()}.${ln.toLowerCase()}${randInt(10, 999)}@gmail.com`;
        
        const isMumbai = Math.random() > 0.5;
        const city = isMumbai ? "Mumbai" : "Pune";
        const area = isMumbai ? randElem(mumbaiLocations) : randElem(puneLocations);
        
        const descWords = ["Reliable and fast.", "Specialist with attention to detail.", "Verified professional expert.", "Trusted by hundreds in the area.", "Top-rated local expert.", "Quality guaranteed every single time."];
        const desc = randElem(descWords);

        await pool.query(
            'INSERT INTO service_providers (name, email, phone, city, area, description) VALUES ($1, $2, $3, $4, $5, $6)',
            [fullName, email, phone, city, area, desc]
        );
    }

    // 3. MAP PROVIDERS TO SERVICES (Multiple services per provider)
    // We have 12 unique services. Each provider will map to 1-3 services.
    console.log('Mapping providers to platform services safely...');
    let mappingCount = 0;
    
    for (let pId = 1; pId <= NUM_PROVIDERS; pId++) {
        const numServices = randInt(1, 3);
        const selectedServices = new Set();
        
        while(selectedServices.size < numServices) {
            selectedServices.add(randInt(1, 12));
        }

        for (let sId of selectedServices) {
            const bp = randElem(basePrices);
            const exp = randInt(2, 15);
            
            await pool.query(
                'INSERT INTO provider_services (provider_id, service_id, base_price, experience_years) VALUES ($1, $2, $3, $4)',
                [pId, sId, bp, exp]
            );
            mappingCount++;
        }
    }
    console.log(`Created ${mappingCount} unique Provider-to-Service mappings.`);

    // 4. GENERATE 300+ REVIEWS
    console.log('Generating realistic reviews...');
    try {
        await pool.query("INSERT INTO users (user_id, name, email, phone, password_hash) VALUES (999, 'Dummy Client', 'client@test.com', '9999999999', 'hash') ON CONFLICT DO NOTHING;");
    } catch(e) {}

    const NUM_REVIEWS = 350;
    for (let i = 0; i < NUM_REVIEWS; i++) {
        const pId = randInt(1, NUM_PROVIDERS);
        let rating;
        const chance = Math.random();
        // Weighted for good ratings as typical for marketplaces
        if(chance < 0.6) rating = 5;
        else if (chance < 0.85) rating = 4;
        else if (chance < 0.95) rating = 3;
        else rating = randInt(1, 2);

        const review = randElem(reviewComments);

        await pool.query(
            'INSERT INTO reviews (user_id, provider_id, rating, comment) VALUES ($1, $2, $3, $4)',
            [999, pId, rating, review]
        );
    }

    // 5. INSERT SUBSERVICES (Full INR configurations across all 12 platform categories)
    console.log('Injecting Subservices (INR Pricing) for all 12 categories...');
    for (let serviceId = 1; serviceId <= 12; serviceId++) {
        const subs = subserviceConfig[serviceId] || [];
        for (let sub of subs) {
            await pool.query(
                'INSERT INTO subservices (service_id, name, price, description) VALUES ($1, $2, $3, $4)',
                [serviceId, sub.name, sub.price, sub.desc]
            );
        }
    }

    console.log(`=========================================`);
    console.log(`INDIAN MEGA SEED COMPLETE!`);
    console.log(`=========================================`);
    process.exit(0);
    
  } catch (err) {
    console.error('Mega Seed Error:', err);
    process.exit(1);
  }
}

seedIndianData();
