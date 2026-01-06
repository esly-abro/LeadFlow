/**
 * Leads Service
 * Business logic for lead management
 */

const zohoClient = require('../clients/zoho.client');
const ingestionClient = require('../clients/ingestion.client');
const { mapZohoLeadToFrontend, mapZohoNoteToActivity } = require('./zoho.mapper');
const { filterLeadsByPermission } = require('../middleware/roles');
const { NotFoundError } = require('../utils/errors');

// Demo mode flag - only enabled when explicitly set
const isDemoMode = process.env.DEMO_MODE === 'true';

// Mock data for demo mode
const mockLeads = [
    {
        id: 'lead_001',
        name: 'John Smith',
        email: 'john.smith@example.com',
        phone: '+1 555-0101',
        company: 'Acme Corp',
        source: 'Website',
        status: 'New',
        score: 85,
        assignedTo: 'user_002',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        activities: []
    },
    {
        id: 'lead_002',
        name: 'Sarah Johnson',
        email: 'sarah.j@techstart.io',
        phone: '+1 555-0102',
        company: 'TechStart Inc',
        source: 'LinkedIn Ads',
        status: 'Contacted',
        score: 72,
        assignedTo: 'user_002',
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        updatedAt: new Date().toISOString(),
        activities: []
    },
    {
        id: 'lead_003',
        name: 'Michael Chen',
        email: 'mchen@globaltech.com',
        phone: '+1 555-0103',
        company: 'Global Tech',
        source: 'Google Ads',
        status: 'Qualified',
        score: 91,
        assignedTo: 'user_003',
        createdAt: new Date(Date.now() - 172800000).toISOString(),
        updatedAt: new Date().toISOString(),
        activities: []
    },
    {
        id: 'lead_004',
        name: 'Emily Davis',
        email: 'emily.d@innovate.co',
        phone: '+1 555-0104',
        company: 'Innovate Co',
        source: 'Referral',
        status: 'Proposal',
        score: 88,
        assignedTo: 'user_002',
        createdAt: new Date(Date.now() - 259200000).toISOString(),
        updatedAt: new Date().toISOString(),
        activities: []
    },
    {
        id: 'lead_005',
        name: 'Raj Patel',
        email: 'raj@startuplab.in',
        phone: '+91 98765 43210',
        company: 'StartupLab',
        source: 'Facebook',
        status: 'New',
        score: 65,
        assignedTo: 'user_002',
        createdAt: new Date(Date.now() - 345600000).toISOString(),
        updatedAt: new Date().toISOString(),
        activities: []
    }
];

/**
 * Get all leads with pagination and filters
 */
async function getLeads(user, { page = 1, limit = 20, status, source, owner }) {
    // Use mock data in demo mode
    if (isDemoMode) {
        let filteredLeads = [...mockLeads];
        
        if (status) {
            filteredLeads = filteredLeads.filter(l => l.status === status);
        }
        if (source) {
            filteredLeads = filteredLeads.filter(l => l.source === source);
        }
        if (owner) {
            filteredLeads = filteredLeads.filter(l => l.assignedTo === owner);
        }
        
        // Apply permission filtering
        filteredLeads = filterLeadsByPermission(user, filteredLeads);
        
        const start = (page - 1) * limit;
        const paginatedLeads = filteredLeads.slice(start, start + limit);
        
        return {
            data: paginatedLeads,
            pagination: {
                page: parseInt(page, 10),
                limit: parseInt(limit, 10),
                total: filteredLeads.length,
                totalPages: Math.ceil(filteredLeads.length / limit)
            }
        };
    }

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
    // Use mock data in demo mode
    if (isDemoMode) {
        const lead = mockLeads.find(l => l.id === leadId);
        if (!lead) {
            throw new NotFoundError('Lead not found');
        }
        
        const { canAccessLead } = require('../middleware/roles');
        if (!canAccessLead(user, lead)) {
            throw new NotFoundError('Lead not found');
        }
        
        return { ...lead, activities: [] };
    }

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
    // Use mock data in demo mode
    if (isDemoMode) {
        const newLead = {
            id: `lead_${Date.now()}`,
            name: leadData.name,
            email: leadData.email,
            phone: leadData.phone,
            company: leadData.company || '',
            source: leadData.source || 'Website',
            status: 'New',
            score: Math.floor(Math.random() * 40) + 60,
            assignedTo: 'user_002',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            activities: []
        };
        mockLeads.unshift(newLead);
        return { success: true, lead: newLead };
    }

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
