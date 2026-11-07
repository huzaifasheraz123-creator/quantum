const express = require('express');
const { createBooking, getBookings } = require('../controllers/bookingController');
const requireAdmin = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', requireAdmin, getBookings);
router.post('/', createBooking);

module.exports = router;
