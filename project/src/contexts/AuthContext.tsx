import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { User } from '@/types';
import { useToast } from '@/components/ui/use-toast';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: Partial<User>, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:50021/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
      
      if (token && savedUser) {
        try {
          // Verify token validity
          await api.get('/auth/verify');
      setUser(JSON.parse(savedUser));
        } catch (error) {
          // Token is invalid or expired
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
    }
    setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, user: userData } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      
      toast({
        title: 'Success',
        description: 'Logged in successfully',
      });
    } catch (error: any) {
      let message = 'Login failed. Please check your credentials.';
      if (error && error.response && error.response.data && error.response.data.message) {
        message = error.response.data.message;
      }
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: Partial<User>, password: string) => {
    setIsLoading(true);
    try {
      const response = await api.post('/auth/register', {
        ...userData,
        password,
      });
      const { token, user: registeredUser } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(registeredUser));
      setUser(registeredUser);
      
      toast({
        title: 'Success',
        description: 'Registration successful',
      });
    } catch (error: any) {
      let message = 'Registration failed. Please try again.';
      if (error && error.response && error.response.data && error.response.data.message) {
        message = error.response.data.message;
      }
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    toast({
      title: 'Success',
      description: 'Logged out successfully',
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        isAuthenticated: !!user,
        isLoading
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};