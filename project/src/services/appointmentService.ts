import axios from 'axios';
import { API_BASE_URL } from '../config/api';

export const bookAppointment = async (appointmentData: any, token: string) => {
  const response = await axios.post(`${API_BASE_URL}/appointments`, appointmentData, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const getAppointments = async (token: string) => {
  const response = await axios.get(`${API_BASE_URL}/appointments`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const getPatientAppointments = async (token: string) => {
  const response = await axios.get(`${API_BASE_URL}/appointments/patient`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const getDoctorAppointments = async (token: string) => {
  const response = await axios.get(`${API_BASE_URL}/appointments/doctor`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
}; 