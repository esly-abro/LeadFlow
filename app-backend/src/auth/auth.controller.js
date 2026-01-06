/**
 * Auth Controller
 * HTTP handlers for authentication endpoints
 */

const authService = require('./auth.service');

/**
 * POST /auth/login
 */
async function login(request, reply) {
    const { email, password } = request.body;

    const result = await authService.login(email, password);

    return reply.code(200).send(result);
}

/**
 * POST /auth/refresh
 */
async function refresh(request, reply) {
    const { refreshToken } = request.body;

    const result = await authService.refresh(refreshToken);

    return reply.code(200).send(result);
}

/**
 * POST /auth/logout
 */
async function logout(request, reply) {
    const { refreshToken } = request.body;

    const result = await authService.logout(refreshToken);

    return reply.code(200).send(result);
}

module.exports = {
    login,
    refresh,
    logout
};
