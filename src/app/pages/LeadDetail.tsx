import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { ArrowLeft, User, Phone, MapPin, FileText, Clock } from 'lucide-react';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import ScheduleSiteVisitDialog from '../components/ScheduleSiteVisitDialog';

export default function LeadDetail() {
  const { id } = useParams();
  const { leads, activities } = useData();
  const [dialogOpen, setDialogOpen] = useState(false);

  const lead = leads.find(l => l.id === id);
  const leadActivities = activities.filter(a => a.leadId === id);

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

  // Mock activity timeline data
  const activityTimeline = [
    { time: '2 hours ago', activity: 'IVR Call - No Response', color: 'bg-orange-500' },
    { time: '14 hours ago', activity: 'IVR Call - No Response', color: 'bg-purple-500' },
    { time: '18 hours ago', activity: 'WhatsApp Reminder Sent', color: 'bg-blue-500' },
    { time: '22 hours ago', activity: 'WhatsApp Message - Seen', color: 'bg-green-500' },
    { time: '1 day ago', activity: 'Lead Created', color: 'bg-blue-500' },
  ];

  const getStatusBadgeColor = (status: string) => {
    if (status.includes('WhatsApp')) return 'bg-blue-100 text-blue-700';
    if (status.includes('No Response')) return 'bg-yellow-100 text-yellow-700';
    if (status.includes('IVR')) return 'bg-purple-100 text-purple-700';
    if (status.includes('Scheduled')) return 'bg-green-100 text-green-700';
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

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-4 mt-6">
              <Button className="bg-green-600 hover:bg-green-700 text-white">
                <Phone className="h-4 w-4 mr-2" />
                Call Now
              </Button>
              <Button variant="outline" className="border-gray-300" onClick={() => setDialogOpen(true)}>
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
              />
            </div>

            {/* Update Status */}
            <div className="mt-6">
              <label className="text-sm font-semibold text-gray-700 mb-2 block">Update Status</label>
              <Select defaultValue={lead.status}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select status..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="WhatsApp Sent">WhatsApp Sent</SelectItem>
                  <SelectItem value="No Response">No Response</SelectItem>
                  <SelectItem value="IVR Attempted">IVR Attempted</SelectItem>
                  <SelectItem value="Human Call Scheduled">Human Call Scheduled</SelectItem>
                  <SelectItem value="Contacted">Contacted</SelectItem>
                  <SelectItem value="Qualified">Qualified</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Update Status Button */}
            <Button className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white">
              Update Status
            </Button>
          </Card>
        </div>

        {/* Right Column - Activity Timeline */}
        <div className="lg:col-span-1">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-6">Activity Timeline</h3>
            <div className="space-y-4">
              {activityTimeline.map((item, index) => (
                <div key={index} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                    {index < activityTimeline.length - 1 && (
                      <div className="w-0.5 h-full bg-gray-200 my-1"></div>
                    )}
                  </div>
                  <div className="flex-1 pb-4">
                    <div className="text-xs text-gray-600 mb-1">{item.time}</div>
                    <div className="text-sm font-medium text-gray-900">{item.activity}</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Schedule Site Visit Dialog */}
      {lead && (
        <ScheduleSiteVisitDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          lead={lead}
        />
      )}
    </div>
  );
}
