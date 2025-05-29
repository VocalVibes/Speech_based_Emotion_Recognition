import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic, Upload, StopCircle, Play, ArrowRight, Calendar, User, Clock, BadgeCheck, AudioWaveform as Waveform } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import AudioRecorder from '@/components/audio/AudioRecorder';
import EmotionAnalysisResults from '@/components/analysis/EmotionAnalysisResults';
import EmotionTrendsChart from '@/components/charts/EmotionTrendsChart';
import ModelStatusCard from '@/components/analysis/ModelStatusCard';
import { analyzeAudio, getEmotionHistory, EmotionAnalysis, getStrengthsAndWeaknesses } from '@/services/emotionService';
import { Appointment, EmotionRecord } from '@/types';
import { getAppointments } from '@/services/appointmentService';
import EmotionAnalysisPanel from '@/components/EmotionAnalysisPanel';
import axios from 'axios';

const DoctorDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [patientName, setPatientName] = useState('');
  const [patientId, setPatientId] = useState('');
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<EmotionAnalysis | null>(null);
  const [emotionHistory, setEmotionHistory] = useState<EmotionAnalysis[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedAudioUrl, setUploadedAudioUrl] = useState<string | null>(null);
  const [strengths, setStrengths] = useState<string[]>([]);
  const [weaknesses, setWeaknesses] = useState<string[]>([]);
  
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);
  const [patientEmotions] = useState<EmotionRecord[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState('');

  useEffect(() => {
    if (user) {
      fetchEmotionHistory();
      fetchAppointments();
    }
  }, [user]);

  const fetchEmotionHistory = async () => {
    try {
      const history = await getEmotionHistory();
      setEmotionHistory(history);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch emotion history',
        variant: 'destructive',
      });
    }
  };

  const fetchStrengthsWeaknesses = async () => {
    try {
      const data = await getStrengthsAndWeaknesses();
      setStrengths(data.strengths);
      setWeaknesses(data.weaknesses);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch strengths and weaknesses',
        variant: 'destructive',
      });
    }
  };

  const fetchAppointments = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const data = await getAppointments(token);
      setUpcomingAppointments(data.appointments || []);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch appointments',
        variant: 'destructive',
      });
    }
  };

  const handleRecordingComplete = (audioBlob: Blob) => {
    if (!patientName) {
      toast({
        title: 'Patient information required',
        description: 'Please enter patient name before recording',
        variant: 'destructive',
      });
      return;
    }
    // Use the correct extension and MIME type for the recorded audio
    const file = new File([audioBlob], 'recording.webm', { type: 'audio/webm' });
    setAudioFile(file);
    setUploadedAudioUrl(URL.createObjectURL(audioBlob));
    toast({
      title: 'Recording completed',
      description: 'Ready to analyze the audio',
    });
  };

  const handleFileUpload = (file: File) => {
    if (!patientName) {
      toast({
        title: 'Patient information required',
        description: 'Please enter patient name before uploading audio',
        variant: 'destructive',
      });
      return;
    }

    setAudioFile(file);
    setUploadedAudioUrl(URL.createObjectURL(file));
    
    toast({
      title: 'File uploaded',
      description: `${file.name} is ready for analysis`,
    });
  };

  const handleAnalyzeAudio = async () => {
    if (!audioFile) {
      toast({
        title: 'No audio to analyze',
        description: 'Please record or upload audio first',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      const results = await analyzeAudio(audioFile);
      setAnalysisResults(results);
      setAnalysisComplete(true);
      await fetchEmotionHistory();
      await fetchStrengthsWeaknesses();
      toast({
        title: 'Analysis complete',
        description: 'Speech emotion analysis results are ready',
      });
    } catch (error) {
      console.error('Analysis error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to analyze the audio';
      toast({
        title: 'Analysis failed',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetAnalysis = () => {
    setAudioFile(null);
    setUploadedAudioUrl(null);
    setAnalysisComplete(false);
    setAnalysisResults(null);
    setPatientName('');
    setPatientId('');
  };

  // Helper to get patient display name
  const getPatientDisplayName = (patientId: any) => {
    if (!patientId) return 'N/A';
    if (typeof patientId === 'object') {
      return patientId.username || patientId.name || patientId.email || patientId._id?.slice(-3) || 'N/A';
    }
    if (typeof patientId === 'string') {
      return `ID: ...${patientId.slice(-3)}`;
    }
    return 'N/A';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Doctor Dashboard</h1>
          <p className="text-muted-foreground">
            Analyze patient speech, track emotions, and manage appointments
          </p>
        </div>
      </div>
      
      <Tabs defaultValue="analysis" className="space-y-6">
        <TabsList>
          <TabsTrigger value="analysis">Speech Analysis</TabsTrigger>
          <TabsTrigger value="appointments">Appointments</TabsTrigger>
        </TabsList>
        
        <TabsContent value="analysis">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left column: Audio input */}
            <div className="md:col-span-2 space-y-6">
              {/* Patient Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Patient Information</CardTitle>
                  <CardDescription>
                    Enter patient details for this analysis session
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="patientName" className="text-sm font-medium mb-2 block">
                          Patient Name
                        </label>
                        <input
                          id="patientName"
                          type="text"
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          placeholder="Enter patient name"
                          value={patientName}
                          onChange={(e) => setPatientName(e.target.value)}
                        />
                      </div>
                      <div>
                        <label htmlFor="patientId" className="text-sm font-medium mb-2 block">
                          Patient ID (optional)
                        </label>
                        <input
                          id="patientId"
                          type="text"
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          placeholder="Enter patient ID"
                          value={patientId}
                          onChange={(e) => setPatientId(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Audio Recorder */}
              <Card>
                <CardHeader>
                  <CardTitle>Audio Input</CardTitle>
                  <CardDescription>
                    Record patient's speech or upload an audio file
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <AudioRecorder 
                      onRecordingComplete={handleRecordingComplete} 
                      onFileUpload={handleFileUpload} 
                    />
                    {uploadedAudioUrl && (
                      <div className="mt-4">
                        <div className="text-sm font-medium mb-2">Preview Audio:</div>
                        <div className="bg-secondary/30 rounded-md p-4 flex items-center justify-between">
                          <div className="flex items-center">
                            <Waveform className="h-5 w-5 mr-2 text-primary" />
                            <span className="text-sm">
                              {audioFile?.name || 'Recorded audio'}
                            </span>
                          </div>
                          <audio
                            controls
                            src={uploadedAudioUrl}
                            className="max-w-[200px]"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter>
                  <div className="flex flex-col sm:flex-row gap-3 w-full">
                    <Button 
                      onClick={handleAnalyzeAudio} 
                      disabled={!audioFile || analysisComplete || isLoading}
                      className="w-full sm:w-auto"
                    >
                      {isLoading ? (
                        <>
                          <Play className="mr-2 h-4 w-4 animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <Play className="mr-2 h-4 w-4" />
                          Analyze Speech
                        </>
                      )}
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      onClick={resetAnalysis}
                      className="w-full sm:w-auto"
                    >
                      Reset
                    </Button>
                  </div>
                </CardFooter>
              </Card>
              
              {/* Analysis Results */}
              {analysisComplete && analysisResults && (
                <>
                  <EmotionAnalysisResults 
                    patientName={patientName}
                    analysis={analysisResults}
                  />
                  {/* Strengths & Weaknesses Card */}
                  <Card className="mt-4">
                    <CardHeader>
                      <CardTitle>Patient Strengths & Weaknesses</CardTitle>
                      <CardDescription>
                        Based on recent speech emotion analysis
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-col md:flex-row gap-6">
                        <div className="flex-1">
                          <h4 className="font-semibold mb-2">Strengths</h4>
                          <ul>
                            {strengths.length > 0 ? strengths.map((s, i) => <li key={i}>{s}</li>) : <li>No strong points detected yet.</li>}
                          </ul>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold mb-2">Weaknesses</h4>
                          <ul>
                            {weaknesses.length > 0 ? weaknesses.map((w, i) => <li key={i}>{w}</li>) : <li>No weak points detected yet.</li>}
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
            </div>
            
            {/* Right column: Status and quick actions */}
            <div className="space-y-6">
              {/* Model Status */}
              <ModelStatusCard />
              
              {/* Today's Appointments */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Today's Appointments</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {upcomingAppointments.slice(0, 2).map((appointment, index) => (
                    <div key={index} className="flex items-start gap-3 pb-3 border-b last:border-0 last:pb-0">
                      <div className="bg-primary/10 p-2 rounded-full">
                        <User className="h-4 w-4 text-primary" />
                      </div>
                      <div className="space-y-1">
                        <p className="font-medium text-sm">
                          Patient: {getPatientDisplayName(appointment.patientId)}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>{appointment.time}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
                <CardFooter>
                  <Button 
                    variant="outline" 
                    className="w-full" 
                    size="sm"
                    onClick={() => navigate('/appointments')}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    View All Appointments
                  </Button>
                </CardFooter>
              </Card>
              
              {/* Quick Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Quick Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="bg-blue-100 dark:bg-blue-900/20 p-3 rounded-full">
                      <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Patients</p>
                      <p className="text-2xl font-bold">24</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="bg-green-100 dark:bg-green-900/20 p-3 rounded-full">
                      <BadgeCheck className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Sessions Completed</p>
                      <p className="text-2xl font-bold">128</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="appointments">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Appointments</CardTitle>
              <CardDescription>
                View and manage your scheduled sessions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingAppointments.map((appointment, index) => (
                  <div key={index} className="flex justify-between items-center border-b pb-4 last:border-0">
                    <div className="flex items-center gap-4">
                      <div className="bg-primary/10 p-3 rounded-full">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">Patient: {getPatientDisplayName(appointment.patientId)}</p>
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
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button
                onClick={() => navigate('/appointments')}
                className="w-full"
              >
                <Calendar className="mr-2 h-4 w-4" />
                Schedule Appointment
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
      <EmotionAnalysisPanel />
    </div>
  );
};

export default DoctorDashboard;