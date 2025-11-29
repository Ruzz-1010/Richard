const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('✅ MongoDB Connected Successfully'))
.catch(err => {
    console.log('❌ MongoDB Connection Error:', err.message);
});

const app = express();

// CORS configuration - allow all origins for now
app.use(cors({
    origin: '*',
    credentials: true
}));

app.use(express.json());

// Test route
app.get('/', (req, res) => {
    const dbStatus = mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected';
    
    res.json({ 
        message: '🏨 Luxury Hotel Booking API is running!',
        database: dbStatus,
        status: 'active',
        timestamp: new Date().toISOString()
    });
});

// Auth routes
app.post('/api/auth/register', async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        
        // Simple validation
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // For now, just return success without database
        res.status(201).json({
            message: 'User registered successfully (demo)',
            token: 'demo-token-' + Date.now(),
            user: { 
                id: 'demo-id', 
                name: name, 
                email: email, 
                role: role || 'user' 
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Simple validation
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        // Demo login - accept any credentials
        res.json({
            message: 'Login successful (demo)',
            token: 'demo-token-' + Date.now(),
            user: { 
                id: 'demo-id', 
                name: 'Demo User', 
                email: email, 
                role: email.includes('admin') ? 'admin' : 'user' 
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Rooms routes
app.get('/api/rooms', (req, res) => {
    // Demo rooms data
    const rooms = [
        { id: 1, name: "Deluxe Room", price: 200, status: "Vacant", amenities: ["WiFi", "TV", "AC"] },
        { id: 2, name: "Executive Suite", price: 350, status: "Occupied", amenities: ["WiFi", "TV", "AC", "Mini Bar"] },
        { id: 3, name: "Presidential Suite", price: 500, status: "Vacant", amenities: ["WiFi", "TV", "AC", "Jacuzzi"] }
    ];
    res.json(rooms);
});

app.post('/api/rooms', (req, res) => {
    res.json({ message: 'Room created successfully (demo)' });
});

// Simple test endpoint
app.get('/api/auth/test', (req, res) => {
    res.json({ message: 'Auth route is working!' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🔗 MongoDB URI: ${process.env.MONGODB_URI ? 'Present' : 'Missing'}`);
});