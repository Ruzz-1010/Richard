const express = require('express');
const router = express.Router();

// Get all bookings
router.get('/', (req, res) => {
    res.json({ message: 'Get all bookings - to be implemented' });
});

// Create new booking
router.post('/', (req, res) => {
    res.json({ message: 'Create booking - to be implemented' });
});

// Get booking by ID
router.get('/:id', (req, res) => {
    res.json({ message: `Get booking ${req.params.id} - to be implemented` });
});

module.exports = router;