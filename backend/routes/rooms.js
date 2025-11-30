const express = require('express');
const Room = require('../models/Room');
const router = express.Router();

// Get all rooms for users (public access)
router.get('/', async (req, res) => {
    try {
        const rooms = await Room.find().select('-__v');
        res.json(rooms);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get room by ID for users (public access)
router.get('/:id', async (req, res) => {
    try {
        const room = await Room.findById(req.params.id).select('-__v');
        if (!room) {
            return res.status(404).json({ message: 'Room not found' });
        }
        res.json(room);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Check room availability
router.get('/:id/availability', async (req, res) => {
    try {
        const { checkIn, checkOut } = req.query;
        const room = await Room.findById(req.params.id);
        
        if (!room) {
            return res.status(404).json({ message: 'Room not found' });
        }

        // Simple availability check - in real app, check against bookings
        const isAvailable = room.status === 'Available';
        
        res.json({
            available: isAvailable,
            room: {
                id: room._id,
                name: room.name,
                price: room.price,
                status: room.status
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;