/**
 * Database Configuration
 * MongoDB connection using Mongoose
 */

require('dotenv').config();
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/leadflow';

/**
 * Connect to MongoDB
 */
async function connectDatabase() {
    try {
        await mongoose.connect(MONGODB_URI, {
            // These options are no longer needed in Mongoose 6+, but kept for compatibility
        });
        console.log('✅ Connected to MongoDB');
        return mongoose.connection;
    } catch (error) {
        console.error('❌ MongoDB connection error:', error.message);
        process.exit(1);
    }
}

/**
 * Disconnect from MongoDB
 */
async function disconnectDatabase() {
    try {
        await mongoose.disconnect();
        console.log('📤 Disconnected from MongoDB');
    } catch (error) {
        console.error('Error disconnecting from MongoDB:', error.message);
    }
}

/**
 * Get connection status
 */
function isConnected() {
    return mongoose.connection.readyState === 1;
}

// Handle connection events
mongoose.connection.on('connected', () => {
    console.log('📦 Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
    console.error('📛 Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
    console.log('📤 Mongoose disconnected');
});

// Graceful shutdown
process.on('SIGINT', async () => {
    await disconnectDatabase();
    process.exit(0);
});

module.exports = {
    connectDatabase,
    disconnectDatabase,
    isConnected,
    mongoose
};
