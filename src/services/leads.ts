/**
 * Leads Service
 * API functions for lead management
 */

import api from './api';
import { Lead } from '../app/context/DataContext';

export interface LeadsResponse {
    data: Lead[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

/**
 * Get all leads with pagination and filters
 */
export async function getLeads(params?: {
    page?: number;
    limit?: number;
    status?: string;
    source?: string;
    owner?: string;
}): Promise<LeadsResponse> {
    const { data } = await api.get<LeadsResponse>('/api/leads', {
        params
    });
    return data;
}

/**
 * Get single lead by ID
 */
export async function getLead(id: string): Promise<Lead> {
    const { data } = await api.get<Lead>(`/api/leads/${id}`);
    return data;
}

/**
 * Create new lead
 */
export async function createLead(leadData: {
    name: string;
    email: string;
    phone: string;
    company?: string;
    source: string;
}): Promise<{ success: boolean; leadId: string; action: string }> {
    const { data } = await api.post('/api/leads', leadData);
    return data;
}

/**
 * Update lead
 */
export async function updateLead(id: string, updateData: Partial<Lead>): Promise<Lead> {
    const { data } = await api.put<Lead>(`/api/leads/${id}`, updateData);
    return data;
}

/**
 * Update lead status
 */
export async function updateLeadStatus(id: string, status: string): Promise<Lead> {
    const { data } = await api.patch<Lead>(`/api/leads/${id}/status`, { status });
    return data;
}

/**
 * Confirm site visit for a lead
 */
export async function confirmSiteVisit(leadId: string, scheduledAt: string) {
    return api.post(`/api/leads/${leadId}/site-visit`, { scheduledAt });
}

/**
 * Get today's site visits
 */
export async function getTodaySiteVisits() {
    return api.get('/api/site-visits/today');
}

/**
 * Get all site visits (for calendar)
 */
export async function getAllSiteVisits() {
    return api.get('/api/site-visits/all');
}

/**
 * Create new activity
 */
export async function createActivity(activity: any) {
  return api.post('/api/activities', activity);
}

/**
 * Get recent activities
 */
export async function getRecentActivities() {
  return api.get('/api/activities/recent');
}
