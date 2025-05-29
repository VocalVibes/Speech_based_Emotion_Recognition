export interface User {
  id: string;
  name: string;
  email: string;
  role: 'doctor' | 'patient' | 'admin' | 'assistant';
  avatar?: string;
  specialties?: string[];
  phone?: string;
  address?: string;
  bio?: string;
}

export interface Doctor extends User {
  role: 'doctor';
  specialties: string[];
  education: Education[];
  experience: number;
  ratings: number;
  patients: number;
  appointments: Appointment[];
  voiceSample?: string;
}

export interface Patient extends User {
  role: 'patient';
  age?: number;
  gender?: string;
  medicalHistory?: string[];
  emotionHistory?: EmotionRecord[];
  upcomingAppointments?: Appointment[];
  pastAppointments?: Appointment[];
}

export interface Admin extends User {
  role: 'admin';
  permissions: string[];
}

export interface Assistant extends User {
  role: 'assistant';
  doctorId: string;
}

export interface Education {
  degree: string;
  institution: string;
  year: string;
}

export interface Appointment {
  id: string;
  doctorId: string;
  patientId: string;
  date: string;
  time: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  notes?: string;
}

export interface EmotionRecord {
  id: string;
  date: string;
  emotion: Emotion;
  intensity: number;
  notes?: string;
  audioUrl?: string;
}

export type Emotion = 
  | 'happy' 
  | 'sad' 
  | 'angry' 
  | 'neutral'
  | 'calm'
  | 'fearful'
  | 'disgust'
  | 'surprised';

export interface DatabaseSettings {
  mongoUri: string;
  isConnected: boolean;
}

export interface ModelStatus {
  status: 'ready' | 'error' | 'checking';
  description: string;
}