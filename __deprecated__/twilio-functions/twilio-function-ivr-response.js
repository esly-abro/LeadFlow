// Twilio Function: IVR Response Handler for JK Real Estate
// Path: /ivr-response

exports.handler = function (context, event, callback) {
    const twiml = new Twilio.twiml.VoiceResponse();

    const digit = event.Digits;
    const callSid = event.CallSid;
    const from = event.From;

    console.log(`IVR response: ${digit} from ${from}`);

    switch (digit) {
        case '1':
            // User wants to schedule site visit
            console.log('Lead wants to schedule site visit');

            twiml.say({
                voice: 'alice',
                language: 'en-IN'
            }, 'Great! We will connect you to our sales team now.');

            // TODO: Update lead in Zoho CRM via HTTP request
            // For now, just acknowledge
            twiml.say({
                voice: 'alice',
                language: 'en-IN'
            }, 'Our team will call you shortly to schedule your site visit. Thank you!');

            twiml.hangup();
            break;

        case '2':
            // User wants WhatsApp info
            console.log('Lead wants WhatsApp information');

            twiml.say({
                voice: 'alice',
                language: 'en-IN'
            }, 'Perfect! We will send you detailed information on WhatsApp shortly. Thank you for your interest.');

            twiml.hangup();
            break;

        case '3':
            // Not interested
            console.log('Lead is not interested');

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

    callback(null, twiml);
};
