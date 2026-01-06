const axios = require('axios');

async function testWebhook() {
    try {
        console.log('Simulating IVR Status Update Webhook...');

        // This simulates the data Twilio would send via ngrok
        const payload = {
            phone: '+916381143136', // Use the user's test number
            status: 'Interested',
            buttonPressed: '1'
        };

        console.log('Payload:', payload);

        const response = await axios.post('http://localhost:3000/twilio/update-lead-status', payload);

        console.log('Response Status:', response.status);
        console.log('Response Data:', response.data);

        if (response.data.success) {
            console.log('✅ SUCCESS: Backend processed the update!');
        } else {
            console.log('❌ FAILED: Backend returned success=false');
        }
    } catch (error) {
        console.error('❌ ERROR:', error.response ? error.response.data : error.message);
    }
}

testWebhook();
