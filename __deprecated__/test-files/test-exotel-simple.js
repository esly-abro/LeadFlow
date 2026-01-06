/**
 * Simple Exotel Test - Check authentication
 */

const axios = require('axios');

const ACCOUNT_SID = 'nil6910';
const API_KEY = '5681199f2b0b804d57c37298b8d6295d55164417c373fbef';
const API_TOKEN = '8b67707d5818b9dc231fbcffbe4e56ee69867c4b5f47eaa3';
const SUBDOMAIN = 'api.exotel.com';
const EXOPHONE = '09513886363';

const baseUrl = `https://${API_KEY}:${API_TOKEN}@${SUBDOMAIN}/v1/Accounts/${ACCOUNT_SID}`;

async function testCall() {
    const url = `${baseUrl}/Calls/connect.json`;

    console.log('Testing Exotel API...');
    console.log('URL:', url.replace(API_KEY, '***').replace(API_TOKEN, '***'));
    console.log('');

    const params = new URLSearchParams();
    params.append('From', '06381143136'); // Test number with 0 prefix
    params.append('To', '09513886363'); // Call to the exophone itself for testing
    params.append('CallerId', EXOPHONE);
    params.append('CallType', 'trans');

    try {
        const response = await axios.post(url, params, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            timeout: 10000
        });

        console.log('✅ SUCCESS!');
        console.log('Status:', response.status);
        console.log('Data:', JSON.stringify(response.data, null, 2));
    } catch (error) {
        console.log('❌ FAILED');
        console.log('Error:', error.message);

        if (error.response) {
            console.log('');
            console.log('Response Status:', error.response.status);
            console.log('Response Headers:', error.response.headers);
            console.log('Response Data:', JSON.stringify(error.response.data, null, 2));
        }
    }
}

testCall();
