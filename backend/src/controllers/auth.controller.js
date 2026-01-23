const authService = require('../services/auth.service');

/**
 * Register a new user
 */
const register = async (req, res) => {
    try {
        const { email, password, name } = req.body;

        // Validate input
        if (!email || !password || !name) {
            return res.status(400).json({
                status: 'FAILED',
                message: 'Email, password, and name are required'
            });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                status: 'FAILED',
                message: 'Invalid email format'
            });
        }

        // Validate password length
        if (password.length < 6) {
            return res.status(400).json({
                status: 'FAILED',
                message: 'Password must be at least 6 characters long'
            });
        }

        const result = await authService.registerUser(email, password, name);

        res.status(201).json({
            status: 'SUCCESS',
            data: result
        });
    } catch (error) {
        if (error.message === 'User already exists') {
            return res.status(409).json({
                status: 'FAILED',
                message: error.message
            });
        }

        console.error('Registration error:', error);
        res.status(500).json({
            status: 'FAILED',
            message: 'Internal server error'
        });
    }
};

/**
 * Login user
 */
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({
                status: 'FAILED',
                message: 'Email and password are required'
            });
        }

        const result = await authService.loginUser(email, password);

        res.json({
            status: 'SUCCESS',
            data: result
        });
    } catch (error) {
        if (error.message === 'Invalid credentials') {
            return res.status(401).json({
                status: 'FAILED',
                message: error.message
            });
        }

        console.error('Login error:', error);
        res.status(500).json({
            status: 'FAILED',
            message: 'Internal server error'
        });
    }
};

module.exports = {
    register,
    login
};
