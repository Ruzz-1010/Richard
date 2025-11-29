const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('✅ MongoDB Connected'))
    .catch(err => console.log('❌ MongoDB Connection Error:', err));

const app = express();

app.use(cors());
app.use(express.json());

// Basic test route
app.get('/', (req, res) => {
    res.json({ 
        message: '🏨 Luxury Hotel Booking API is running!',
        database: 'Connected to MongoDB',
        status: 'active',
        timestamp: new Date().toISOString()
    });
});

// Simple auth routes
app.get('/api/auth/test', (req, res) => {
    res.json({ message: 'Auth route is working!' });
});

app.post('/api/auth/register', (req, res) => {
    res.json({ message: 'Register endpoint - to be implemented' });
});

app.post('/api/auth/login', (req, res) => {
    res.json({ message: 'Login endpoint - to be implemented' });
});

// Simple room routes
app.get('/api/rooms', (req, res) => {
    res.json({ message: 'Get all rooms - to be implemented' });
});

app.get('/api/rooms/:id', (req, res) => {
    res.json({ message: `Get room ${req.params.id} - to be implemented` });
});

// Simple booking routes
app.get('/api/bookings', (req, res) => {
    res.json({ message: 'Get all bookings - to be implemented' });
});

app.post('/api/bookings', (req, res) => {
    res.json({ message: 'Create booking - to be implemented' });
});

// Simple feedback routes
app.get('/api/feedback', (req, res) => {
    res.json({ message: 'Get all feedback - to be implemented' });
});

app.post('/api/feedback', (req, res) => {
    res.json({ message: 'Create feedback - to be implemented' });
});

// Simple admin routes
app.get('/api/admin/dashboard', (req, res) => {
    res.json({ message: 'Admin dashboard - to be implemented' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});