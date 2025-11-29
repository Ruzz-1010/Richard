const express = require('express');
const { adminAuth } = require('../middleware/auth');
const Room = require('../models/Room');
const Booking = require('../models/Booking');
const User = require('../models/User');
const Feedback = require('../models/Feedback');
const router = express.Router();

// Admin dashboard stats
router.get('/dashboard', adminAuth, async (req, res) => {
    try {
        // Get all data for dashboard
        const [rooms, bookings, users, feedbacks] = await Promise.all([
            Room.find(),
            Booking.find().populate('user room'),
            User.find(),
            Feedback.find().populate('user')
        ]);

        // Calculate statistics
        const totalRooms = rooms.length;
        const occupiedRooms = rooms.filter(room => 
            room.status === 'Occupied' || room.status === 'Reserved'
        ).length;
        const availableRooms = rooms.filter(room => 
            room.status === 'Available'
        ).length;
        
        const totalBookings = bookings.length;
        const pendingBookings = bookings.filter(booking => 
            booking.status === 'Pending'
        ).length;
        const confirmedBookings = bookings.filter(booking => 
            booking.status === 'Confirmed'
        ).length;
        
        const totalUsers = users.length;
        const totalRevenue = bookings
            .filter(booking => booking.status === 'Confirmed' || booking.status === 'Checked-out')
            .reduce((sum, booking) => sum + (booking.totalPrice || 0), 0);

        // Recent bookings (last 5)
        const recentBookings = bookings
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 5)
            .map(booking => ({
                id: booking._id,
                userName: booking.user?.name || 'Unknown User',
                roomName: booking.room?.name || 'Unknown Room',
                checkIn: booking.checkIn,
                checkOut: booking.checkOut,
                status: booking.status,
                totalPrice: booking.totalPrice
            }));

        // Recent feedback (last 5)
        const recentFeedback = feedbacks
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 5)
            .map(feedback => ({
                id: feedback._id,
                userName: feedback.user?.name || 'Unknown User',
                rating: feedback.rating,
                comment: feedback.comment,
                createdAt: feedback.createdAt
            }));

        res.json({
            success: true,
            stats: {
                totalRooms,
                occupiedRooms,
                availableRooms,
                totalBookings,
                pendingBookings,
                confirmedBookings,
                totalUsers,
                totalRevenue
            },
            recentBookings,
            recentFeedback,
            rooms: rooms.slice(0, 10), // Recent 10 rooms
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Dashboard error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error loading dashboard', 
            error: error.message 
        });
    }
});

// Get all rooms for admin
router.get('/rooms', adminAuth, async (req, res) => {
    try {
        const rooms = await Room.find().sort({ createdAt: -1 });
        res.json({
            success: true,
            rooms: rooms.map(room => ({
                id: room._id,
                name: room.name,
                type: room.type,
                price: room.price,
                status: room.status,
                amenities: room.amenities,
                capacity: room.capacity,
                description: room.description,
                images: room.images,
                createdAt: room.createdAt
            }))
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Error fetching rooms', 
            error: error.message 
        });
    }
});

// Create new room
router.post('/rooms', adminAuth, async (req, res) => {
    try {
        const roomData = req.body;
        
        // Validate required fields
        if (!roomData.name || !roomData.price || !roomData.type) {
            return res.status(400).json({
                success: false,
                message: 'Name, price, and type are required fields'
            });
        }

        const room = new Room({
            name: roomData.name,
            type: roomData.type,
            price: roomData.price,
            description: roomData.description,
            amenities: roomData.amenities || [],
            capacity: roomData.capacity || 2,
            status: roomData.status || 'Available',
            images: roomData.images || []
        });

        await room.save();

        res.status(201).json({
            success: true,
            message: 'Room created successfully',
            room: {
                id: room._id,
                name: room.name,
                type: room.type,
                price: room.price,
                status: room.status,
                amenities: room.amenities,
                capacity: room.capacity,
                description: room.description,
                createdAt: room.createdAt
            }
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Error creating room', 
            error: error.message 
        });
    }
});

