/**
 * User Model
 * In-memory user storage (TODO: Replace with database)
 */

const bcrypt = require('bcrypt');

// TODO: Replace with database
// For alpha/demo purposes, we use hardcoded users
const users = [
    {
        id: 'user_001',
        email: 'admin@example.com',
        // Password: admin123
        passwordHash: '$2b$10$Y7LxQ.2tVPaQH4k9YRfIW.pxP5zPgJx/JHSASYAcDmWkUZRc3ttya',
        name: 'Admin User',
        role: 'admin'
    },
    {
        id: 'user_002',
        email: 'agent@example.com',
        // Password: agent123
        passwordHash: '$2b$10$n5RkQy/WqA6MHs3JjN8hXuFZ6WqSvVxZ0D7YmR9kPeL.5ZHxGJKLO',
        name: 'Agent User',
        role: 'agent'
    },
    {
        id: 'user_003',
        email: 'manager@example.com',
        // Password: manager123
        passwordHash: '$2b$10$n84dWa7N4NjOLJ0JmloGPuWKqCvT4RgLmO2sP8NkJeX.8QyHzGK3e',
        name: 'Manager User',
        role: 'manager'
    }
];

// In-memory refresh token store (TODO: Move to Redis)
const refreshTokens = new Set();

/**
 * Find user by email
 */
async function findByEmail(email) {
    return users.find(u => u.email.toLowerCase() === email.toLowerCase());
}

/**
 * Find user by ID
 */
async function findById(id) {
    return users.find(u => u.id === id);
}

/**
 * Verify password
 */
async function verifyPassword(plainPassword, hashedPassword) {
    return bcrypt.compare(plainPassword, hashedPassword);
}

/**
 * Hash password (for future user creation)
 */
async function hashPassword(plainPassword) {
    return bcrypt.hash(plainPassword, 10);
}

/**
 * Store refresh token
 */
function storeRefreshToken(token) {
    refreshTokens.add(token);
}

/**
 * Check if refresh token exists
 */
function hasRefreshToken(token) {
    return refreshTokens.has(token);
}

/**
 * Remove refresh token (logout)
 */
function removeRefreshToken(token) {
    refreshTokens.delete(token);
}

/**
 * Get safe user object (without password)
 */
function getSafeUser(user) {
    if (!user) return null;

    const { passwordHash, ...safeUser } = user;
    return safeUser;
}

module.exports = {
    findByEmail,
    findById,
    verifyPassword,
    hashPassword,
    storeRefreshToken,
    hasRefreshToken,
    removeRefreshToken,
    getSafeUser
};
