import axios from 'axios';
import { API_BASE_URL, API_ENDPOINTS } from '@/config/api';

export interface EmotionAnalysis {
  emotions: Array<{
    timestamp: number;
    emotion: string;
    confidence: number;
  }>;
  transcript: string;
  duration: number;
  sampleRate: number;
  strengths: string[];
  weaknesses: string[];
  primaryEmotion: string;
  confidenceScore: number;
  emotionScores: {
    [key: string]: number;
  };
}

// Helper function to retry failed requests
const retry = async <T>(fn: () => Promise<T>, retries = 3, delay = 1000): Promise<T> => {
    try {
      return await fn();
    } catch (error) {
    if (retries === 0) throw error;
    await new Promise(resolve => setTimeout(resolve, delay));
    return retry(fn, retries - 1, delay * 2);
      }
};

export const analyzeAudio = async (audioFile: File): Promise<EmotionAnalysis> => {
  const formData = new FormData();
  formData.append('audio', audioFile);
  const token = localStorage.getItem('token');

  return retry(async () => {
    try {
      const response = await axios.post(`${API_BASE_URL}${API_ENDPOINTS.EMOTION.ANALYZE}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        timeout: 30000,
      });

      if (!response.data?.success || !response.data?.analysis) {
        throw new Error('Invalid response from server');
      }

      return response.data.analysis;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response) {
          throw new Error(error.response.data?.message || 'Server error occurred');
        } else if (error.request) {
          throw new Error('No response from server. Please check your connection.');
        }
      }
      throw error;
    }
  });
};

export const getEmotionHistory = async (): Promise<EmotionAnalysis[]> => {
  const token = localStorage.getItem('token');
  return retry(async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}${API_ENDPOINTS.EMOTION.HISTORY}`, {
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        timeout: 10000,
      });

      if (!response.data?.success || !Array.isArray(response.data?.history)) {
        throw new Error('Invalid response format');
      }

      return response.data.history.map((record: any) => ({
        emotions: [{
          timestamp: record.timestamp,
          emotion: record.emotion,
          confidence: record.confidence
        }],
        transcript: record.transcript || '',
        duration: record.metadata?.duration || 0,
        sampleRate: record.metadata?.sampleRate || 0,
        strengths: record.strengths || [],
        weaknesses: record.weaknesses || [],
        primaryEmotion: record.emotion,
        confidenceScore: record.confidence,
        emotionScores: {
          [record.emotion]: record.confidence
        }
      }));
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response) {
          throw new Error(error.response.data?.message || 'Server error occurred');
        } else if (error.request) {
          throw new Error('No response from server. Please check your connection.');
        }
      }
      throw error;
    }
  });
};

export const getStrengthsAndWeaknesses = async (): Promise<{ strengths: string[]; weaknesses: string[] }> => {
  const token = localStorage.getItem('token');
  return retry(async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}${API_ENDPOINTS.EMOTION.STRENGTHS_WEAKNESSES}`, {
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        timeout: 10000,
      });

      if (!response.data?.success) {
        throw new Error('Invalid response format');
      }

      return {
        strengths: response.data.strengths || [],
        weaknesses: response.data.weaknesses || [],
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response) {
          throw new Error(error.response.data?.message || 'Server error occurred');
        } else if (error.request) {
          throw new Error('No response from server. Please check your connection.');
        }
      }
      throw error;
    }
  });
}; 