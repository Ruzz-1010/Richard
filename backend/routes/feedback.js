const express = require('express');
const Feedback = require('../models/Feedback');
const Booking = require('../models/Booking');
const { auth } = require('../middleware/auth');
const router = express.Router();

// Submit feedback (user must be logged in)
router.post('/', auth, async (req, res) => {
    try {
        const { rating, comment, category, bookingId } = req.body;

        // Validate required fields
        if (!rating) {
            return res.status(400).json({ 
                success: false,
                message: 'Rating is required' 
            });
        }

        // Validate rating range
        if (rating < 1 || rating > 5) {
            return res.status(400).json({ 
                success: false,
                message: 'Rating must be between 1 and 5' 
            });
        }

        // Check if booking exists and belongs to user (if provided)
        let booking = null;
        if (bookingId) {
            booking = await Booking.findOne({ 
                _id: bookingId, 
                user: req.user.id 
            });
            
            if (!booking) {
                return res.status(404).json({ 
                    success: false,
                    message: 'Booking not found or access denied' 
                });
            }
        }

        // Check if user already submitted feedback for this booking
        if (bookingId) {
            const existingFeedback = await Feedback.findOne({ 
                user: req.user.id, 
                booking: bookingId 
            });
            
            if (existingFeedback) {
                return res.status(400).json({ 
                    success: false,
                    message: 'You have already submitted feedback for this booking' 
                });
            }
        }

        // Create feedback
        const feedback = new Feedback({
            user: req.user.id,
            booking: bookingId || null,
            rating: rating,
            comment: comment || '',
            category: category || 'Overall'
        });

        await feedback.save();

        // Populate user info for response
        await feedback.populate('user', 'name email');

        res.status(201).json({
            success: true,
            message: 'Thank you for your feedback!',
            feedback: {
                id: feedback._id,
                user: feedback.user,
                rating: feedback.rating,
                comment: feedback.comment,
                category: feedback.category,
                createdAt: feedback.createdAt
            }
        });
    } catch (error) {
        console.error('Feedback error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Error submitting feedback', 
            error: error.message 
        });
    }
});

// Get user's feedback (user must be logged in)
router.get('/my-feedback', auth, async (req, res) => {
    try {
        const feedbacks = await Feedback.find({ user: req.user.id })
            .populate('booking', 'checkIn checkOut')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            feedbacks: feedbacks.map(feedback => ({
                id: feedback._id,
                rating: feedback.rating,
                comment: feedback.comment,
                category: feedback.category,
                status: feedback.status,
                booking: feedback.booking ? {
                    checkIn: feedback.booking.checkIn,
                    checkOut: feedback.booking.checkOut
                } : null,
                createdAt: feedback.createdAt,
                adminReply: feedback.response?.adminReply || null
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

// Get all approved feedbacks (public access)
router.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const feedbacks = await Feedback.find({ status: 'Approved' })
            .populate('user', 'name')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Feedback.countDocuments({ status: 'Approved' });

        res.json({
            success: true,
            feedbacks: feedbacks.map(feedback => ({
                id: feedback._id,
                user: feedback.user,
                rating: feedback.rating,
                comment: feedback.comment,
                category: feedback.category,
                createdAt: feedback.createdAt,
                adminReply: feedback.response?.adminReply || null
            })),
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: 'Error fetching feedback', 
            error: error.message 
        });
    }
});

// Get feedback statistics (public access)
router.get('/stats', async (req, res) => {
    try {
        const stats = await Feedback.aggregate([
            { $match: { status: 'Approved' } },
            {
                $group: {
                    _id: null,
                    totalReviews: { $sum: 1 },
                    averageRating: { $avg: '$rating' },
                    ratingDistribution: {
                        $push: '$rating'
                    }
                }
            }
        ]);

        const categoryStats = await Feedback.aggregate([
            { $match: { status: 'Approved' } },
            {
                $group: {
                    _id: '$category',
                    count: { $sum: 1 },
                    averageRating: { $avg: '$rating' }
                }
            }
        ]);

        const result = {
            totalReviews: stats[0]?.totalReviews || 0,
            averageRating: stats[0]?.averageRating ? Math.round(stats[0].averageRating * 10) / 10 : 0,
            ratingDistribution: {
                1: 0, 2: 0, 3: 0, 4: 0, 5: 0
            },
            categories: categoryStats
        };

        // Calculate rating distribution
        if (stats[0]?.ratingDistribution) {
            stats[0].ratingDistribution.forEach(rating => {
                result.ratingDistribution[rating]++;
            });
        }

        res.json({
            success: true,
            stats: result
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: 'Error fetching feedback statistics', 
            error: error.message 
        });
    }
});

// Update feedback (user can update their own feedback)
router.put('/:id', auth, async (req, res) => {
    try {
        const { rating, comment, category } = req.body;
        const feedbackId = req.params.id;

        const feedback = await Feedback.findById(feedbackId);

        if (!feedback) {
            return res.status(404).json({ 
                success: false,
                message: 'Feedback not found' 
            });
        }

        // Check if user owns this feedback
        if (feedback.user.toString() !== req.user.id) {
            return res.status(403).json({ 
                success: false,
                message: 'Access denied' 
            });
        }

        // Update feedback
        if (rating !== undefined) feedback.rating = rating;
        if (comment !== undefined) feedback.comment = comment;
        if (category !== undefined) feedback.category = category;

        await feedback.save();

        res.json({
            success: true,
            message: 'Feedback updated successfully',
            feedback: {
                id: feedback._id,
                rating: feedback.rating,
                comment: feedback.comment,
                category: feedback.category,
                updatedAt: feedback.updatedAt
            }
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: 'Error updating feedback', 
            error: error.message 
        });
    }
});

// Delete feedback (user can delete their own feedback)
router.delete('/:id', auth, async (req, res) => {
    try {
        const feedbackId = req.params.id;

        const feedback = await Feedback.findById(feedbackId);

        if (!feedback) {
            return res.status(404).json({ 
                success: false,
                message: 'Feedback not found' 
            });
        }

        // Check if user owns this feedback
        if (feedback.user.toString() !== req.user.id) {
            return res.status(403).json({ 
                success: false,
                message: 'Access denied' 
            });
        }

        await Feedback.findByIdAndDelete(feedbackId);

        res.json({
            success: true,
            message: 'Feedback deleted successfully'
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: 'Error deleting feedback', 
            error: error.message 
        });
    }
});

module.exports = router;