import { useState } from 'react';
import { useData } from '../context/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Download, TrendingUp, Users, DollarSign, Target } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function Analytics() {
  const { leads } = useData();
  const [dateRange, setDateRange] = useState('30days');

  const monthlyData = [
    { month: 'Jan', leads: 45, deals: 12, revenue: 125000 },
    { month: 'Feb', leads: 52, deals: 15, revenue: 165000 },
    { month: 'Mar', leads: 48, deals: 13, revenue: 145000 },
    { month: 'Apr', leads: 61, deals: 18, revenue: 195000 },
    { month: 'May', leads: 55, deals: 16, revenue: 175000 },
    { month: 'Jun', leads: 67, deals: 20, revenue: 225000 },
  ];

  const conversionFunnel = [
    { stage: 'Leads', count: 150 },
    { stage: 'Contacted', count: 120 },
    { stage: 'Qualified', count: 80 },
    { stage: 'Proposal', count: 50 },
    { stage: 'Closed', count: 30 },
  ];

  const sourcePerformance = [
    { source: 'Website', leads: 45, conversion: 28 },
    { source: 'LinkedIn', leads: 32, conversion: 35 },
    { source: 'Referral', leads: 28, conversion: 42 },
    { source: 'Google Ads', leads: 25, conversion: 22 },
    { source: 'Conference', leads: 20, conversion: 38 },
  ];

  const teamData = [
    { name: 'John Doe', leads: 35, deals: 12, revenue: 145000 },
    { name: 'Jane Smith', leads: 28, deals: 9, revenue: 98000 },
    { name: 'Mike Johnson', leads: 22, deals: 7, revenue: 76000 },
  ];

  const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600">Track your performance and insights</p>
        </div>
        <div className="flex gap-2">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md"
          >
            <option value="7days">Last 7 days</option>
            <option value="30days">Last 30 days</option>
            <option value="90days">Last 90 days</option>
            <option value="year">This year</option>
          </select>
          <Button>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="leads">Leads</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
          <TabsTrigger value="sources">Sources</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Leads</p>
                    <h3 className="text-2xl font-bold">150</h3>
                    <p className="text-sm text-green-600">↑ 12% vs last period</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Conversion Rate</p>
                    <h3 className="text-2xl font-bold">24.5%</h3>
                    <p className="text-sm text-green-600">↑ 3% vs last period</p>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <Target className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Deals Closed</p>
                    <h3 className="text-2xl font-bold">30</h3>
                    <p className="text-sm text-green-600">↑ 8% vs last period</p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Revenue</p>
                    <h3 className="text-2xl font-bold">$225K</h3>
                    <p className="text-sm text-green-600">↑ 15% vs last period</p>
                  </div>
                  <div className="p-3 bg-orange-100 rounded-lg">
                    <DollarSign className="h-6 w-6 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="leads" stroke="#3b82f6" strokeWidth={2} />
                    <Line type="monotone" dataKey="deals" stroke="#10b981" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Conversion Funnel</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={conversionFunnel}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="stage" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="sources">
          <Card>
            <CardHeader>
              <CardTitle>Source Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sourcePerformance.map((source) => (
                  <div key={source.source} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="font-semibold">{source.source}</div>
                      <div className="text-sm text-gray-600">{source.leads} leads</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-lg">{source.conversion}%</div>
                      <div className="text-sm text-gray-600">conversion</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="team">
          <Card>
            <CardHeader>
              <CardTitle>Team Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-4">Team Member</th>
                      <th className="text-right p-4">Leads</th>
                      <th className="text-right p-4">Deals</th>
                      <th className="text-right p-4">Revenue</th>
                      <th className="text-right p-4">Conversion</th>
                    </tr>
                  </thead>
                  <tbody>
                    {teamData.map((member) => (
                      <tr key={member.name} className="border-b">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center font-semibold text-blue-600">
                              {member.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <span className="font-semibold">{member.name}</span>
                          </div>
                        </td>
                        <td className="text-right p-4">{member.leads}</td>
                        <td className="text-right p-4">{member.deals}</td>
                        <td className="text-right p-4">${(member.revenue / 1000).toFixed(0)}K</td>
                        <td className="text-right p-4">{((member.deals / member.leads) * 100).toFixed(1)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="revenue">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="revenue" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
