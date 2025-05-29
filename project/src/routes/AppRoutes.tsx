import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import MainLayout from '@/layouts/MainLayout';
import AuthLayout from '@/layouts/AuthLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import LoadingScreen from '@/components/common/LoadingScreen';

// Auth Pages
import Login from '@/pages/auth/Login';
import Register from '@/pages/auth/Register';
import RoleSelection from '@/pages/auth/RoleSelection';

// Main Pages
import Home from '@/pages/Home';
import DoctorDashboard from '@/pages/doctor/DoctorDashboard';
import PatientDashboard from '@/pages/patient/PatientDashboard';
import AdminDashboard from '@/pages/admin/AdminDashboard';
import AssistantDashboard from '@/pages/assistant/AssistantDashboard';
import Appointments from '@/pages/Appointments';
import Profile from '@/pages/Profile';
import NotFound from '@/pages/NotFound';
import Doctors from '@/pages/Doctors';
import DoctorAnalytics from '@/pages/doctor/Analytics';

const AppRoutes = () => {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <Routes>
      {/* Auth Routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={
          isAuthenticated ? <Navigate to="/dashboard" /> : <Login />
        } />
        <Route path="/register" element={
          isAuthenticated ? <Navigate to="/dashboard" /> : <Register />
        } />
        <Route path="/role-selection" element={<RoleSelection />} />
      </Route>

      {/* Main App Routes */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        
        {/* Dashboard Routes - redirects based on user role */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              {user?.role === 'doctor' ? <DoctorDashboard /> :
               user?.role === 'patient' ? <PatientDashboard /> :
               user?.role === 'admin' ? <AdminDashboard /> :
               user?.role === 'assistant' ? <AssistantDashboard /> :
               <Navigate to="/" />}
            </ProtectedRoute>
          } 
        />
        
        {/* Common routes */}
        <Route path="/appointments" element={
          <ProtectedRoute>
            <Appointments />
          </ProtectedRoute>
        } />
        
        <Route path="/profile" element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } />
        
        {/* 404 Route */}
        <Route path="*" element={<NotFound />} />

        <Route path="/doctors" element={
          <ProtectedRoute allowedRoles={['patient']}>
            <Doctors />
          </ProtectedRoute>
        } />

        <Route path="/analytics" element={
          <ProtectedRoute allowedRoles={['doctor']}>
            <DoctorAnalytics />
          </ProtectedRoute>
        } />
      </Route>
    </Routes>
  );
};

export default AppRoutes;