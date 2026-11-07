const express = require('express');
const { getTours, getTourById, createTour, updateTour, deleteTour } = require('../controllers/tourController');
const requireAdmin = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', getTours);
router.get('/:id', getTourById);
router.post('/', requireAdmin, createTour);
router.put('/:id', requireAdmin, updateTour);
router.delete('/:id', requireAdmin, deleteTour);

module.exports = router;
