import axios from 'axios';
import { API_BASE_URL } from '../config/api';

export const login = async (email: string, password: string) => {
  const response = await axios.post(`${API_BASE_URL}/auth/login`, { email, password });
  return response.data;
};

export const register = async (userData: any) => {
  const response = await axios.post(`${API_BASE_URL}/auth/register`, userData);
  return response.data;
};

export const getProfile = async (token: string) => {
  const response = await axios.get(`${API_BASE_URL}/auth/profile`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
}; 