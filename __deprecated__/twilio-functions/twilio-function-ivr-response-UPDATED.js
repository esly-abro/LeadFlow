// Updated Twilio Function: IVR Response Handler with Direct Zoho CRM Update
// Path: /ivr-response
// 
// ========== DEPLOYMENT INSTRUCTIONS ==========
// 1. Go to Twilio Console > Functions > Services > jk-9813
// 2. Add these Environment Variables:
//    - ZOHO_CLIENT_ID: 1000.ETAD3PDM5624ZZOH7BGIC7HMC3G00E
//    - ZOHO_CLIENT_SECRET: 6919b9ef2b27e8858a0d1549bd4128c510557e40f1
//    - ZOHO_REFRESH_TOKEN: 1000.d875c4afcc7b1afedb4d16c4d5f57443.59a7686d47cfb9faedebfa394226d30a
//    - ZOHO_API_DOMAIN: https://www.zohoapis.in
//    - ZOHO_ACCOUNTS_URL: https://accounts.zoho.in
// 3. Add 'axios' to Dependencies
// 4. Copy this code to /ivr-response function
// 5. Deploy
// =============================================

const axios = require('axios');

// Get Zoho Access Token
async function getZohoAccessToken(context) {
    const tokenUrl = `${context.ZOHO_ACCOUNTS_URL}/oauth/v2/token`;
    
    const params = new URLSearchParams();
    params.append('refresh_token', context.ZOHO_REFRESH_TOKEN);
    params.append('client_id', context.ZOHO_CLIENT_ID);
    params.append('client_secret', context.ZOHO_CLIENT_SECRET);
    params.append('grant_type', 'refresh_token');

    const response = await axios.post(tokenUrl, params, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    return response.data.access_token;
}

// Search lead by phone number
async function searchLeadByPhone(context, phoneNumber) {
    const accessToken = await getZohoAccessToken(context);
    
    // Clean phone number - try multiple formats
    let cleanPhone = phoneNumber.replace(/^\+91/, '').replace(/^\+/, '').replace(/^91/, '');
    
    const criteria = `(Phone:equals:${cleanPhone})`;
    const url = `${context.ZOHO_API_DOMAIN}/crm/v2/Leads/search?criteria=${encodeURIComponent(criteria)}`;
    
    try {
        const response = await axios.get(url, {
            headers: {
                'Authorization': `Zoho-oauthtoken ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (response.data && response.data.data && response.data.data.length > 0) {
            return response.data.data[0];
        }
    } catch (error) {
        console.log(`Search failed: ${error.message}`);
    }
    
    return null;
}

// Update lead status in Zoho CRM
async function updateLeadStatus(context, leadId, status) {
    const accessToken = await getZohoAccessToken(context);
    
    const url = `${context.ZOHO_API_DOMAIN}/crm/v2/Leads/${leadId}`;
    
    const response = await axios.put(url, {
        data: [{
            Lead_Status: status
        }]
    }, {
        headers: {
            'Authorization': `Zoho-oauthtoken ${accessToken}`,
            'Content-Type': 'application/json'
        }
    });
    
    return response.data;
}

exports.handler = async function (context, event, callback) {
    const twiml = new Twilio.twiml.VoiceResponse();

    const digit = event.Digits;
    const callSid = event.CallSid;
    const from = event.From;

    console.log(`IVR response: digit=${digit}, from=${from}, callSid=${callSid}`);

    switch (digit) {
        case '1':
            // User is INTERESTED
            console.log('Lead is interested - updating Zoho CRM');

            try {
                const lead = await searchLeadByPhone(context, from);
                if (lead) {
                    await updateLeadStatus(context, lead.id, 'Interested');
                    console.log(`Lead ${lead.id} updated to Interested`);
                } else {
                    console.log(`Lead not found for phone: ${from}`);
                }
            } catch (error) {
                console.error('Zoho update failed:', error.message);
            }

            twiml.say({
                voice: 'alice',
                language: 'en-IN'
            }, 'Thank you for your interest! Our team will contact you shortly.');

            twiml.hangup();
            break;

        case '2':
            // WhatsApp info request
            console.log('Lead wants WhatsApp information');

            twiml.say({
                voice: 'alice',
                language: 'en-IN'
            }, 'We will send you information on WhatsApp shortly. Thank you!');

            twiml.hangup();
            break;

        case '3':
            // Not interested
            console.log('Lead is not interested');

            try {
                const lead = await searchLeadByPhone(context, from);
                if (lead) {
                    await updateLeadStatus(context, lead.id, 'Not Interested');
                    console.log(`Lead ${lead.id} updated to Not Interested`);
                }
            } catch (error) {
                console.error('Zoho update failed:', error.message);
            }

            twiml.say({
                voice: 'alice',
                language: 'en-IN'
            }, 'Thank you for your time. Have a great day!');

            twiml.hangup();
            break;

        default:
            console.log('Invalid IVR input:', digit);

            twiml.say({
                voice: 'alice',
                language: 'en-IN'
            }, 'Invalid selection. Our team will call you back. Thank you.');

            twiml.hangup();
    }

    callback(null, twiml);
};
