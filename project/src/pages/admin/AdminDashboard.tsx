import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  UserCircle, 
  Calendar, 
  BarChart3,
  Settings,
  AlertCircle,
  CheckCircle2,
  Activity,
  PieChart,
  LineChart,
  ArrowRight,
  Database
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Sample data for the admin dashboard
  const [stats, setStats] = useState({
    totalUsers: 145,
    activeUsers: 98,
    doctors: 24,
    patients: 118,
    appointments: 210,
    completedSessions: 176,
  });
  
  const [systemStatus, setSystemStatus] = useState({
    apiServer: 'operational',
    database: 'operational',
    modelServer: 'degraded',
    storage: 'operational',
  });
  
  const [recentAlerts, setRecentAlerts] = useState([
    {
      id: '1',
      type: 'error',
      message: 'ML model service degraded performance',
      time: '15 minutes ago',
    },
    {
      id: '2',
      type: 'warning',
      message: 'High database load detected',
      time: '2 hours ago',
    },
    {
      id: '3',
      type: 'success',
      message: 'System backup completed successfully',
      time: '6 hours ago',
    },
  ]);

  const restartService = (service: string) => {
    toast({
      title: 'Service restart initiated',
      description: `The ${service} service is being restarted.`,
    });
    
    // Simulate service restart
    setTimeout(() => {
      if (service === 'modelServer') {
        setSystemStatus(prev => ({
          ...prev,
          modelServer: 'operational'
        }));
        
        setRecentAlerts(prev => [
          {
            id: Date.now().toString(),
            type: 'success',
            message: 'ML model service restored to operational status',
            time: 'Just now',
          },
          ...prev,
        ]);
        
        toast({
          title: 'Service restored',
          description: 'The ML model service is now operational.',
        });
      }
    }, 3000);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor system performance and manage platform users
          </p>
        </div>
      </div>
      
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col items-center justify-center space-y-2">
              <Users className="h-8 w-8 text-blue-500" />
              <div className="text-xl font-bold">{stats.totalUsers}</div>
              <p className="text-xs text-muted-foreground text-center">Total Users</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col items-center justify-center space-y-2">
              <Activity className="h-8 w-8 text-green-500" />
              <div className="text-xl font-bold">{stats.activeUsers}</div>
              <p className="text-xs text-muted-foreground text-center">Active Users</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col items-center justify-center space-y-2">
              <UserCircle className="h-8 w-8 text-violet-500" />
              <div className="text-xl font-bold">{stats.doctors}</div>
              <p className="text-xs text-muted-foreground text-center">Doctors</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col items-center justify-center space-y-2">
              <Users className="h-8 w-8 text-orange-500" />
              <div className="text-xl font-bold">{stats.patients}</div>
              <p className="text-xs text-muted-foreground text-center">Patients</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col items-center justify-center space-y-2">
              <Calendar className="h-8 w-8 text-red-500" />
              <div className="text-xl font-bold">{stats.appointments}</div>
              <p className="text-xs text-muted-foreground text-center">Appointments</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col items-center justify-center space-y-2">
              <CheckCircle2 className="h-8 w-8 text-teal-500" />
              <div className="text-xl font-bold">{stats.completedSessions}</div>
              <p className="text-xs text-muted-foreground text-center">Completed Sessions</p>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Main Dashboard Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="system">System Status</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Main Overview Content */}
            <div className="md:col-span-2 space-y-6">
              {/* Platform Metrics */}
              <Card>
                <CardHeader>
                  <CardTitle>Platform Metrics</CardTitle>
                  <CardDescription>
                    Key performance indicators for the EmotiSense platform
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between mb-2">
                        <div className="text-sm font-medium">User Growth</div>
                        <div className="text-sm text-muted-foreground">+24% this month</div>
                      </div>
                      <Progress value={68} className="h-2" />
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-2">
                        <div className="text-sm font-medium">Appointment Completion Rate</div>
                        <div className="text-sm text-muted-foreground">84%</div>
                      </div>
                      <Progress value={84} className="h-2" />
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-2">
                        <div className="text-sm font-medium">System Uptime</div>
                        <div className="text-sm text-muted-foreground">99.7%</div>
                      </div>
                      <Progress value={99.7} className="h-2" />
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-2">
                        <div className="text-sm font-medium">Storage Utilization</div>
                        <div className="text-sm text-muted-foreground">56%</div>
                      </div>
                      <Progress value={56} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Chart Placeholders */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">User Registration</CardTitle>
                  </CardHeader>
                  <CardContent className="h-64 flex items-center justify-center">
                    <div className="text-center">
                      <LineChart className="h-16 w-16 mx-auto text-muted-foreground/50" />
                      <p className="text-sm text-muted-foreground mt-4">
                        User growth chart visualization
                      </p>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">User Distribution</CardTitle>
                  </CardHeader>
                  <CardContent className="h-64 flex items-center justify-center">
                    <div className="text-center">
                      <PieChart className="h-16 w-16 mx-auto text-muted-foreground/50" />
                      <p className="text-sm text-muted-foreground mt-4">
                        Distribution of user roles
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
            
            {/* Sidebar */}
            <div className="space-y-6">
              {/* System Status */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">System Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className={`h-2 w-2 rounded-full ${
                        systemStatus.apiServer === 'operational' ? 'bg-green-500' : 'bg-red-500'
                      }`} />
                      <span className="text-sm">API Server</span>
                    </div>
                    <Badge variant="outline" className="capitalize">
                      {systemStatus.apiServer}
                    </Badge>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className={`h-2 w-2 rounded-full ${
                        systemStatus.database === 'operational' ? 'bg-green-500' : 'bg-red-500'
                      }`} />
                      <span className="text-sm">Database</span>
                    </div>
                    <Badge variant="outline" className="capitalize">
                      {systemStatus.database}
                    </Badge>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className={`h-2 w-2 rounded-full ${
                        systemStatus.modelServer === 'operational' ? 'bg-green-500' : 
                        systemStatus.modelServer === 'degraded' ? 'bg-yellow-500' : 'bg-red-500'
                      }`} />
                      <span className="text-sm">ML Model Server</span>
                    </div>
                    <Badge 
                      variant={systemStatus.modelServer === 'operational' ? 'outline' : 'secondary'} 
                      className="capitalize"
                    >
                      {systemStatus.modelServer}
                    </Badge>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className={`h-2 w-2 rounded-full ${
                        systemStatus.storage === 'operational' ? 'bg-green-500' : 'bg-red-500'
                      }`} />
                      <span className="text-sm">Storage Service</span>
                    </div>
                    <Badge variant="outline" className="capitalize">
                      {systemStatus.storage}
                    </Badge>
                  </div>
                </CardContent>
                <CardFooter>
                  {systemStatus.modelServer !== 'operational' && (
                    <Button 
                      className="w-full" 
                      size="sm"
                      onClick={() => restartService('modelServer')}
                    >
                      Restart ML Service
                    </Button>
                  )}
                </CardFooter>
              </Card>
              
              {/* Recent Alerts */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Recent Alerts</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {recentAlerts.map((alert) => (
                    <div key={alert.id} className="flex items-start gap-3 pb-3 border-b last:border-0 last:pb-0">
                      <div>
                        {alert.type === 'error' && (
                          <AlertCircle className="h-5 w-5 text-red-500" />
                        )}
                        {alert.type === 'warning' && (
                          <AlertCircle className="h-5 w-5 text-yellow-500" />
                        )}
                        {alert.type === 'success' && (
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{alert.message}</p>
                        <p className="text-xs text-muted-foreground">{alert.time}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full" size="sm">
                    View All Alerts
                  </Button>
                </CardFooter>
              </Card>
              
              {/* Database Connection */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Database Connection</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Database className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">MongoDB</span>
                    </div>
                    <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                      Connected
                    </Badge>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full mt-4"
                    size="sm"
                    onClick={() => navigate('/profile')}
                  >
                    Manage Connection
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>
                View and manage all platform users
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <div className="grid grid-cols-5 border-b px-4 py-3 font-medium">
                  <div>Name</div>
                  <div>Email</div>
                  <div>Role</div>
                  <div>Status</div>
                  <div>Actions</div>
                </div>
                <div className="divide-y">
                  {[
                    { id: 1, name: 'Dr. Jane Smith', email: 'jane.smith@example.com', role: 'doctor', status: 'active' },
                    { id: 2, name: 'John Doe', email: 'john.doe@example.com', role: 'patient', status: 'active' },
                    { id: 3, name: 'Alice Johnson', email: 'alice@example.com', role: 'patient', status: 'inactive' },
                    { id: 4, name: 'Dr. Robert Williams', email: 'robert@example.com', role: 'doctor', status: 'active' },
                    { id: 5, name: 'Sarah Thompson', email: 'sarah@example.com', role: 'assistant', status: 'active' },
                    { id: 6, name: 'Michael Brown', email: 'michael@example.com', role: 'patient', status: 'active' },
                    { id: 7, name: 'Emily Davis', email: 'emily@example.com', role: 'patient', status: 'active' },
                  ].map((user) => (
                    <div key={user.id} className="grid grid-cols-5 px-4 py-3 items-center">
                      <div className="font-medium">{user.name}</div>
                      <div className="text-sm text-muted-foreground">{user.email}</div>
                      <div>
                        <Badge className={`
                          ${user.role === 'doctor' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' : 
                            user.role === 'patient' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 
                            'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'}
                        `}>
                          {user.role === 'doctor' ? 'Doctor' : 
                           user.role === 'patient' ? 'Patient' : 'Assistant'}
                        </Badge>
                      </div>
                      <div>
                        <Badge variant={user.status === 'active' ? 'default' : 'secondary'}>
                          {user.status === 'active' ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">Edit</Button>
                        <Button variant="outline" size="sm" className="text-red-500 hover:text-red-700">
                          {user.status === 'active' ? 'Disable' : 'Enable'}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <div className="text-sm text-muted-foreground">
                Showing 7 of 145 users
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled>Previous</Button>
                <Button variant="outline" size="sm">Next</Button>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="system">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* System Services */}
            <Card>
              <CardHeader>
                <CardTitle>System Services</CardTitle>
                <CardDescription>
                  Monitor and manage core system services
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { name: 'API Gateway', status: 'Running', uptime: '24d 12h 35m', cpu: 12, memory: 245 },
                    { name: 'Authentication Service', status: 'Running', uptime: '24d 12h 35m', cpu: 8, memory: 180 },
                    { name: 'Database Service', status: 'Running', uptime: '24d 12h 35m', cpu: 24, memory: 560 },
                    { name: 'ML Model Service', status: 'Warning', uptime: '12h 15m', cpu: 45, memory: 890 },
                    { name: 'Storage Service', status: 'Running', uptime: '24d 12h 35m', cpu: 5, memory: 120 },
                  ].map((service, i) => (
                    <div key={i} className="flex flex-col">
                      <div className="flex justify-between items-center pb-2">
                        <div>
                          <div className="font-medium">{service.name}</div>
                          <div className="text-xs text-muted-foreground">Uptime: {service.uptime}</div>
                        </div>
                        <Badge 
                          variant={service.status === 'Running' ? 'outline' : 'secondary'}
                          className={service.status === 'Warning' ? 'text-yellow-800 bg-yellow-100 dark:text-yellow-300 dark:bg-yellow-900/30' : ''}
                        >
                          {service.status}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-4 py-2 border-t">
                        <div>
                          <div className="text-xs text-muted-foreground mb-1">CPU Usage</div>
                          <div className="flex items-center gap-2">
                            <Progress value={service.cpu} className="h-2" />
                            <span className="text-xs">{service.cpu}%</span>
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground mb-1">Memory</div>
                          <div className="flex items-center gap-2">
                            <Progress value={(service.memory / 1000) * 100} className="h-2" />
                            <span className="text-xs">{service.memory} MB</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full" onClick={() => restartService('modelServer')}>
                  Restart Services
                </Button>
              </CardFooter>
            </Card>
            
            {/* System Logs */}
            <Card>
              <CardHeader>
                <CardTitle>System Logs</CardTitle>
                <CardDescription>
                  Recent activity and error logs
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border bg-muted/50 font-mono text-sm h-[400px] overflow-y-auto p-4 space-y-2">
                  <div className="text-green-600 dark:text-green-400">[2025-06-05 10:12:34] INFO: System backup completed successfully</div>
                  <div className="text-yellow-600 dark:text-yellow-400">[2025-06-05 08:45:12] WARN: High memory usage detected on ML service</div>
                  <div className="text-red-600 dark:text-red-400">[2025-06-05 08:43:22] ERROR: ML model service connection timeout</div>
                  <div className="text-muted-foreground">[2025-06-05 08:30:15] INFO: User john.doe@example.com logged in</div>
                  <div className="text-muted-foreground">[2025-06-05 08:15:44] INFO: New appointment created for patient ID P-12345</div>
                  <div className="text-muted-foreground">[2025-06-05 08:10:17] INFO: DB backup scheduled for 22:00 UTC</div>
                  <div className="text-muted-foreground">[2025-06-05 08:05:32] INFO: API request completed in 235ms</div>
                  <div className="text-muted-foreground">[2025-06-05 08:01:12] INFO: System services health check - all services operational</div>
                  <div className="text-muted-foreground">[2025-06-05 07:45:03] INFO: User alice@example.com updated profile information</div>
                  <div className="text-yellow-600 dark:text-yellow-400">[2025-06-05 07:30:27] WARN: Database connection pool nearing capacity</div>
                  <div className="text-muted-foreground">[2025-06-05 07:15:19] INFO: New user registration - sarah@example.com</div>
                  <div className="text-muted-foreground">[2025-06-05 07:00:00] INFO: Daily analytics report generated</div>
                  <div className="text-muted-foreground">[2025-06-05 06:45:22] INFO: Storage cleanup process completed</div>
                  <div className="text-muted-foreground">[2025-06-05 06:30:11] INFO: API request completed in 198ms</div>
                  <div className="text-muted-foreground">[2025-06-05 06:15:47] INFO: User robert@example.com logged in</div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline">Clear Logs</Button>
                <Button variant="outline">Download Logs</Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="settings">
          <div className="grid grid-cols-1 gap-6">
            {/* System Settings */}
            <Card>
              <CardHeader>
                <CardTitle>System Settings</CardTitle>
                <CardDescription>
                  Configure platform-wide settings and preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <div className="font-medium">Database Configuration</div>
                    <div className="rounded-md border p-4">
                      <div className="grid gap-4">
                        <div>
                          <label className="text-sm font-medium mb-1 block">MongoDB Connection URI</label>
                          <input 
                            type="text" 
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            value="mongodb://********:27017/emotisense"
                            disabled
                          />
                          <p className="text-xs text-muted-foreground mt-1">Credentials are hidden for security reasons</p>
                        </div>
                        <div className="flex justify-end">
                          <Button 
                            onClick={() => navigate('/profile')}
                            variant="outline"
                          >
                            Manage Database
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="font-medium">ML Model Configuration</div>
                    <div className="rounded-md border p-4">
                      <div className="grid gap-4">
                        <div>
                          <label className="text-sm font-medium mb-1 block">Model Endpoint</label>
                          <input 
                            type="text" 
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            value="https://api.emotisense.ai/v1/model"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-1 block">API Key</label>
                          <input 
                            type="password" 
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            value="sk_emotion_model_********"
                          />
                        </div>
                        <div className="flex justify-end">
                          <Button>Update Configuration</Button>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="font-medium">Platform Settings</div>
                    <div className="rounded-md border p-4">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">Enable User Registration</div>
                            <div className="text-sm text-muted-foreground">Allow new users to register</div>
                          </div>
                          <div className="h-6 w-11 rounded-full bg-primary relative">
                            <div className="absolute right-1 top-1 h-4 w-4 rounded-full bg-white"></div>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">Email Notifications</div>
                            <div className="text-sm text-muted-foreground">Send email alerts for system events</div>
                          </div>
                          <div className="h-6 w-11 rounded-full bg-primary relative">
                            <div className="absolute right-1 top-1 h-4 w-4 rounded-full bg-white"></div>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">Maintenance Mode</div>
                            <div className="text-sm text-muted-foreground">Put platform in maintenance mode</div>
                          </div>
                          <div className="h-6 w-11 rounded-full bg-muted relative">
                            <div className="absolute left-1 top-1 h-4 w-4 rounded-full bg-background"></div>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">Debug Logging</div>
                            <div className="text-sm text-muted-foreground">Enable verbose debug logs</div>
                          </div>
                          <div className="h-6 w-11 rounded-full bg-muted relative">
                            <div className="absolute left-1 top-1 h-4 w-4 rounded-full bg-background"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full">Save All Settings</Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;