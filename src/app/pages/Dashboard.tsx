import { useData } from '../context/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Users, TrendingUp, DollarSign, Target, ArrowUpRight, ArrowDownRight, Phone, Mail, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, FunnelChart, Funnel, LabelList } from 'recharts';

export default function Dashboard() {
  const { leads, activities } = useData();

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

  const leadsNeedingAttention = leads.filter(l => l.priority === 'high').slice(0, 3);

  const teamPerformance = [
    { name: 'John Doe', active: 3, closed: 2 },
    { name: 'Jane Smith', active: 2, closed: 1 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome back! Here's what's happening with your leads today.</p>
      </div>

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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Funnel Chart */}
        <Card className="lg:col-span-2">
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
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row - Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Leads Needing Attention */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Leads Needing Attention</CardTitle>
            <Link to="/leads">
              <Button variant="ghost" size="sm">View All</Button>
            </Link>
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

      {/* Recent Activities */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Activities</CardTitle>
          <Link to="/activities">
            <Button variant="ghost" size="sm">View All</Button>
          </Link>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activities.slice(0, 5).map((activity) => {
              const lead = leads.find(l => l.id === activity.leadId);
              return (
                <div key={activity.id} className="flex gap-4 items-start">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{activity.type.toUpperCase()}</span>
                      <span className="text-gray-600">with</span>
                      <span className="font-semibold">{lead?.name}</span>
                    </div>
                    <div className="text-sm text-gray-600">{activity.description}</div>
                    <div className="text-xs text-gray-500 mt-1">{activity.user} • {new Date(activity.timestamp).toLocaleString()}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
