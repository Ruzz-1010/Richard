const express = require('express');
const { register, login, getMe } = require('../controllers/authController');
const { auth } = require('../middleware/auth');
const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', auth, getMe);

// Test route
router.get('/test', (req, res) => {
    res.json({ message: 'Auth route is working!' });
});

module.exports = router;