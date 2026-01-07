import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { ArrowLeft, User, Phone, MapPin, FileText, Clock, Loader2, PhoneOff, Mic, MicOff, CheckCircle, Mail } from 'lucide-react';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import ScheduleSiteVisitDialog from '../components/ScheduleSiteVisitDialog';
import { useTwilioCall } from '../hooks/useTwilioCall';

// Activity type for the lead
interface LeadActivity {
  id: string;
  type: string;
  description: string;
  timestamp: string;
  color: string;
}

export default function LeadDetail() {
  const { id } = useParams();
  const { leads, activities, updateLead, addActivity } = useData();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [callStatus, setCallStatus] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateMessage, setUpdateMessage] = useState<string | null>(null);
  const [leadActivityList, setLeadActivityList] = useState<LeadActivity[]>([]);
  const [callNotes, setCallNotes] = useState<string>('');
  const [notesSaved, setNotesSaved] = useState(false);

  const {
    initializeDevice,
    makeCall,
    hangUp,
    toggleMute,
    isReady,
    isConnecting,
    isOnCall,
    isMuted,
    formattedDuration,
    error: twilioError,
  } = useTwilioCall({
    onCallStarted: () => {
      setCallStatus('🔊 Call connected!');
    },
    onCallEnded: () => {
      setCallStatus('📞 Call ended');
      setTimeout(() => setCallStatus(null), 3000);
    },
    onError: (err) => setCallStatus(`❌ Error: ${err}`),
  });

  // Track call connection for activity logging
  useEffect(() => {
    if (isOnCall && id) {
      // Call just connected - log activity
      const stored = localStorage.getItem(`lead_activities_${id}`);
      const activities = stored ? JSON.parse(stored) : [];
      const connectedActivity = {
        id: Date.now().toString(),
        type: 'call',
        description: 'Call Connected',
        timestamp: new Date().toISOString(),
        color: 'bg-green-500'
      };
      const updated = [connectedActivity, ...activities];
      localStorage.setItem(`lead_activities_${id}`, JSON.stringify(updated));
      setLeadActivityList(updated);
    }
  }, [isOnCall, id]);

  // Initialize Twilio when component mounts
  useEffect(() => {
    initializeDevice();
  }, []);

  const lead = leads.find(l => l.id === id);
  const leadActivities = activities.filter(a => a.leadId === id);

  // Load activities from localStorage on mount
  useEffect(() => {
    if (id) {
      const stored = localStorage.getItem(`lead_activities_${id}`);
      if (stored) {
        setLeadActivityList(JSON.parse(stored));
      } else {
        // Initialize with Lead Created activity
        const initialActivity: LeadActivity = {
          id: '1',
          type: 'created',
          description: 'Lead Created',
          timestamp: lead?.createdAt || new Date().toISOString(),
          color: 'bg-blue-500'
        };
        setLeadActivityList([initialActivity]);
      }
    }
  }, [id, lead?.createdAt]);

  // Load saved notes from localStorage
  useEffect(() => {
    if (id) {
      const savedNotes = localStorage.getItem(`lead_notes_${id}`);
      if (savedNotes) {
        setCallNotes(savedNotes);
      }
    }
  }, [id]);

  // Save activities to localStorage whenever they change
  useEffect(() => {
    if (id && leadActivityList.length > 0) {
      localStorage.setItem(`lead_activities_${id}`, JSON.stringify(leadActivityList));
    }
  }, [id, leadActivityList]);

  // Add a new activity
  const addLeadActivity = (type: string, description: string, color: string) => {
    const newActivity: LeadActivity = {
      id: Date.now().toString(),
      type,
      description,
      timestamp: new Date().toISOString(),
      color
    };
    setLeadActivityList(prev => [newActivity, ...prev]);
    
    // Also add to global activities context
    if (id) {
      addActivity({
        type: type as any,
        leadId: id,
        description,
        timestamp: new Date().toISOString(),
        user: 'Agent'
      });
    }
  };

  // Handle call button click
  const handleCall = async () => {
    if (!lead?.phone) return;
    
    if (isOnCall) {
      hangUp();
      addLeadActivity('call', `Call Ended - Duration: ${formattedDuration}`, 'bg-gray-500');
    } else {
      setCallStatus('📞 Connecting...');
      addLeadActivity('call', 'Call Initiated', 'bg-blue-500');
      const success = await makeCall(lead.phone);
      if (!success && !twilioError) {
        setCallStatus('❌ Failed to connect call');
        addLeadActivity('call', 'Call Failed', 'bg-red-500');
        setTimeout(() => setCallStatus(null), 3000);
      }
    }
  };

  if (!lead) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900">Lead not found</h2>
        <Link to="/leads">
          <Button className="mt-4">Back to Leads</Button>
        </Link>
      </div>
    );
  }

  // Get time ago string
  const getTimeAgo = (timestamp: string) => {
    const now = new Date();
    const then = new Date(timestamp);
    const diffMs = now.getTime() - then.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays === 1) return '1 day ago';
    return `${diffDays} days ago`;
  };

  const getStatusBadgeColor = (status: string) => {
    if (status.includes('Attended')) return 'bg-green-100 text-green-700';
    if (status.includes('No Response')) return 'bg-yellow-100 text-yellow-700';
    if (status.includes('Not Interested')) return 'bg-red-100 text-red-700';
    if (status.includes('Site Visit')) return 'bg-purple-100 text-purple-700';
    return 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-2">
          <Link to="/leads">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-blue-900">Call Center Agent Dashboard</h1>
        </div>
        <p className="text-gray-600 ml-14">Assigned Lead Details</p>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Lead Information */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            {/* Header with Status */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-700 mb-2">Lead Information</h2>
                <Badge className={getStatusBadgeColor(lead.status)}>
                  {lead.status}
                </Badge>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-600">Lead ID</div>
                <div className="font-semibold text-blue-600">#LD-{lead.id.padStart(4, '0')}</div>
              </div>
            </div>

            {/* Lead Details Cards */}
            <div className="space-y-3">
              {/* Full Name */}
              <div className="flex items-center gap-3 bg-blue-50 p-4 rounded-lg">
                <div className="bg-blue-500 rounded-full p-2">
                  <User className="h-5 w-5 text-white" />
                </div>
                <div>
                  <div className="text-xs text-gray-600">Full Name</div>
                  <div className="font-semibold text-gray-900">{lead.name}</div>
                </div>
              </div>

              {/* Phone Number */}
              <div className="flex items-center gap-3 bg-blue-50 p-4 rounded-lg">
                <div className="bg-green-500 rounded-full p-2">
                  <Phone className="h-5 w-5 text-white" />
                </div>
                <div>
                  <div className="text-xs text-gray-600">Phone Number</div>
                  <div className="font-semibold text-gray-900">{lead.phone}</div>
                </div>
              </div>

              {/* Property Interested */}
              <div className="flex items-center gap-3 bg-blue-50 p-4 rounded-lg">
                <div className="bg-purple-500 rounded-full p-2">
                  <MapPin className="h-5 w-5 text-white" />
                </div>
                <div>
                  <div className="text-xs text-gray-600">Property Interested</div>
                  <div className="font-semibold text-gray-900">{lead.company}</div>
                </div>
              </div>

              {/* Source */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-xs text-gray-600 mb-1">Source</div>
                <div className="font-medium text-gray-900">{lead.source}</div>
              </div>

              {/* Last Activity */}
              <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-lg">
                <div className="bg-orange-500 rounded-full p-2">
                  <Clock className="h-5 w-5 text-white" />
                </div>
                <div>
                  <div className="text-xs text-gray-600">Last Activity</div>
                  <div className="font-medium text-gray-900">IVR Call Attempted - {lead.lastActivity}</div>
                </div>
              </div>
            </div>

            {/* Call Status */}
            {callStatus && (
              <div className={`p-3 rounded-lg mb-4 mt-4 ${callStatus.includes('✅') || callStatus.includes('🔊') ? 'bg-green-100 text-green-800' : callStatus.includes('❌') ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>
                {callStatus}
                {isOnCall && <span className="ml-2 font-mono">{formattedDuration}</span>}
              </div>
            )}

            {/* On Call Controls */}
            {isOnCall && (
              <div className="flex gap-4 mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
                <Button
                  onClick={toggleMute}
                  variant={isMuted ? "destructive" : "outline"}
                  className="flex-1"
                >
                  {isMuted ? <MicOff className="h-4 w-4 mr-2" /> : <Mic className="h-4 w-4 mr-2" />}
                  {isMuted ? 'Unmute' : 'Mute'}
                </Button>
                <Button
                  onClick={hangUp}
                  variant="destructive"
                  className="flex-1"
                >
                  <PhoneOff className="h-4 w-4 mr-2" />
                  End Call
                </Button>
              </div>
            )}

            {/* Action Buttons */}
            <div className="grid grid-cols-4 gap-4 mt-6">
              <Button 
                className={isOnCall ? "bg-red-600 hover:bg-red-700 text-white" : "bg-green-600 hover:bg-green-700 text-white"}
                onClick={handleCall}
                disabled={isConnecting || !isReady}
              >
                {isConnecting ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : isOnCall ? (
                  <PhoneOff className="h-4 w-4 mr-2" />
                ) : (
                  <Phone className="h-4 w-4 mr-2" />
                )}
                {isConnecting ? 'Connecting...' : isOnCall ? 'End Call' : isReady ? 'Call Now' : 'Loading...'}
              </Button>
              <Button 
                className="bg-[#25D366] hover:bg-[#128C7E] text-white"
                onClick={() => {
                  if (lead.phone) {
                    // Remove spaces, dashes, and + from phone number for WhatsApp
                    const cleanPhone = lead.phone.replace(/[\s\-\+]/g, '');
                    // If number doesn't start with country code, assume India (91)
                    const whatsappNumber = cleanPhone.startsWith('91') ? cleanPhone : `91${cleanPhone}`;
                    window.open(`https://wa.me/${whatsappNumber}`, '_blank');
                    // Log WhatsApp activity
                    addLeadActivity('whatsapp', 'WhatsApp Message Opened', 'bg-green-500');
                  }
                }}
              >
                <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                WhatsApp
              </Button>
              <Button 
                className="bg-blue-600 hover:bg-blue-700 text-white"
                onClick={() => {
                  if (lead.email) {
                    // Open Gmail compose with pre-filled recipient and subject
                    const subject = encodeURIComponent(`Follow up - ${lead.name}`);
                    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${lead.email}&su=${subject}`;
                    window.open(gmailUrl, '_blank');
                    // Log Email activity
                    addLeadActivity('email', 'Email Composed via Gmail', 'bg-blue-500');
                  }
                }}
              >
                <Mail className="h-4 w-4 mr-2" />
                Email
              </Button>
              <Button 
                variant="outline" 
                className="border-gray-300" 
                onClick={() => {
                  setDialogOpen(true);
                }}
              >
                <FileText className="h-4 w-4 mr-2" />
                Schedule Site Visit
              </Button>
            </div>

            {/* Call Notes */}
            <div className="mt-6">
              <label className="text-sm font-semibold text-gray-700 mb-2 block">Call Notes</label>
              <Textarea
                placeholder="Enter notes from the call..."
                rows={4}
                className="resize-none"
                value={callNotes}
                onChange={(e) => {
                  setCallNotes(e.target.value);
                  setNotesSaved(false);
                }}
              />
              <div className="flex items-center gap-2 mt-2">
                <Button
                  size="sm"
                  onClick={() => {
                    if (callNotes.trim()) {
                      // Save notes to localStorage
                      localStorage.setItem(`lead_notes_${id}`, callNotes);
                      addLeadActivity('note', `Notes saved: "${callNotes.substring(0, 50)}${callNotes.length > 50 ? '...' : ''}"`, 'bg-gray-500');
                      setNotesSaved(true);
                      setTimeout(() => setNotesSaved(false), 3000);
                    }
                  }}
                  disabled={!callNotes.trim()}
                >
                  Save Notes
                </Button>
                {notesSaved && (
                  <span className="text-sm text-green-600 flex items-center gap-1">
                    <CheckCircle className="h-4 w-4" /> Saved!
                  </span>
                )}
              </div>
            </div>

            {/* Update Status */}
            <div className="mt-6">
              <label className="text-sm font-semibold text-gray-700 mb-2 block">Update Status</label>
              <Select value={selectedStatus || lead.status} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select status..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Call Attended">Call Attended</SelectItem>
                  <SelectItem value="No Response">No Response</SelectItem>
                  <SelectItem value="Not Interested">Not Interested</SelectItem>
                  <SelectItem value="Site Visit Booked">Site Visit Booked</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Update Message */}
            {updateMessage && (
              <div className="mt-2 p-2 bg-green-100 text-green-800 rounded-lg flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                {updateMessage}
              </div>
            )}

            {/* Update Status Button */}
            <Button 
              className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => {
                if (!selectedStatus && !lead.status) return;
                setIsUpdating(true);
                const newStatus = selectedStatus || lead.status;
                updateLead(lead.id, { status: newStatus });
                
                // Log activity for status update
                const colorMap: Record<string, string> = {
                  'Call Attended': 'bg-green-500',
                  'No Response': 'bg-yellow-500',
                  'Not Interested': 'bg-red-500',
                  'Site Visit Booked': 'bg-purple-500'
                };
                addLeadActivity('status', `Status Updated: ${newStatus}`, colorMap[newStatus] || 'bg-gray-500');
                
                setUpdateMessage(`Status updated to "${newStatus}"`);
                setTimeout(() => {
                  setIsUpdating(false);
                  setUpdateMessage(null);
                }, 3000);
              }}
              disabled={isUpdating}
            >
              {isUpdating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Status'
              )}
            </Button>
          </Card>
        </div>

        {/* Right Column - Activity Timeline */}
        <div className="lg:col-span-1">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-6">Activity Timeline</h3>
            {leadActivityList.length === 0 ? (
              <p className="text-gray-500 text-sm">No activities yet</p>
            ) : (
              <div className="space-y-4">
                {leadActivityList.map((item, index) => (
                  <div key={item.id} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                      {index < leadActivityList.length - 1 && (
                        <div className="w-0.5 h-full bg-gray-200 my-1"></div>
                      )}
                    </div>
                    <div className="flex-1 pb-4">
                      <div className="text-xs text-gray-600 mb-1">{getTimeAgo(item.timestamp)}</div>
                      <div className="text-sm font-medium text-gray-900">{item.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Schedule Site Visit Dialog */}
      {lead && (
        <ScheduleSiteVisitDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          lead={lead}
          onConfirm={(details) => {
            addLeadActivity(`Site Visit Scheduled for ${details.visitDate} at ${details.timeSlot}`, 'site_visit', 'bg-purple-500');
          }}
        />
      )}
    </div>
  );
}
