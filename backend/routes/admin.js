const express = require('express');
const router = express.Router();

// Admin dashboard stats
router.get('/dashboard', (req, res) => {
    res.json({ message: 'Admin dashboard - to be implemented' });
});

// Room management
router.get('/rooms', (req, res) => {
    res.json({ message: 'Admin rooms - to be implemented' });
});

module.exports = router;