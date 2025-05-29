import { useState, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  User, 
  Clock, 
  Search,
  PlusCircle
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { Appointment } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { getAppointments} from '@/services/appointmentService';
import axios from 'axios';
import { API_BASE_URL } from '@/config/api';
import { useSearchParams } from 'react-router-dom';

function to24Hour(timeStr: string) {
  // e.g., "10:00 AM" => "10:00", "2:30 PM" => "14:30"
  const [time, modifier] = timeStr.split(' ');
  let [hours, minutes] = time.split(':');
  if (modifier === 'PM' && hours !== '12') hours = String(Number(hours) + 12);
  if (modifier === 'AM' && hours === '12') hours = '00';
  return `${hours.padStart(2, '0')}:${minutes}`;
}

const isValidObjectId = (id: string) => /^[a-fA-F0-9]{24}$/.test(id);
const validTimes = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
  '15:00', '15:30', '16:00', '16:30'
];

const AppointmentsPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDoctorId, setSelectedDoctorId] = useState<string | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingTime, setBookingTime] = useState<string | null>(null);
  const [bookingType, setBookingType] = useState('regular');
  const [bookingNotes, setBookingNotes] = useState('');
  
  // Get doctorId from URL if present
  useEffect(() => {
    const doctorId = searchParams.get('doctorId');
    if (doctorId) {
      setSelectedDoctorId(doctorId);
    }
  }, [searchParams]);

  // Fetch appointments from backend
  const fetchAppointments = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await getAppointments(token || '');
      setAppointments(response.appointments || []);
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to fetch appointments',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [user]);

  // Filter appointments based on selected date and user role
  const filteredAppointments = appointments.filter(appointment => {
    const appointmentDateMatch = (() => {
      const aptDate = appointment.date;
      if (!aptDate) return false;
      const aptDateObj = new Date(aptDate);
      if (isNaN(aptDateObj.getTime()) || !date) return false;
      return aptDateObj.toLocaleDateString() === date.toLocaleDateString();
    })();
    
    if (user?.role === 'doctor') {
      return appointmentDateMatch && appointment.doctorId === user.id;
    } else if (user?.role === 'patient') {
      return appointmentDateMatch && appointment.patientId === user.id;
    } else if (user?.role === 'admin') {
      return appointmentDateMatch;
    } else if (user?.role === 'assistant') {
      return appointmentDateMatch && appointment.doctorId === 'doctor-1';
    }
    
    return appointmentDateMatch;
  });

  // Book appointment handler (no prompt)
  const bookAppointment = async () => {
    if (!user) {
      toast({
        title: 'Login Required',
        description: 'Please log in to book an appointment',
        variant: 'destructive',
      });
      return;
    }
    if (!selectedDoctorId || !bookingTime) {
      toast({
        title: 'Missing Info',
        description: 'Please select a doctor and time slot',
        variant: 'destructive',
      });
      return;
    }
    if (!isValidObjectId(selectedDoctorId)) {
      toast({
        title: 'Invalid Doctor',
        description: 'Selected doctor is invalid. Please try again.',
        variant: 'destructive',
      });
      return;
    }
    const formattedTime = to24Hour(bookingTime);
    if (!validTimes.includes(formattedTime)) {
      toast({
        title: 'Invalid Time',
        description: 'Please select a valid time slot (weekdays, 9:00-17:00, on the hour or half hour).',
        variant: 'destructive',
      });
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const formattedDate = date?.toISOString().split('T')[0];
      await axios.post(
        `${API_BASE_URL}/appointments`,
        {
          doctorId: selectedDoctorId,
          date: formattedDate,
          time: formattedTime,
          type: bookingType,
          notes: bookingNotes,
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      toast({
        title: 'Success',
        description: 'Appointment booked successfully',
      });
      setShowBookingModal(false);
      setBookingTime(null);
      setBookingType('regular');
      setBookingNotes('');
      fetchAppointments();
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err?.response?.data?.message || 'Failed to book appointment',
        variant: 'destructive',
      });
    }
  };

  // Function to render time slots with appointments
  const renderTimeSlots = () => {
    const timeSlots = [
      '8:00 AM', '8:30 AM', '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
      '12:00 PM', '12:30 PM', '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM', '3:00 PM', '3:30 PM',
      '4:00 PM', '4:30 PM', '5:00 PM'
    ];
    return timeSlots.map((time, index) => {
      const appointment = filteredAppointments.find(apt => apt.time === time);
      return (
        <div 
          key={index} 
          className={`flex items-center border-b last:border-0 py-3 ${appointment ? 'cursor-pointer hover:bg-muted/50' : ''}`}
          onClick={() => appointment && setSelectedAppointment(appointment)}
        >
          <div className="w-20 text-sm font-medium">{time}</div>
          {appointment ? (
            <div className="flex-1 ml-4">
              <div className="bg-primary/10 rounded-md p-2">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">
                      {user?.role === 'doctor' || user?.role === 'assistant' 
                        ? `Patient #${appointment.patientId?.slice(-3) || ''}` 
                        : `Dr. ${appointment.doctorId?.replace('doctor-', 'Smith') || ''}`}
                    </p>
                    <p className="text-xs text-muted-foreground">{appointment.notes}</p>
                  </div>
                  <Badge variant="outline">{appointment.status}</Badge>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 ml-4">
              <Button 
                variant="ghost"
                size="sm" 
                className="h-10 w-full justify-start border border-dashed"
                onClick={e => {
                  e.stopPropagation();
                  setBookingTime(time);
                  setShowBookingModal(true);
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Available
              </Button>
            </div>
          )}
        </div>
      );
    });
  };

  // Function to handle date change and navigation
  const handleDateChange = (newDate: Date | undefined) => {
    if (newDate) {
      setDate(newDate);
      setSelectedAppointment(null);
    }
  };

  const handlePrevDay = () => {
    if (date) {
      const prevDay = new Date(date);
      prevDay.setDate(prevDay.getDate() - 1);
      setDate(prevDay);
      setSelectedAppointment(null);
    }
  };

  const handleNextDay = () => {
    if (date) {
      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);
      setDate(nextDay);
      setSelectedAppointment(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* My Appointments List */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>My Appointments</CardTitle>
          <CardDescription>All your upcoming appointments</CardDescription>
        </CardHeader>
        <CardContent>
          {appointments.length === 0 ? (
            <div className="text-muted-foreground">No appointments found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr>
                    <th className="text-left p-2">Date</th>
                    <th className="text-left p-2">Time</th>
                    <th className="text-left p-2">With</th>
                    <th className="text-left p-2">Type</th>
                    <th className="text-left p-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments
                    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                    .map((apt) => {
                      const aapt = apt as Appointment & {
                        _id?: string;
                        patientName?: string;
                        doctorName?: string;
                        type?: string;
                        status?: string;
                      };
                      return (
                        <tr key={aapt._id || aapt.date + aapt.time}>
                          <td className="p-2">{aapt.date}</td>
                          <td className="p-2">{aapt.time}</td>
                          <td className="p-2">
                            {user?.role === 'doctor'
                              ? aapt.patientName || aapt.patientId
                              : aapt.doctorName || aapt.doctorId}
                          </td>
                          <td className="p-2">{aapt.type}</td>
                          <td className="p-2">{aapt.status}</td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
      
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Appointments</h1>
          <p className="text-muted-foreground">
            View and manage your scheduled appointments
          </p>
        </div>
        
        <Button onClick={() => {
          setSelectedDoctorId(null);
          setDate(new Date());
        }}>
          <PlusCircle className="mr-2 h-4 w-4" />
          New Appointment
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Calendar */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Calendar</CardTitle>
            <CardDescription>
              Select a date to view appointments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={date}
              onSelect={handleDateChange}
              className="rounded-md border"
            />
          </CardContent>
        </Card>
        
        {/* Daily Schedule */}
        <Card className="md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Daily Schedule</CardTitle>
              <CardDescription>
                {date ? date.toLocaleDateString(undefined, { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                }) : ''}
              </CardDescription>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={handlePrevDay}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={() => setDate(new Date())}>
                <CalendarIcon className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={handleNextDay}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search appointments..."
                  className="pl-8"
                />
              </div>
              <div className="flex justify-end">
                <Badge className="text-sm py-1 px-3">
                  {filteredAppointments.length} Appointments
                </Badge>
              </div>
            </div>
            {loading ? (
              <div className="text-center py-8">Loading appointments...</div>
            ) : (
              <div className="rounded-md border">
                <div className="overflow-y-auto max-h-96">
                  {renderTimeSlots()}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Selected Appointment Details */}
      {selectedAppointment && (
        <Card>
          <CardHeader>
            <CardTitle>Appointment Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Basic Information</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">
                        {user?.role === 'doctor' || user?.role === 'assistant' 
                          ? `Patient #${selectedAppointment.patientId?.slice(-3) || ''}` 
                          : `Dr. ${selectedAppointment.doctorId?.replace('doctor-', 'Smith') || ''}`}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {user?.role === 'doctor' || user?.role === 'assistant' 
                          ? 'Patient' 
                          : 'Doctor'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <CalendarIcon className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">{selectedAppointment.date}</p>
                      <p className="text-sm text-muted-foreground">Date</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">{selectedAppointment.time}</p>
                      <p className="text-sm text-muted-foreground">Time</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Additional Information</h3>
                <div className="space-y-4">
                  <div>
                    <p className="font-medium">Session Type</p>
                    <p className="text-sm text-muted-foreground">{selectedAppointment.notes}</p>
                  </div>
                  
                  <div>
                    <p className="font-medium">Status</p>
                    <Badge className="mt-1">
                      {selectedAppointment.status?.charAt(0).toUpperCase() + selectedAppointment.status?.slice(1) || ''}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Button variant="outline">
              Reschedule
            </Button>
            <Button variant="destructive">
              Cancel Appointment
            </Button>
          </CardFooter>
        </Card>
      )}

      {showBookingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-bold mb-4">Book Appointment</h2>
            <div className="mb-2">
              <label className="block text-sm font-medium mb-1">Doctor</label>
              <input
                className="w-full border rounded px-2 py-1"
                value={selectedDoctorId || ''}
                disabled
              />
            </div>
            <div className="mb-2">
              <label className="block text-sm font-medium mb-1">Date</label>
              <input
                className="w-full border rounded px-2 py-1"
                value={date?.toISOString().split('T')[0] || ''}
                disabled
              />
            </div>
            <div className="mb-2">
              <label className="block text-sm font-medium mb-1">Time</label>
              <input
                className="w-full border rounded px-2 py-1"
                value={bookingTime || ''}
                disabled
              />
            </div>
            <div className="mb-2">
              <label className="block text-sm font-medium mb-1">Session Type</label>
              <select
                className="w-full border rounded px-2 py-1"
                value={bookingType}
                onChange={e => setBookingType(e.target.value)}
              >
                <option value="regular">Regular</option>
                <option value="follow-up">Follow-up</option>
                <option value="emergency">Emergency</option>
                <option value="consultation">Consultation</option>
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Notes</label>
              <textarea
                className="w-full border rounded px-2 py-1"
                value={bookingNotes}
                onChange={e => setBookingNotes(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowBookingModal(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={bookAppointment}
              >
                Book
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentsPage;