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
