/**
 * Zoho CRM Client
 * Handles OAuth token management and API calls to Zoho CRM
 */

const axios = require('axios');
const config = require('../config/env');
const { ExternalServiceError } = require('../utils/errors');

// In-memory token cache
let tokenCache = {
    accessToken: null,
    expiresAt: null
};

/**
 * Get valid access token (with auto-refresh)
 */
async function getAccessToken() {
    // Check if cached token is still valid
    if (tokenCache.accessToken && tokenCache.expiresAt > Date.now() + 60000) {
        return tokenCache.accessToken;
    }

    // Refresh token
    return await refreshAccessToken();
}

/**
 * Refresh access token using refresh_token
 */
async function refreshAccessToken() {
    try {
        const response = await axios.post(
            `${config.zoho.accountsUrl}/oauth/v2/token`,
            null,
            {
                params: {
                    refresh_token: config.zoho.refreshToken,
                    client_id: config.zoho.clientId,
                    client_secret: config.zoho.clientSecret,
                    grant_type: 'refresh_token'
                }
            }
        );

        const { access_token, expires_in } = response.data;

        // Cache token
        tokenCache = {
            accessToken: access_token,
            expiresAt: Date.now() + (expires_in * 1000)
        };

        return access_token;
    } catch (error) {
        throw new ExternalServiceError('Zoho OAuth', error);
    }
}

/**
 * Make authenticated request to Zoho CRM
 */
async function makeRequest(method, endpoint, data = null, params = null) {
    const token = await getAccessToken();

    try {
        const response = await axios({
            method,
            url: `${config.zoho.apiDomain}/crm/v2${endpoint}`,
            headers: {
                'Authorization': `Zoho-oauthtoken ${token}`,
                'Content-Type': 'application/json'
            },
            data,
            params
        });

        return response.data;
    } catch (error) {
        // Handle 401 - token might be invalid
        if (error.response?.status === 401) {
            // Clear cache and retry once
            tokenCache = { accessToken: null, expiresAt: null };
            const newToken = await getAccessToken();

            // Retry request
            const retryResponse = await axios({
                method,
                url: `${config.zoho.apiDomain}/crm/v2${endpoint}`,
                headers: {
                    'Authorization': `Zoho-oauthtoken ${newToken}`,
                    'Content-Type': 'application/json'
                },
                data,
                params
            });

            return retryResponse.data;
        }

        throw new ExternalServiceError('Zoho CRM API', error);
    }
}

/**
 * Search leads by criteria
 */
async function searchLeads(criteria, page = 1, perPage = 200) {
    const params = {
        page,
        per_page: perPage
    };

    if (criteria) {
        params.criteria = criteria;
    }

    return await makeRequest('GET', '/Leads/search', null, params);
}

/**
 * Get all leads (with pagination)
 */
async function getLeads(page = 1, perPage = 200) {
    const params = {
        page,
        per_page: perPage
    };

    return await makeRequest('GET', '/Leads', null, params);
}

/**
 * Get single lead by ID
 */
async function getLead(leadId) {
    return await makeRequest('GET', `/Leads/${leadId}`);
}

/**
 * Get lead notes/activities
 */
async function getLeadNotes(leadId) {
    try {
        return await makeRequest('GET', `/Leads/${leadId}/Notes`);
    } catch (error) {
        // Notes might not exist, return empty array
        return { data: [] };
    }
}

module.exports = {
    getAccessToken,
    searchLeads,
    getLeads,
    getLead,
    getLeadNotes
};
