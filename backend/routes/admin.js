const express = require('express');
const Room = require('../models/Room');
const Booking = require('../models/Booking');
const User = require('../models/User');
const Feedback = require('../models/Feedback');
const router = express.Router();

// Simple admin auth
const adminAuth = (req, res, next) => {
    next(); // For now, allow all requests
};

// Admin Dashboard - REAL DATA
router.get('/dashboard', adminAuth, async (req, res) => {
    try {
        // Get REAL data from database
        const rooms = await Room.find();
        const bookings = await Booking.find().populate('user room');
        const users = await User.find();
        const feedbacks = await Feedback.find().populate('user');

        // Calculate REAL statistics
        const totalRooms = rooms.length;
        const occupiedRooms = rooms.filter(room => room.status === 'Occupied').length;
        const availableRooms = rooms.filter(room => room.status === 'Available').length;
        const totalBookings = bookings.length;
        const pendingBookings = bookings.filter(booking => booking.status === 'Pending').length;
        const totalUsers = users.length;
        const totalRevenue = bookings.reduce((sum, booking) => sum + (booking.totalPrice || 0), 0);

        res.json({
            success: true,
            stats: {
                totalRooms,
                occupiedRooms,
                availableRooms,
                totalBookings,
                pendingBookings,
                totalUsers,
                totalRevenue,
                occupancyRate: totalRooms > 0 ? ((occupiedRooms / totalRooms) * 100).toFixed(1) : 0
            },
            recentBookings: bookings.slice(0, 5).map(b => ({
                userName: b.user?.name || 'Guest',
                roomName: b.room?.name || 'Unknown Room',
                checkIn: b.checkIn,
                checkOut: b.checkOut,
                status: b.status,
                totalPrice: b.totalPrice
            })),
            recentFeedback: feedbacks.slice(0, 3).map(f => ({
                userName: f.user?.name || 'Guest',
                rating: f.rating,
                comment: f.comment
            }))
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get ALL rooms - REAL DATA
router.get('/rooms', adminAuth, async (req, res) => {
    try {
        const rooms = await Room.find().sort({ createdAt: -1 });
        res.json({ success: true, rooms });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// CREATE new room - REAL OPERATION
router.post('/rooms', adminAuth, async (req, res) => {
    try {
        const room = new Room(req.body);
        await room.save();
        res.json({ success: true, room, message: 'Room created successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// UPDATE room - REAL OPERATION
router.put('/rooms/:id', adminAuth, async (req, res) => {
    try {
        const room = await Room.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json({ success: true, room, message: 'Room updated successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// DELETE room - REAL OPERATION
router.delete('/rooms/:id', adminAuth, async (req, res) => {
    try {
        await Room.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Room deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get ALL bookings - REAL DATA
router.get('/bookings', adminAuth, async (req, res) => {
    try {
        const bookings = await Booking.find()
            .populate('user', 'name email')
            .populate('room', 'name price')
            .sort({ createdAt: -1 });
        res.json({ success: true, bookings });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// UPDATE booking status - REAL OPERATION
router.put('/bookings/:id/status', adminAuth, async (req, res) => {
    try {
        const { status } = req.body;
        const booking = await Booking.findByIdAndUpdate(
            req.params.id, 
            { status }, 
            { new: true }
        ).populate('user room');
        
        res.json({ success: true, booking, message: 'Booking updated successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// FEEDBACK MANAGEMENT ROUTES

// Admin feedback management - Get all feedback
router.get('/feedback', adminAuth, async (req, res) => {
    try {
        const feedbacks = await Feedback.find()
            .populate('user', 'name email')
            .populate('booking')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            feedbacks: feedbacks.map(feedback => ({
                id: feedback._id,
                user: feedback.user,
                rating: feedback.rating,
                comment: feedback.comment,
                category: feedback.category,
                status: feedback.status,
                booking: feedback.booking,
                createdAt: feedback.createdAt,
                adminReply: feedback.response?.adminReply || null
            }))
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Admin reply to feedback
router.put('/feedback/:id/reply', adminAuth, async (req, res) => {
    try {
        const { adminReply } = req.body;
        const feedback = await Feedback.findByIdAndUpdate(
            req.params.id,
            {
                'response.adminReply': adminReply,
                'response.repliedAt': new Date(),
                'response.repliedBy': req.user.id
            },
            { new: true }
        ).populate('user', 'name email');

        res.json({
            success: true,
            message: 'Reply added successfully',
            feedback: {
                id: feedback._id,
                user: feedback.user,
                rating: feedback.rating,
                comment: feedback.comment,
                adminReply: feedback.response?.adminReply
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Update feedback status
router.put('/feedback/:id/status', adminAuth, async (req, res) => {
    try {
        const { status } = req.body;
        const feedback = await Feedback.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );

        res.json({
            success: true,
            message: `Feedback ${status.toLowerCase()} successfully`,
            feedback: {
                id: feedback._id,
                status: feedback.status
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// REPORTS & ANALYTICS ROUTES

// Get reports - REAL DATA
router.get('/reports', adminAuth, async (req, res) => {
    try {
        const { period = 'monthly' } = req.query;
        
        // Get REAL data
        const bookings = await Booking.find().populate('room');
        const rooms = await Room.find();
        
        // Calculate date ranges
        const now = new Date();
        let startDate;
        
        switch(period) {
            case 'daily':
                startDate = new Date(now.setHours(0, 0, 0, 0));
                break;
            case 'weekly':
                startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                break;
            case 'monthly':
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                break;
            default:
                startDate = new Date(now.getFullYear(), 0, 1); // Yearly
        }

        // Revenue by date
        const revenueByDate = bookings
            .filter(booking => new Date(booking.createdAt) >= startDate)
            .reduce((acc, booking) => {
                const date = booking.createdAt.toISOString().split('T')[0];
                acc[date] = (acc[date] || 0) + (booking.totalPrice || 0);
                return acc;
            }, {});

        // Room type performance
        const roomTypeRevenue = rooms.map(room => {
            const roomBookings = bookings.filter(b => b.room?._id?.toString() === room._id.toString());
            const revenue = roomBookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0);
            
            return {
                type: room.type,
                revenue: revenue,
                bookings: roomBookings.length,
                occupancy: (roomBookings.length / bookings.length * 100).toFixed(1)
            };
        });

        // Booking status distribution
        const statusDistribution = bookings.reduce((acc, booking) => {
            acc[booking.status] = (acc[booking.status] || 0) + 1;
            return acc;
        }, {});

        res.json({
            success: true,
            period,
            reports: {
                revenueData: Object.entries(revenueByDate).map(([date, revenue]) => ({ date, revenue })),
                roomTypePerformance: roomTypeRevenue,
                statusDistribution,
                totalRevenue: Object.values(revenueByDate).reduce((sum, revenue) => sum + revenue, 0),
                totalBookings: bookings.filter(b => new Date(b.createdAt) >= startDate).length,
                averageBookingValue: bookings.length > 0 ? 
                    bookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0) / bookings.length : 0
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Revenue Services - REAL DATA
router.get('/revenue-services', adminAuth, async (req, res) => {
    try {
        // In a real system, you'd have a separate services collection
        // For now, we'll calculate from booking special requests and room amenities
        const bookings = await Booking.find();
        
        const revenueServices = [
            {
                service: 'Room Service',
                revenue: bookings.filter(b => b.specialRequests?.includes('room service')).length * 50,
                bookings: bookings.filter(b => b.specialRequests?.includes('room service')).length
            },
            {
                service: 'Spa & Wellness',
                revenue: bookings.filter(b => b.specialRequests?.includes('spa')).length * 100,
                bookings: bookings.filter(b => b.specialRequests?.includes('spa')).length
            },
            {
                service: 'Airport Transfer',
                revenue: bookings.filter(b => b.specialRequests?.includes('transfer')).length * 75,
                bookings: bookings.filter(b => b.specialRequests?.includes('transfer')).length
            },
            {
                service: 'Conference Room',
                revenue: bookings.filter(b => b.specialRequests?.includes('conference')).length * 200,
                bookings: bookings.filter(b => b.specialRequests?.includes('conference')).length
            }
        ].filter(service => service.bookings > 0);

        const totalSecondaryRevenue = revenueServices.reduce((sum, service) => sum + service.revenue, 0);

        res.json({
            success: true,
            revenueServices,
            summary: {
                totalSecondaryRevenue,
                mostProfitableService: revenueServices.reduce((prev, current) => 
                    (prev.revenue > current.revenue) ? prev : current, { service: 'None', revenue: 0 }
                ),
                totalServiceBookings: revenueServices.reduce((sum, service) => sum + service.bookings, 0)
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;