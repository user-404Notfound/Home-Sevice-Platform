const express = require('express');
const router = express.Router();
const pool = require('../db');
const auth = require('../middleware/auth');

// @route   GET /bookings/availability
// @desc    Get booked time slots for a specific provider on a specific date
// @access  Private
router.get('/availability', auth, async (req, res) => {
    try {
        const { providerId, date } = req.query;
        if (!providerId || !date) return res.status(400).json({ msg: "Missing providerId or date" });

        const result = await pool.query(
            "SELECT booking_time FROM bookings WHERE provider_id = $1 AND booking_date = $2 AND status != 'cancelled'",
            [providerId, date]
        );

        const bookedSlots = result.rows.map(r => r.booking_time);
        res.json({ bookedSlots });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Server Error fetching availability" });
    }
});

// @route   POST /bookings
// @desc    Orchestrates the massive Final Checkout Cart into segmented historical Booking tracking
// @access  Private
router.post('/', auth, async (req, res) => {
    try {
        const userId = req.user.id;
        const { cartItems, schedules, location } = req.body; 

        if (!cartItems || cartItems.length === 0) {
            return res.status(400).json({ msg: "Cannot process empty checkout payload." });
        }

        // Group cart items cleanly by Provider to split workflows dynamically
        const providersMap = {};
        for (let item of cartItems) {
            if (!providersMap[item.provider_id]) {
                providersMap[item.provider_id] = [];
            }
            providersMap[item.provider_id].push(item);
        }

        const newBookingIds = [];

        // Transaction logic mapping distinct Booking roots
        for (const providerId in providersMap) {
            const items = providersMap[providerId];
            
            // Derive primary service_id securely directly from database source of truth if frontend state didn't cache it
            let primaryServiceId = items[0].service_id; 
            if (!primaryServiceId) {
                const svcLookup = await pool.query('SELECT service_id FROM subservices WHERE subservice_id = $1', [items[0].id]);
                if (svcLookup.rows.length > 0) {
                    primaryServiceId = svcLookup.rows[0].service_id;
                } else {
                    throw new Error("Invalid subservice, cannot map to logical service_id parent.");
                }
            }

            // Calculate precise provider Subtotal (Not including Global Platform Fee since that's handled at invoice)
            const providerSubtotal = items.reduce((acc, current) => acc + (current.price * current.quantity), 0);

            // Lookup the dynamic schedule for this specific provider generated from Frontend
            const providerSchedule = schedules[providerId];
            if (!providerSchedule || !providerSchedule.date || !providerSchedule.time) {
                throw new Error("Missing specific schedule mapping for provider: " + providerId);
            }

            // Generate a 6-digit PIN
            const completionPin = Math.floor(100000 + Math.random() * 900000).toString();

            // Create Booking Parent Container
            const bookingParent = await pool.query(
                `INSERT INTO bookings (user_id, provider_id, service_id, booking_date, booking_time, status, total_price, location, completion_pin) 
                 VALUES ($1, $2, $3, $4, $5, 'pending', $6, $7, $8) RETURNING booking_id`,
                [userId, providerId, primaryServiceId, providerSchedule.date, providerSchedule.time, providerSubtotal, location, completionPin]
            );

            const safeId = bookingParent.rows[0].booking_id;
            newBookingIds.push(safeId);

            // Populate booking_items granularly with correct cascades 
            for (let sub of items) {
                await pool.query(
                    `INSERT INTO booking_items (booking_id, subservice_id, quantity, price) 
                     VALUES ($1, $2, $3, $4)`,
                    [safeId, sub.id, sub.quantity, sub.price] // Sub.id maps from local cache `id` alias to subservice_id
                );
            }
        }

        // Wipe the local native cart securely now that order is generated!
        const getCart = await pool.query('SELECT cart_id FROM cart WHERE user_id = $1', [userId]);
        if (getCart.rows.length > 0) {
             await pool.query('DELETE FROM cart_items WHERE cart_id = $1', [getCart.rows[0].cart_id]);
        }

        res.status(201).json({ msg: "Checkout Success", booking_ids: newBookingIds });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error during Checkout Iteration');
    }
});

// @route   GET /bookings
// @desc    Fetches cleanly formatted user historical bookings for their Dashboard array
// @access  Private
router.get('/', auth, async (req, res) => {
    try {
        const userId = req.user.id;
        
        // Joining parent bookings and aggregating their booking_items into json blocks
        const query = `
           SELECT 
              b.booking_id, b.booking_date, b.booking_time, b.status, b.total_price, b.completion_pin,
              p.provider_id, p.name AS provider_name,
              s.service_name,
              json_agg(
                 json_build_object(
                    'subservice_name', sub.name,
                    'quantity', bi.quantity,
                    'price', bi.price
                 )
              ) as items
           FROM bookings b
           JOIN service_providers p ON b.provider_id = p.provider_id
           JOIN services s ON b.service_id = s.service_id
           JOIN booking_items bi ON b.booking_id = bi.booking_id
           JOIN subservices sub ON bi.subservice_id = sub.subservice_id
           WHERE b.user_id = $1
           GROUP BY b.booking_id, p.provider_id, p.name, s.service_name
           ORDER BY b.booking_date DESC, b.booking_time DESC
        `;

        const dbRes = await pool.query(query, [userId]);
        res.json(dbRes.rows);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error fetching Bookings');
    }
});

// @route   POST /bookings/review
// @desc    Submit a review for a provider
// @access  Private
router.post('/review', auth, async (req, res) => {
    try {
        const userId = req.user.id;
        const { provider_id, rating, comment } = req.body;

        if (!provider_id || !rating) {
            return res.status(400).json({ msg: "Provider ID and rating are required." });
        }

        await pool.query(
            "INSERT INTO reviews (user_id, provider_id, rating, comment) VALUES ($1, $2, $3, $4)",
            [userId, provider_id, rating, comment || ""]
        );

        res.status(201).json({ msg: "Review submitted successfully" });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error submitting review');
    }
});

module.exports = router;
