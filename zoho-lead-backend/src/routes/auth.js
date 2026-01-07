/**
 * Authentication Routes
 * Login, logout, and token refresh endpoints
 */

const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();

// JWT Configuration
const JWT_SECRET = process.env.JWT_SECRET || 'leadflow-dev-secret-key-change-in-production';
const ACCESS_TOKEN_EXPIRY = '1h';
const REFRESH_TOKEN_EXPIRY = '7d';

// In-memory user store (for development/demo purposes)
// In production, replace with database queries and proper password hashing
const users = [
    {
        id: 'user-1',
        email: 'admin@example.com',
        password: 'admin123', // In production: use bcrypt hashed passwords
        name: 'Admin User',
        role: 'admin'
    },
    {
        id: 'user-2',
        email: 'manager@example.com',
        password: 'manager123',
        name: 'Sales Manager',
        role: 'manager'
    },
    {
        id: 'user-3',
        email: 'agent@example.com',
        password: 'agent123',
        name: 'Sales Agent',
        role: 'agent'
    }
];

// In-memory refresh token store (for development)
// In production, store in database or Redis
const refreshTokens = new Set();

/**
 * Generate JWT tokens
 */
function generateTokens(user) {
    const payload = {
        userId: user.id,
        email: user.email,
        name: user.name,
        role: user.role
    };

    const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });
    const refreshToken = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRY });

    refreshTokens.add(refreshToken);

    return { accessToken, refreshToken };
}

/**
 * POST /auth/login
 * Authenticate user and return tokens
 */
router.post('/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            success: false,
            error: 'Email and password are required'
        });
    }

    // Find user by email
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!user || user.password !== password) {
        return res.status(401).json({
            success: false,
            error: 'Invalid email or password'
        });
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user);

    res.json({
        success: true,
        accessToken,
        refreshToken,
        user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role
        }
    });
});

/**
 * POST /auth/refresh
 * Refresh access token using refresh token
 */
router.post('/refresh', (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        return res.status(400).json({
            success: false,
            error: 'Refresh token is required'
        });
    }

    // Check if refresh token exists in our store
    if (!refreshTokens.has(refreshToken)) {
        return res.status(401).json({
            success: false,
            error: 'Invalid refresh token'
        });
    }

    try {
        // Verify refresh token
        const decoded = jwt.verify(refreshToken, JWT_SECRET);
        const user = users.find(u => u.id === decoded.userId);

        if (!user) {
            return res.status(401).json({
                success: false,
                error: 'User not found'
            });
        }

        // Generate new access token only
        const payload = {
            userId: user.id,
            email: user.email,
            name: user.name,
            role: user.role
        };
        const newAccessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });

        res.json({
            success: true,
            accessToken: newAccessToken
        });
    } catch (error) {
        // Token expired or invalid
        refreshTokens.delete(refreshToken);
        return res.status(401).json({
            success: false,
            error: 'Invalid or expired refresh token'
        });
    }
});

/**
 * POST /auth/logout
 * Invalidate refresh token
 */
router.post('/logout', (req, res) => {
    const { refreshToken } = req.body;

    if (refreshToken) {
        refreshTokens.delete(refreshToken);
    }

    res.json({
        success: true,
        message: 'Logged out successfully'
    });
});

module.exports = router;
