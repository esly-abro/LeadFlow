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

/**
 * POST /api/leads/:id/site-visit
 */
async function postSiteVisit(request, reply) {
    const leadId = request.params.id;
    const { scheduledAt } = request.body;
    const userId = request.user._id;
    const visit = await leadsService.confirmSiteVisit(leadId, scheduledAt, userId);
    return reply.code(201).send(visit);
}

/**
 * GET /api/site-visits/today
 */
async function getTodaySiteVisits(request, reply) {
    const userId = request.user._id;
    const visits = await leadsService.getSiteVisitsForToday(userId);
    return reply.send(visits);
}

/**
 * POST /api/activities
 */
async function postActivity(request, reply) {
    const activity = await leadsService.createActivity(request.body);
    return reply.code(201).send(activity);
}

/**
 * GET /api/activities/recent
 */
async function getRecentActivitiesHandler(request, reply) {
    const activities = await leadsService.getRecentActivities(50);
    return reply.send(activities);
}

module.exports = {
    getLeads,
    getLead,
    createLead,
    updateLead,
    updateLeadStatus,
    postSiteVisit,
    getTodaySiteVisits,
    postActivity,
    getRecentActivitiesHandler
};
