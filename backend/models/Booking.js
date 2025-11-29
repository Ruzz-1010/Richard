const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    user: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    room: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Room', 
        required: true 
    },
    checkIn: { 
        type: Date, 
        required: true 
    },
    checkOut: { 
        type: Date, 
        required: true 
    },
    guests: { 
        type: Number, 
        required: true,
        min: 1,
        max: 10
    },
    totalPrice: { 
        type: Number, 
        required: true 
    },
    status: { 
        type: String, 
        enum: ['Pending', 'Confirmed', 'Checked-in', 'Checked-out', 'Cancelled'], 
        default: 'Pending' 
    },
    specialRequests: { 
        type: String,
        default: '' 
    },
    paymentStatus: {
        type: String,
        enum: ['Pending', 'Paid', 'Refunded', 'Failed'],
        default: 'Pending'
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
bookingSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

// Calculate total price before saving
bookingSchema.pre('save', async function(next) {
    if (this.isModified('checkIn') || this.isModified('checkOut') || this.isModified('room')) {
        const Room = mongoose.model('Room');
        const room = await Room.findById(this.room);
        
        if (room) {
            const nights = Math.ceil((this.checkOut - this.checkIn) / (1000 * 60 * 60 * 24));
            this.totalPrice = room.price * nights;
        }
    }
    next();
});

module.exports = mongoose.model('Booking', bookingSchema);