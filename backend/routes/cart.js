const express = require('express');
const router = express.Router();
const pool = require('../db');
const auth = require('../middleware/auth');

// @route   POST /cart/sync
// @desc    Takes client LocalStorage cart and force-flushes/syncs it into PostgreSQL natively
// @access  Private
router.post('/sync', auth, async (req, res) => {
    try {
        const userId = req.user.id;
        const { cartItems } = req.body; // Array of items from frontend local storage

        // 1. Locate or construct user cart root
        let cartRes = await pool.query('SELECT cart_id FROM cart WHERE user_id = $1', [userId]);
        
        let cartId;
        if (cartRes.rows.length === 0) {
            const newCart = await pool.query('INSERT INTO cart (user_id) VALUES ($1) RETURNING cart_id', [userId]);
            cartId = newCart.rows[0].cart_id;
        } else {
            cartId = cartRes.rows[0].cart_id;
        }

        // 2. Wipe existing cart items to ensure strict state parity (Fast sync replacement)
        await pool.query('DELETE FROM cart_items WHERE cart_id = $1', [cartId]);

        // 3. Re-hydrate cart items directly from fresh payload if array isn't empty
        if (cartItems && cartItems.length > 0) {
            // Using standard individual inserts for reliability and strict schema matching
            for (let item of cartItems) {
                let sId = item.service_id;
                if (!sId) {
                    const svcLookup = await pool.query('SELECT service_id FROM subservices WHERE subservice_id = $1', [item.id]);
                    if (svcLookup.rows.length > 0) sId = svcLookup.rows[0].service_id;
                }
                
                await pool.query(
                    `INSERT INTO cart_items (cart_id, subservice_id, quantity, price, provider_id, service_id) 
                     VALUES ($1, $2, $3, $4, $5, $6)`,
                    [cartId, item.id, item.quantity, item.price, item.provider_id, sId]
                );
            }
        }

        res.json({ msg: "Cart properly synchronized to backend cloud." });

    } catch (err) {
        console.error("Cart Sync Error:", err.message);
        if (err.code === '23503') { // PostgreSQL Foreign Key Violation Code
            return res.status(409).json({ msg: "Stale cart items detected. Please clear your browser cart." });
        }
        res.status(500).send('Server Error during Cart Sync');
    }
});

// @route   GET /cart
// @desc    Retrieve user's persisted db cart (Usually runs on successful login transition)
// @access  Private
router.get('/', auth, async (req, res) => {
    try {
        const userId = req.user.id;
        const cartRes = await pool.query('SELECT cart_id FROM cart WHERE user_id = $1', [userId]);
        
        if (cartRes.rows.length === 0) return res.json([]);

        const cartId = cartRes.rows[0].cart_id;

        // Extract items including joined metadata to seamlessly refill frontend model
        const items = await pool.query(`
            SELECT 
                ci.subservice_id AS id, 
                ci.quantity, 
                ci.price, 
                ci.provider_id, 
                ci.service_id,
                s.name,
                s.description AS desc
            FROM cart_items ci
            JOIN subservices s ON s.subservice_id = ci.subservice_id
            WHERE ci.cart_id = $1
        `, [cartId]);

        res.json(items.rows);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error fetching Cart');
    }
});

module.exports = router;
