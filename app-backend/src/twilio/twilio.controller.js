const twilioService = require('./twilio.service');

async function twilioRoutes(fastify, options) {
  // Make a call
  fastify.post('/call', {
    preHandler: fastify.auth,
    handler: async (request, reply) => {
      const { phoneNumber, leadId, leadName } = request.body;

      if (!phoneNumber) {
        return reply.status(400).send({ error: 'Phone number is required' });
      }

      const result = await twilioService.makeCall(phoneNumber);

      if (result.success) {
        // Log the call activity (you can store this in your database)
        console.log(`Call initiated to ${phoneNumber} for lead ${leadName || leadId}`);
      }

      return reply.send(result);
    },
  });

  // Get call status
  fastify.get('/call/:callSid', {
    preHandler: fastify.auth,
    handler: async (request, reply) => {
      const { callSid } = request.params;
      const result = await twilioService.getCallStatus(callSid);
      return reply.send(result);
    },
  });

  // Get call history
  fastify.get('/calls', {
    preHandler: fastify.auth,
    handler: async (request, reply) => {
      const { limit } = request.query;
      const result = await twilioService.getCallHistory(limit ? parseInt(limit) : 20);
      return reply.send(result);
    },
  });

  // TwiML webhook for call handling
  fastify.post('/voice', {
    handler: async (request, reply) => {
      const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice">Connecting your call. Please hold.</Say>
  <Dial callerId="${twilioService.TWILIO_PHONE_NUMBER}">
    <Number>${request.body.To || request.body.to}</Number>
  </Dial>
</Response>`;
      
      reply.header('Content-Type', 'text/xml');
      return reply.send(twiml);
    },
  });
}

module.exports = twilioRoutes;
