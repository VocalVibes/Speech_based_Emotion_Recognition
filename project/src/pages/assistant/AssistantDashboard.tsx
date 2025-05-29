import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  Clock, 
  CheckCircle2, 
  User, 
  Mail, 
  Phone, 
  File, 
  MessageCircle,
  Filter,
  ChevronsUpDown,
  Search,
  PlusCircle
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Appointment } from '@/types';
import { getAppointments } from '@/services/appointmentService';

const AssistantDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const data = await getAppointments(token);
        setAppointments(data.appointments || []);
      } catch (error) {
        // Optionally show a toast or error message
      }
    };
    fetchAppointments();
  }, []);

  // Mock tasks data
  const [tasks, setTasks] = useState([
    {
      id: '1',
      title: 'Send appointment reminder emails',
      status: 'pending',
      due: 'Today',
      priority: 'high'
    },
    {
      id: '2',
      title: 'Update patient records',
      status: 'pending',
      due: 'Today',
      priority: 'medium'
    },
    {
      id: '3',
      title: 'Organize meeting notes',
      status: 'completed',
      due: 'Yesterday',
      priority: 'medium'
    },
    {
      id: '4',
      title: 'Prepare weekly report',
      status: 'pending',
      due: 'Tomorrow',
      priority: 'high'
    }
  ]);
  
  // Mock patient messages
  const [messages, setMessages] = useState([
    {
      id: '1',
      patient: 'John Doe',
      patientId: 'patient-1',
      message: 'I need to reschedule my appointment for next week.',
      time: '30 minutes ago',
      read: false
    },
    {
      id: '2',
      patient: 'Alice Johnson',
      patientId: 'patient-3',
      message: 'Do I need to prepare anything for my session today?',
      time: '2 hours ago',
      read: true
    },
    {
      id: '3',
      patient: 'Emma Wilson',
      patientId: 'patient-5',
      message: 'Could you please send me the forms I need to fill out?',
      time: 'Yesterday',
      read: true
    }
  ]);

  const markTaskComplete = (taskId: string) => {
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, status: 'completed' } : task
    ));
    
    toast({
      title: 'Task marked as complete',
      description: 'The task has been updated successfully.',
    });
  };

  const markMessageAsRead = (messageId: string) => {
    setMessages(messages.map(message => 
      message.id === messageId ? { ...message, read: true } : message
    ));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Assistant Dashboard</h1>
          <p className="text-muted-foreground">
            Manage schedules, appointments, and communications
          </p>
        </div>
      </div>
      
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col items-center space-y-2">
              <Calendar className="h-8 w-8 text-blue-500" />
              <div className="text-xl font-bold">{
                appointments.filter(apt => apt.date === new Date().toLocaleDateString()).length
              }</div>
              <p className="text-xs text-muted-foreground">Today's Appointments</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col items-center space-y-2">
              <CheckCircle2 className="h-8 w-8 text-green-500" />
              <div className="text-xl font-bold">{
                tasks.filter(task => task.status === 'pending').length
              }</div>
              <p className="text-xs text-muted-foreground">Pending Tasks</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col items-center space-y-2">
              <MessageCircle className="h-8 w-8 text-red-500" />
              <div className="text-xl font-bold">{
                messages.filter(msg => !msg.read).length
              }</div>
              <p className="text-xs text-muted-foreground">Unread Messages</p>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Main Dashboard Tabs */}
      <Tabs defaultValue="schedule" className="space-y-6">
        <TabsList>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="messages">Messages</TabsTrigger>
          <TabsTrigger value="doctor">Doctor Profile</TabsTrigger>
        </TabsList>
        
        <TabsContent value="schedule">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Appointment Schedule</CardTitle>
                <CardDescription>
                  Manage and organize doctor appointments
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center mb-6">
                  <div className="relative w-full max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search appointments..."
                      className="pl-8"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Filter className="h-4 w-4 mr-2" />
                      Filter
                    </Button>
                    <Button size="sm">
                      <PlusCircle className="h-4 w-4 mr-2" />
                      New Appointment
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-3 flex items-center">
                      Today's Schedule
                      <Badge className="ml-2">
                        {appointments.filter(apt => apt.date === new Date().toLocaleDateString()).length} Appointments
                      </Badge>
                    </h3>
                    {appointments
                      .filter(apt => apt.date === new Date().toLocaleDateString())
                      .sort((a, b) => a.time.localeCompare(b.time))
                      .map((appointment, index) => (
                        <div 
                          key={index} 
                          className="flex justify-between items-center p-4 rounded-lg border mb-3 last:mb-0 hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-center gap-4">
                            <div className="bg-primary/10 p-3 rounded-full">
                              <Clock className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium">Patient #{appointment.patientId.slice(-3)}</p>
                              <div className="flex text-sm text-muted-foreground gap-4 mt-1">
                                <div className="flex items-center gap-1">
                                  <Clock className="h-4 w-4" />
                                  <span>{appointment.time}</span>
                                </div>
                                <div>
                                  <Badge variant="outline">
                                    {appointment.notes}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">View</Button>
                            <Button variant="outline" size="sm">Reschedule</Button>
                          </div>
                        </div>
                    ))}
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-3 flex items-center">
                      Upcoming Schedule
                      <Badge className="ml-2">
                        {appointments.filter(apt => apt.date !== new Date().toLocaleDateString()).length} Appointments
                      </Badge>
                    </h3>
                    {appointments
                      .filter(apt => apt.date !== new Date().toLocaleDateString())
                      .map((appointment, index) => (
                        <div 
                          key={index} 
                          className="flex justify-between items-center p-4 rounded-lg border mb-3 last:mb-0 hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-center gap-4">
                            <div className="bg-primary/10 p-3 rounded-full">
                              <Calendar className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium">Patient #{appointment.patientId.slice(-3)}</p>
                              <div className="flex text-sm text-muted-foreground gap-4 mt-1">
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-4 w-4" />
                                  <span>{appointment.date}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Clock className="h-4 w-4" />
                                  <span>{appointment.time}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">View</Button>
                            <Button variant="outline" size="sm">Reschedule</Button>
                          </div>
                        </div>
                    ))}
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full"
                  onClick={() => navigate('/appointments')}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  View Full Calendar
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="tasks">
          <Card>
            <CardHeader>
              <CardTitle>Task Management</CardTitle>
              <CardDescription>
                Keep track of your daily tasks and responsibilities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center mb-6">
                <div className="relative w-full max-w-sm">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search tasks..."
                    className="pl-8"
                  />
                </div>
                <Button>
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Add Task
                </Button>
              </div>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-4">Pending Tasks</h3>
                  {tasks
                    .filter(task => task.status === 'pending')
                    .map((task) => (
                      <div 
                        key={task.id} 
                        className="flex justify-between items-center p-4 rounded-lg border mb-3 last:mb-0 hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div 
                            className={`w-5 h-5 rounded-full border-2 ${
                              task.priority === 'high' ? 'border-red-500' : 
                              task.priority === 'medium' ? 'border-yellow-500' : 'border-green-500'
                            }`}
                          />
                          <div>
                            <p className="font-medium">{task.title}</p>
                            <div className="flex text-sm text-muted-foreground gap-4 mt-1">
                              <span>Due: {task.due}</span>
                              <Badge variant="outline" className={
                                task.priority === 'high' ? 'text-red-500 border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800' :
                                task.priority === 'medium' ? 'text-yellow-500 border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-800' :
                                'text-green-500 border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800'
                              }>
                                {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => markTaskComplete(task.id)}
                          >
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                            Complete
                          </Button>
                          <Button variant="outline" size="sm">Edit</Button>
                        </div>
                      </div>
                    ))
                  }
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-4">Completed Tasks</h3>
                  {tasks
                    .filter(task => task.status === 'completed')
                    .map((task) => (
                      <div 
                        key={task.id} 
                        className="flex justify-between items-center p-4 rounded-lg border mb-3 last:mb-0 hover:bg-muted/50 transition-colors opacity-60"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-5 h-5 rounded-full bg-green-500 text-white flex items-center justify-center">
                            <CheckCircle2 className="h-3 w-3" />
                          </div>
                          <div>
                            <p className="font-medium line-through">{task.title}</p>
                            <div className="flex text-sm text-muted-foreground gap-4 mt-1">
                              <span>Due: {task.due}</span>
                              <Badge variant="outline">Completed</Badge>
                            </div>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm">
                          Delete
                        </Button>
                      </div>
                    ))
                  }
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="messages">
          <Card>
            <CardHeader>
              <CardTitle>Patient Messages</CardTitle>
              <CardDescription>
                Manage communications with patients
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-4">Inbox</h3>
                  {messages.length > 0 ? (
                    <div className="space-y-3">
                      {messages.map((message) => (
                        <div 
                          key={message.id} 
                          className={`flex justify-between items-start p-4 rounded-lg border hover:bg-muted/50 transition-colors ${!message.read ? 'bg-primary/5 border-primary/20' : ''}`}
                          onClick={() => markMessageAsRead(message.id)}
                        >
                          <div className="flex items-start gap-4">
                            <div className="bg-primary/10 p-3 rounded-full">
                              <User className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-medium">{message.patient}</p>
                                {!message.read && (
                                  <Badge className="ml-2 bg-primary/20 text-primary">New</Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground mt-1">{message.message}</p>
                              <p className="text-xs text-muted-foreground mt-2">{message.time}</p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">Reply</Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <MessageCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                      <p>No messages in your inbox</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full">
                <MessageCircle className="mr-2 h-4 w-4" />
                Compose New Message
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="doctor">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Doctor Profile</CardTitle>
                  <CardDescription>
                    Doctor information and contact details
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-col items-center">
                    <div className="w-24 h-24 rounded-full bg-primary/10 overflow-hidden mb-4">
                      <img 
                        src="https://images.pexels.com/photos/5214956/pexels-photo-5214956.jpeg" 
                        alt="Doctor profile" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <h3 className="text-xl font-semibold">Dr. Jane Smith</h3>
                    <p className="text-sm text-muted-foreground">Clinical Psychologist</p>
                  </div>
                  
                  <div className="space-y-3 pt-4">
                    <div className="flex items-center gap-3">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">jane.smith@example.com</span>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">(555) 123-4567</span>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">10+ Years Experience</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full">
                    Edit Profile
                  </Button>
                </CardFooter>
              </Card>
            </div>
            
            <div className="md:col-span-2">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle>Weekly Schedule</CardTitle>
                  <CardDescription>
                    Overview of the doctor's weekly appointments
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-5 gap-4 text-center mb-3">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((day, i) => (
                      <div key={i} className="font-medium">
                        {day}
                      </div>
                    ))}
                  </div>
                  
                  <div className="grid grid-cols-5 gap-4">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((day, i) => (
                      <div key={i} className="min-h-32 border rounded-md p-2 space-y-2">
                        {i === 0 && (
                          <>
                            <div className="text-xs p-1 rounded bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300">
                              9:00 AM - Patient #123
                            </div>
                            <div className="text-xs p-1 rounded bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300">
                              10:30 AM - Patient #456
                            </div>
                            <div className="text-xs p-1 rounded bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300">
                              1:00 PM - Patient #789
                            </div>
                          </>
                        )}
                        {i === 1 && (
                          <>
                            <div className="text-xs p-1 rounded bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300">
                              11:00 AM - Patient #234
                            </div>
                            <div className="text-xs p-1 rounded bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300">
                              2:30 PM - Patient #567
                            </div>
                          </>
                        )}
                        {i === 2 && (
                          <>
                            <div className="text-xs p-1 rounded bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300">
                              9:30 AM - Team Meeting
                            </div>
                            <div className="text-xs p-1 rounded bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300">
                              1:00 PM - Patient #345
                            </div>
                            <div className="text-xs p-1 rounded bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300">
                              3:30 PM - Patient #678
                            </div>
                          </>
                        )}
                        {i === 3 && (
                          <>
                            <div className="text-xs p-1 rounded bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300">
                              10:00 AM - Patient #890
                            </div>
                            <div className="text-xs p-1 rounded bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300">
                              2:00 PM - Patient #123
                            </div>
                          </>
                        )}
                        {i === 4 && (
                          <>
                            <div className="text-xs p-1 rounded bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300">
                              9:00 AM - Patient #456
                            </div>
                            <div className="text-xs p-1 rounded bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300">
                              12:00 PM - Day Off
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full"
                    onClick={() => navigate('/appointments')}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    View Calendar
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AssistantDashboard;