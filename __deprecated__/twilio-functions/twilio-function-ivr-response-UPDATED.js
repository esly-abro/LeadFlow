// Updated Twilio Function: IVR Response Handler with Lead Status Update
// Path: /ivr-response

const axios = require('axios');

exports.handler = async function (context, event, callback) {
    const twiml = new Twilio.twiml.VoiceResponse();

    const digit = event.Digits;
    const callSid = event.CallSid;
    const from = event.From;

    console.log(`IVR response: ${digit} from ${from}`);

    // Your backend URL - UPDATE THIS!
    const backendUrl = 'http://YOUR_BACKEND_URL:3000';

    let status = 'Unknown';
    let updateSent = false;

    switch (digit) {
        case '1':
            // User wants to schedule site visit
            status = 'Interested';
            console.log('Lead wants to schedule site visit');

            // Send status update to backend
            try {
                await axios.post(`${backendUrl}/twilio/update-lead-status`, {
                    phone: from,
                    status: 'Interested',
                    buttonPressed: '1'
                }, {
                    timeout: 3000
                });
                updateSent = true;
            } catch (error) {
                console.error('Failed to update lead status:', error.message);
            }

            twiml.say({
                voice: 'alice',
                language: 'en-IN'
            }, 'Great! We will connect you to our sales team now.');

            twiml.say({
                voice: 'alice',
                language: 'en-IN'
            }, 'Our team will call you shortly to schedule your site visit. Thank you!');

            twiml.hangup();
            break;

        case '2':
            // User wants WhatsApp info
            status = 'Interested - WhatsApp';
            console.log('Lead wants WhatsApp information');

            try {
                await axios.post(`${backendUrl}/twilio/update-lead-status`, {
                    phone: from,
                    status: 'Interested - WhatsApp',
                    buttonPressed: '2'
                }, {
                    timeout: 3000
                });
                updateSent = true;
            } catch (error) {
                console.error('Failed to update lead status:', error.message);
            }

            twiml.say({
                voice: 'alice',
                language: 'en-IN'
            }, 'Perfect! We will send you detailed information on WhatsApp shortly. Thank you for your interest.');

            twiml.hangup();
            break;

        case '3':
            // Not interested
            status = 'Not Interested';
            console.log('Lead is not interested');

            try {
                await axios.post(`${backendUrl}/twilio/update-lead-status`, {
                    phone: from,
                    status: 'Not Interested',
                    buttonPressed: '3'
                }, {
                    timeout: 3000
                });
                updateSent = true;
            } catch (error) {
                console.error('Failed to update lead status:', error.message);
            }

            twiml.say({
                voice: 'alice',
                language: 'en-IN'
            }, 'Thank you for your time. If you change your mind, please feel free to contact us. Have a great day!');

            twiml.hangup();
            break;

        default:
            // Invalid input
            console.log('Invalid IVR input');

            twiml.say({
                voice: 'alice',
                language: 'en-IN'
            }, 'We did not receive a valid selection. Our team will call you back shortly. Thank you.');

            twiml.hangup();
    }

    console.log(`Status update ${updateSent ? 'sent' : 'failed'} for ${from}: ${status}`);

    callback(null, twiml);
};
