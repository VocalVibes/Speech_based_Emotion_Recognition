// API configuration
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:50021/api';

// API endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    PROFILE: '/auth/profile',
  },
  EMOTION: {
    ANALYZE: '/emotion/analyze',
    HISTORY: '/emotion/history',
    REPORTS: '/emotion/reports',
    STRENGTHS_WEAKNESSES: '/emotion/strengths-weaknesses',
  },
  APPOINTMENTS: {
    BASE: '/appointments',
    BOOK: '/appointments/book',
    LIST: '/appointments/list',
  },
  USERS: {
    PROFILE: '/users/profile',
    DOCTORS: '/users/doctors',
    PATIENTS: '/users/patients',
  },
}; 