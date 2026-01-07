import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getLeads, updateLead as updateLeadAPI } from '../../services/leads';

export interface Lead {
  id: string;
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
}

export interface Activity {
  id: string;
  type: 'call' | 'email' | 'note' | 'meeting' | 'whatsapp' | 'status' | 'site_visit';
  leadId?: string;
  description: string;
  timestamp: string;
  user: string;
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

interface DataContextType {
  leads: Lead[];
  activities: Activity[];
  messages: Message[];
  loading: boolean;
  error: string | null;
  refreshLeads: () => Promise<void>;
  updateLead: (id: string, updates: Partial<Lead>) => void;
  addActivity: (activity: Omit<Activity, 'id'>) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [messages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const addActivity = (activity: Omit<Activity, 'id'>) => {
    const newActivity = {
      ...activity,
      id: Date.now().toString()
    };
    setActivities(prev => [newActivity, ...prev]);
  };

  return (
    <DataContext.Provider value={{
      leads,
      activities,
      messages,
      loading,
      error,
      refreshLeads,
      updateLead,
      addActivity
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
