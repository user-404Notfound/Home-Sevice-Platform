const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        s.service_id as id, 
        c.category_name as category, 
        s.service_name as name, 
        s.description as desc, 
        s.icon, 
        s.is_popular as popular
      FROM services s
      JOIN categories c ON s.category_id = c.category_id
      ORDER BY s.service_id
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching services:', err);
    res.status(500).json({ msg: 'Server error fetching services' });
  }
});

// Global Search Route
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.json([]);

    const searchQuery = `%${q}%`;
    const result = await pool.query(`
      SELECT DISTINCT
        s.service_id as id, 
        c.category_name as category, 
        s.service_name as name, 
        s.description as desc, 
        s.icon, 
        s.is_popular as popular
      FROM services s
      JOIN categories c ON s.category_id = c.category_id
      LEFT JOIN subservices sub ON s.service_id = sub.service_id
      WHERE s.service_name ILIKE $1 
         OR s.description ILIKE $1 
         OR sub.name ILIKE $1
      ORDER BY s.service_id
    `, [searchQuery]);
    
    res.json(result.rows);
  } catch (err) {
    console.error('Error searching services:', err);
    res.status(500).json({ msg: 'Server error during search' });
  }
});

// Fetch providers in bulk by IDs
router.get('/providers/details', async (req, res) => {
  try {
    const { ids } = req.query;
    if (!ids) return res.json([]);
    
    // Safety approach: split, map to integer, filter NaNs
    const idArray = ids.split(',').map(Number).filter(n => !isNaN(n));
    if (idArray.length === 0) return res.json([]);

    const placeholders = idArray.map((_, i) => `$${i + 1}`).join(',');
    
    const result = await pool.query(`
      SELECT 
        sp.provider_id as id,
        sp.name,
        sp.city,
        sp.area,
        sp.description as desc,
        COALESCE(AVG(r.rating), 0) as rating,
        COUNT(r.review_id) as review_count
      FROM service_providers sp
      LEFT JOIN reviews r ON sp.provider_id = r.provider_id
      WHERE sp.provider_id IN (${placeholders})
      GROUP BY sp.provider_id
    `, idArray);
    
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching bulk providers:', err);
    res.status(500).json({ msg: 'Server error bulk fetching providers' });
  }
});

// Get single service details
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        s.service_id as id, 
        c.category_name as category, 
        s.service_name as name, 
        s.description as desc, 
        s.icon,
        s.is_popular as popular
      FROM services s
      JOIN categories c ON s.category_id = c.category_id
      WHERE s.service_id = $1
    `, [req.params.id]);
    
    if (result.rows.length === 0) return res.status(404).json({ msg: 'Service not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching service:', err);
    res.status(500).json({ msg: 'Server error fetching service' });
  }
});

// Get providers for a specific service
router.get('/:id/providers', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        sp.provider_id as id,
        sp.name,
        sp.city,
        sp.area,
        sp.description as desc,
        ps.base_price,
        ps.experience_years as experience,
        COALESCE(AVG(r.rating), 0) as rating,
        COUNT(r.review_id) as review_count
      FROM service_providers sp
      JOIN provider_services ps ON sp.provider_id = ps.provider_id
      LEFT JOIN reviews r ON sp.provider_id = r.provider_id
      WHERE ps.service_id = $1
      GROUP BY sp.provider_id, ps.base_price, ps.experience_years
    `, [req.params.id]);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching providers:', err);
    res.status(500).json({ msg: 'Server error fetching providers' });
  }
});

// Get subservices for a specific service
router.get('/:id/subservices', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        subservice_id as id,
        name,
        price,
        description as desc
      FROM subservices
      WHERE service_id = $1
      ORDER BY subservice_id
    `, [req.params.id]);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching subservices:', err);
    res.status(500).json({ msg: 'Server error fetching subservices' });
  }
});

// [NEW] Get a specific provider's menu for a specific service
router.get('/:id/providers/:providerId/menu', async (req, res) => {
  try {
    const { id: serviceId, providerId } = req.params;

    // Fetch the provider profile details
    const providerResult = await pool.query(`
      SELECT 
        sp.provider_id as id,
        sp.name,
        sp.city,
        sp.area,
        sp.description as desc,
        ps.base_price,
        ps.experience_years as experience,
        COALESCE(AVG(r.rating), 0) as rating,
        COUNT(r.review_id) as review_count
      FROM service_providers sp
      JOIN provider_services ps ON sp.provider_id = ps.provider_id
      LEFT JOIN reviews r ON sp.provider_id = r.provider_id
      WHERE ps.service_id = $1 AND sp.provider_id = $2
      GROUP BY sp.provider_id, ps.base_price, ps.experience_years
    `, [serviceId, providerId]);

    if (providerResult.rows.length === 0) {
      return res.status(404).json({ msg: 'Provider not found for this service' });
    }

    // Fetch the specific subservices they offer with their custom pricing
    const menuResult = await pool.query(`
      SELECT 
        pbs.id as pbs_id,
        pbs.subservice_id,
        COALESCE(pbs.custom_name, s.name) as name,
        s.description as desc,
        pbs.price as provider_price
      FROM provider_subservices pbs
      LEFT JOIN subservices s ON pbs.subservice_id = s.subservice_id
      WHERE pbs.service_id = $1 AND pbs.provider_id = $2
    `, [serviceId, providerId]);

    // Fetch Reviews
    const reviewsResult = await pool.query(`
      SELECT 
        r.review_id, 
        r.rating, 
        r.comment, 
        u.name as user_name
      FROM reviews r
      JOIN users u ON r.user_id = u.user_id
      WHERE r.provider_id = $1
      ORDER BY r.review_id DESC
    `, [providerId]);

    res.json({
      provider: providerResult.rows[0],
      menu: menuResult.rows,
      reviews: reviewsResult.rows
    });
  } catch (err) {
    console.error('Error fetching provider menu:', err);
    res.status(500).json({ msg: 'Server error fetching provider menu' });
  }
});

module.exports = router;