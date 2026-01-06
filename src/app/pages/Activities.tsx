import { useData } from '../context/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Plus, Phone, Mail, FileText, Calendar as CalendarIcon, MessageSquare } from 'lucide-react';

export default function Activities() {
  const { activities, leads } = useData();

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'call': return Phone;
      case 'email': return Mail;
      case 'note': return FileText;
      case 'meeting': return CalendarIcon;
      case 'whatsapp': return MessageSquare;
      default: return FileText;
    }
  };

  const tasks = [
    { id: '1', title: 'Follow up with Sarah Johnson', dueDate: 'Today', priority: 'high' },
    { id: '2', title: 'Send proposal to Michael Chen', dueDate: 'Tomorrow', priority: 'medium' },
    { id: '3', title: 'Schedule demo for Emma Williams', dueDate: 'Next week', priority: 'low' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Activities</h1>
          <p className="text-gray-600">Track all your interactions and tasks</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Activity
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity Feed */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Activity Feed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {activities.map((activity) => {
                  const Icon = getActivityIcon(activity.type);
                  const lead = leads.find(l => l.id === activity.leadId);
                  
                  return (
                    <div key={activity.id} className="flex gap-4 items-start">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Icon className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge>{activity.type.toUpperCase()}</Badge>
                          <span className="font-semibold">{lead?.name}</span>
                        </div>
                        <p className="text-gray-700">{activity.description}</p>
                        <div className="text-sm text-gray-500 mt-1">
                          {activity.user} • {new Date(activity.timestamp).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tasks & Reminders */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Tasks & Reminders</CardTitle>
              <Button size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-red-600 mb-2">Overdue</h3>
                  <div className="text-sm text-gray-500">No overdue tasks</div>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">Today's Tasks</h3>
                  {tasks.filter(t => t.dueDate === 'Today').map(task => (
                    <div key={task.id} className="p-3 border rounded-lg mb-2">
                      <div className="flex items-center gap-2 mb-1">
                        <input type="checkbox" className="rounded" />
                        <span className="font-medium text-sm">{task.title}</span>
                      </div>
                      <Badge variant="outline" className="text-xs">{task.priority}</Badge>
                    </div>
                  ))}
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">Upcoming</h3>
                  {tasks.filter(t => t.dueDate !== 'Today').map(task => (
                    <div key={task.id} className="p-3 border rounded-lg mb-2">
                      <div className="flex items-center gap-2 mb-1">
                        <input type="checkbox" className="rounded" />
                        <span className="font-medium text-sm">{task.title}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span>{task.dueDate}</span>
                        <Badge variant="outline" className="text-xs">{task.priority}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
