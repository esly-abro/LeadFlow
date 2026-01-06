/**
 * Exotel Diagnostic Test
 * Run this to test Exotel API connection and see detailed errors
 */

const config = require('./src/config/config');
const exotelClient = require('./src/services/exotelClient');
const logger = require('./src/utils/logger');

async function testExotelConnection() {
    console.log('\n=== Exotel Diagnostic Test ===\n');

    // Check configuration
    console.log('Configuration:');
    console.log('- Enabled:', config.exotel.enabled);
    console.log('- Account SID:', config.exotel.accountSid);
    console.log('- Subdomain:', config.exotel.subdomain);
    console.log('- Exophone:', config.exotel.exophone);
    console.log('- App ID:', config.exotel.appId || '(not set)');
    console.log('- Has API Key:', !!config.exotel.apiKey);
    console.log('- Has API Token:', !!config.exotel.apiToken);
    console.log('');

    if (!config.exotel.enabled) {
        console.error('❌ Exotel is DISABLED in config');
        return;
    }

    if (!config.exotel.exophone) {
        console.error('❌ Exophone is NOT SET');
        return;
    }

    // Test phone number
    const testPhone = '6381143136';
    console.log(`Testing call to: ${testPhone}`);
    console.log('');

    try {
        const result = await exotelClient.makeCall(testPhone, {
            customField: 'diagnostic_test'
        });

        console.log('✅ Call initiated successfully!');
        console.log('Response:', JSON.stringify(result, null, 2));
    } catch (error) {
        console.error('❌ Call failed!');
        console.error('Error:', error.message);
        console.error('');

        if (error.response) {
            console.error('API Response Status:', error.response.status);
            console.error('API Response Data:', JSON.stringify(error.response.data, null, 2));
        }
    }
}

testExotelConnection();
