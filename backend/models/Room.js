const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
    name: { type: String, required: true },
    type: { type: String, required: true },
    price: { type: Number, required: true },
    description: String,
    amenities: [String],
    images: [String],
    status: { 
        type: String, 
        enum: ['Available', 'Occupied', 'Reserved', 'Maintenance'], 
        default: 'Available' 
    },
    capacity: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Room', roomSchema);