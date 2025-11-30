const express = require('express');
const Booking = require('../models/Booking');
const Room = require('../models/Room');
const { auth } = require('../middleware/auth');
const router = express.Router();

// Create booking (user must be logged in)
router.post('/', auth, async (req, res) => {
    try {
        const { room, checkIn, checkOut, guests, specialRequests } = req.body;

        // Validate required fields
        if (!room || !checkIn || !checkOut || !guests) {
            return res.status(400).json({ 
                success: false,
                message: 'Room, check-in, check-out, and guests are required' 
            });
        }

        // Check if room exists and is available
        const roomData = await Room.findById(room);
        if (!roomData) {
            return res.status(404).json({ 
                success: false,
                message: 'Room not found' 
            });
        }

        if (roomData.status !== 'Available') {
            return res.status(400).json({ 
                success: false,
                message: 'Room is not available for booking' 
            });
        }

        // Calculate total price
        const checkInDate = new Date(checkIn);
        const checkOutDate = new Date(checkOut);
        const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
        const totalPrice = roomData.price * nights;

        // Create booking
        const booking = new Booking({
            user: req.user.id,
            room: room,
            checkIn: checkInDate,
            checkOut: checkOutDate,
            guests: guests,
            totalPrice: totalPrice,
            specialRequests: specialRequests || '',
            status: 'Pending'
        });

        await booking.save();

        // Update room status to Reserved
        roomData.status = 'Reserved';
        await roomData.save();

        // Populate booking data for response
        const populatedBooking = await Booking.findById(booking._id)
            .populate('user', 'name email')
            .populate('room', 'name price type');

        res.status(201).json({
            success: true,
            message: 'Booking created successfully',
            booking: {
                id: populatedBooking._id,
                user: populatedBooking.user,
                room: populatedBooking.room,
                checkIn: populatedBooking.checkIn,
                checkOut: populatedBooking.checkOut,
                guests: populatedBooking.guests,
                totalPrice: populatedBooking.totalPrice,
                status: populatedBooking.status,
                specialRequests: populatedBooking.specialRequests,
                createdAt: populatedBooking.createdAt
            }
        });
    } catch (error) {
        console.error('Booking error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Error creating booking', 
            error: error.message 
        });
    }
});

// Get user's bookings (user must be logged in)
router.get('/my-bookings', auth, async (req, res) => {
    try {
        const bookings = await Booking.find({ user: req.user.id })
            .populate('room', 'name price type images')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            bookings: bookings.map(booking => ({
                id: booking._id,
                room: booking.room,
                checkIn: booking.checkIn,
                checkOut: booking.checkOut,
                guests: booking.guests,
                totalPrice: booking.totalPrice,
                status: booking.status,
                specialRequests: booking.specialRequests,
                createdAt: booking.createdAt
            }))
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: 'Error fetching bookings', 
            error: error.message 
        });
    }
});

// Get booking by ID (user can only see their own bookings)
router.get('/:id', auth, async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id)
            .populate('user', 'name email')
            .populate('room', 'name price type amenities images');

        if (!booking) {
            return res.status(404).json({ 
                success: false,
                message: 'Booking not found' 
            });
        }

        // Check if user owns this booking
        if (booking.user._id.toString() !== req.user.id) {
            return res.status(403).json({ 
                success: false,
                message: 'Access denied' 
            });
        }

        res.json({
            success: true,
            booking: {
                id: booking._id,
                user: booking.user,
                room: booking.room,
                checkIn: booking.checkIn,
                checkOut: booking.checkOut,
                guests: booking.guests,
                totalPrice: booking.totalPrice,
                status: booking.status,
                specialRequests: booking.specialRequests,
                createdAt: booking.createdAt
            }
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: 'Error fetching booking', 
            error: error.message 
        });
    }
});

// Cancel booking (user can cancel their own bookings)
router.put('/:id/cancel', auth, async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id)
            .populate('room');

        if (!booking) {
            return res.status(404).json({ 
                success: false,
                message: 'Booking not found' 
            });
        }

        // Check if user owns this booking
        if (booking.user.toString() !== req.user.id) {
            return res.status(403).json({ 
                success: false,
                message: 'Access denied' 
            });
        }

        // Update booking status
        booking.status = 'Cancelled';
        await booking.save();

        // Update room status back to Available
        if (booking.room) {
            booking.room.status = 'Available';
            await booking.room.save();
        }

        res.json({
            success: true,
            message: 'Booking cancelled successfully',
            booking: {
                id: booking._id,
                status: booking.status
            }
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: 'Error cancelling booking', 
            error: error.message 
        });
    }
});

module.exports = router;