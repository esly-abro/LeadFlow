import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { User, Phone, MapPin, Calendar as CalendarIcon, Clock, CheckCircle2, FileText } from 'lucide-react';
import type { Lead } from '../context/DataContext';

interface ScheduleSiteVisitDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    lead: Lead;
}

export default function ScheduleSiteVisitDialog({ open, onOpenChange, lead }: ScheduleSiteVisitDialogProps) {
    const [selectedDate, setSelectedDate] = useState<number | null>(null);
    const [visitDate, setVisitDate] = useState('');
    const [timeSlot, setTimeSlot] = useState('');
    const [agent, setAgent] = useState('');
    const [instructions, setInstructions] = useState('');

    // Generate calendar days for current month with proper alignment
    const generateCalendarDays = () => {
        const currentDate = new Date();
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();

        // Get first day of month (0 = Sunday, 1 = Monday, etc.)
        const firstDayOfMonth = new Date(year, month, 1).getDay();

        // Get number of days in month
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        const days = [];

        // Add empty cells for days before the first day of month
        for (let i = 0; i < firstDayOfMonth; i++) {
            days.push(null);
        }

        // Add actual days of the month
        for (let i = 1; i <= daysInMonth; i++) {
            days.push(i);
        }

        return days;
    };

    const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    const calendarDays = generateCalendarDays();
    const today = new Date().getDate();

    const handleConfirm = () => {
        // Handle confirmation logic here
        console.log({ visitDate, timeSlot, agent, instructions });
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-blue-900 text-center">
                        Schedule Site Visit
                    </DialogTitle>
                    <p className="text-center text-gray-600 text-sm">Coordinate property viewing with client</p>
                </DialogHeader>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                    {/* Left Column - Visit Details */}
                    <div className="space-y-6">
                        <h3 className="text-lg font-semibold text-gray-800">Visit Details</h3>

                        {/* Client Name */}
                        <div>
                            <label className="text-sm font-medium text-gray-700 mb-2 block">Client Name</label>
                            <div className="flex items-center gap-3 bg-blue-50 p-3 rounded-lg border border-blue-100">
                                <User className="h-5 w-5 text-blue-600" />
                                <span className="font-medium text-gray-900">{lead.name}</span>
                            </div>
                        </div>

                        {/* Phone Number */}
                        <div>
                            <label className="text-sm font-medium text-gray-700 mb-2 block">Phone Number</label>
                            <div className="flex items-center gap-3 bg-blue-50 p-3 rounded-lg border border-blue-100">
                                <Phone className="h-5 w-5 text-green-600" />
                                <span className="font-medium text-gray-900">{lead.phone}</span>
                            </div>
                        </div>

                        {/* Property */}
                        <div>
                            <label className="text-sm font-medium text-gray-700 mb-2 block">Property</label>
                            <div className="flex items-center gap-3 bg-blue-50 p-3 rounded-lg border border-blue-100">
                                <MapPin className="h-5 w-5 text-purple-600" />
                                <span className="font-medium text-gray-900">{lead.company}</span>
                            </div>
                        </div>

                        {/* Visit Date */}
                        <div>
                            <label className="text-sm font-medium text-gray-700 mb-2 block">Visit Date</label>
                            <div className="relative">
                                <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-blue-600" />
                                <Input
                                    type="date"
                                    value={visitDate}
                                    onChange={(e) => setVisitDate(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>

                        {/* Visit Time */}
                        <div>
                            <label className="text-sm font-medium text-gray-700 mb-2 block">Visit Time</label>
                            <Select value={timeSlot} onValueChange={setTimeSlot}>
                                <SelectTrigger className="w-full">
                                    <div className="flex items-center gap-2">
                                        <Clock className="h-4 w-4 text-blue-600" />
                                        <SelectValue placeholder="Select time slot" />
                                    </div>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="09:00">09:00 AM</SelectItem>
                                    <SelectItem value="10:00">10:00 AM</SelectItem>
                                    <SelectItem value="11:00">11:00 AM</SelectItem>
                                    <SelectItem value="12:00">12:00 PM</SelectItem>
                                    <SelectItem value="14:00">02:00 PM</SelectItem>
                                    <SelectItem value="15:00">03:00 PM</SelectItem>
                                    <SelectItem value="16:00">04:00 PM</SelectItem>
                                    <SelectItem value="17:00">05:00 PM</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Assigned Agent */}
                        <div>
                            <label className="text-sm font-medium text-gray-700 mb-2 block">Assigned Agent</label>
                            <Select value={agent} onValueChange={setAgent}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select agent" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="john">John Doe</SelectItem>
                                    <SelectItem value="jane">Jane Smith</SelectItem>
                                    <SelectItem value="mike">Mike Johnson</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Special Instructions */}
                        <div>
                            <label className="text-sm font-medium text-gray-700 mb-2 block">Special Instructions</label>
                            <Textarea
                                placeholder="Any specific requirements or notes..."
                                value={instructions}
                                onChange={(e) => setInstructions(e.target.value)}
                                rows={3}
                                className="resize-none"
                            />
                        </div>

                        {/* Confirm Button */}
                        <Button
                            onClick={handleConfirm}
                            className="w-full bg-green-600 hover:bg-green-700 text-white"
                        >
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                            Confirm Site Visit
                        </Button>
                    </div>

                    {/* Right Column - Available Slots & Info */}
                    <div className="space-y-6">
                        {/* Available Slots Calendar */}
                        <div className="bg-white border border-gray-200 rounded-lg p-4">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">Available Slots</h3>

                            {/* Week Days Header */}
                            <div className="grid grid-cols-7 gap-1 mb-2">
                                {weekDays.map((day, index) => (
                                    <div key={index} className="text-center text-sm font-semibold text-blue-600 py-2">
                                        {day}
                                    </div>
                                ))}
                            </div>

                            {/* Calendar Days */}
                            <div className="grid grid-cols-7 gap-1">
                                {calendarDays.map((day, index) => {
                                    // Empty cell for days before month starts
                                    if (day === null) {
                                        return <div key={`empty-${index}`} className="aspect-square"></div>;
                                    }

                                    const isToday = day === today;
                                    const isSelected = day === selectedDate;
                                    const isAvailable = day >= today && day <= today + 10;

                                    return (
                                        <button
                                            key={day}
                                            type="button"
                                            onClick={() => isAvailable && setSelectedDate(day)}
                                            disabled={!isAvailable}
                                            className={`
                                                aspect-square w-full flex items-center justify-center
                                                rounded-lg text-sm font-medium transition-all
                                                ${isToday ? 'bg-blue-600 text-white hover:bg-blue-700' : ''}
                                                ${isSelected && !isToday ? 'bg-green-100 text-green-700 ring-2 ring-green-500' : ''}
                                                ${!isToday && !isSelected && isAvailable ? 'hover:bg-gray-100 text-gray-700 bg-white border border-gray-200' : ''}
                                                ${!isAvailable && !isToday ? 'text-gray-300 cursor-not-allowed bg-gray-50' : ''}
                                                ${isAvailable ? 'cursor-pointer' : ''}
                                            `}
                                        >
                                            {day}
                                        </button>
                                    );
                                })}
                            </div>

                            {today && (
                                <div className="flex items-center gap-2 mt-3">
                                    <div className="w-3 h-3 bg-blue-600 rounded"></div>
                                    <span className="text-xs text-gray-600">Today</span>
                                </div>
                            )}
                        </div>

                        {/* Site Visit Information */}
                        <div className="bg-white border border-gray-200 rounded-lg p-4">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">Site Visit Information</h3>

                            <div className="space-y-3">
                                <div className="bg-blue-50 p-3 rounded-lg">
                                    <div className="text-xs font-medium text-blue-900 mb-1">Property Address</div>
                                    <div className="text-sm text-gray-800">Skyline Residency, Plot No. 45, Sector 21, Gurgaon</div>
                                </div>

                                <div className="bg-blue-50 p-3 rounded-lg">
                                    <div className="text-xs font-medium text-blue-900 mb-1">Meeting Point</div>
                                    <div className="text-sm text-gray-800">Sales Office - Ground Floor</div>
                                </div>

                                <div className="bg-blue-50 p-3 rounded-lg">
                                    <div className="text-xs font-medium text-blue-900 mb-1">Duration</div>
                                    <div className="text-sm text-gray-800">Approximately 60 minutes</div>
                                </div>

                                <div className="bg-blue-50 p-3 rounded-lg">
                                    <div className="text-xs font-medium text-blue-900 mb-1">What to Bring</div>
                                    <div className="text-sm text-gray-800">Valid ID proof for registration</div>
                                </div>
                            </div>
                        </div>

                        {/* Note */}
                        <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                            <p className="text-sm text-green-800">
                                <strong>Note:</strong> SMS and WhatsApp confirmation will be sent automatically to the client after scheduling.
                            </p>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
