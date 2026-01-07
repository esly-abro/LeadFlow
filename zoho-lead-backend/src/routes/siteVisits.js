/**
 * Site Visit Routes
 * Handles specific site visit endpoints
 */

const express = require('express');
const router = express.Router();

// In-memory store (shared conceptually, but simple array here)
const siteVisits = [];

/**
 * GET /site-visits/today
 * Get today's site visits
 */
router.get('/today', (req, res) => {
    const today = new Date().toISOString().split('T')[0];

    // filtered visits
    const todaysVisits = siteVisits.filter(v =>
        v.scheduledAt.startsWith(today)
    );

    res.json({
        success: true,
        data: todaysVisits
    });
});

module.exports = router;
