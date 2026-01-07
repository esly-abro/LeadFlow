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

/**
 * PUT /api/leads/:id
 * Update a lead
 */
async function updateLead(request, reply) {
    const { id } = request.params;
    const updateData = request.body;

    const lead = await leadsService.updateLead(request.user, id, updateData);

    return reply.code(200).send(lead);
}

/**
 * PATCH /api/leads/:id/status
 * Update lead status only
 */
async function updateLeadStatus(request, reply) {
    const { id } = request.params;
    const { status } = request.body;

    const lead = await leadsService.updateLead(request.user, id, { status });

    return reply.code(200).send(lead);
}

module.exports = {
    getLeads,
    getLead,
    createLead,
    updateLead,
    updateLeadStatus
};
