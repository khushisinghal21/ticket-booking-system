const pool = require('../db/postgres');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key';

/**
 * Register a new user
 */
const registerUser = async (email, password, name) => {
    // Check if user already exists
    const existingUser = await pool.query(
        'SELECT id FROM users WHERE email = $1',
        [email]
    );

    if (existingUser.rows.length > 0) {
        throw new Error('User already exists');
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Insert user
    const result = await pool.query(
        'INSERT INTO users (email, password_hash, name) VALUES ($1, $2, $3) RETURNING id, email, name, created_at',
        [email, passwordHash, name]
    );

    const user = result.rows[0];
    const token = generateToken(user.id, user.email);

    return {
        user: {
            id: user.id,
            email: user.email,
            name: user.name,
            createdAt: user.created_at
        },
        token
    };
};

/**
 * Login user
 */
const loginUser = async (email, password) => {
    // Find user
    const result = await pool.query(
        'SELECT id, email, name, password_hash, created_at FROM users WHERE email = $1',
        [email]
    );

    if (result.rows.length === 0) {
        throw new Error('Invalid credentials');
    }

    const user = result.rows[0];

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
        throw new Error('Invalid credentials');
    }

    const token = generateToken(user.id, user.email);

    return {
        user: {
            id: user.id,
            email: user.email,
            name: user.name,
            createdAt: user.created_at
        },
        token
    };
};

/**
 * Generate JWT token
 */
const generateToken = (userId, email) => {
    return jwt.sign(
        { userId, email },
        JWT_SECRET,
        { expiresIn: '7d' }
    );
};

/**
 * Verify JWT token
 */
const verifyToken = (token) => {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        throw new Error('Invalid token');
    }
};

module.exports = {
    registerUser,
    loginUser,
    generateToken,
    verifyToken
};
