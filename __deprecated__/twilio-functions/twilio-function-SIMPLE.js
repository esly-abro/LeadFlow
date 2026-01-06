/**
 * SIMPLIFIED Twilio Function for IVR Response
 * 
 * This function receives the leadId directly from the URL query parameter,
 * so NO PHONE SEARCH is needed!
 * 
 * DEPLOY THIS TO: https://jk-9813.twil.io/ivr-response
 * 
 * Required Environment Variables in Twilio Console:
 * - ZOHO_CLIENT_ID
 * - ZOHO_CLIENT_SECRET  
 * - ZOHO_REFRESH_TOKEN
 * - ZOHO_API_DOMAIN (e.g., https://www.zohoapis.in)
 * - ZOHO_ACCOUNTS_URL (e.g., https://accounts.zoho.in)
 * 
 * Dependencies: Add "axios" in Twilio Function Dependencies
 */

const axios = require('axios');

// Cache for Zoho access token
let cachedAccessToken = null;
let tokenExpiry = null;

exports.handler = async function(context, event, callback) {
    const twiml = new Twilio.twiml.VoiceResponse();
    
    console.log('=== IVR Response Received ===');
    console.log('Digits pressed:', event.Digits);
    console.log('Lead ID from URL:', event.leadId);
    console.log('Caller:', event.From);
    
    const digit = event.Digits;
    const leadId = event.leadId;
    
    if (!leadId) {
        console.error('ERROR: No leadId provided in URL');
        twiml.say({ voice: 'alice', language: 'en-IN' }, 
            'Thank you for your response. Our team will contact you shortly.');
        twiml.hangup();
        return callback(null, twiml);
    }
    
    try {
        if (digit === '1') {
            // Interested - Update lead status to "Interested"
            console.log('User pressed 1 - Updating lead to Interested');
            
            const accessToken = await getZohoAccessToken(context);
            await updateLeadStatus(context, accessToken, leadId, 'Interested');
            
            twiml.say({ voice: 'alice', language: 'en-IN' }, 
                'Wonderful! Thank you for your interest. One of our property consultants will contact you within the next 24 hours to discuss your requirements in detail. Have a great day!');
                
        } else if (digit === '2') {
            // WhatsApp - Update to "Contacted" 
            console.log('User pressed 2 - WhatsApp info requested');
            
            const accessToken = await getZohoAccessToken(context);
            await updateLeadStatus(context, accessToken, leadId, 'Contacted');
            
            twiml.say({ voice: 'alice', language: 'en-IN' }, 
                'Perfect! We will send you property details and brochures via WhatsApp shortly. Thank you!');
                
        } else if (digit === '3') {
            // Not interested - Update to "Not Interested"
            console.log('User pressed 3 - Not interested');
            
            const accessToken = await getZohoAccessToken(context);
            await updateLeadStatus(context, accessToken, leadId, 'Not Interested');
            
            twiml.say({ voice: 'alice', language: 'en-IN' }, 
                'We understand. Thank you for your time. Feel free to reach out if you change your mind. Goodbye!');
                
        } else {
            // Invalid input
            twiml.say({ voice: 'alice', language: 'en-IN' }, 
                'Sorry, we did not understand your selection. Our team will call you back shortly.');
        }
    } catch (error) {
        console.error('Error processing IVR response:', error.message);
        twiml.say({ voice: 'alice', language: 'en-IN' }, 
            'Thank you for your response. Our team will contact you shortly.');
    }
    
    twiml.hangup();
    return callback(null, twiml);
};

/**
 * Get Zoho access token (with caching)
 */
async function getZohoAccessToken(context) {
    // Return cached token if still valid
    if (cachedAccessToken && tokenExpiry && Date.now() < tokenExpiry) {
        console.log('Using cached access token');
        return cachedAccessToken;
    }
    
    console.log('Refreshing Zoho access token...');
    
    const accountsUrl = context.ZOHO_ACCOUNTS_URL || 'https://accounts.zoho.in';
    const tokenUrl = `${accountsUrl}/oauth/v2/token`;
    
    const params = new URLSearchParams({
        grant_type: 'refresh_token',
        client_id: context.ZOHO_CLIENT_ID,
        client_secret: context.ZOHO_CLIENT_SECRET,
        refresh_token: context.ZOHO_REFRESH_TOKEN
    });
    
    const response = await axios.post(tokenUrl, params.toString(), {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
    
    cachedAccessToken = response.data.access_token;
    // Cache for 50 minutes (tokens expire in 60)
    tokenExpiry = Date.now() + (50 * 60 * 1000);
    
    console.log('Access token refreshed successfully');
    return cachedAccessToken;
}

/**
 * Update lead status in Zoho CRM using leadId directly
 */
async function updateLeadStatus(context, accessToken, leadId, newStatus) {
    const apiDomain = context.ZOHO_API_DOMAIN || 'https://www.zohoapis.in';
    const updateUrl = `${apiDomain}/crm/v2/Leads/${leadId}`;
    
    console.log(`Updating lead ${leadId} to status: ${newStatus}`);
    
    const updateData = {
        data: [{
            Lead_Status: newStatus
        }]
    };
    
    const response = await axios.put(updateUrl, updateData, {
        headers: {
            'Authorization': `Zoho-oauthtoken ${accessToken}`,
            'Content-Type': 'application/json'
        }
    });
    
    console.log('Update response:', JSON.stringify(response.data));
    
    if (response.data?.data?.[0]?.code === 'SUCCESS') {
        console.log(`✅ Lead ${leadId} status updated to "${newStatus}"`);
        return true;
    } else {
        console.error('Update failed:', response.data);
        throw new Error('Failed to update lead status');
    }
}
