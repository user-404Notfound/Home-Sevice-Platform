const express = require('express');
const router = express.Router();
const providerAuthController = require('../controllers/providerAuthController');
const providerBookingController = require('../controllers/providerBookingController');
const providerServiceController = require('../controllers/providerServiceController');
const providerAuth = require('../middleware/providerAuth');

// --- Provider Auth Routes ---
// @route   POST /provider/login
// @desc    Login provider & acquire token
// @access  Public
router.post('/login', providerAuthController.login);

// @route   POST /provider/register
// @desc    Register a new provider
// @access  Public
router.post('/register', providerAuthController.register);

// @route   GET /provider/me
// @desc    Get logged in provider details
// @access  Private (Provider)
router.get('/me', providerAuth, providerAuthController.getMe);

// --- Provider Dashboard & Booking Routes ---
// @route   GET /provider/my-services
// @desc    Get provider configured services
// @access  Private
router.get('/my-services', providerAuth, providerServiceController.getMyServices);

// @route   POST /provider/my-services
// @desc    Update provider configured services
// @access  Private
router.post('/my-services', providerAuth, providerServiceController.addMyServices);

// @route   GET /provider/stats
// @desc    Get dashboard stats
// @access  Private (Provider)
router.get('/stats', providerAuth, providerBookingController.getStats);

// @route   GET /provider/bookings
// @desc    Get all bookings for provider
// @access  Private (Provider)
router.get('/bookings', providerAuth, providerBookingController.getBookings);

// @route   PUT /provider/bookings/:id/status
// @desc    Update booking status
// @access  Private (Provider)
router.put('/bookings/:id/status', providerAuth, providerBookingController.updateBookingStatus);

// @route   GET /provider/reviews
// @desc    Get reviews for provider
// @access  Private (Provider)
router.get('/reviews', providerAuth, providerBookingController.getReviews);

module.exports = router;
