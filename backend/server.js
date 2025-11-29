const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config();

// Connect to MongoDB with proper options
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('✅ MongoDB Connected Successfully'))
.catch(err => {
    console.log('❌ MongoDB Connection Error:', err.message);
    console.log('🔗 Connection URI:', process.env.MONGODB_URI ? 'Present' : 'Missing');
});

const app = express();

app.use(cors());
app.use(express.json());

// Basic test route
app.get('/', (req, res) => {
    const dbStatus = mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected';
    
    res.json({ 
        message: '🏨 Luxury Hotel Booking API is running!',
        database: dbStatus,
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

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🔗 MongoDB URI: ${process.env.MONGODB_URI ? 'Present' : 'Missing'}`);
});