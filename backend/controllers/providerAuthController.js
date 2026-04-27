const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db');

// Login provider
exports.login = async (req, res) => {
    try {
        const { email, phone, password } = req.body;

        // Either email or phone can be used to log in, but let's assume email is primary, fallback to phone
        let query = 'SELECT * FROM service_providers WHERE ';
        let values = [];
        
        if (email) {
            query += 'email = $1';
            values.push(email);
        } else if (phone) {
            query += 'phone = $1';
            values.push(phone);
        } else {
             return res.status(400).json({ msg: 'Please include email or phone' });
        }

        const providerResult = await pool.query(query, values);
        if (providerResult.rows.length === 0) {
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        const provider = providerResult.rows[0];

        // Check if provider has a password set
        if (!provider.password_hash) {
            return res.status(400).json({ msg: 'Account not fully set up. Please contact admin.'});
        }

        // Validate password
        const isMatch = await bcrypt.compare(password, provider.password_hash);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        // Generate JWT
        const payload = { provider: { id: provider.provider_id } };
        const secret = process.env.JWT_SECRET || 'fallback_secret_key';
        
        jwt.sign(payload, secret, { expiresIn: '7d' }, (err, token) => {
            if (err) throw err;
            res.json({ 
                token, 
                provider: { 
                    provider_id: provider.provider_id, 
                    name: provider.name, 
                    email: provider.email, 
                    phone: provider.phone, 
                    city: provider.city,
                    area: provider.area
                } 
            });
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Optional: Get logged in provider info
exports.getMe = async (req, res) => {
    try {
        const providerResult = await pool.query(
            'SELECT provider_id, name, email, phone, city, area, description FROM service_providers WHERE provider_id = $1',
            [req.provider.id]
        );
        
        if (providerResult.rows.length === 0) {
             return res.status(404).json({ msg: 'Provider not found' });
        }
        res.json(providerResult.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
}

// Register provider
exports.register = async (req, res) => {
    try {
        const { name, email, phone, password, city, area } = req.body;

        if (!name || (!email && !phone) || !password || !city || !area) {
             return res.status(400).json({ msg: 'Please include all required fields' });
        }

        // Check if provider exists
        let query = 'SELECT * FROM service_providers WHERE ';
        let values = [];
        if (email && phone) {
            query += 'email = $1 OR phone = $2';
            values.push(email, phone);
        } else if (email) {
            query += 'email = $1';
            values.push(email);
        } else {
            query += 'phone = $1';
            values.push(phone);
        }

        const providerResult = await pool.query(query, values);
        if (providerResult.rows.length > 0) {
            return res.status(400).json({ msg: 'Provider already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        // Insert new provider
        const insertProvider = await pool.query(
            'INSERT INTO service_providers (name, email, phone, city, area, password_hash, description) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING provider_id, name, email, phone, city, area',
            [name, email, phone, city, area, password_hash, 'Newly registered professional.']
        );

        const newProvider = insertProvider.rows[0];

        // Generate JWT
        const payload = { provider: { id: newProvider.provider_id } };
        const secret = process.env.JWT_SECRET || 'fallback_secret_key';
        
        jwt.sign(payload, secret, { expiresIn: '7d' }, (err, token) => {
            if (err) throw err;
            res.json({ 
                token, 
                provider: newProvider
            });
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};
