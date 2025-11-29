const express = require('express');
const router = express.Router();

// Get all rooms
router.get('/', (req, res) => {
    res.json({ message: 'Get all rooms - to be implemented' });
});

// Get single room
router.get('/:id', (req, res) => {
    res.json({ message: `Get room ${req.params.id} - to be implemented` });
});

module.exports = router;    