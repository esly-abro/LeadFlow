/**
 * Activities Routes
 * Handles lead activities and site visits
 */

const express = require('express');
const router = express.Router();
const logger = require('../utils/logger');

// In-memory store for activities (replace with DB in production)
const activities = [
    {
        id: 'act-1',
        type: 'call',
        description: 'Initial contact with John Doe',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
        user: 'user-1',
        userName: 'Admin User',
        leadId: 'lead-1'
    },
    {
        id: 'act-2',
        type: 'status',
        description: 'Status changed to Interested',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
        user: 'user-3',
        userName: 'Sales Agent',
        leadId: 'lead-1'
    }
];

// In-memory store for site visits
const siteVisits = [];

/**
 * GET /activities/recent
 * Get recent activities
 */
router.get('/recent', (req, res) => {
    // Sort by timestamp desc
    const recent = [...activities]
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, 20);

    res.json({
        success: true,
        data: recent
    });
});

/**
 * POST /activities
 * Create new activity
 */
router.post('/', (req, res) => {
    const { type, description, leadId, title, scheduledAt, userName } = req.body;

    const newActivity = {
        id: `act-${Date.now()}`,
        type: type || 'note',
        description,
        title,
        leadId,
        timestamp: new Date().toISOString(),
        user: req.user?.userId || 'unknown',
        userName: userName || 'System',
        scheduledAt
    };

    activities.unshift(newActivity);

    res.status(201).json({
        success: true,
        data: newActivity
    });
});

module.exports = router;
