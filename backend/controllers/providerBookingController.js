const pool = require('../db');

// Get bookings for logged-in provider
exports.getBookings = async (req, res) => {
    try {
        const providerId = req.provider.id;

        // Fetch bookings along with customer name, service name
        const bookingsQuery = `
            SELECT 
                b.booking_id, b.booking_date, b.booking_time, b.status, b.total_price, b.location,
                u.name AS customer_name, u.phone AS customer_phone,
                s.service_name
            FROM bookings b
            JOIN users u ON b.user_id = u.user_id
            JOIN services s ON b.service_id = s.service_id
            WHERE b.provider_id = $1
            ORDER BY b.booking_date DESC, b.booking_time DESC
        `;
        const bookingsResult = await pool.query(bookingsQuery, [providerId]);
        
        const bookings = bookingsResult.rows;

        // For each booking, fetch items
        for (let b of bookings) {
            const itemsQuery = `
                SELECT bi.quantity, bi.price, sub.name AS subservice_name
                FROM booking_items bi
                JOIN subservices sub ON bi.subservice_id = sub.subservice_id
                WHERE bi.booking_id = $1
            `;
            const itemsResult = await pool.query(itemsQuery, [b.booking_id]);
            b.items = itemsResult.rows;
        }

        res.json(bookings);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Get stats for dashboard
exports.getStats = async (req, res) => {
    try {
        const providerId = req.provider.id;

        const statsQuery = `
            SELECT 
                COUNT(*) as total_bookings,
                SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_bookings,
                SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_bookings,
                SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled_bookings
            FROM bookings
            WHERE provider_id = $1
        `;
        const result = await pool.query(statsQuery, [providerId]);
        const dbStats = result.rows[0];

        res.json({
            total: parseInt(dbStats.total_bookings) || 0,
            completed: parseInt(dbStats.completed_bookings) || 0,
            pending: parseInt(dbStats.pending_bookings) || 0,
            cancelled: parseInt(dbStats.cancelled_bookings) || 0
        });

    } catch(err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
}

// Update booking status
exports.updateBookingStatus = async (req, res) => {
    try {
        const providerId = req.provider.id;
        const bookingId = req.params.id;
        const { status, pin } = req.body;

        if (!['pending', 'completed', 'cancelled'].includes(status)) {
            return res.status(400).json({ msg: 'Invalid status' });
        }

        // Ensure the booking belongs to this provider
        const checkQuery = 'SELECT * FROM bookings WHERE booking_id = $1 AND provider_id = $2';
        const checkResult = await pool.query(checkQuery, [bookingId, providerId]);

        if (checkResult.rows.length === 0) {
            return res.status(404).json({ msg: 'Booking not found or not assigned to you' });
        }

        const booking = checkResult.rows[0];

        if (status === 'completed') {
            if (!pin) {
                return res.status(400).json({ msg: 'Completion PIN is required to mark as completed.' });
            }
            if (booking.completion_pin !== pin) {
                return res.status(400).json({ msg: 'Invalid PIN. Please ask the customer for the correct 6-digit PIN.' });
            }
        }

        const updateQuery = 'UPDATE bookings SET status = $1 WHERE booking_id = $2 RETURNING *';
        const updateResult = await pool.query(updateQuery, [status, bookingId]);

        res.json(updateResult.rows[0]);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Get reviews for logged-in provider
exports.getReviews = async (req, res) => {
    try {
        const providerId = req.provider.id;
        const reviewsQuery = `
            SELECT r.review_id, r.rating, r.comment, r.created_at, u.name as customer_name
            FROM reviews r
            JOIN users u ON r.user_id = u.user_id
            WHERE r.provider_id = $1
            ORDER BY r.created_at DESC
        `;
        const result = await pool.query(reviewsQuery, [providerId]);
        res.json(result.rows);
    } catch(err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};
