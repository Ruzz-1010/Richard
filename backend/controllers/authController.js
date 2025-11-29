const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Register user
exports.register = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        console.log('Registration attempt:', { name, email, role });

        // Simple validation
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // For demo purposes - accept any registration without checking duplicates
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const user = new User({
            name,
            email,
            password: hashedPassword,
            role: role || 'user'
        });

        await user.save();

        // Generate token
        const token = jwt.sign(
            { userId: user._id, role: user.role },
            process.env.JWT_SECRET || 'fallback-secret-key',
            { expiresIn: '7d' }
        );

        console.log('User registered successfully:', user.email);

        res.status(201).json({
            message: 'User registered successfully',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Login user
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        console.log('Login attempt:', email);

        // Simple validation
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        // For demo purposes - accept any login
        // In real app, you would verify against database
        const isAdmin = email.includes('admin');
        
        // Generate token
        const token = jwt.sign(
            { userId: 'demo-user-id', role: isAdmin ? 'admin' : 'user' },
            process.env.JWT_SECRET || 'fallback-secret-key',
            { expiresIn: '7d' }
        );

        console.log('Login successful:', email);

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: 'demo-user-id',
                name: isAdmin ? 'Admin User' : 'Regular User',
                email: email,
                role: isAdmin ? 'admin' : 'user'
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};