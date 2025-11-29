const express = require('express');
const router = express.Router();

// Get all feedback
router.get('/', (req, res) => {
    res.json({ message: 'Get all feedback - to be implemented' });
});

// Create new feedback
router.post('/', (req, res) => {
    res.json({ message: 'Create feedback - to be implemented' });
});

module.exports = router;    