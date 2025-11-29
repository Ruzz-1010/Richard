const express = require('express');
const router = express.Router();

// Test route
router.get('/test', (req, res) => {
    res.json({ message: 'Auth route is working!' });
});

// Register route
router.post('/register', (req, res) => {
    res.json({ message: 'Register endpoint - to be implemented' });
});

// Login route
router.post('/login', (req, res) => {
    res.json({ message: 'Login endpoint - to be implemented' });
});

module.exports = router;