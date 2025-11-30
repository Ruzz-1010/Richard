const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true,
        unique: true 
    },
    type: { 
        type: String, 
        required: true,
        enum: ['Standard', 'Deluxe', 'Executive', 'Suite', 'Presidential']
    },
    price: { 
        type: Number, 
        required: true,
        min: 0
    },
    description: { 
        type: String,
        default: 'Comfortable and well-appointed room for your stay.' 
    },
    amenities: [{ 
        type: String 
    }],
    images: [{ 
        type: String 
    }],
    status: { 
        type: String, 
        enum: ['Available', 'Occupied', 'Reserved', 'Maintenance'], 
        default: 'Available' 
    },
    capacity: { 
        type: Number, 
        required: true,
        min: 1,
        max: 10,
        default: 2
    },
    size: { 
        type: String,
        default: 'Standard' 
    },
    bedType: { 
        type: String,
        default: 'Queen Bed'
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
roomSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Room', roomSchema);