/**
 * Twilio Voice API Client
 * Handles communication with Twilio API for making calls
 */

const twilio = require('twilio');
const config = require('../config/config');
const logger = require('../utils/logger');

class TwilioClient {
    constructor() {
        this.accountSid = config.twilio.accountSid;
        this.authToken = config.twilio.authToken;
        this.phoneNumber = config.twilio.phoneNumber;

        // Initialize Twilio client
        this.client = twilio(this.accountSid, this.authToken);

        logger.info('Twilio client initialized', {
            accountSid: this.accountSid,
            hasPhoneNumber: !!this.phoneNumber
        });
    }

    /**
     * Make a call to a lead
     * @param {string} phoneNumber - Lead's phone number
     * @param {object} options - Additional call options
     * @returns {Promise<object>} Call response from Twilio
     */
    async makeCall(phoneNumber, options = {}) {
        if (!config.twilio.enabled) {
            logger.warn('Twilio is disabled, skipping call', { phoneNumber });
            return { skipped: true, reason: 'Twilio disabled' };
        }

        if (!this.phoneNumber) {
            throw new Error('Twilio phone number not configured. Please set TWILIO_PHONE_NUMBER in .env');
        }

        // Format phone number (add country code if needed)
        const formattedTo = this.formatPhoneNumber(phoneNumber);
        const formattedFrom = this.phoneNumber;

        logger.info('Initiating Twilio call', {
            to: this.maskPhoneNumber(formattedTo),
            from: formattedFrom
        });

        try {
            // Prepare call parameters
            const callParams = {
                to: formattedTo,
                from: formattedFrom,
                // Use inline TwiML instead of webhook URL (for local testing)
                twiml: this.getDefaultTwiML(),
                statusCallback: options.statusCallback,
                statusCallbackEvent: ['completed', 'failed', 'busy', 'no-answer'],
                statusCallbackMethod: 'POST',
                timeout: options.timeout || 60, // Ring timeout in seconds
                record: options.record || false
            };

            // Make the call
            const call = await this.client.calls.create(callParams);

            logger.info('Twilio call initiated successfully', {
                callSid: call.sid,
                status: call.status,
                to: this.maskPhoneNumber(formattedTo)
            });

            return {
                success: true,
                callSid: call.sid,
                status: call.status,
                data: call
            };

        } catch (error) {
            logger.error('Twilio API call failed', {
                to: this.maskPhoneNumber(formattedTo),
                error: error.message,
                code: error.code
            });

            throw new Error(`Twilio call failed: ${error.message}`);
        }
    }

    /**
     * Format phone number for Twilio (E.164 format)
     * @param {string} phoneNumber - Input phone number
     * @returns {string} Formatted phone number
     */
    formatPhoneNumber(phoneNumber) {
        // Remove all non-digit characters
        let cleaned = phoneNumber.replace(/\D/g, '');

        // If it's a 10-digit Indian mobile number, add +91
        if (cleaned.length === 10 && /^[6-9]/.test(cleaned)) {
            return '+91' + cleaned;
        }

        // If it already has country code (91), add +
        if (cleaned.startsWith('91') && cleaned.length === 12) {
            return '+' + cleaned;
        }

        // If it already has +, return as-is
        if (phoneNumber.startsWith('+')) {
            return phoneNumber;
        }

        // Default: assume it needs +91
        return '+91' + cleaned;
    }

    /**
     * Mask phone number for logging (privacy)
     * @private
     */
    maskPhoneNumber(phoneNumber) {
        if (!phoneNumber || phoneNumber.length < 4) return '***';
        return phoneNumber.substring(0, 4) + '***' + phoneNumber.substring(phoneNumber.length - 2);
    }

    /**
     * Get default TwiML for IVR (inline)
     * Returns TwiML XML string for JK Real Estate IVR
     */
    getDefaultTwiML() {
        const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
        const webhookUrl = `${baseUrl}/ivr-response`;  // Fixed: removed /twilio prefix

        return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say voice="alice" language="en-IN">
        Hello, this is an automated call from J K Real Estate. 
        We noticed you showed interest in properties.
    </Say>
    <Pause length="1"/>
    <Say voice="alice" language="en-IN">
        We have some exciting options that match your requirements. 
        Our properties feature modern amenities, prime locations, and competitive pricing.
    </Say>
    <Pause length="1"/>
    <Gather action="${webhookUrl}" numDigits="1" timeout="10" method="POST">
        <Say voice="alice" language="en-IN">
            Would you like to schedule a site visit? 
            Press 1 to schedule a visit with our team. 
            Press 2 to receive more information via WhatsApp. 
            Press 3 if you are not interested at this time.
        </Say>
    </Gather>
    <Say voice="alice" language="en-IN">
        We did not receive your selection. Our team will call you back shortly. Thank you.
    </Say>
    <Hangup/>
</Response>`;
    }

    /**
     * Get call details by SID
     * @param {string} callSid - Call SID from Twilio
     * @returns {Promise<object>} Call details
     */
    async getCallDetails(callSid) {
        try {
            const call = await this.client.calls(callSid).fetch();
            return call;
        } catch (error) {
            logger.error('Failed to fetch call details', {
                callSid,
                error: error.message
            });
            throw error;
        }
    }
}

// Export singleton instance
module.exports = new TwilioClient();
