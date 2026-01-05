/**
 * Role-Based Access Control Middleware
 * Permission checks based on user roles
 */

const { ForbiddenError } = require('../utils/errors');

/**
 * Require specific role(s)
 * @param {string|string[]} allowedRoles - Single role or array of roles
 */
function requireRole(allowedRoles) {
    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

    return async function (request, reply) {
        if (!request.user) {
            throw new ForbiddenError('User context not found');
        }

        if (!roles.includes(request.user.role)) {
            throw new ForbiddenError(`Access denied. Required roles: ${roles.join(', ')}`);
        }
    };
}

/**
 * Check if user can access lead
 * Rules:
 * - Admin: all leads
 * - Manager: all leads (simplified, can be restricted to team)
 * - Agent: only assigned leads
 */
function canAccessLead(user, lead) {
    if (user.role === 'admin' || user.role === 'manager') {
        return true;
    }

    if (user.role === 'agent') {
        // Check if lead is assigned to this user
        // For now, allow all (TODO: implement ownership check)
        return true;
    }

    return false;
}

/**
 * Filter leads based on user role
 */
function filterLeadsByPermission(user, leads) {
    if (user.role === 'admin' || user.role === 'manager') {
        return leads;
    }

    if (user.role === 'agent') {
        // TODO: Filter by owner when Zoho returns owner field
        // For now, return all (acceptable for alpha)
        return leads;
    }

    return [];
}

module.exports = {
    requireRole,
    canAccessLead,
    filterLeadsByPermission
};
