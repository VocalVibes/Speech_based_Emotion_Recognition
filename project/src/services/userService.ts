import axios from 'axios';
import { API_BASE_URL } from '../config/api';

export const getUser = async (userId: string, token: string) => {
  const response = await axios.get(`${API_BASE_URL}/users/${userId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const getDoctors = async (token: string) => {
  const response = await axios.get(`${API_BASE_URL}/doctors`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const getPatients = async (token: string) => {
  const response = await axios.get(`${API_BASE_URL}/patients`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
}; 