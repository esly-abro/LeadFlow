/**
 * Call Scheduler Service
 * Manages delayed calling with retry logic
 */

const exotelClient = require('./exotelClient');
const twilioClient = require('./twilioClient');
const config = require('../config/config');
const logger = require('../utils/logger');

class CallScheduler {
    constructor() {
        this.pendingCalls = new Map(); // Store pending timeouts
        this.callHistory = new Map(); // Track call attempts
        this.isShuttingDown = false;

        // Determine which provider to use
        this.provider = config.twilio.enabled ? 'twilio' : 'exotel';
        this.callDelayMs = config.twilio.enabled ? config.twilio.callDelayMs : config.exotel.callDelayMs;
        this.maxRetries = config.twilio.enabled ? config.twilio.maxRetries : config.exotel.maxRetries;

        logger.info('Call scheduler initialized', {
            provider: this.provider,
            delayMs: this.callDelayMs,
            maxRetries: this.maxRetries
        });
    }

    /**
     * Schedule a call to a lead
     * @param {string} phoneNumber - Lead's phone number
     * @param {object} leadData - Lead information for logging
     * @param {object} options - Call options
     */
    scheduleCall(phoneNumber, leadData = {}, options = {}) {
        if (!config.exotel.enabled && !config.twilio.enabled) {
            logger.info('Call scheduling skipped - No provider enabled');
            return;
        }

        if (!phoneNumber) {
            logger.warn('Cannot schedule call - no phone number provided', leadData);
            return;
        }

        if (this.isShuttingDown) {
            logger.warn('Cannot schedule call - service is shutting down');
            return;
        }

        const callId = this.generateCallId(phoneNumber, leadData);
        const delay = options.delay || this.callDelayMs;

        logger.info('Scheduling call', {
            callId,
            phoneNumber: this.maskPhoneNumber(phoneNumber),
            leadName: leadData.name,
            leadId: leadData.leadId,
            delayMs: delay,
            scheduledFor: new Date(Date.now() + delay).toISOString()
        });

        // Initialize call history
        if (!this.callHistory.has(callId)) {
            this.callHistory.set(callId, {
                phoneNumber,
                leadData,
                attempts: 0,
                lastAttempt: null,
                status: 'pending'
            });
        }

        // Schedule the call
        const timeoutId = setTimeout(() => {
            this.executeCall(callId, phoneNumber, leadData, options);
        }, delay);

        // Store timeout reference
        this.pendingCalls.set(callId, timeoutId);
    }

    /**
     * Execute the actual call
     * @private
     */
    async executeCall(callId, phoneNumber, leadData, options) {
        const history = this.callHistory.get(callId);

        if (!history) {
            logger.error('Call history not found', { callId });
            return;
        }

        history.attempts += 1;
        history.lastAttempt = new Date();

        logger.info('Executing call', {
            callId,
            attempt: history.attempts,
            maxRetries: config.exotel.maxRetries,
            phoneNumber: this.maskPhoneNumber(phoneNumber),
            leadName: leadData.name
        });

        try {
            // Prepare call options with lead info
            const callOptions = {
                customField: callId,
                statusCallback: options.statusCallback,
                leadId: leadData.leadId,  // Pass leadId for Twilio Function
                leadName: leadData.name,
                ...options
            };

            // Make the call using the active provider
            const client = this.provider === 'twilio' ? twilioClient : exotelClient;
            const result = await client.makeCall(phoneNumber, callOptions);

            if (result.success) {
                logger.info('Call initiated successfully', {
                    callId,
                    callSid: result.callSid,
                    phoneNumber: this.maskPhoneNumber(phoneNumber),
                    leadName: leadData.name
                });

                history.status = 'success';
                history.callSid = result.callSid;
                history.result = result;

                // Clean up
                this.pendingCalls.delete(callId);
            } else if (result.skipped) {
                logger.info('Call skipped', { callId, reason: result.reason });
                history.status = 'skipped';
                this.pendingCalls.delete(callId);
            }

        } catch (error) {
            logger.error('Call execution failed', {
                callId,
                attempt: history.attempts,
                error: error.message,
                phoneNumber: this.maskPhoneNumber(phoneNumber)
            });

            history.status = 'failed';
            history.lastError = error.message;

            // Retry logic
            if (history.attempts < this.maxRetries) {
                const retryDelay = this.calculateRetryDelay(history.attempts);

                logger.info('Scheduling retry', {
                    callId,
                    attempt: history.attempts + 1,
                    retryDelayMs: retryDelay
                });

                // Schedule retry
                const timeoutId = setTimeout(() => {
                    this.executeCall(callId, phoneNumber, leadData, options);
                }, retryDelay);

                this.pendingCalls.set(callId, timeoutId);
            } else {
                logger.error('Max retries reached, giving up', {
                    callId,
                    attempts: history.attempts
                });
                this.pendingCalls.delete(callId);
            }
        }
    }

    /**
     * Calculate exponential backoff delay for retries
     * @private
     */
    calculateRetryDelay(attemptNumber) {
        // Exponential backoff: 2s, 4s, 8s...
        return Math.min(2000 * Math.pow(2, attemptNumber - 1), 30000);
    }

    /**
     * Generate unique call ID
     * @private
     */
    generateCallId(phoneNumber, leadData) {
        const timestamp = Date.now();
        const leadId = leadData.leadId || 'unknown';
        return `call_${leadId}_${timestamp}`;
    }

    /**
     * Mask phone number for logging (privacy)
     * @private
     */
    maskPhoneNumber(phoneNumber) {
        if (!phoneNumber || phoneNumber.length < 4) return '***';
        return phoneNumber.substring(0, 3) + '***' + phoneNumber.substring(phoneNumber.length - 2);
    }

    /**
     * Get call status
     */
    getCallStatus(callId) {
        return this.callHistory.get(callId);
    }

    /**
     * Get all pending calls
     */
    getPendingCalls() {
        return Array.from(this.pendingCalls.keys());
    }

    /**
     * Cancel a scheduled call
     */
    cancelCall(callId) {
        const timeoutId = this.pendingCalls.get(callId);
        if (timeoutId) {
            clearTimeout(timeoutId);
            this.pendingCalls.delete(callId);

            const history = this.callHistory.get(callId);
            if (history) {
                history.status = 'cancelled';
            }

            logger.info('Call cancelled', { callId });
            return true;
        }
        return false;
    }

    /**
     * Graceful shutdown - cancel all pending calls
     */
    async shutdown() {
        logger.info('Shutting down call scheduler', {
            pendingCalls: this.pendingCalls.size
        });

        this.isShuttingDown = true;

        // Clear all pending timeouts
        for (const [callId, timeoutId] of this.pendingCalls) {
            clearTimeout(timeoutId);
            logger.info('Cancelled pending call during shutdown', { callId });
        }

        this.pendingCalls.clear();
        logger.info('Call scheduler shutdown complete');
    }

    /**
     * Get statistics
     */
    getStats() {
        const stats = {
            pending: this.pendingCalls.size,
            total: this.callHistory.size,
            byStatus: {
                pending: 0,
                success: 0,
                failed: 0,
                skipped: 0,
                cancelled: 0
            }
        };

        for (const history of this.callHistory.values()) {
            stats.byStatus[history.status] = (stats.byStatus[history.status] || 0) + 1;
        }

        return stats;
    }
}

// Export singleton instance
module.exports = new CallScheduler();
