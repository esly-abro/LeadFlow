/**
 * User Schema
 * MongoDB model for user management
 */

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    passwordHash: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    role: {
        type: String,
        enum: ['admin', 'manager', 'agent'],
        default: 'agent'
    },
    phone: {
        type: String,
        trim: true
    },
    avatar: {
        type: String
    },
    isActive: {
        type: Boolean,
        default: true
    },
    lastLogin: {
        type: Date
    },
    // For team/organization support
    organizationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organization'
    }
}, {
    timestamps: true // Adds createdAt and updatedAt
});

// Index for faster queries (email index is auto-created by unique: true)
userSchema.index({ role: 1 });
userSchema.index({ organizationId: 1 });

/**
 * Hash password before saving
 */
userSchema.pre('save', async function(next) {
    // Only hash if password was modified
    if (!this.isModified('passwordHash')) {
        return next();
    }
    // Note: passwordHash is already hashed when passed in
    next();
});

/**
 * Compare password
 */
userSchema.methods.comparePassword = async function(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.passwordHash);
};

/**
 * Get safe user object (without password)
 */
userSchema.methods.toSafeObject = function() {
    const obj = this.toObject();
    delete obj.passwordHash;
    delete obj.__v;
    return obj;
};

/**
 * Static method to hash password
 */
userSchema.statics.hashPassword = async function(plainPassword) {
    return bcrypt.hash(plainPassword, 10);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
