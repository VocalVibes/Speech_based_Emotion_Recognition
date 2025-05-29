import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  allowedRoles 
}) => {
  const { isAuthenticated, user, isLoading } = useAuth();
  const location = useLocation();
  const { toast } = useToast();

  if (isLoading) {
    return null; // or a loading spinner
  }

  if (!isAuthenticated) {
    toast({
      title: 'Access Denied',
      description: 'Please log in to access this page',
      variant: 'destructive',
    });
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    toast({
      title: 'Access Denied',
      description: 'You do not have permission to access this page',
      variant: 'destructive',
    });
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;