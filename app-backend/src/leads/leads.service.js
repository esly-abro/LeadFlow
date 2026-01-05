/**
 * Leads Service
 * Business logic for lead management
 */

const zohoClient = require('../clients/zoho.client');
const ingestionClient = require('../clients/ingestion.client');
const { mapZohoLeadToFrontend, mapZohoNoteToActivity } = require('./zoho.mapper');
const { filterLeadsByPermission } = require('../middleware/roles');
const { NotFoundError } = require('../utils/errors');

/**
 * Get all leads with pagination and filters
 */
async function getLeads(user, { page = 1, limit = 20, status, source, owner }) {
    // Build search criteria
    const criteria = [];

    if (status) {
        criteria.push(`(Lead_Status:equals:${status})`);
    }

    if (source) {
        // Map frontend source to Zoho source
        const zohoSource = mapFrontendSourceToZoho(source);
        criteria.push(`(Lead_Source:equals:${zohoSource})`);
    }

    if (owner) {
        criteria.push(`(Owner:equals:${owner})`);
    }

    // Fetch from Zoho
    let zohoResponse;
    if (criteria.length > 0) {
        const criteriaString = criteria.join('and');
        zohoResponse = await zohoClient.searchLeads(criteriaString, page, limit);
    } else {
        zohoResponse = await zohoClient.getLeads(page, limit);
    }

    // Map leads
    const leads = (zohoResponse.data || []).map(mapZohoLeadToFrontend);

    // Apply permission filtering
    const filteredLeads = filterLeadsByPermission(user, leads);

    // Build pagination info
    const pagination = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        total: zohoResponse.info?.count || filteredLeads.length,
        totalPages: Math.ceil((zohoResponse.info?.count || filteredLeads.length) / limit)
    };

    return {
        data: filteredLeads,
        pagination
    };
}

/**
 * Get single lead by ID
 */
async function getLead(user, leadId) {
    // Fetch lead from Zoho
    const zohoResponse = await zohoClient.getLead(leadId);

    if (!zohoResponse.data || zohoResponse.data.length === 0) {
        throw new NotFoundError('Lead not found');
    }

    const lead = mapZohoLeadToFrontend(zohoResponse.data[0]);

    // Check permissions
    const { canAccessLead } = require('../middleware/roles');
    if (!canAccessLead(user, lead)) {
        throw new NotFoundError('Lead not found');
    }

    // Fetch activities/notes
    try {
        const notesResponse = await zohoClient.getLeadNotes(leadId);
        lead.activities = (notesResponse.data || [])
            .map(mapZohoNoteToActivity)
            .filter(a => a !== null);
    } catch (error) {
        // Notes might fail, that's okay
        lead.activities = [];
    }

    return lead;
}

/**
 * Create lead (proxy to ingestion service)
 */
async function createLead(leadData) {
    // Forward to ingestion service
    return await ingestionClient.createLead(leadData);
}

/**
 * Helper: Map frontend source to Zoho
 */
function mapFrontendSourceToZoho(source) {
    const map = {
        'Facebook': 'Facebook',
        'Website': 'Website',
        'Google Ads': 'Google AdWords',
        'LinkedIn Ads': 'LinkedIn',
        'Referral': 'Employee Referral',
        'WhatsApp': 'WhatsApp'
    };
    return map[source] || source;
}

module.exports = {
    getLeads,
    getLead,
    createLead
};
