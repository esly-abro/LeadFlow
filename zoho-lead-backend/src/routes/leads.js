/**
 * Lead Ingestion Routes
 * Handles POST /leads endpoint
 */

const express = require('express');
const router = express.Router();
const Joi = require('joi');
const leadNormalizer = require('../services/leadNormalizer');
const duplicateDetector = require('../services/duplicateDetector');
const logger = require('../utils/logger');

/**
 * Request body validation schema
 */
const leadSchema = Joi.object({
    source: Joi.string().required().messages({
        'any.required': 'Source is required',
        'string.empty': 'Source cannot be empty'
    }),
    name: Joi.string().required().min(2).messages({
        'any.required': 'Name is required',
        'string.empty': 'Name cannot be empty',
        'string.min': 'Name must be at least 2 characters'
    }),
    email: Joi.string().email().optional().allow(null, '').messages({
        'string.email': 'Invalid email format'
    }),
    phone: Joi.string().optional().allow(null, '').messages({
        'string.base': 'Phone must be a string'
    }),
    company: Joi.string().optional().allow(null, ''),
    extra: Joi.object().optional().allow(null)
}).custom((value, helpers) => {
    // At least one of email or phone must be provided
    if (!value.email && !value.phone) {
        return helpers.error('any.custom', {
            message: 'Either email or phone is required'
        });
    }
    return value;
});

/**
 * GET /
 * Get list of leads
 */
router.get('/', async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;

        const zohoClient = require('../services/zohoClient');
        const result = await zohoClient.getLeads({ page, limit });

        // Transform Zoho leads to frontend format
        const leads = result.data.map(lead => ({
            id: lead.id,
            name: lead.Last_Name || lead.Full_Name || 'Unknown',
            email: lead.Email || '',
            phone: lead.Phone || '',
            company: lead.Company || '',
            source: lead.Lead_Source || '',
            status: (lead.Lead_Status === 'New' ? 'New Lead' :
                lead.Lead_Status === 'Interested' ? 'Engaged' :
                    lead.Lead_Status) || 'New Lead', // Map Zoho status
            value: 0, // Default for now
            priority: 'medium', // Default
            owner: lead.Owner ? {
                id: lead.Owner.id,
                name: lead.Owner.name
            } : 'Unknown',
            lastActivity: lead.Modified_Time || lead.Created_Time,
            createdAt: lead.Created_Time
        }));

        res.json({
            data: leads,
            pagination: {
                page,
                limit,
                total: result.info.count,
                totalPages: Math.ceil(result.info.count / limit)
            }
        });

    } catch (error) {
        next(error);
    }
});

/**
 * POST /leads
 * Create or update a lead in Zoho CRM
 * 
 * Request Body:
 * {
 *   "source": "meta_ads",
 *   "name": "John Doe",
 *   "email": "john@example.com",
 *   "phone": "9876543210",
 *   "company": "TechCorp" (optional),
 *   "extra": { } (optional)
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "action": "created" | "updated",
 *   "leadId": "zoho_lead_id",
 *   "message": "Lead created successfully"
 * }
 */
router.post('/', async (req, res, next) => {
    try {
        logger.info('Received lead ingestion request', {
            source: req.body.source,
            hasEmail: !!req.body.email,
            hasPhone: !!req.body.phone
        });

        // Step 1: Validate request body
        const { error, value } = leadSchema.validate(req.body, {
            abortEarly: false,  // Return all errors
            stripUnknown: true  // Remove unknown fields
        });

        if (error) {
            const errors = error.details.map(detail => detail.message);
            logger.warn('Validation failed', { errors });

            return res.status(400).json({
                success: false,
                error: 'Validation failed',
                details: errors
            });
        }

        // Step 2: Normalize lead data to Zoho format
        let normalizedLead;
        try {
            normalizedLead = leadNormalizer.normalize(value);
        } catch (normError) {
            logger.error('Normalization failed', {
                error: normError.message,
                data: value
            });

            return res.status(400).json({
                success: false,
                error: 'Data normalization failed',
                details: normError.message
            });
        }

        // Step 3: Process lead (check duplicates + create/update)
        const result = await duplicateDetector.processLead(normalizedLead);

        logger.info('Lead processed successfully', {
            action: result.action,
            leadId: result.leadId
        });

        // Step 4: Return success response
        res.status(result.action === 'created' ? 201 : 200).json({
            success: true,
            action: result.action,
            leadId: result.leadId,
            message: result.message,
            matchedBy: result.matchedBy || null
        });

    } catch (error) {
        next(error);  // Pass to error handler middleware
    }
});

