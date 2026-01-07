import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getLeads, updateLead as updateLeadAPI, confirmSiteVisit as confirmSiteVisitAPI, getTodaySiteVisits, createActivity as createActivityAPI, getRecentActivities } from '../../services/leads';

export interface Agent {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'agent';
}

// Demo agents list
export const AGENTS: Agent[] = [
  { id: 'user-1', name: 'Admin User', email: 'admin@example.com', role: 'admin' },
  { id: 'user-2', name: 'Sales Manager', email: 'manager@example.com', role: 'manager' },
  { id: 'user-3', name: 'Sales Agent', email: 'agent@example.com', role: 'agent' },
  { id: 'user-4', name: 'Rajesh Kumar', email: 'rajesh@example.com', role: 'agent' },
  { id: 'user-5', name: 'Priya Sharma', email: 'priya@example.com', role: 'agent' },
];

export interface Lead {
  id: string;
  _id?: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  source: string;
  status: string;
  value: number;
  priority: 'high' | 'medium' | 'low';
  owner: {
    id: string;
    name: string;
  } | string;
  lastActivity: string;
  createdAt: string;
  budget?: string;
  timeline?: string;
  tags?: string[];
  activities?: Activity[];
  // New fields for assignment
  assignedTo?: {
    id: string;
    name: string;
  };
  property?: string;
}

export interface Activity {
  id: string;
  _id?: string;
  type: 'call' | 'email' | 'note' | 'meeting' | 'whatsapp' | 'status' | 'site_visit';
  leadId?: string;
  description: string;
  title?: string;
  timestamp: string;
  user: string;
  userName?: string;
}

export interface Message {
  id: string;
  leadId: string;
  leadName: string;
  lastMessage: string;
  timestamp: string;
  unread: boolean;
  messages: {
    id: string;
    text: string;
    sender: 'user' | 'lead';
    timestamp: string;
  }[];
}

export interface SiteVisit {
  _id: string;
  lead: Lead;
  scheduledAt: string;
  confirmedBy: string;
  createdAt: string;
}

interface DataContextType {
  leads: Lead[];
  activities: Activity[];
  messages: Message[];
  loading: boolean;
  error: string | null;
  refreshLeads: () => Promise<void>;
  updateLead: (id: string, updates: Partial<Lead>) => void;
  addActivity: (activity: Omit<Activity, 'id'>) => void;
  siteVisits: SiteVisit[];
  confirmSiteVisit: (leadId: string, scheduledAt: string, leadName?: string) => Promise<void>;
  // New fields for admin assignment
  agents: Agent[];
  currentUser: Agent | null;
  setCurrentUser: (user: Agent | null) => void;
  assignLead: (leadId: string, agentId: string) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [messages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [siteVisits, setSiteVisits] = useState<SiteVisit[]>([]);
  const [currentUser, setCurrentUser] = useState<Agent | null>(() => {
    // Get current user from localStorage token
    const token = localStorage.getItem('accessToken');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        // Find matching agent from AGENTS list
        const agent = AGENTS.find(a => a.email === payload.email);
        return agent || null;
      } catch {
        return null;
      }
    }
    return null;
  });

  const refreshLeads = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getLeads({ limit: 200 });
      setLeads(response.data);
    } catch (err: any) {
      setError(err.message || 'Failed to load leads');
      console.error('Failed to fetch leads:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch leads on mount - only if user is authenticated
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      refreshLeads();
    } else {
      // No token, mark as not loading so UI doesn't show spinner
      setLoading(false);
    }
  }, []);

  const updateLead = async (id: string, updates: Partial<Lead>) => {
    // Update local state immediately for responsiveness
    setLeads(prev => prev.map(lead =>
      lead.id === id ? { ...lead, ...updates } : lead
    ));

    // Persist to database
    try {
      await updateLeadAPI(id, updates);
    } catch (err) {
      console.error('Failed to update lead:', err);
      // Optionally revert on error
      // refreshLeads();
    }
  };

  // Assign lead to an agent
  const assignLead = (leadId: string, agentId: string) => {
    const agent = AGENTS.find(a => a.id === agentId);
    if (agent) {
      updateLead(leadId, {
        assignedTo: { id: agent.id, name: agent.name }
      });
    }
  };

  const fetchActivities = async () => {
    try {
      const response = await getRecentActivities();
      setActivities(response.data);
    } catch (err) {
      setActivities([]);
    }
  };

  const addActivity = async (activity: Omit<Activity, 'id'>) => {
    await createActivityAPI(activity);
    await fetchActivities();
  };

  const fetchSiteVisits = async () => {
    try {
      const response = await getTodaySiteVisits();
      setSiteVisits(response.data);
    } catch (err) {
      setSiteVisits([]);
    }
  };

  const confirmSiteVisit = async (leadId: string, scheduledAt: string, leadName?: string) => {
    await confirmSiteVisitAPI(leadId, scheduledAt);
    // Also create an activity for this site visit
    await createActivityAPI({
      leadId,
      type: 'site_visit',
      title: `Site visit scheduled with ${leadName || 'client'}`,
      description: `Site visit confirmed for ${new Date(scheduledAt).toLocaleString()}`,
      userName: 'Current User',
      scheduledAt
    });
    await fetchSiteVisits();
    await fetchActivities();
  };

  useEffect(() => {
    fetchSiteVisits();
  }, []);

  // Initial fetch of activities
  useEffect(() => {
    fetchActivities();
  }, []);

  return (
    <DataContext.Provider value={{
      leads,
      activities,
      messages,
      loading,
      error,
      refreshLeads,
      updateLead,
      addActivity,
      siteVisits,
      confirmSiteVisit,
      // New admin assignment fields
      agents: AGENTS,
      currentUser,
      setCurrentUser,
      assignLead,
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
