/**
 * Leads Controller
 * HTTP handlers for lead management endpoints
 */

const leadsService = require('./leads.service');

/**
 * GET /api/leads
 */
async function getLeads(request, reply) {
    const { page, limit, status, source, owner } = request.query;

    const result = await leadsService.getLeads(
        request.user,
        { page, limit, status, source, owner }
    );

    return reply.code(200).send(result);
}

/**
 * GET /api/leads/:id
 */
async function getLead(request, reply) {
    const { id } = request.params;

    const lead = await leadsService.getLead(request.user, id);

    return reply.code(200).send(lead);
}

/**
 * POST /api/leads
 */
async function createLead(request, reply) {
    const leadData = request.body;

    const result = await leadsService.createLead(leadData);

    return reply.code(201).send(result);
}

module.exports = {
    getLeads,
    getLead,
    createLead
};
