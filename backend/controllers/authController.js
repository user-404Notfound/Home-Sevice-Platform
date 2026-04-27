const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db');

// Register a new user
exports.register = async (req, res) => {
    try {
        const { name, email, phone, location, password } = req.body;

        // Check if user already exists
        const userExists = await pool.query('SELECT * FROM users WHERE email = $1 OR phone = $2', [email, phone]);
        if (userExists.rows.length > 0) {
            return res.status(400).json({ msg: 'User with this email or phone already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        // Insert new user
        const newUser = await pool.query(
            'INSERT INTO users (name, email, phone, password_hash, location) VALUES ($1, $2, $3, $4, $5) RETURNING user_id, name, email, phone, location, created_at',
            [name, email, phone, password_hash, location]
        );

        // Generate JWT
        const payload = { user: { id: newUser.rows[0].user_id } };
        const secret = process.env.JWT_SECRET || 'fallback_secret_key'; // Fallback configured for local dev
        
        jwt.sign(payload, secret, { expiresIn: '7d' }, (err, token) => {
            if (err) throw err;
            res.status(201).json({ token, user: newUser.rows[0] });
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Login user
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if user exists
        const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (userResult.rows.length === 0) {
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        const user = userResult.rows[0];

        // Validate password
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        // Generate JWT
        const payload = { user: { id: user.user_id } };
        const secret = process.env.JWT_SECRET || 'fallback_secret_key';
        
        jwt.sign(payload, secret, { expiresIn: '7d' }, (err, token) => {
            if (err) throw err;
            res.json({ 
                token, 
                user: { 
                    user_id: user.user_id, 
                    name: user.name, 
                    email: user.email, 
                    phone: user.phone, 
                    location: user.location 
                } 
            });
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};
