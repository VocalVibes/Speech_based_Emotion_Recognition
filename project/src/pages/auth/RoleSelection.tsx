import { useNavigate } from 'react-router-dom';
import { BrainCircuit, UserCircle, Users, ShieldCheck, HeadsetIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const RoleSelection = () => {
  const navigate = useNavigate();

  const roles = [
    {
      id: 'doctor',
      title: 'Doctor',
      description: 'Create and manage patient records, analyze emotions, schedule appointments',
      icon: UserCircle,
    },
    {
      id: 'patient',
      title: 'Patient',
      description: 'Book appointments, track your emotional health progress, communicate with doctors',
      icon: Users,
    },
    {
      id: 'admin',
      title: 'Administrator',
      description: 'Manage platform users, view system metrics, configure system settings',
      icon: ShieldCheck,
    },
    {
      id: 'assistant',
      title: 'Personal Assistant',
      description: 'Manage doctor schedules, handle appointments, assist with patient communication',
      icon: HeadsetIcon,
    },
  ];

  const handleRoleSelect = (role: string) => {
    navigate(`/register?role=${role}`);
  };

  return (
    <Card className="w-full">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
          <BrainCircuit className="h-6 w-6 text-primary" />
        </div>
        <CardTitle className="text-2xl font-bold">Choose your role</CardTitle>
        <CardDescription>
          Select the role that best describes how you'll use EmotiSense
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        {roles.map((role) => (
          <Button
            key={role.id}
            variant="outline"
            className="flex items-center justify-start h-auto p-4 hover:bg-secondary/50"
            onClick={() => handleRoleSelect(role.id)}
          >
            <div className="mr-4 rounded-full bg-secondary w-12 h-12 flex items-center justify-center">
              <role.icon className="h-6 w-6 text-primary" />
            </div>
            <div className="text-left">
              <div className="font-medium">{role.title}</div>
              <div className="text-sm text-muted-foreground">{role.description}</div>
            </div>
          </Button>
        ))}
        
        <div className="mt-4 text-center text-sm text-muted-foreground">
          <p>
            Already have an account?{' '}
            <Button variant="link" className="p-0 h-auto" onClick={() => navigate('/login')}>
              Log in
            </Button>
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default RoleSelection;