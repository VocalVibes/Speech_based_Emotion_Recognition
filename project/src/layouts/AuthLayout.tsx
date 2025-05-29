import { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { BrainCircuit } from 'lucide-react';

const AuthLayout = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="py-4 px-6 border-b">
        <div className="container mx-auto flex justify-between items-center">
          <Button 
            variant="ghost" 
            className="flex items-center gap-2 text-xl font-semibold"
            onClick={() => navigate('/')}
          >
            <BrainCircuit className="h-6 w-6 text-primary" />
            <span>EmotiSense</span>
          </Button>
          
          <Button 
            variant="outline"
            onClick={() => navigate('/')}
          >
            Return Home
          </Button>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="flex-grow flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </main>
      
      {/* Footer */}
      <footer className="py-4 px-6 border-t text-center text-sm text-muted-foreground">
        <div className="container mx-auto">
          © {new Date().getFullYear()} EmotiSense. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default AuthLayout;