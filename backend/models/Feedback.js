const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
    user: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    booking: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Booking' 
    },
    rating: { 
        type: Number, 
        required: true,
        min: 1,
        max: 5
    },
    comment: { 
        type: String,
        trim: true,
        maxlength: 1000
    },
    category: {
        type: String,
        enum: ['Service', 'Room Quality', 'Cleanliness', 'Amenities', 'Location', 'Overall'],
        default: 'Overall'
    },
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected'],
        default: 'Approved'
    },
    response: {
        adminReply: String,
        repliedAt: Date,
        repliedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    },
    updatedAt: { 
        type: Date, 
        default: Date.now 
    }
});

// Update the updatedAt field before saving
feedbackSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Feedback', feedbackSchema);