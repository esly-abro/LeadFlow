/**
 * Environment Configuration
 * Centralized configuration management from environment variables
 */

require('dotenv').config();

const requiredVars = [
    'JWT_SECRET',
    'ZOHO_CLIENT_ID',
    'ZOHO_CLIENT_SECRET',
    'ZOHO_REFRESH_TOKEN',
    'INGESTION_SERVICE_URL',
    'INGESTION_SERVICE_API_KEY'
];

// Validate required environment variables
const missing = requiredVars.filter(v => !process.env[v]);
if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
}

const config = {
    // Server
    nodeEnv: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT, 10) || 4000,

    // JWT
    jwt: {
        secret: process.env.JWT_SECRET,
        accessExpiry: process.env.JWT_ACCESS_EXPIRY || '15m',
        refreshExpiry: process.env.JWT_REFRESH_EXPIRY || '7d'
    },

    // Zoho CRM
    zoho: {
        clientId: process.env.ZOHO_CLIENT_ID,
        clientSecret: process.env.ZOHO_CLIENT_SECRET,
        refreshToken: process.env.ZOHO_REFRESH_TOKEN,
        apiDomain: process.env.ZOHO_API_DOMAIN || 'https://www.zohoapis.in',
        accountsUrl: process.env.ZOHO_ACCOUNTS_URL || 'https://accounts.zoho.in'
    },

    // Ingestion Service
    ingestion: {
        url: process.env.INGESTION_SERVICE_URL,
        apiKey: process.env.INGESTION_SERVICE_API_KEY
    },

    // CORS
    cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:5173'
    }
};

module.exports = config;
