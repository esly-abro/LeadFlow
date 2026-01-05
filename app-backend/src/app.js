/**
 * Fastify Application Setup
 * Main application configuration and routes
 */

const fastify = require('fastify');
const cors = require('@fastify/cors');
const config = require('./config/env');

// Controllers
const authController = require('./auth/auth.controller');
const leadsController = require('./leads/leads.controller');
const metricsController = require('./metrics/metrics.controller');

// Middleware
const requireAuth = require('./middleware/requireAuth');

// Errors
const { AppError } = require('./utils/errors');

async function buildApp() {
    const app = fastify({
        logger: config.nodeEnv === 'development' ? {
            transport: {
                target: 'pino-pretty',
                options: {
                    translateTime: 'HH:MM:ss Z',
                    ignore: 'pid,hostname'
                }
            }
        } : true
    });

    // CORS
    await app.register(cors, {
        origin: config.cors.origin,
        credentials: true
    });

    // Global error handler
    app.setErrorHandler((error, request, reply) => {
        // Log error
        request.log.error(error);

        // Handle operational errors
        if (error instanceof AppError) {
            return reply.code(error.statusCode).send({
                success: false,
                error: error.message
            });
        }

        // Handle Fastify validation errors
        if (error.validation) {
            return reply.code(400).send({
                success: false,
                error: 'Validation failed',
                details: error.validation
            });
        }

        // Unknown errors
        const statusCode = error.statusCode || 500;
        return reply.code(statusCode).send({
            success: false,
            error: config.nodeEnv === 'development' ? error.message : 'Internal server error'
        });
    });

    // Health check
    app.get('/health', async (request, reply) => {
        return {
            status: 'ok',
            timestamp: new Date().toISOString(),
            service: 'app-backend',
            version: '1.0.0'
        };
    });

    // Root endpoint
    app.get('/', async (request, reply) => {
        return {
            service: 'SaaS Lead Management - Application Backend',
            version: '1.0.0',
            documentation: 'See README.md',
            endpoints: {
                'POST /auth/login': 'User login',
                'POST /auth/refresh': 'Refresh access token',
                'POST /auth/logout': 'User logout',
                'GET /api/leads': 'List leads',
                'GET /api/leads/:id': 'Get lead details',
                'POST /api/leads': 'Create lead',
                'GET /api/metrics/overview': 'Dashboard metrics'
            }
        };
    });

    // Auth routes (no auth required)
    app.post('/auth/login', authController.login);
    app.post('/auth/refresh', authController.refresh);
    app.post('/auth/logout', authController.logout);

    // Protected API routes
    app.register(async function (protectedApp) {
        // Apply auth middleware to all routes in this scope
        protectedApp.addHook('onRequest', requireAuth);
        
        // Add auth decorator for nested routes
        protectedApp.decorate('auth', requireAuth);

        // Leads routes
        protectedApp.get('/api/leads', leadsController.getLeads);
        protectedApp.get('/api/leads/:id', leadsController.getLead);
        protectedApp.post('/api/leads', leadsController.createLead);

        // Metrics routes
        protectedApp.get('/api/metrics/overview', metricsController.getOverview);
        
        // Twilio routes (protected)
        protectedApp.post('/api/twilio/call', async (request, reply) => {
          const twilioService = require('./twilio/twilio.service');
          const { phoneNumber, leadId, leadName } = request.body;
          if (!phoneNumber) {
            return reply.status(400).send({ error: 'Phone number is required' });
          }
          const result = await twilioService.makeCall(phoneNumber);
          if (result.success) {
            console.log(`Call initiated to ${phoneNumber} for lead ${leadName || leadId}`);
          }
          return reply.send(result);
        });
        
        protectedApp.get('/api/twilio/call/:callSid', async (request, reply) => {
          const twilioService = require('./twilio/twilio.service');
          const { callSid } = request.params;
          const result = await twilioService.getCallStatus(callSid);
          return reply.send(result);
        });
        
        protectedApp.get('/api/twilio/calls', async (request, reply) => {
          const twilioService = require('./twilio/twilio.service');
          const { limit } = request.query;
          const result = await twilioService.getCallHistory(limit ? parseInt(limit) : 20);
          return reply.send(result);
        });
        
        // Get access token for browser calling
        protectedApp.get('/api/twilio/token', async (request, reply) => {
          const twilioService = require('./twilio/twilio.service');
          const identity = request.user?.email || 'agent';
          const token = twilioService.generateAccessToken(identity);
          return reply.send({ token, identity });
        });
    });

    // Twilio voice webhook (no auth - called by Twilio)
    app.post('/twilio/voice', async (request, reply) => {
      const toNumber = request.body.To || request.body.to;
      let twiml;
      
      // Check if it's a phone number or client
      if (toNumber && toNumber.startsWith('+')) {
        twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Dial callerId="+17655076878">
    <Number>${toNumber}</Number>
  </Dial>
</Response>`;
      } else {
        twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice">Invalid phone number</Say>
</Response>`;
      }
      
      reply.header('Content-Type', 'text/xml');
      return reply.send(twiml);
    });

    return app;
}

module.exports = buildApp;
