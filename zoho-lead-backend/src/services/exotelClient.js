/**
 * Exotel API Client
 * Handles communication with Exotel API for making calls
 */

const axios = require('axios');
const config = require('../config/config');
const logger = require('../utils/logger');

class ExotelClient {
    constructor() {
        this.accountSid = config.exotel.accountSid;
        this.apiKey = config.exotel.apiKey;
        this.apiToken = config.exotel.apiToken;
        this.subdomain = config.exotel.subdomain;
        this.exophone = config.exotel.exophone;
        this.appId = config.exotel.appId;
        this.callType = config.exotel.callType;

        // Construct base URL
        this.baseUrl = `https://${this.apiKey}:${this.apiToken}@${this.subdomain}/v1/Accounts/${this.accountSid}`;

        logger.info('Exotel client initialized', {
            accountSid: this.accountSid,
            subdomain: this.subdomain,
            hasExophone: !!this.exophone,
            hasAppId: !!this.appId
        });
    }

    /**
     * Make a call to a lead
     * @param {string} phoneNumber - Lead's phone number (10 digits with country code prefix)
     * @param {object} options - Additional call options
     * @returns {Promise<object>} Call response from Exotel
     */
    async makeCall(phoneNumber, options = {}) {
        if (!config.exotel.enabled) {
            logger.warn('Exotel is disabled, skipping call', { phoneNumber });
            return { skipped: true, reason: 'Exotel disabled' };
        }

        if (!this.exophone) {
            throw new Error('Exotel Exophone not configured. Please set EXOTEL_EXOPHONE in .env');
        }

        // Format phone number (ensure it has country code)
        const formattedNumber = this.formatPhoneNumber(phoneNumber);

        // Prepare call parameters
        const callParams = new URLSearchParams();

        if (this.appId) {
            // Connect to IVR app
            callParams.append('From', formattedNumber);
            callParams.append('CallerId', this.exophone);
            callParams.append('Url', `http://my.exotel.in/exoml/start/${this.appId}`);
            callParams.append('CallType', this.callType);
        } else {
            // Direct call (connect two numbers)
            // For direct calls, we need a 'To' number (agent/sales team number)
            // Since we don't have this, we'll default to connecting to app
            const toNumber = options.agentNumber || this.exophone;
            callParams.append('From', formattedNumber);
            callParams.append('To', toNumber);
            callParams.append('CallerId', this.exophone);
            callParams.append('CallType', this.callType);
        }

        // Optional parameters
        if (options.customField) {
            callParams.append('CustomField', options.customField);
        }

        if (options.timeLimit) {
            callParams.append('TimeLimit', options.timeLimit);
        }

        if (options.statusCallback) {
            callParams.append('StatusCallback', options.statusCallback);
            callParams.append('StatusCallbackEvents[0]', 'terminal');
        }

        // Make API request
        const url = `${this.baseUrl}/Calls/connect.json`;

        try {
            logger.info('Initiating Exotel call', {
                phoneNumber: formattedNumber,
                exophone: this.exophone,
                hasAppId: !!this.appId,
                url: url.replace(this.apiKey, '***').replace(this.apiToken, '***')
            });

            const response = await axios.post(url, callParams, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                timeout: 10000 // 10 second timeout
            });

            logger.info('Exotel call initiated successfully', {
                callSid: response.data?.Call?.Sid,
                status: response.data?.Call?.Status,
                phoneNumber: formattedNumber
            });

            return {
                success: true,
                callSid: response.data?.Call?.Sid,
                status: response.data?.Call?.Status,
                data: response.data
            };

        } catch (error) {
            logger.error('Exotel API call failed', {
                phoneNumber: formattedNumber,
                error: error.message,
                responseStatus: error.response?.status,
                responseData: error.response?.data
            });

            throw new Error(`Exotel call failed: ${error.message}`);
        }
    }

    /**
     * Format phone number for Exotel
     * Exotel expects mobile numbers with 0 prefix (e.g., 09876543210)
     * and landlines with STD code (e.g., 08030752400)
     * @param {string} phoneNumber - Input phone number
     * @returns {string} Formatted phone number
     */
    formatPhoneNumber(phoneNumber) {
        // Remove all non-digit characters
        let cleaned = phoneNumber.replace(/\D/g, '');

        // If it's a 10-digit Indian mobile number, add 0 prefix
        if (cleaned.length === 10 && /^[6-9]/.test(cleaned)) {
            return '0' + cleaned;
        }

        // If it already has country code (91), format accordingly
        if (cleaned.startsWith('91') && cleaned.length === 12) {
            return '0' + cleaned.substring(2);
        }

        // Return as-is if already formatted
        return cleaned;
    }

    /**
     * Get call details by SID
     * @param {string} callSid - Call SID from Exotel
     * @returns {Promise<object>} Call details
     */
    async getCallDetails(callSid) {
        const url = `${this.baseUrl}/Calls/${callSid}.json`;

        try {
            const response = await axios.get(url, {
                timeout: 10000
            });

            return response.data;
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
module.exports = new ExotelClient();
