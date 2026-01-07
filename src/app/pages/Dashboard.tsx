import { useData } from '../context/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Users, TrendingUp, DollarSign, Target, ArrowUpRight, ArrowDownRight, Phone, Mail, Calendar, Clock, CheckCircle2, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, FunnelChart, Funnel, LabelList, Legend } from 'recharts';

export default function Dashboard() {
  const { leads, activities, siteVisits } = useData();

  const stats = [
    {
      title: 'Total Leads',
      value: leads.length,
      change: '+12%',
      trend: 'up',
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Active Leads',
      value: leads.filter(l => ['New', 'Contacted', 'Qualified'].includes(l.status)).length,
      change: '+8%',
      trend: 'up',
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Conversion Rate',
      value: '24.5%',
      change: '+3%',
      trend: 'up',
      icon: Target,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'Pipeline Value',
      value: `$${(leads.reduce((sum, lead) => sum + lead.value, 0) / 1000).toFixed(0)}K`,
      change: '+15%',
      trend: 'up',
      icon: DollarSign,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
  ];

  const funnelData = [
    { name: 'New', value: leads.filter(l => l.status === 'New').length, fill: '#3b82f6' },
    { name: 'Contacted', value: leads.filter(l => l.status === 'Contacted').length, fill: '#8b5cf6' },
    { name: 'Qualified', value: leads.filter(l => l.status === 'Qualified').length, fill: '#ec4899' },
    { name: 'Proposal', value: leads.filter(l => l.status === 'Proposal Sent').length, fill: '#f59e0b' },
    { name: 'Negotiation', value: leads.filter(l => l.status === 'Negotiation').length, fill: '#10b981' },
  ];

  const sourceData = [
    { name: 'Website', value: leads.filter(l => l.source === 'Website').length, color: '#3b82f6' },
    { name: 'LinkedIn', value: leads.filter(l => l.source === 'LinkedIn Ads').length, color: '#8b5cf6' },
    { name: 'Referral', value: leads.filter(l => l.source === 'Referral').length, color: '#ec4899' },
    { name: 'Google Ads', value: leads.filter(l => l.source === 'Google Ads').length, color: '#f59e0b' },
    { name: 'Conference', value: leads.filter(l => l.source === 'Conference').length, color: '#10b981' },
  ];

  const leadsNeedingAttention = leads.filter(l => ['Follow-up', 'Not Interested', 'Nurture'].includes(l.status)).slice(0, 5);

  const teamPerformance = [
    { name: 'John Doe', active: 3, closed: 2 },
    { name: 'Jane Smith', active: 2, closed: 1 },
  ];

  // Filter activities for today
  const todaysActivities = activities.filter(activity => {
    const activityDate = new Date(activity.timestamp);
    const today = new Date();
    const isToday = activityDate.toDateString() === today.toDateString();
    const isStatusUpdate = activity.description.startsWith('Status Updated') || activity.type === 'note' || activity.type === 'status'; // generic/status types
    const isRelevant = activity.type === 'meeting' || activity.description.toLowerCase().includes('site visit');

    return isToday && !isStatusUpdate && isRelevant;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome back! Here's what's happening with your leads today.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Main Content Area - Spans 3 columns on large screens */}
        <div className="xl:col-span-3 space-y-6">

          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <Card key={stat.title}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                        <h3 className="text-3xl font-bold text-gray-900">{stat.value}</h3>
                        <div className="flex items-center gap-1 mt-2">
                          {stat.trend === 'up' ? (
                            <ArrowUpRight className="h-4 w-4 text-green-600" />
                          ) : (
                            <ArrowDownRight className="h-4 w-4 text-red-600" />
                          )}
                          <span className={`text-sm ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                            {stat.change}
                          </span>
                          <span className="text-sm text-gray-500">from last month</span>
                        </div>
                      </div>
                      <div className={`${stat.bgColor} ${stat.color} p-3 rounded-lg`}>
                        <Icon className="h-6 w-6" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Funnel Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Sales Funnel</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={funnelData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Lead Sources Pie Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Lead Sources</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={sourceData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label
                    >
                      {sourceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Tables Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Leads Needing Attention */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Leads Needing Attention</CardTitle>
                <Button variant="ghost" size="sm" className="gap-2">
                  <Filter className="h-4 w-4" />
                  Filter
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {leadsNeedingAttention.map((lead) => (
                    <div key={lead.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                      <div>
                        <div className="font-semibold">{lead.name}</div>
                        <div className="text-sm text-gray-600">{lead.company}</div>
                        <div className="flex gap-2 mt-2">
                          <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">
                            High Priority
                          </span>
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                            {lead.status}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-lg">${(lead.value / 1000).toFixed(0)}K</div>
                        <div className="text-sm text-gray-600">{lead.lastActivity}</div>
                        <div className="flex gap-1 mt-2">
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Phone className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Mail className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Calendar className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Team Performance */}
            <Card>
              <CardHeader>
                <CardTitle>Team Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {teamPerformance.map((member) => (
                    <div key={member.name} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center font-semibold text-blue-600">
                          {member.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <div className="font-semibold">{member.name}</div>
                          <div className="text-sm text-gray-600">Sales Representative</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-600">Active: {member.active}</div>
                        <div className="text-sm text-green-600">Closed: {member.closed}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Right Sidebar - Today's Meetings */}
        <div className="xl:col-span-1">
          <Card className="h-full border-l-4 border-l-blue-600 shadow-md flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between pb-2 shrink-0">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-600" />
                <CardTitle className="text-xl">Today's Meetings</CardTitle>
              </div>
              <Link to="/activities">
                <Button variant="ghost" size="sm">View All</Button>
              </Link>
            </CardHeader>
            <CardContent className="flex-1 overflow-auto custom-scrollbar">
              {todaysActivities.length > 0 ? (
                <div className="space-y-4">
                  {todaysActivities.map((activity) => {
                    const lead = leads.find(l => l.id === activity.leadId);
                    return (
                      <div key={activity.id} className="gap-3 flex flex-col p-3 hover:bg-slate-50 rounded-md transition-colors border border-gray-100 hover:border-slate-200 shadow-sm">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded uppercase tracking-wide">
                              {activity.type}
                            </span>
                          </div>
                          <span className="text-xs text-gray-400 font-medium">
                            {new Date(activity.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>

                        <div>
                          <p className="text-sm font-medium text-gray-900 leading-tight mb-1">{activity.description}</p>
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <span>with</span>
                            <span className="font-medium text-blue-700">{lead?.name || 'Unknown Lead'}</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-gray-50 mt-1">
                          <div className="flex items-center gap-1 text-[10px] text-gray-400">
                            <CheckCircle2 className="h-3 w-3" />
                            <span>{activity.user}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500 flex flex-col items-center justify-center h-full">
                  <Target className="h-12 w-12 mb-3 text-gray-300" />
                  <p>No active site visits or negotiations.</p>
                  <Link to="/leads">
                    <Button variant="link" className="mt-2 text-blue-600">Find leads</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
