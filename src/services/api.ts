/**
 * API Client
 * Single axios instance with JWT token management and auto-refresh
 */
/**
 * API Client
 * Single axios instance with JWT token management and auto-refresh
 */

import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const api = axios.create({
    baseURL: API_BASE_URL
});

// Helper function to clear auth and redirect - defined BEFORE interceptors
function handleAuthFailure() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    // Only redirect if not already on login page to avoid loops
    if (window.location.pathname !== '/login') {
        window.location.href = '/login';
    }
}

// Request interceptor: attach JWT token
api.interceptors.request.use(config => {
    const token = localStorage.getItem('accessToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Response interceptor: handle 401, auto-refresh token
api.interceptors.response.use(
    response => response,
    async error => {
        if (error.response?.status === 401) {
            const refreshToken = localStorage.getItem('refreshToken');
            if (!refreshToken) {
                handleAuthFailure();
                return Promise.reject(error);
            }

            try {
                const { data } = await axios.post(`${API_BASE_URL}/auth/refresh`, {
                    refreshToken
                });
                localStorage.setItem('accessToken', data.accessToken);

                // Retry original request with new token
                error.config.headers.Authorization = `Bearer ${data.accessToken}`;
                return api(error.config);
            } catch {
                handleAuthFailure();
                return Promise.reject(error);
            }
        }
        return Promise.reject(error);
    }
);

export default api;
