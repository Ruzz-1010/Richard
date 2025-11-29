const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
    name: { type: String, required: true },
    type: { type: String, required: true },
    price: { type: Number, required: true },
    amenities: [String],
    status: { 
        type: String, 
        enum: ['Vacant', 'Occupied', 'Reserved', 'Under Maintenance'], 
        default: 'Vacant' 
    },
    images: [String],
    description: String,
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Room', roomSchema);    