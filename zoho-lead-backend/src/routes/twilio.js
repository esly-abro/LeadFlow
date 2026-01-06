/**
 * Twilio TwiML Routes
 * Handles Twilio webhooks and IVR flows
 */

const express = require('express');
const router = express.Router();
const logger = require('../utils/logger');
const VoiceResponse = require('twilio').twiml.VoiceResponse;
const zohoClient = require('../services/zohoClient');

/**
 * GET/POST /twilio/ivr-greeting
 * Initial IVR greeting for JK Real Estate
 */
router.all('/ivr-greeting', (req, res) => {
    const twiml = new VoiceResponse();

    // Greeting message
    twiml.say({
        voice: 'alice',
        language: 'en-IN'
    }, 'Hello, this is an automated call from J K Real Estate. We noticed you showed interest in properties.');

    twiml.pause({ length: 1 });

    twiml.say({
        voice: 'alice',
        language: 'en-IN'
    }, 'We have some exciting options that match your requirements. Our properties feature modern amenities, prime locations, and competitive pricing.');

    twiml.pause({ length: 1 });

    // Gather input
    const gather = twiml.gather({
        action: '/twilio/ivr-response',
        method: 'POST',
        numDigits: 1,
        timeout: 10
    });

    gather.say({
        voice: 'alice',
        language: 'en-IN'
    }, 'Would you like to schedule a site visit? Press 1 to schedule a visit with our team. Press 2 to receive more information via WhatsApp. Press 3 if you are not interested at this time.');

    // If no input, repeat the message once
    twiml.say({
        voice: 'alice',
        language: 'en-IN'
    }, 'We did not receive your selection. Our team will call you back shortly. Thank you.');

    twiml.hangup();

    res.type('text/xml');
    res.send(twiml.toString());

    logger.info('IVR greeting served', {
        from: req.body.From,
        callSid: req.body.CallSid
    });
});

/**
 * POST /twilio/ivr-response
 * Handle user button press responses
 */
router.post('/ivr-response', async (req, res) => {
    const digit = req.body.Digits;
    const callSid = req.body.CallSid;
    const from = req.body.From;

    logger.info('IVR response received', {
        digit,
        callSid,
        from
    });

    const twiml = new VoiceResponse();

    switch (digit) {
        case '1':
            // Lead is interested - update status in Zoho
            logger.info('Lead is interested - pressing 1', { callSid, from });

            // Update lead status in Zoho CRM
            try {
                // Extract phone number (remove +91 or country code)
                const phoneNumber = from.replace(/^\+91/, '').replace(/^\+/, '');
                const lead = await zohoClient.searchLeadsByPhone(phoneNumber);
                if (lead) {
                    await zohoClient.updateLead(lead.id, {
                        Lead_Status: 'Interested'
                    });
                    logger.info('Lead status updated to Interested in Zoho', { leadId: lead.id, phone: phoneNumber });
                } else {
                    logger.warn('Lead not found in Zoho for phone', { phone: phoneNumber });
                }
            } catch (updateError) {
                logger.error('Failed to update lead status in Zoho', {
                    error: updateError.message,
                    from: from
                });
            }

            twiml.say({
                voice: 'alice',
                language: 'en-IN'
            }, 'Thank you for your interest! Our team will contact you shortly to assist you further.');

            twiml.hangup();
            break;

        case '2':
            // Send WhatsApp info
            logger.info('Lead wants WhatsApp information', { callSid, from });

            twiml.say({
                voice: 'alice',
                language: 'en-IN'
            }, 'Perfect! We will send you detailed information on WhatsApp shortly. Thank you for your interest.');

            twiml.hangup();
            break;

        case '3':
            // Not interested
            logger.info('Lead is not interested', { callSid, from });

            twiml.say({
                voice: 'alice',
                language: 'en-IN'
            }, 'Thank you for your time. If you change your mind, please feel free to contact us. Have a great day!');

            twiml.hangup();
            break;

        default:
            // Invalid input
            logger.warn('Invalid IVR input', { digit, callSid });

            twiml.say({
                voice: 'alice',
                language: 'en-IN'
            }, 'We did not receive a valid selection. Our team will call you back shortly. Thank you.');

            twiml.hangup();
    }

    res.type('text/xml');
    res.send(twiml.toString());
});

/**
 * POST /twilio/status-callback
 * Receive call status updates from Twilio
 */
router.post('/status-callback', (req, res) => {
    const { CallSid, CallStatus, From, To, Duration } = req.body;

    logger.info('Twilio status callback received', {
        callSid: CallSid,
        status: CallStatus,
        from: From,
        to: To,
        duration: Duration
    });

    // TODO: Update lead status in Zoho CRM based on call outcome

    res.sendStatus(200);
});

/**
 * POST /twilio/update-lead-status
 * Update lead status based on IVR response
 * Called by Twilio Function when user presses buttons
 */
router.post('/update-lead-status', async (req, res) => {
    try {
        const { phone, status, buttonPressed } = req.body;

        logger.info('IVR status update received', {
            phone,
            status,
            buttonPressed
        });

        if (!phone || !status) {
            return res.status(400).json({
                success: false,
                error: 'Phone and status are required'
            });
        }

        // Update lead in Zoho CRM
        try {
            // FIX: Using the correct service file name
            const zohoClient = require('../services/zohoClient');

            // Search for lead by phone number
            // Twilio sends E.164 (+91...), but Zoho might have local format
            let lead = await zohoClient.searchLeadsByPhone(phone);

            // Fallback: Try removing +91 if not found
            if (!lead && phone.startsWith('+91')) {
                const localPhone = phone.substring(3); // Remove +91
                lead = await zohoClient.searchLeadsByPhone(localPhone);
            }

            if (lead) {
                const leadId = lead.id;

                // Update lead status in Zoho
                // Note: Ensure 'Lead_Status' matches the API name in your Zoho setup
                const updateData = {
                    Lead_Status: status
                };

                await zohoClient.updateLead(leadId, updateData);

                logger.info('Lead status updated in Zoho CRM', {
                    leadId,
                    phone,
                    newStatus: status,
                    button: buttonPressed
                });

                res.json({
                    success: true,
                    message: 'Lead status updated in Zoho CRM',
                    phone,
                    status,
                    leadId
                });
            } else {
                logger.warn('Lead not found in Zoho for phone update', { phone });
                res.json({
                    success: false,
                    message: 'Lead not found in Zoho',
                    phone
                });
            }
        } catch (zohoError) {
            logger.error('Failed to update lead in Zoho', {
                error: zohoError.message,
                phone
            });

            res.json({
                success: true,
                message: 'Webhook received but Zoho update failed',
                error: zohoError.message
            });
        }

    } catch (error) {
        logger.error('Error processing IVR status update', {
            error: error.message
        });
        res.status(500).json({
            success: false,
            error: 'Failed to process status update'
        });
    }
});

/**
 * GET /twilio/stats
 * Get call statistics
 */
router.get('/stats', (req, res) => {
    const callScheduler = require('../services/callScheduler');
    const stats = callScheduler.getStats();

    res.json({
        success: true,
        provider: 'twilio',
        stats
    });
});

module.exports = router;
