/**
 * Test Twilio Connection
 * Run this to diagnose Twilio issues
 */

const config = require('./src/config/config');
const twilioClient = require('./src/services/twilioClient');
const logger = require('./src/utils/logger');

async function testTwilioConnection() {
    console.log('\n=== Twilio Diagnostic Test ===\n');

    // Check configuration
    console.log('Configuration:');
    console.log('- Twilio Enabled:', config.twilio.enabled);
    console.log('- Exotel Enabled:', config.exotel.enabled);
    console.log('- Account SID:', config.twilio.accountSid);
    console.log('- Phone Number:', config.twilio.phoneNumber);
    console.log('- Has Auth Token:', !!config.twilio.authToken);
    console.log('');

    if (!config.twilio.enabled) {
        console.error('❌ Twilio is DISABLED in config');
        console.log('Check your .env file - TWILIO_ENABLED should be true');
        return;
    }

    if (!config.twilio.phoneNumber) {
        console.error('❌ Twilio phone number is NOT SET');
        return;
    }

    // Test call to verified number
    const testPhone = '6381143136';
    console.log(`Testing call to: ${testPhone}`);
    console.log('');

    try {
        const result = await twilioClient.makeCall(testPhone);

        console.log('✅ Call initiated successfully!');
        console.log('Response:', JSON.stringify(result, null, 2));
    } catch (error) {
        console.error('❌ Call failed!');
        console.error('Error:', error.message);
        console.error('');

        if (error.code) {
            console.error('Twilio Error Code:', error.code);
        }
        if (error.moreInfo) {
            console.error('More Info:', error.moreInfo);
        }
    }
}

testTwilioConnection().then(() => process.exit(0)).catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
});
