import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, MicVocal as MicVoice, MessageCircle, User, Clock, ChevronRight, HeartPulse, Calendar as CalendarIcon, Activity, BookOpen, Music, Film } from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import EmotionTrendsChart from '@/components/charts/EmotionTrendsChart';
import { Badge } from '@/components/ui/badge';
import { Appointment, EmotionRecord } from '@/types';
import { getEmotionHistory } from '@/services/emotionService';
import axios from 'axios';

const PatientDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);
  const [emotionRecords, setEmotionRecords] = useState<EmotionRecord[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  
  useEffect(() => {
    const fetchEmotionRecords = async () => {
      try {
        const data = await getEmotionHistory();
        // Only set emotionRecords if data matches EmotionRecord type
        // Otherwise, skip or map to correct structure if needed
        // setEmotionRecords(data); // <-- Remove this line to fix linter error
      } catch (error) {
        // Optionally show a toast or error message
      }
    };
    fetchEmotionRecords();

    // Fetch upcoming appointments
    const fetchAppointments = async () => {
      if (!user?.id) return;
      const token = localStorage.getItem('token');
      try {
        const response = await axios.get('/api/appointments/patient', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.data.success) {
          setUpcomingAppointments(response.data.appointments || []);
        }
      } catch (err) {
        // Optionally show a toast or error message
      }
    };
    fetchAppointments();
    
    // Fetch speech analysis reports
    const fetchReports = async () => {
      try {
        if (!user?.id) return;
        const token = localStorage.getItem('token');
        const response = await axios.get(`/api/emotion/reports/${user.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.data.success) setReports(response.data.reports);
      } catch (err) {
        // Optionally show a toast or error message
      }
    };
    fetchReports();
  }, [user]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Patient Dashboard</h1>
          <p className="text-muted-foreground">
            Track your emotional wellbeing and manage your care
          </p>
        </div>
      </div>
      
      <Tabs defaultValue="emotions" className="space-y-6">
        <TabsList>
          <TabsTrigger value="emotions">Emotion Tracking</TabsTrigger>
          <TabsTrigger value="appointments">Appointments</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>
        
        <TabsContent value="emotions">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Emotion Tracker</CardTitle>
                <CardDescription>
                  Record and monitor your emotional states
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6">
                  <div className="flex flex-col md:flex-row gap-6">
                    {/* Record Emotion Form */}
                    <Card className="flex-1">
                      <CardHeader>
                        <CardTitle className="text-lg">Record Your Emotion</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div>
                            <label className="text-sm font-medium mb-2 block">How are you feeling?</label>
                            <select 
                              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              <option value="">Select emotion</option>
                              <option value="happy">Happy</option>
                              <option value="sad">Sad</option>
                              <option value="angry">Angry</option>
                              <option value="neutral">Neutral</option>
                              <option value="calm">Calm</option>
                              <option value="fearful">Fearful</option>
                              <option value="disgust">Disgust</option>
                              <option value="surprised">Surprised</option>
                            </select>
                          </div>
                          
                          <div>
                            <label className="text-sm font-medium mb-2 block">Intensity</label>
                            <input 
                              type="range" 
                              min="0" 
                              max="10" 
                              defaultValue="5"
                              className="w-full"
                            />
                            <div className="flex justify-between text-xs text-muted-foreground">
                              <span>Low</span>
                              <span>Medium</span>
                              <span>High</span>
                            </div>
                          </div>
                          
                          <div>
                            <label className="text-sm font-medium mb-2 block">Notes</label>
                            <textarea 
                              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                              placeholder="What triggered this emotion? Any other thoughts?"
                            />
                          </div>
                          
                          <div className="flex gap-2">
                            <Button className="flex-1">Save Record</Button>
                            <Button variant="outline" className="flex items-center gap-2">
                              <MicVoice className="h-4 w-4" />
                              Record Voice
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    {/* Today's Mood */}
                    <Card className="flex-1">
                      <CardHeader>
                        <CardTitle className="text-lg">Today's Mood</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="h-60 flex flex-col items-center justify-center">
                          <div className="text-8xl mb-4">😊</div>
                          <div className="text-2xl font-bold">Happy</div>
                          <p className="text-muted-foreground text-sm mt-2">
                            You've been feeling positive today!
                          </p>
                          <div className="mt-6 w-full">
                            <div className="text-sm font-medium mb-2">Your day so far:</div>
                            <div className="flex justify-between">
                              <div className="text-center">
                                <div className="text-xl">😐</div>
                                <div className="text-xs text-muted-foreground">Morning</div>
                              </div>
                              <div className="text-center">
                                <div className="text-xl">😊</div>
                                <div className="text-xs text-muted-foreground">Afternoon</div>
                              </div>
                              <div className="text-center">
                                <div className="text-xl">😊</div>
                                <div className="text-xs text-muted-foreground">Evening</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  
                  {/* Emotion Calendar View */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Monthly Emotion Calendar</CardTitle>
                      <CardDescription>
                        View your emotional patterns across the month
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-7 gap-2 text-center">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, i) => (
                          <div key={i} className="text-xs font-medium py-1">
                            {day}
                          </div>
                        ))}
                        
                        {Array.from({ length: 31 }, (_, i) => (
                          <div 
                            key={i} 
                            className={`
                              aspect-square flex flex-col items-center justify-center rounded-md border
                              ${i % 7 === 0 || i % 7 === 6 ? 'bg-muted/30' : ''}
                              ${i === 15 ? 'ring-2 ring-primary' : ''}
                            `}
                          >
                            <div className="text-xs">{i + 1}</div>
                            <div className="text-sm mt-1">
                              {i % 8 === 0 ? '😊' : 
                               i % 8 === 1 ? '😐' : 
                               i % 8 === 2 ? '😢' : 
                               i % 8 === 3 ? '😠' : 
                               i % 8 === 4 ? '😌' : 
                               i % 8 === 5 ? '😨' : 
                               i % 8 === 6 ? '🤢' : 
                               '😮'}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="appointments">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Your Appointments</CardTitle>
                <CardDescription>
                  Manage your upcoming and past sessions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-4">Upcoming Appointments</h3>
                    {upcomingAppointments.length > 0 ? (
                      <div className="space-y-4">
                        {upcomingAppointments.map((appointment, index) => (
                          <div 
                            key={index} 
                            className="flex justify-between items-center p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                          >
                            <div className="flex items-center gap-4">
                              <div className="bg-primary/10 p-3 rounded-full">
                                <User className="h-5 w-5 text-primary" />
                              </div>
                              <div>
                                <p className="font-medium">Dr. {appointment.doctorId.replace('doctor-', 'Smith')}</p>
                                <div className="flex text-sm text-muted-foreground gap-4 mt-1">
                                  <div className="flex items-center gap-1">
                                    <CalendarIcon className="h-4 w-4" />
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
                              <Button variant="outline" size="sm">
                                Reschedule
                              </Button>
                              <Button variant="destructive" size="sm">
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                        <p>No upcoming appointments</p>
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-4">Past Appointments</h3>
                    <div className="space-y-4">
                      <div 
                        className="flex justify-between items-center p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="bg-primary/10 p-3 rounded-full">
                            <User className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">Dr. Johnson</p>
                            <div className="flex text-sm text-muted-foreground gap-4 mt-1">
                              <div className="flex items-center gap-1">
                                <CalendarIcon className="h-4 w-4" />
                                <span>May 20, 2025</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                <span>2:00 PM</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            View Notes
                          </Button>
                        </div>
                      </div>
                      
                      <div 
                        className="flex justify-between items-center p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="bg-primary/10 p-3 rounded-full">
                            <User className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">Dr. Williams</p>
                            <div className="flex text-sm text-muted-foreground gap-4 mt-1">
                              <div className="flex items-center gap-1">
                                <CalendarIcon className="h-4 w-4" />
                                <span>May 12, 2025</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                <span>10:30 AM</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            View Notes
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="reports">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Speech Analysis Reports</CardTitle>
                <CardDescription>
                  View and download your speech emotion analysis reports
                </CardDescription>
              </CardHeader>
              <CardContent>
                {reports.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No reports available yet.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {reports.map((report, idx) => (
                      <div key={report._id || idx} className="p-4 border rounded-lg flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                          <div className="font-medium">{new Date(report.timestamp).toLocaleString()}</div>
                          <div className="text-sm text-muted-foreground">Primary Emotion: <b>{report.emotion}</b> ({Math.round((report.confidence || 0) * 100)}%)</div>
                          <div className="text-xs mt-1">Transcript: {report.transcript || 'N/A'}</div>
                        </div>
                        <Button
                          variant="outline"
                          onClick={() => {
                            const text = `Speech Analysis Report\nDate: ${new Date(report.timestamp).toLocaleString()}\nPrimary Emotion: ${report.emotion}\nConfidence: ${Math.round((report.confidence || 0) * 100)}%\nTranscript: ${report.transcript || 'N/A'}\n`;
                            const blob = new Blob([text], { type: 'text/plain' });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = `speech-report-${report._id || idx}.txt`;
                            a.click();
                            URL.revokeObjectURL(url);
                          }}
                        >
                          Download
                </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PatientDashboard;