import { useState } from 'react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';

export default function CalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'day' | 'week' | 'month'>('month');

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];

  const events = [
    { id: '1', title: 'Demo with Sarah Johnson', date: '2024-01-15', time: '10:00 AM', color: 'bg-blue-500' },
    { id: '2', title: 'Follow-up call', date: '2024-01-16', time: '2:00 PM', color: 'bg-green-500' },
    { id: '3', title: 'Team meeting', date: '2024-01-17', time: '9:00 AM', color: 'bg-purple-500' },
  ];

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const days = [];
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    return days;
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Calendar</h1>
          <p className="text-gray-600">Manage your meetings and events</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Event
        </Button>
      </div>

      <Card className="p-6">
        {/* Calendar Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" onClick={previousMonth}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={nextMonth}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <Button variant="outline" onClick={() => setCurrentDate(new Date())}>
              Today
            </Button>
          </div>

          <div className="flex gap-2">
            {(['day', 'week', 'month'] as const).map((v) => (
              <Button
                key={v}
                variant={view === v ? 'default' : 'outline'}
                onClick={() => setView(v)}
                className="capitalize"
              >
                {v}
              </Button>
            ))}
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-px bg-gray-200 border border-gray-200">
          {/* Day headers */}
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="bg-gray-50 p-2 text-center font-semibold text-sm text-gray-600">
              {day}
            </div>
          ))}
          
          {/* Days */}
          {getDaysInMonth(currentDate).map((day, index) => (
            <div
              key={index}
              className={`bg-white min-h-[100px] p-2 ${
                !day ? 'bg-gray-50' : ''
              } ${
                day === new Date().getDate() &&
                currentDate.getMonth() === new Date().getMonth()
                  ? 'bg-blue-50'
                  : ''
              }`}
            >
              {day && (
                <>
                  <div className="font-semibold text-sm mb-1">{day}</div>
                  {/* Event dots or mini cards could go here */}
                </>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Upcoming Events */}
      <Card className="p-6">
        <h3 className="font-semibold text-lg mb-4">Upcoming Events</h3>
        <div className="space-y-3">
          {events.map((event) => (
            <div key={event.id} className="flex items-center gap-4 p-3 border rounded-lg hover:bg-gray-50">
              <div className={`w-1 h-12 ${event.color} rounded-full`}></div>
              <div className="flex-1">
                <div className="font-semibold">{event.title}</div>
                <div className="text-sm text-gray-600">{event.date} at {event.time}</div>
              </div>
              <Button variant="outline" size="sm">View</Button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
