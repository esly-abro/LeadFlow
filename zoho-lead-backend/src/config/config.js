/**
 * Configuration Module
 * Loads and validates environment variables
 */

require('dotenv').config();

const config = {
    // Server configuration
    port: process.env.PORT || 3000,
    nodeEnv: process.env.NODE_ENV || 'development',

    // Zoho OAuth credentials
    zoho: {
        clientId: process.env.ZOHO_CLIENT_ID,
        clientSecret: process.env.ZOHO_CLIENT_SECRET,
        refreshToken: process.env.ZOHO_REFRESH_TOKEN,
        apiDomain: process.env.ZOHO_API_DOMAIN || 'https://www.zohoapis.in',
        accountsUrl: process.env.ZOHO_ACCOUNTS_URL || 'https://accounts.zoho.in',
        scope: process.env.ZOHO_CRM_SCOPE || 'ZohoCRM.modules.ALL'
    },

    // Logging
    logLevel: process.env.LOG_LEVEL || 'info'
};

// Validate required environment variables
function validateConfig() {
    const required = [
        'ZOHO_CLIENT_ID',
        'ZOHO_CLIENT_SECRET',
        'ZOHO_REFRESH_TOKEN'
    ];

    const missing = required.filter(key => !process.env[key]);

    if (missing.length > 0) {
        throw new Error(
            `Missing required environment variables: ${missing.join(', ')}\n` +
            'Please check your .env file'
        );
    }
}

// Validate on module load
validateConfig();

module.exports = config;
