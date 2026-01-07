/**
 * Main Server File
 * Express application entry point
 */

const express = require('express');
const cors = require('cors');
const config = require('./config/config');
const logger = require('./utils/logger');
const requestLogger = require('./middleware/logger');
const errorHandler = require('./middleware/errorHandler');
const leadsRoutes = require('./routes/leads');

// Create Express app
const app = express();

// Middleware
app.use(cors());  // Enable CORS for all origins
app.use(express.json());  // Parse JSON bodies
app.use(requestLogger);  // Log all requests

// Health check endpoint
app.get('/health', (req, res) => {
    const tokenManager = require('./services/tokenManager');
    const tokenInfo = tokenManager.getTokenInfo();

    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        nodejs: process.version,
        token: {
            isValid: tokenInfo.isValid,
            expiresAt: tokenInfo.expiresAt
        }
    });
});

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        service: 'Zoho Lead Ingestion Backend',
        version: '1.0.0',
        endpoints: {
            'POST /leads': 'Create or update lead',
            'GET /leads/sources': 'Get valid source values',
            'GET /health': 'Health check'
        }
    });
});

// API Routes
app.use('/api/leads', leadsRoutes);

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Endpoint not found',
        path: req.originalUrl
    });
});

// Error handler (must be last)
app.use(errorHandler);

// Start server
const PORT = config.port;

app.listen(PORT, () => {
    logger.info(`🚀 Server started on port ${PORT}`);
    logger.info(`Environment: ${config.nodeEnv}`);
    logger.info(`Zoho API Domain: ${config.zoho.apiDomain}`);
    logger.info('');
    logger.info('Available endpoints:');
    logger.info(`  POST   http://localhost:${PORT}/leads`);
    logger.info(`  GET    http://localhost:${PORT}/leads/sources`);
    logger.info(`  GET    http://localhost:${PORT}/health`);
    logger.info('');
    logger.info('Ready to accept lead ingestion requests! 🎉');
});

// Graceful shutdown
process.on('SIGTERM', () => {
    logger.info('SIGTERM received, shutting down gracefully...');
    process.exit(0);
});

process.on('SIGINT', () => {
    logger.info('SIGINT received, shutting down gracefully...');
    process.exit(0);
});

module.exports = app;
