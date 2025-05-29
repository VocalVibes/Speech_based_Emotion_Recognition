import { useState, useEffect } from 'react';
import { 
  User as UserIcon, 
  Mail, 
  Phone, 
  MapPin, 
  Award, 
  School, 
  Settings, 
  Save,
  Database,
  Server,
  CheckCircle,
  XCircle,
  Loader2
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { ModelStatus, DatabaseSettings } from '@/types';
import { useNavigate } from 'react-router-dom';
import { getProfile } from '@/services/authService';

const ProfilePage = () => {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(user);
  
  // State for database settings
  const [dbSettings, setDbSettings] = useState<DatabaseSettings>({
    mongoUri: 'mongodb://localhost:27017/emotisense',
    isConnected: false
  });
  
  // State for model status
  const [modelStatus, setModelStatus] = useState<ModelStatus>({
    status: 'checking',
    description: 'Checking model status...'
  });
  
  // Form state
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: profile?.name || '',
    email: profile?.email || '',
    phone: profile?.phone || '',
    address: '',
    bio: ''
  });

  // Simulate checking model status on component mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const data = await getProfile(token);
        setProfile(data.user);
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to fetch profile',
          variant: 'destructive',
      });
      }
    };
    fetchProfile();
  }, []);
  
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      toast({
        title: 'Profile Updated',
        description: 'Your profile information has been updated successfully.',
      });
    }, 1000);
  };
  
  const handleDatabaseConnect = () => {
    setLoading(true);
    
    // Simulate database connection
    setTimeout(() => {
      setDbSettings({
        ...dbSettings,
        isConnected: true
      });
      
      setLoading(false);
      toast({
        title: 'Database Connected',
        description: 'Successfully connected to MongoDB.',
      });
    }, 1500);
  };
  
  const getDoctorContent = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Doctor Profile Card */}
      <Card className="md:col-span-1">
        <CardHeader className="flex flex-row items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={profile?.avatar} alt={profile?.name || 'User'} />
            <AvatarFallback>{profile?.name?.charAt(0) || 'U'}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle>{profile?.name}</CardTitle>
            <CardDescription>{profile?.role}</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{profile?.email}</span>
          </div>
          
          <div className="flex items-center gap-3">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{formData.phone || 'Not provided'}</span>
          </div>
          
          <div className="flex items-center gap-3">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{formData.address || 'Not provided'}</span>
          </div>
          
          <div className="border-t pt-4">
            <p className="text-sm font-medium mb-2">Specialties</p>
            <div className="flex flex-wrap gap-2">
              {(profile?.specialties || []).map((specialty, i) => (
                <Badge key={i} variant="secondary">{specialty}</Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Doctor Tabs */}
      <div className="md:col-span-2 space-y-6">
        <Tabs defaultValue="education">
          <TabsList className="mb-4">
            <TabsTrigger value="education">Education & Certifications</TabsTrigger>
            <TabsTrigger value="stats">Practice Statistics</TabsTrigger>
            <TabsTrigger value="settings">Account Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="education">
            <Card>
              <CardHeader>
                <CardTitle>Education & Certifications</CardTitle>
                <CardDescription>
                  Your academic and professional qualifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-3">Education</h3>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="bg-primary/10 p-2 rounded-full mt-1">
                        <School className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">Ph.D. in Clinical Psychology</p>
                        <p className="text-sm text-muted-foreground">Stanford University</p>
                        <p className="text-sm text-muted-foreground">2010 - 2015</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="bg-primary/10 p-2 rounded-full mt-1">
                        <School className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">M.S. in Psychology</p>
                        <p className="text-sm text-muted-foreground">University of California, Berkeley</p>
                        <p className="text-sm text-muted-foreground">2008 - 2010</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-3">Certifications</h3>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="bg-primary/10 p-2 rounded-full mt-1">
                        <Award className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">Licensed Clinical Psychologist</p>
                        <p className="text-sm text-muted-foreground">California Board of Psychology</p>
                        <p className="text-sm text-muted-foreground">License #PSY12345</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="bg-primary/10 p-2 rounded-full mt-1">
                        <Award className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">Certified Cognitive Behavioral Therapist</p>
                        <p className="text-sm text-muted-foreground">Academy of Cognitive Therapy</p>
                        <p className="text-sm text-muted-foreground">Certification #ACT98765</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline">Edit Qualifications</Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="stats">
            <Card>
              <CardHeader>
                <CardTitle>Practice Statistics</CardTitle>
                <CardDescription>
                  Overview of your practice performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-muted rounded-lg p-4 flex flex-col items-center">
                    <div className="text-3xl font-bold">42</div>
                    <div className="text-sm text-muted-foreground">Active Patients</div>
                  </div>
                  
                  <div className="bg-muted rounded-lg p-4 flex flex-col items-center">
                    <div className="text-3xl font-bold">128</div>
                    <div className="text-sm text-muted-foreground">Sessions Conducted</div>
                  </div>
                  
                  <div className="bg-muted rounded-lg p-4 flex flex-col items-center">
                    <div className="text-3xl font-bold">4.8</div>
                    <div className="text-sm text-muted-foreground">Average Rating</div>
                  </div>
                </div>
                
                <div className="mt-6">
                  <h3 className="text-lg font-medium mb-3">Monthly Sessions</h3>
                  <div className="h-32 bg-muted rounded-lg flex items-center justify-center">
                    <p className="text-muted-foreground">Session trend chart would appear here</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
                <CardDescription>
                  Update your account information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleFormSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-1 block">Full Name</label>
                      <input 
                        type="text" 
                        name="name"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={formData.name}
                        onChange={handleFormChange}
                      />
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium mb-1 block">Email</label>
                      <input 
                        type="email" 
                        name="email"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={formData.email}
                        onChange={handleFormChange}
                      />
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium mb-1 block">Phone</label>
                      <input 
                        type="tel" 
                        name="phone"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={formData.phone}
                        onChange={handleFormChange}
                      />
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium mb-1 block">Address</label>
                      <input 
                        type="text" 
                        name="address"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={formData.address}
                        onChange={handleFormChange}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-1 block">Bio</label>
                    <textarea 
                      name="bio"
                      className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={formData.bio}
                      onChange={handleFormChange}
                      placeholder="Brief professional bio"
                    />
                  </div>
                  
                  <Button type="submit" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              {/* Database Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5" />
                    Database Settings
                  </CardTitle>
                  <CardDescription>
                    Connect to MongoDB for persistent storage
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium">Connection Status:</div>
                      <div>
                        {dbSettings.isConnected ? (
                          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                            Connected
                          </Badge>
                        ) : (
                          <Badge variant="secondary">
                            Disconnected
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium mb-1 block">MongoDB URI</label>
                      <input 
                        type="text" 
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={dbSettings.mongoUri}
                        onChange={(e) => setDbSettings({ ...dbSettings, mongoUri: e.target.value })}
                        placeholder="mongodb://username:password@host:port/dbname"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Enter your MongoDB connection string
                      </p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full" 
                    onClick={handleDatabaseConnect}
                    disabled={loading || dbSettings.isConnected}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Connecting...
                      </>
                    ) : dbSettings.isConnected ? (
                      <>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Connected
                      </>
                    ) : (
                      <>
                        <Database className="mr-2 h-4 w-4" />
                        Connect to MongoDB
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
              
              {/* Model Status */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Server className="h-5 w-5" />
                    Model Status
                  </CardTitle>
                  <CardDescription>
                    Python speech analysis model status
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium">Status:</div>
                      <div>
                        {modelStatus.status === 'ready' && (
                          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                            Ready
                          </Badge>
                        )}
                        {modelStatus.status === 'error' && (
                          <Badge variant="destructive">
                            Error
                          </Badge>
                        )}
                        {modelStatus.status === 'checking' && (
                          <Badge variant="secondary" className="flex items-center">
                            <Loader2 className="h-3 w-3 animate-spin mr-1" />
                            Checking
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="rounded-md bg-muted p-4">
                      <div className="flex items-center gap-3">
                        {modelStatus.status === 'ready' ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : modelStatus.status === 'error' ? (
                          <XCircle className="h-5 w-5 text-red-500" />
                        ) : (
                          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                        )}
                        <p className="text-sm">{modelStatus.description}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => {
                      setModelStatus({
                        status: 'checking',
                        description: 'Checking model status...'
                      });
                      
                      setTimeout(() => {
                        setModelStatus({
                          status: 'ready',
                          description: 'The speech emotion analysis model is ready and operational.'
                        });
                        
                        toast({
                          title: 'Model Status',
                          description: 'The model is operational and ready for use.',
                        });
                      }, 1500);
                    }}
                  >
                    <Server className="mr-2 h-4 w-4" />
                    Check Model Status
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
  
  const getPatientContent = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Patient Profile Card */}
      <Card className="md:col-span-1">
        <CardHeader className="flex flex-row items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={profile?.avatar} alt={profile?.name || 'User'} />
            <AvatarFallback>{profile?.name?.charAt(0) || 'U'}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle>{profile?.name}</CardTitle>
            <CardDescription>{profile?.role}</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{profile?.email}</span>
          </div>
          
          <div className="flex items-center gap-3">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{formData.phone || 'Not provided'}</span>
          </div>
          
          <div className="flex items-center gap-3">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{formData.address || 'Not provided'}</span>
          </div>
          
          <div className="border-t pt-4">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium">Progress Score</div>
              <Badge variant="outline">Good</Badge>
            </div>
            <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-primary" style={{ width: '75%' }} />
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Patient Settings */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Account Settings</CardTitle>
          <CardDescription>
            Update your account information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Full Name</label>
                <input 
                  type="text" 
                  name="name"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={formData.name}
                  onChange={handleFormChange}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-1 block">Email</label>
                <input 
                  type="email" 
                  name="email"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={formData.email}
                  onChange={handleFormChange}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-1 block">Phone</label>
                <input 
                  type="tel" 
                  name="phone"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={formData.phone}
                  onChange={handleFormChange}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-1 block">Address</label>
                <input 
                  type="text" 
                  name="address"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={formData.address}
                  onChange={handleFormChange}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-1 block">Age</label>
                <input 
                  type="number" 
                  name="age"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Enter your age"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-1 block">Gender</label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                  <option value="prefer-not-to-say">Prefer not to say</option>
                </select>
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-1 block">Medical History</label>
              <textarea 
                name="medicalHistory"
                className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Any relevant medical history (optional)"
              />
            </div>
            
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
      
      {/* Database and Model Settings */}
      <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Database Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Database Settings
            </CardTitle>
            <CardDescription>
              Connect to MongoDB for persistent storage
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium">Connection Status:</div>
                <div>
                  {dbSettings.isConnected ? (
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                      Connected
                    </Badge>
                  ) : (
                    <Badge variant="secondary">
                      Disconnected
                    </Badge>
                  )}
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-1 block">MongoDB URI</label>
                <input 
                  type="text" 
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={dbSettings.mongoUri}
                  onChange={(e) => setDbSettings({ ...dbSettings, mongoUri: e.target.value })}
                  placeholder="mongodb://username:password@host:port/dbname"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Enter your MongoDB connection string
                </p>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full" 
              onClick={handleDatabaseConnect}
              disabled={loading || dbSettings.isConnected}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Connecting...
                </>
              ) : dbSettings.isConnected ? (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Connected
                </>
              ) : (
                <>
                  <Database className="mr-2 h-4 w-4" />
                  Connect to MongoDB
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
        
        {/* Model Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="h-5 w-5" />
              Model Status
            </CardTitle>
            <CardDescription>
              Python speech analysis model status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium">Status:</div>
                <div>
                  {modelStatus.status === 'ready' && (
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                      Ready
                    </Badge>
                  )}
                  {modelStatus.status === 'error' && (
                    <Badge variant="destructive">
                      Error
                    </Badge>
                  )}
                  {modelStatus.status === 'checking' && (
                    <Badge variant="secondary" className="flex items-center">
                      <Loader2 className="h-3 w-3 animate-spin mr-1" />
                      Checking
                    </Badge>
                  )}
                </div>
              </div>
              
              <div className="rounded-md bg-muted p-4">
                <div className="flex items-center gap-3">
                  {modelStatus.status === 'ready' ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : modelStatus.status === 'error' ? (
                    <XCircle className="h-5 w-5 text-red-500" />
                  ) : (
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  )}
                  <p className="text-sm">{modelStatus.description}</p>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => {
                setModelStatus({
                  status: 'checking',
                  description: 'Checking model status...'
                });
                
                setTimeout(() => {
                  setModelStatus({
                    status: 'ready',
                    description: 'The speech emotion analysis model is ready and operational.'
                  });
                  
                  toast({
                    title: 'Model Status',
                    description: 'The model is operational and ready for use.',
                  });
                }, 1500);
              }}
            >
              <Server className="mr-2 h-4 w-4" />
              Check Model Status
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
  
  const getAdminContent = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Admin Profile Card */}
      <Card className="md:col-span-1">
        <CardHeader className="flex flex-row items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={profile?.avatar} alt={profile?.name || 'User'} />
            <AvatarFallback>{profile?.name?.charAt(0) || 'U'}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle>{profile?.name}</CardTitle>
            <CardDescription>{profile?.role}</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{profile?.email}</span>
          </div>
          
          <div className="flex items-center gap-3">
            <Settings className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">System Administrator</span>
          </div>
          
          <div className="border-t pt-4">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium">Admin Status</div>
              <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                Active
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Admin Settings */}
      <div className="md:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Admin Settings</CardTitle>
            <CardDescription>
              Update your admin account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Full Name</label>
                  <input 
                    type="text" 
                    name="name"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={formData.name}
                    onChange={handleFormChange}
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-1 block">Email</label>
                  <input 
                    type="email" 
                    name="email"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={formData.email}
                    onChange={handleFormChange}
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-1 block">Phone</label>
                  <input 
                    type="tel" 
                    name="phone"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={formData.phone}
                    onChange={handleFormChange}
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-1 block">Password</label>
                  <input 
                    type="password" 
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="••••••••"
                  />
                </div>
              </div>
              
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          {/* Database Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Database Settings
              </CardTitle>
              <CardDescription>
                Configure MongoDB connection
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium">Connection Status:</div>
                  <div>
                    {dbSettings.isConnected ? (
                      <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                        Connected
                      </Badge>
                    ) : (
                      <Badge variant="secondary">
                        Disconnected
                      </Badge>
                    )}
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-1 block">MongoDB URI</label>
                  <input 
                    type="text" 
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={dbSettings.mongoUri}
                    onChange={(e) => setDbSettings({ ...dbSettings, mongoUri: e.target.value })}
                    placeholder="mongodb://username:password@host:port/dbname"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Enter your MongoDB connection string
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full" 
                onClick={handleDatabaseConnect}
                disabled={loading || dbSettings.isConnected}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Connecting...
                  </>
                ) : dbSettings.isConnected ? (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Connected
                  </>
                ) : (
                  <>
                    <Database className="mr-2 h-4 w-4" />
                    Connect to MongoDB
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
          
          {/* Model Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="h-5 w-5" />
                Model Status
              </CardTitle>
              <CardDescription>
                Speech analysis model status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium">Status:</div>
                  <div>
                    {modelStatus.status === 'ready' && (
                      <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                        Ready
                      </Badge>
                    )}
                    {modelStatus.status === 'error' && (
                      <Badge variant="destructive">
                        Error
                      </Badge>
                    )}
                    {modelStatus.status === 'checking' && (
                      <Badge variant="secondary" className="flex items-center">
                        <Loader2 className="h-3 w-3 animate-spin mr-1" />
                        Checking
                      </Badge>
                    )}
                  </div>
                </div>
                
                <div className="rounded-md bg-muted p-4">
                  <div className="flex items-center gap-3">
                    {modelStatus.status === 'ready' ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : modelStatus.status === 'error' ? (
                      <XCircle className="h-5 w-5 text-red-500" />
                    ) : (
                      <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                    )}
                    <p className="text-sm">{modelStatus.description}</p>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => {
                  setModelStatus({
                    status: 'checking',
                    description: 'Checking model status...'
                  });
                  
                  setTimeout(() => {
                    setModelStatus({
                      status: 'ready',
                      description: 'The speech emotion analysis model is ready and operational.'
                    });
                    
                    toast({
                      title: 'Model Status',
                      description: 'The model is operational and ready for use.',
                    });
                  }, 1500);
                }}
              >
                <Server className="mr-2 h-4 w-4" />
                Check Model Status
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
  
  const getAssistantContent = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Assistant Profile Card */}
      <Card className="md:col-span-1">
        <CardHeader className="flex flex-row items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={profile?.avatar} alt={profile?.name || 'User'} />
            <AvatarFallback>{profile?.name?.charAt(0) || 'U'}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle>{profile?.name}</CardTitle>
            <CardDescription>{profile?.role}</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{profile?.email}</span>
          </div>
          
          <div className="flex items-center gap-3">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{formData.phone || 'Not provided'}</span>
          </div>
          
          <div className="flex items-center gap-3">
            <UserIcon className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">Assistant to Dr. Jane Smith</span>
          </div>
          
          <div className="border-t pt-4">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium">Status</div>
              <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                Active
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Assistant Settings */}
      <div className="md:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Account Settings</CardTitle>
            <CardDescription>
              Update your account information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Full Name</label>
                  <input 
                    type="text" 
                    name="name"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={formData.name}
                    onChange={handleFormChange}
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-1 block">Email</label>
                  <input 
                    type="email" 
                    name="email"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={formData.email}
                    onChange={handleFormChange}
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-1 block">Phone</label>
                  <input 
                    type="tel" 
                    name="phone"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={formData.phone}
                    onChange={handleFormChange}
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-1 block">Associated Doctor</label>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    defaultValue="doctor-1"
                  >
                    <option value="doctor-1">Dr. Jane Smith</option>
                    <option value="doctor-2">Dr. Michael Johnson</option>
                    <option value="doctor-3">Dr. Sarah Williams</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-1 block">Bio</label>
                <textarea 
                  name="bio"
                  className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={formData.bio}
                  onChange={handleFormChange}
                  placeholder="Brief professional bio"
                />
              </div>
              
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          {/* Database Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Database Settings
              </CardTitle>
              <CardDescription>
                Connect to MongoDB for persistent storage
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium">Connection Status:</div>
                  <div>
                    {dbSettings.isConnected ? (
                      <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                        Connected
                      </Badge>
                    ) : (
                      <Badge variant="secondary">
                        Disconnected
                      </Badge>
                    )}
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-1 block">MongoDB URI</label>
                  <input 
                    type="text" 
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={dbSettings.mongoUri}
                    onChange={(e) => setDbSettings({ ...dbSettings, mongoUri: e.target.value })}
                    placeholder="mongodb://username:password@host:port/dbname"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Enter your MongoDB connection string
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full" 
                onClick={handleDatabaseConnect}
                disabled={loading || dbSettings.isConnected}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Connecting...
                  </>
                ) : dbSettings.isConnected ? (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Connected
                  </>
                ) : (
                  <>
                    <Database className="mr-2 h-4 w-4" />
                    Connect to MongoDB
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
          
          {/* Model Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="h-5 w-5" />
                Model Status
              </CardTitle>
              <CardDescription>
                Python speech analysis model status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium">Status:</div>
                  <div>
                    {modelStatus.status === 'ready' && (
                      <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                        Ready
                      </Badge>
                    )}
                    {modelStatus.status === 'error' && (
                      <Badge variant="destructive">
                        Error
                      </Badge>
                    )}
                    {modelStatus.status === 'checking' && (
                      <Badge variant="secondary" className="flex items-center">
                        <Loader2 className="h-3 w-3 animate-spin mr-1" />
                        Checking
                      </Badge>
                    )}
                  </div>
                </div>
                
                <div className="rounded-md bg-muted p-4">
                  <div className="flex items-center gap-3">
                    {modelStatus.status === 'ready' ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : modelStatus.status === 'error' ? (
                      <XCircle className="h-5 w-5 text-red-500" />
                    ) : (
                      <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                    )}
                    <p className="text-sm">{modelStatus.description}</p>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => {
                  setModelStatus({
                    status: 'checking',
                    description: 'Checking model status...'
                  });
                  
                  setTimeout(() => {
                    setModelStatus({
                      status: 'ready',
                      description: 'The speech emotion analysis model is ready and operational.'
                    });
                    
                    toast({
                      title: 'Model Status',
                      description: 'The model is operational and ready for use.',
                    });
                  }, 1500);
                }}
              >
                <Server className="mr-2 h-4 w-4" />
                Check Model Status
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences
        </p>
      </div>
      
      {profile?.role === 'doctor' && getDoctorContent()}
      {profile?.role === 'patient' && getPatientContent()}
      {profile?.role === 'admin' && getAdminContent()}
      {profile?.role === 'assistant' && getAssistantContent()}
      <div className="flex gap-4 mt-8">
        <Button variant="destructive" onClick={() => { logout(); navigate('/'); }}>
          Log out
        </Button>
        <Button variant="outline" onClick={() => navigate('/')}>Return to Home</Button>
      </div>
    </div>
  );
};

export default ProfilePage;