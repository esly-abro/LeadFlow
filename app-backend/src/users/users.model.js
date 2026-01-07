/**
 * User Model Service
 * Database operations for user management
 * Uses MongoDB via Mongoose (with in-memory fallback)
 */

const bcrypt = require('bcrypt');

// Lazy load models to avoid circular dependency issues
let User, RefreshToken;
function getModels() {
    if (!User) {
        User = require('../models/User');
        RefreshToken = require('../models/RefreshToken');
    }
    return { User, RefreshToken };
}

// Check if we're using MongoDB or fallback to in-memory
const useDatabase = () => !!process.env.MONGODB_URI;

// Fallback: In-memory storage for development without MongoDB
const inMemoryUsers = [
    {
        id: 'user_001',
        _id: 'user_001',
        email: 'admin@example.com',
        // Password: admin123
        passwordHash: '$2b$10$qHYTTMZCK8aV.xsx9GwW1.78IpO7a6mvREleu6X.6jZ8aMwH92iC.',
        name: 'Admin User',
        role: 'admin'
    },
    {
        id: 'user_002',
        _id: 'user_002',
        email: 'agent@example.com',
        // Password: agent123
        passwordHash: '$2b$10$4CelbV5Njfo9rNDj16dSbe4ZNLPntWwQaYZjklAYcESZCtPhv9wru',
        name: 'Agent User',
        role: 'agent'
    },
    {
        id: 'user_003',
        _id: 'user_003',
        email: 'manager@example.com',
        // Password: manager123
        passwordHash: '$2b$10$6meeNQaeQ5mUK534pGXOUezV6yJjkxzphmunChYPMHtoVgqDGft86',
        name: 'Manager User',
        role: 'manager'
    }
];

const inMemoryRefreshTokens = new Set();

/**
 * Find user by email
 */
async function findByEmail(email) {
    if (useDatabase()) {
        const { User } = getModels();
        return User.findOne({ email: email.toLowerCase() });
    }
    return inMemoryUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
}

/**
 * Find user by ID
 */
async function findById(id) {
    if (useDatabase()) {
        const { User } = getModels();
        return User.findById(id);
    }
    return inMemoryUsers.find(u => u.id === id || u._id === id);
}

/**
 * Create new user
 */
async function createUser(userData) {
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    
    if (useDatabase()) {
        const { User } = getModels();
        const user = new User({
            email: userData.email,
            passwordHash: hashedPassword,
            name: userData.name,
            role: userData.role || 'agent',
            phone: userData.phone
        });
        await user.save();
        return user;
    }
    
    // In-memory fallback
    const newUser = {
        id: `user_${Date.now()}`,
        _id: `user_${Date.now()}`,
        email: userData.email,
        passwordHash: hashedPassword,
        name: userData.name,
        role: userData.role || 'agent'
    };
    inMemoryUsers.push(newUser);
    return newUser;
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
async function storeRefreshToken(token, userId, expiresAt) {
    if (useDatabase()) {
        const { RefreshToken } = getModels();
        const refreshToken = new RefreshToken({
            token,
            userId,
            expiresAt: expiresAt || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
        });
        await refreshToken.save();
        return refreshToken;
    }
    inMemoryRefreshTokens.add(token);
    return { token };
}

/**
 * Check if refresh token exists
 */
async function hasRefreshToken(token) {
    if (useDatabase()) {
        const { RefreshToken } = getModels();
        const refreshToken = await RefreshToken.findOne({ token, isRevoked: false });
        return refreshToken && refreshToken.isValid();
    }
    return inMemoryRefreshTokens.has(token);
}

/**
 * Remove refresh token (logout)
 */
async function removeRefreshToken(token) {
    if (useDatabase()) {
        const { RefreshToken } = getModels();
        const refreshToken = await RefreshToken.findOne({ token });
        if (refreshToken) {
            await refreshToken.revoke();
        }
        return;
    }
    inMemoryRefreshTokens.delete(token);
}

/**
 * Revoke all tokens for a user (logout from all devices)
 */
async function revokeAllUserTokens(userId) {
    if (useDatabase()) {
        const { RefreshToken } = getModels();
        await RefreshToken.revokeAllForUser(userId);
    }
}

/**
 * Get safe user object (without password)
 */
function getSafeUser(user) {
    if (!user) return null;
    
    // Handle Mongoose document
    if (user.toSafeObject) {
        return user.toSafeObject();
    }
    
    const userObj = user.toObject ? user.toObject() : { ...user };
    const { passwordHash, __v, ...safeUser } = userObj;
    
    // Ensure id is available
    if (safeUser._id && !safeUser.id) {
        safeUser.id = safeUser._id.toString();
    }
    return safeUser;
}

/**
 * Get all users (admin only)
 */
async function getAllUsers() {
    if (useDatabase()) {
        const { User } = getModels();
        return User.find({ isActive: true }).select('-passwordHash');
    }
    return inMemoryUsers.map(u => {
        const { passwordHash, ...safe } = u;
        return safe;
    });
}

/**
 * Seed default users (for fresh database)
 */
async function seedDefaultUsers() {
    if (!useDatabase()) return;
    
    const { User } = getModels();
    const count = await User.countDocuments();
    if (count > 0) {
        console.log('📦 Users already exist, skipping seed');
        return;
    }
    
    console.log('🌱 Seeding default users...');
    
    const defaultUsers = [
        {
            email: 'admin@example.com',
            passwordHash: '$2b$10$qHYTTMZCK8aV.xsx9GwW1.78IpO7a6mvREleu6X.6jZ8aMwH92iC.',
            name: 'Admin User',
            role: 'admin'
        },
        {
            email: 'agent@example.com',
            passwordHash: '$2b$10$4CelbV5Njfo9rNDj16dSbe4ZNLPntWwQaYZjklAYcESZCtPhv9wru',
            name: 'Agent User',
            role: 'agent'
        },
        {
            email: 'manager@example.com',
            passwordHash: '$2b$10$6meeNQaeQ5mUK534pGXOUezV6yJjkxzphmunChYPMHtoVgqDGft86',
            name: 'Manager User',
            role: 'manager'
        }
    ];
    
    await User.insertMany(defaultUsers);
    console.log('✅ Default users created');
}

module.exports = {
    findByEmail,
    findById,
    createUser,
    verifyPassword,
    hashPassword,
    storeRefreshToken,
    hasRefreshToken,
    removeRefreshToken,
    revokeAllUserTokens,
    getSafeUser,
    getAllUsers,
    seedDefaultUsers,
    useDatabase
};
