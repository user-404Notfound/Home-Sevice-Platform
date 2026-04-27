const pool = require('./db');

async function seedOggy() {
  try {
    console.log("Seeding Oggy's reviews...");
    
    // 1. Create Oggy
    let oggyRes = await pool.query("INSERT INTO users (name, email, phone, password_hash) VALUES ('Oggy', 'oggy@test.com', '1234567890', 'hash') ON CONFLICT (email) DO UPDATE SET name='Oggy' RETURNING user_id;");
    let oggyId = oggyRes.rows[0].user_id;

    // 2. Get all providers
    const providers = await pool.query("SELECT provider_id FROM service_providers");
    
    // 3. Insert reviews
    // We'll give Oggy a funny list of glowing reviews
    const oggyComments = [
        "Oggy approves! Absolutely fantastic service, meow!",
        "Jack and I loved the result. Very professional.",
        "Saved my house from the cockroaches! 10/10.",
        "Very swift and amazing tools used.",
        "Oggy is super happy with this professional."
    ];

    let inserted = 0;
    for (let p of providers.rows) {
        const comment = oggyComments[Math.floor(Math.random() * oggyComments.length)];
        const rating = Math.random() > 0.5 ? 5 : 4; // Oggy is a nice cat

        // Ensure we don't insert duplicates if run multiple times
        await pool.query(
            "INSERT INTO reviews (user_id, provider_id, rating, comment) VALUES ($1, $2, $3, $4)",
            [oggyId, p.provider_id, rating, comment]
        );
        inserted++;
    }

    console.log(`Successfully added ${inserted} reviews from Oggy!`);
    process.exit(0);

  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

seedOggy();
