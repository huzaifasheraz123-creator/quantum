const express = require('express');
const { login, me, logout } = require('../controllers/authController');
const requireAdmin = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/login', login);
router.get('/me', me);
router.post('/logout', requireAdmin, logout);

module.exports = router;