/**
 * GET /leads/sources
 * Get list of valid source values
 */
router.get('/sources', (req, res) => {
    const sources = leadNormalizer.getValidSources();

    res.json({
        success: true,
        sources: sources,
        count: sources.length
    });
});

/**
 * GET /:id
 * Get single lead details
 */
router.get('/:id', async (req, res, next) => {
    try {
        const zohoClient = require('../services/zohoClient');
        const lead = await zohoClient.getLead(req.params.id);

        if (!lead) {
            return res.status(404).json({ success: false, error: 'Lead not found' });
        }

        // Transform to frontend format
        const transformedLead = {
            id: lead.id,
            name: lead.Last_Name || lead.Full_Name || 'Unknown',
            email: lead.Email || '',
            phone: lead.Phone || '',
            company: lead.Company || '',
            source: lead.Lead_Source || '',
            status: (lead.Lead_Status === 'New' ? 'New Lead' :
                lead.Lead_Status === 'Interested' ? 'Engaged' :
                    lead.Lead_Status) || 'New Lead',
            value: 0,
            priority: 'medium',
            owner: lead.Owner ? {
                id: lead.Owner.id,
                name: lead.Owner.name
            } : 'Unknown',
            lastActivity: lead.Modified_Time || lead.Created_Time,
            createdAt: lead.Created_Time,
            // Include other fields if needed
            street: lead.Street,
            city: lead.City,
            state: lead.State,
            zipCode: lead.Zip_Code,
            description: lead.Description
        };

        res.json({ success: true, data: transformedLead });
    } catch (error) {
        next(error);
    }
});

/**
 * PUT /:id
 * Update lead details
 */
router.put('/:id', async (req, res, next) => {
    try {
        const zohoClient = require('../services/zohoClient');
        const updateData = {};

        // Map frontend fields to Zoho fields
        if (req.body.name) updateData.Last_Name = req.body.name;
        if (req.body.email) updateData.Email = req.body.email;
        if (req.body.phone) updateData.Phone = req.body.phone;
        if (req.body.company) updateData.Company = req.body.company;
        if (req.body.source) updateData.Lead_Source = req.body.source;
        if (req.body.street) updateData.Street = req.body.street;
        if (req.body.city) updateData.City = req.body.city;
        if (req.body.state) updateData.State = req.body.state;
        if (req.body.zipCode) updateData.Zip_Code = req.body.zipCode;
        if (req.body.description) updateData.Description = req.body.description;

        // Handle assignment
        if (req.body.assignedTo) {
            // In a real scenario, you'd map this to Zoho Owner ID
            // updateData.Owner = { id: req.body.assignedTo.id };
        }

        await zohoClient.updateLead(req.params.id, updateData);

        res.json({ success: true, message: 'Lead updated successfully' });
    } catch (error) {
        next(error);
    }
});

/**
 * PATCH /:id/status
 * Update lead status
 */
router.patch('/:id/status', async (req, res, next) => {
    try {
        const zohoClient = require('../services/zohoClient');
        const { status } = req.body;

        // Map status back to Zoho status if needed
        // For now using direct mapping or simple switch
        let zohoStatus = status;
        if (status === 'New Lead') zohoStatus = 'New';
        if (status === 'Engaged') zohoStatus = 'Interested';

        await zohoClient.updateLead(req.params.id, { Lead_Status: zohoStatus });

        res.json({ success: true, message: 'Status updated successfully' });
    } catch (error) {
        next(error);
    }
});

/**
 * POST /:id/site-visit
 * Confirm site visit
 */
router.post('/:id/site-visit', async (req, res, next) => {
    try {
        const { scheduledAt } = req.body;
        // In a real app, save this to DB or Zoho Notes/Events
        // For now just return success
        res.json({ success: true, message: 'Site visit scheduled' });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
