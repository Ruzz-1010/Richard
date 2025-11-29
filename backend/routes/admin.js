const express = require('express');
const { adminAuth } = require('../middleware/auth');
const Room = require('../models/Room');
const Booking = require('../models/Booking');
const User = require('../models/User');
const Feedback = require('../models/Feedback');
const router = express.Router();

// Admin Dashboard Statistics
router.get('/dashboard', adminAuth, async (req, res) => {
    try {
        const [rooms, bookings, users, feedbacks] = await Promise.all([
            Room.find(),
            Booking.find().populate('user room'),
            User.find(),
            Feedback.find().populate('user')
        ]);

        // Calculate statistics
        const totalRooms = rooms.length;
        const occupiedRooms = rooms.filter(room => room.status === 'Occupied').length;
        const reservedRooms = rooms.filter(room => room.status === 'Reserved').length;
        const maintenanceRooms = rooms.filter(room => room.status === 'Maintenance').length;
        const availableRooms = rooms.filter(room => room.status === 'Available').length;
        
        const totalBookings = bookings.length;
        const pendingBookings = bookings.filter(booking => booking.status === 'Pending').length;
        const confirmedBookings = bookings.filter(booking => booking.status === 'Confirmed').length;
        const checkedInBookings = bookings.filter(booking => booking.status === 'Checked-in').length;
        
        const totalUsers = users.length;
        const totalRevenue = bookings
            .filter(booking => ['Confirmed', 'Checked-in', 'Checked-out'].includes(booking.status))
            .reduce((sum, booking) => sum + (booking.totalPrice || 0), 0);

        // Revenue calculations
        const today = new Date();
        const todayStart = new Date(today.setHours(0, 0, 0, 0));
        const todayEnd = new Date(today.setHours(23, 59, 59, 999));
        
        const dailyRevenue = bookings
            .filter(booking => 
                new Date(booking.createdAt) >= todayStart && 
                new Date(booking.createdAt) <= todayEnd &&
                ['Confirmed', 'Checked-in', 'Checked-out'].includes(booking.status)
            )
            .reduce((sum, booking) => sum + (booking.totalPrice || 0), 0);

        const weeklyStart = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        const weeklyRevenue = bookings
            .filter(booking => 
                new Date(booking.createdAt) >= weeklyStart &&
                ['Confirmed', 'Checked-in', 'Checked-out'].includes(booking.status)
            )
            .reduce((sum, booking) => sum + (booking.totalPrice || 0), 0);

        // Recent activities
        const recentBookings = bookings
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 10)
            .map(booking => ({
                id: booking._id,
                userName: booking.user?.name || 'Unknown',
                roomName: booking.room?.name || 'Unknown',
                checkIn: booking.checkIn,
                checkOut: booking.checkOut,
                status: booking.status,
                totalPrice: booking.totalPrice,
                createdAt: booking.createdAt
            }));

        const recentFeedbacks = feedbacks
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 5)
            .map(feedback => ({
                id: feedback._id,
                userName: feedback.user?.name || 'Unknown',
                rating: feedback.rating,
                comment: feedback.comment,
                createdAt: feedback.createdAt
            }));

        res.json({
            success: true,
            stats: {
                totalRooms,
                occupiedRooms,
                reservedRooms,
                maintenanceRooms,
                availableRooms,
                totalBookings,
                pendingBookings,
                confirmedBookings,
                checkedInBookings,
                totalUsers,
                totalRevenue,
                dailyRevenue,
                weeklyRevenue,
                occupancyRate: totalRooms > 0 ? ((occupiedRooms + reservedRooms) / totalRooms * 100).toFixed(1) : 0
            },
            recentBookings,
            recentFeedbacks,
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

// Room Management
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

// Booking Management
router.get('/bookings', adminAuth, async (req, res) => {
    try {
        const bookings = await Booking.find()
            .populate('user', 'name email phone')
            .populate('room', 'name price type')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            bookings: bookings.map(booking => ({
                id: booking._id,
                userName: booking.user?.name || 'Unknown',
                userEmail: booking.user?.email || 'No Email',
                userPhone: booking.user?.phone || 'No Phone',
                roomName: booking.room?.name || 'Unknown',
                roomType: booking.room?.type || 'Unknown',
                roomPrice: booking.room?.price || 0,
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

// Update booking status (Check-in/Check-out)
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

        // Update room status based on booking status
        if (status === 'Checked-in') {
            await Room.findByIdAndUpdate(booking.room, { status: 'Occupied' });
        } else if (status === 'Checked-out' || status === 'Cancelled') {
            await Room.findByIdAndUpdate(booking.room, { status: 'Available' });
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

// Reports and Analytics
router.get('/reports', adminAuth, async (req, res) => {
    try {
        const { period = 'monthly' } = req.query;
        const now = new Date();
        let startDate;

        switch (period) {
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
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        }

        const reports = await Booking.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate },
                    status: { $in: ['Confirmed', 'Checked-in', 'Checked-out'] }
                }
            },
            {
                $group: {
                    _id: {
                        $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
                    },
                    revenue: { $sum: "$totalPrice" },
                    bookings: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        const roomOccupancy = await Room.aggregate([
            {
                $group: {
                    _id: "$status",
                    count: { $sum: 1 }
                }
            }
        ]);

        const revenueByRoomType = await Booking.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate },
                    status: { $in: ['Confirmed', 'Checked-in', 'Checked-out'] }
                }
            },
            {
                $lookup: {
                    from: "rooms",
                    localField: "room",
                    foreignField: "_id",
                    as: "roomData"
                }
            },
            {
                $group: {
                    _id: { $arrayElemAt: ["$roomData.type", 0] },
                    revenue: { $sum: "$totalPrice" },
                    bookings: { $sum: 1 }
                }
            }
        ]);

        res.json({
            success: true,
            period,
            reports: {
                revenueData: reports,
                roomOccupancy,
                revenueByRoomType,
                summary: {
                    totalRevenue: reports.reduce((sum, item) => sum + item.revenue, 0),
                    totalBookings: reports.reduce((sum, item) => sum + item.bookings, 0),
                    averageBookingValue: reports.length > 0 ? 
                        reports.reduce((sum, item) => sum + item.revenue, 0) / 
                        reports.reduce((sum, item) => sum + item.bookings, 0) : 0
                }
            }
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Error generating reports', 
            error: error.message 
        });
    }
});

// Revenue Services (Secondary revenue)
router.get('/revenue-services', adminAuth, async (req, res) => {
    try {
        // Mock data for additional services revenue
        const revenueServices = [
            { service: 'Spa & Wellness', revenue: 2500, bookings: 45 },
            { service: 'Restaurant', revenue: 1800, bookings: 120 },
            { service: 'Conference Room', revenue: 3200, bookings: 25 },
            { service: 'Airport Transfer', revenue: 800, bookings: 40 },
            { service: 'Laundry', revenue: 450, bookings: 85 }
        ];

        const totalSecondaryRevenue = revenueServices.reduce((sum, service) => sum + service.revenue, 0);

        res.json({
            success: true,
            revenueServices,
            summary: {
                totalSecondaryRevenue,
                mostProfitableService: revenueServices.reduce((prev, current) => 
                    (prev.revenue > current.revenue) ? prev : current
                ),
                totalServiceBookings: revenueServices.reduce((sum, service) => sum + service.bookings, 0)
            }
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Error fetching revenue services', 
            error: error.message 
        });
    }
});

module.exports = router;