// Update room
router.put('/rooms/:id', adminAuth, async (req, res) => {
    try {
        const roomId = req.params.id;
        const updateData = req.body;

        const room = await Room.findByIdAndUpdate(
            roomId, 
            updateData, 
            { new: true, runValidators: true }
        );

        if (!room) {
            return res.status(404).json({
                success: false,
                message: 'Room not found'
            });
        }

        res.json({
            success: true,
            message: 'Room updated successfully',
            room: {
                id: room._id,
                name: room.name,
                type: room.type,
                price: room.price,
                status: room.status,
                amenities: room.amenities,
                capacity: room.capacity,
                description: room.description,
                createdAt: room.createdAt
            }
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Error updating room', 
            error: error.message 
        });
    }
});

// Delete room
router.delete('/rooms/:id', adminAuth, async (req, res) => {
    try {
        const roomId = req.params.id;
        
        const room = await Room.findByIdAndDelete(roomId);
        
        if (!room) {
            return res.status(404).json({
                success: false,
                message: 'Room not found'
            });
        }

        res.json({
            success: true,
            message: 'Room deleted successfully'
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Error deleting room', 
            error: error.message 
        });
    }
});

// Get all bookings for admin
router.get('/bookings', adminAuth, async (req, res) => {
    try {
        const bookings = await Booking.find()
            .populate('user', 'name email')
            .populate('room', 'name price')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            bookings: bookings.map(booking => ({
                id: booking._id,
                userName: booking.user?.name || 'Unknown User',
                userEmail: booking.user?.email || 'No Email',
                roomName: booking.room?.name || 'Unknown Room',
                roomPrice: booking.room?.price || 0,
                checkIn: booking.checkIn,
                checkOut: booking.checkOut,
                guests: booking.guests,
                totalPrice: booking.totalPrice,
                status: booking.status,
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

// Update booking status
router.put('/bookings/:id/status', adminAuth, async (req, res) => {
    try {
        const bookingId = req.params.id;
        const { status } = req.body;

        const validStatuses = ['Pending', 'Confirmed', 'Checked-in', 'Checked-out', 'Cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status'
            });
        }

        const booking = await Booking.findByIdAndUpdate(
            bookingId,
            { status },
            { new: true }
        ).populate('user room');

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        res.json({
            success: true,
            message: `Booking ${status.toLowerCase()} successfully`,
            booking: {
                id: booking._id,
                userName: booking.user?.name,
                roomName: booking.room?.name,
                status: booking.status,
                checkIn: booking.checkIn,
                checkOut: booking.checkOut
            }
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Error updating booking status', 
            error: error.message 
        });
    }
});

// Get all feedback for admin
router.get('/feedback', adminAuth, async (req, res) => {
    try {
        const feedbacks = await Feedback.find()
            .populate('user', 'name email')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            feedbacks: feedbacks.map(feedback => ({
                id: feedback._id,
                userName: feedback.user?.name || 'Unknown User',
                userEmail: feedback.user?.email || 'No Email',
                rating: feedback.rating,
                comment: feedback.comment,
                createdAt: feedback.createdAt
            }))
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Error fetching feedback', 
            error: error.message 
        });
    }
});

// Get system statistics
router.get('/statistics', adminAuth, async (req, res) => {
    try {
        const [totalRooms, totalBookings, totalUsers, totalRevenue, roomStatus] = await Promise.all([
            Room.countDocuments(),
            Booking.countDocuments(),
            User.countDocuments(),
            Booking.aggregate([
                { $match: { status: { $in: ['Confirmed', 'Checked-out'] } } },
                { $group: { _id: null, total: { $sum: '$totalPrice' } } }
            ]),
            Room.aggregate([
                { $group: { _id: '$status', count: { $sum: 1 } } }
            ])
        ]);

        const revenue = totalRevenue.length > 0 ? totalRevenue[0].total : 0;

        // Monthly revenue (last 6 months)
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const monthlyRevenue = await Booking.aggregate([
            { 
                $match: { 
                    status: { $in: ['Confirmed', 'Checked-out'] },
                    createdAt: { $gte: sixMonthsAgo }
                } 
            },
            {
                $group: {
                    _id: { 
                        year: { $year: '$createdAt' },
                        month: { $month: '$createdAt' }
                    },
                    revenue: { $sum: '$totalPrice' }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } }
        ]);

        res.json({
            success: true,
            statistics: {
                totalRooms,
                totalBookings,
                totalUsers,
                totalRevenue: revenue,
                roomStatus,
                monthlyRevenue
            }
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Error fetching statistics', 
            error: error.message 
        });
    }
});

module.exports = router;