const express = require('express');
const cors = require('cors');

const app = express(); // ✅ IMPORTANT

app.use(cors());
app.use(express.json());

// Test route
app.get('/', (req, res) => {
  res.send('API is running');
});

// Routes
const servicesRoutes = require('./routes/services');
app.use('/services', servicesRoutes);

const authRoutes = require('./routes/auth');
app.use('/auth', authRoutes);

const cartRoutes = require('./routes/cart');
app.use('/cart', cartRoutes);

const bookingsRoutes = require('./routes/bookings');
app.use('/bookings', bookingsRoutes);

const providerRoutes = require('./routes/provider');
app.use('/provider', providerRoutes);

// Start server
app.listen(5000, () => {
  console.log('Server running on port 5000');
});