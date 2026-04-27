const pool = require('../db');

exports.getMyServices = async (req, res) => {
    try {
        const providerId = req.provider.id;
        
        const servicesResult = await pool.query(
            `SELECT ps.*, s.service_name, s.icon 
             FROM provider_services ps 
             JOIN services s ON ps.service_id = s.service_id 
             WHERE ps.provider_id = $1`,
            [providerId]
        );

        if (servicesResult.rows.length === 0) {
            return res.json({ hasServices: false, services: [], subservices: [] });
        }

        const providerServices = servicesResult.rows;
        
        const subservicesResult = await pool.query(
            `SELECT pbs.id, pbs.service_id, pbs.subservice_id, pbs.custom_name, pbs.price as custom_price,
                    s.name as standard_name, s.price as standard_price
             FROM provider_subservices pbs
             LEFT JOIN subservices s ON pbs.subservice_id = s.subservice_id
             WHERE pbs.provider_id = $1`,
            [providerId]
        );

        res.json({
            hasServices: true,
            services: providerServices,
            subservices: subservicesResult.rows
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.addMyServices = async (req, res) => {
    try {
        const providerId = req.provider.id;
        const { services } = req.body;

        if (!services || services.length === 0) {
            return res.status(400).json({ msg: 'Please provide at least one service.' });
        }

        await pool.query('BEGIN');

        // Clear existing to allow full update
        await pool.query('DELETE FROM provider_subservices WHERE provider_id = $1', [providerId]);
        await pool.query('DELETE FROM provider_services WHERE provider_id = $1', [providerId]);

        for (const s of services) {
            await pool.query(
                'INSERT INTO provider_services (provider_id, service_id, base_price, experience_years, description) VALUES ($1, $2, $3, $4, $5)',
                [providerId, s.service_id, s.base_price || 0, s.experience_years || 0, s.description || '']
            );

            if (s.subservices && s.subservices.length > 0) {
                for (const sub of s.subservices) {
                    await pool.query(
                        'INSERT INTO provider_subservices (provider_id, service_id, subservice_id, custom_name, price) VALUES ($1, $2, $3, $4, $5)',
                        [providerId, s.service_id, sub.subservice_id || null, sub.custom_name || null, sub.price || 0]
                    );
                }
            }
        }

        await pool.query('COMMIT');
        res.json({ msg: 'Services updated successfully' });

    } catch (err) {
        await pool.query('ROLLBACK');
        console.error("Provider Services Update Error:", err.message);
        if (err.code === '23503') {
            return res.status(409).json({ msg: "Provider profile not found in database. Please log in again." });
        }
        res.status(500).send('Server Error');
    }
};
