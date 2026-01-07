/**
 * SiteVisit Schema
 * Stores confirmed site visits for leads
 */

const mongoose = require('mongoose');

const siteVisitSchema = new mongoose.Schema({
    lead: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lead',
        required: true
    },
    scheduledAt: {
        type: Date,
        required: true
    },
    confirmedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('SiteVisit', siteVisitSchema);
