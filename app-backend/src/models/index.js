/**
 * Models Index
 * Export all MongoDB models
 */

const User = require('./User');
const RefreshToken = require('./RefreshToken');
const CallLog = require('./CallLog');
const Activity = require('./Activity');
const Lead = require('./Lead');

module.exports = {
    User,
    RefreshToken,
    CallLog,
    Activity,
    Lead
};
