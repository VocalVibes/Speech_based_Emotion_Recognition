import { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/navigation/Navbar';
import Sidebar from '@/components/navigation/Sidebar';
import { cn } from '@/lib/utils';

const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Close sidebar when route changes
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  // Redirect to appropriate dashboard if authenticated and on home page
  useEffect(() => {
    if (isAuthenticated && location.pathname === '/' && user) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, location.pathname, navigate, user]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar onMenuButtonClick={() => setSidebarOpen(true)} />
      
      {isAuthenticated && (
        <Sidebar 
          isOpen={sidebarOpen} 
          onClose={() => setSidebarOpen(false)}
        />
      )}
      
      <main className={cn(
        "pt-16 min-h-[calc(100vh-64px)]",
        isAuthenticated && "md:pl-64"
      )}>
        <div className="container mx-auto py-6 px-4 md:px-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default MainLayout;