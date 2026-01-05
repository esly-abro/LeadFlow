import api from './api';

export interface CallResult {
  success: boolean;
  callSid?: string;
  status?: string;
  to?: string;
  from?: string;
  error?: string;
}

export interface CallStatus {
  success: boolean;
  status?: string;
  duration?: string;
  startTime?: string;
  endTime?: string;
  error?: string;
}

export interface CallRecord {
  sid: string;
  to: string;
  from: string;
  status: string;
  duration: string;
  startTime: string;
  direction: string;
}

export interface CallHistory {
  success: boolean;
  calls?: CallRecord[];
  error?: string;
}

export interface TokenResponse {
  token: string;
  identity: string;
}

// Get access token for browser calling
export async function getAccessToken(): Promise<TokenResponse> {
  const response = await api.get('/api/twilio/token');
  return response.data;
}

// Make a call to a phone number (server-side)
export async function makeCall(phoneNumber: string, leadId?: string, leadName?: string): Promise<CallResult> {
  const response = await api.post('/api/twilio/call', {
    phoneNumber,
    leadId,
    leadName,
  });
  return response.data;
}

// Get status of a specific call
export async function getCallStatus(callSid: string): Promise<CallStatus> {
  const response = await api.get(`/api/twilio/call/${callSid}`);
  return response.data;
}

// Get call history
export async function getCallHistory(limit = 20): Promise<CallHistory> {
  const response = await api.get(`/api/twilio/calls?limit=${limit}`);
  return response.data;
}
