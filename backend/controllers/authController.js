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

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists with this email' });
        }

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

        // DEMO MODE: For demo purposes, accept specific emails without database check
        const demoUsers = {
            'admin@hotel.com': { 
                name: 'Admin User', 
                role: 'admin', 
                id: 'demo-admin-id' 
            },
            'user@hotel.com': { 
                name: 'Regular User', 
                role: 'user', 
                id: 'demo-user-id' 
            }
        };

        // Check if it's a demo user
        if (demoUsers[email]) {
            const demoUser = demoUsers[email];
            
            // Generate token for demo user
            const token = jwt.sign(
                { userId: demoUser.id, role: demoUser.role },
                process.env.JWT_SECRET || 'fallback-secret-key',
                { expiresIn: '7d' }
            );

            console.log('Demo login successful:', email);

            return res.json({
                message: 'Login successful',
                token,
                user: {
                    id: demoUser.id,
                    name: demoUser.name,
                    email: email,
                    role: demoUser.role
                }
            });
        }

        // REAL USER: Find user in database
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Generate token for real user
        const token = jwt.sign(
            { userId: user._id, role: user.role },
            process.env.JWT_SECRET || 'fallback-secret-key',
            { expiresIn: '7d' }
        );

        console.log('Real user login successful:', user.email);

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};