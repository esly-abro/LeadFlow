/**
 * Exotel Status Callback Routes
 * Handles webhooks from Exotel for call status updates
 */

const express = require('express');
const router = express.Router();
const logger = require('../utils/logger');
const zohoClient = require('../services/zohoClient');

/**
 * POST /exotel/status-callback
 * Receive call status updates from Exotel
 * 
 * Exotel sends various call events:
 * - 'terminal' - Call completed
 * - 'answered' - Call was answered
 * - 'busy' - Line was busy
 * - 'no-answer' - No answer
 * - 'failed' - Call failed
 */
router.post('/status-callback', (req, res) => {
    try {
        const callData = req.body;

        logger.info('Exotel status callback received', {
            callSid: callData.CallSid,
            status: callData.Status,
            direction: callData.Direction,
            from: callData.From,
            to: callData.To,
            duration: callData.Duration,
            startTime: callData.StartTime,
            endTime: callData.EndTime,
            customField: callData.CustomField
        });

        // Log detailed status
        if (callData.Status === 'completed') {
            logger.info('Call completed successfully', {
                callSid: callData.CallSid,
                duration: callData.Duration,
                customField: callData.CustomField
            });
        } else if (callData.Status === 'failed') {
            logger.warn('Call failed', {
                callSid: callData.CallSid,
                reason: callData.FailureReason,
                customField: callData.CustomField
            });
        } else if (callData.Status === 'busy') {
            logger.info('Call was busy', {
                callSid: callData.CallSid,
                customField: callData.CustomField
            });
        } else if (callData.Status === 'no-answer') {
            logger.info('Call not answered', {
                callSid: callData.CallSid,
                customField: callData.CustomField
            });
        }

        // TODO: Optional enhancements:
        // 1. Update lead in Zoho CRM with call status
        // 2. Add note to lead with call duration and outcome
        // 3. Store call logs in database
        // 4. Trigger follow-up actions based on call status

        // Respond to Exotel
        res.status(200).send('OK');

    } catch (error) {
        logger.error('Error processing Exotel callback', {
            error: error.message,
            body: req.body
        });

        // Still respond with 200 to avoid Exotel retries
        res.status(200).send('OK');
    }
});

/**
 * POST /exotel/ivr-response
 * Handle IVR menu responses (button presses)
 * 
 * Called by Exotel when user presses a digit
 */
router.post('/ivr-response', async (req, res) => {
    try {
        const { Digits, CallSid, From, To, CustomField } = req.body;

        logger.info('IVR response received', {
            digits: Digits,
            callSid: CallSid,
            from: From,
            customField: CustomField
        });

        // Handle different responses
        switch (Digits) {
            case '1':
                // User is interested - update status in Zoho CRM
                logger.info('Lead is interested - pressing 1', {
                    callSid: CallSid,
                    from: From,
                    customField: CustomField
                });

                // Update lead status in Zoho CRM to "Interested"
                try {
                    // CustomField should contain the leadId
                    const leadId = CustomField;
                    if (leadId) {
                        await zohoClient.updateLead(leadId, {
                            Lead_Status: 'Interested'
                        });
                        logger.info('Lead status updated to Interested in Zoho', { leadId });
                    } else {
                        // Search by phone number if no leadId in CustomField
                        const phoneNumber = From.replace(/^0/, '');
                        const lead = await zohoClient.searchLeadsByPhone(phoneNumber);
                        if (lead) {
                            await zohoClient.updateLead(lead.id, {
                                Lead_Status: 'Interested'
                            });
                            logger.info('Lead status updated to Interested in Zoho', { leadId: lead.id });
                        }
                    }
                } catch (updateError) {
                    logger.error('Failed to update lead status in Zoho', {
                        error: updateError.message,
                        from: From
                    });
                }

                res.set('Content-Type', 'text/xml');
                res.send(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say voice="woman" language="en">
        Thank you for your interest! Our team will contact you shortly to assist you further.
    </Say>
    <Hangup/>
</Response>`);
                break;

            case '2':
                // User wants WhatsApp information
                logger.info('Lead wants WhatsApp information', {
                    callSid: CallSid,
                    from: From,
                    customField: CustomField
                });

                // TODO: Trigger WhatsApp message
                // Use WhatsApp Business API or integration service

                res.set('Content-Type', 'text/xml');
                res.send(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say voice="woman" language="en">
        Perfect! We will send you detailed information on WhatsApp shortly. Thank you for your interest.
    </Say>
    <Hangup/>
</Response>`);
                break;

            case '3':
                // User is not interested
                logger.info('Lead is not interested', {
                    callSid: CallSid,
                    from: From,
                    customField: CustomField
                });

                // TODO: Update lead status in Zoho to "Not Interested"

                res.set('Content-Type', 'text/xml');
                res.send(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say voice="woman" language="en">
        Thank you for your time. If you change your mind, please feel free to contact us. Have a great day!
    </Say>
    <Hangup/>
</Response>`);
                break;

            default:
                // Invalid input or timeout
                logger.warn('Invalid IVR input', {
                    digits: Digits,
                    callSid: CallSid
                });

                res.set('Content-Type', 'text/xml');
                res.send(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say voice="woman" language="en">
        We did not receive a valid selection. Our team will call you back shortly. Thank you.
    </Say>
    <Hangup/>
</Response>`);
        }

    } catch (error) {
        logger.error('Error processing IVR response', {
            error: error.message,
            body: req.body
        });

        // Send error response
        res.set('Content-Type', 'text/xml');
        res.status(500).send(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say voice="woman" language="en">
        We encountered an error. Our team will call you back shortly. Thank you.
    </Say>
    <Hangup/>
</Response>`);
    }
});

/**
 * GET /exotel/stats
 * Get call statistics (for monitoring)
 */
router.get('/stats', (req, res) => {
    const callScheduler = require('../services/callScheduler');
    const stats = callScheduler.getStats();

    res.json({
        success: true,
        stats
    });
});

module.exports = router;
