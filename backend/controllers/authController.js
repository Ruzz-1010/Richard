const User = require('../models/User');
const jwt = require('jsonwebtoken');
const Recaptcha = require('recaptcha2');

// Register user
const register = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        console.log('Registration attempt:', { name, email, role });

        // Simple validation
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists with this email' });
        }

        // Create user
        const user = new User({
            name,
            email,
            password,
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
const login = async (req, res) => {
    try {
        const { email, password, recaptchaResponse } = req.body;

        console.log('Login attempt:', email);

        // Simple validation
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        // Verify reCAPTCHA
        const recaptcha = new Recaptcha({
            siteKey: '6LeyrhwsAAAAACZx4BBID7lZ1VEeC-rJfh5yQIA8',
            secretKey: '6LeyrhwsAAAAAJDIsKE8cX_KR9Dxhl_Q40hwSE0x'
        });

        try {
            await recaptcha.validate(recaptchaResponse);
        } catch (error) {
            console.log('reCAPTCHA verification failed:', error.message);
            return res.status(400).json({ message: 'reCAPTCHA verification failed' });
        }

        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Check password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Generate token
        const token = jwt.sign(
            { userId: user._id, role: user.role },
            process.env.JWT_SECRET || 'fallback-secret-key',
            { expiresIn: '7d' }
        );

        console.log('Login successful:', user.email);

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

// Get current user
const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json({
            success: true,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// Export all functions
module.exports = {
    register,
    login,
    getMe
};