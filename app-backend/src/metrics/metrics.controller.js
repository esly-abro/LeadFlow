/**
 * Metrics Controller
 * HTTP handlers for metrics and analytics endpoints
 */

const metricsService = require('./metrics.service');

/**
 * GET /api/metrics/overview
 */
async function getOverview(request, reply) {
    const metrics = await metricsService.getOverview();

    return reply.code(200).send(metrics);
}

module.exports = {
    getOverview
};
