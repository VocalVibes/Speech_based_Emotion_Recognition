import React, { useState, useRef } from 'react';
import axios from 'axios';
import { useToast } from '@/hooks/use-toast';
import { API_BASE_URL } from '@/config/api';
import Recorder from 'recorder-js';

const SpeechRecorder = ({ patientId, onRecordingComplete }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingId, setRecordingId] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const streamRef = useRef(null);
  const recorderRef = useRef(null);
  const { toast } = useToast();

  const startRecording = async () => {
    try {
      // Start a new recording session
      const response = await axios.post(`${API_BASE_URL}/recordings/start`, { patientId });
      setRecordingId(response.data.recordingId);

      // Get access to the microphone
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Initialize AudioContext and Recorder only once
      if (!recorderRef.current) {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        recorderRef.current = new Recorder(audioContext);
        await recorderRef.current.init(stream);
      } else {
        await recorderRef.current.init(stream);
      }

      recorderRef.current.start();
      setIsRecording(true);
      toast({
        title: 'Recording Started',
        description: 'Your speech is being recorded',
      });
    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to start recording',
        variant: 'destructive',
      });
    }
  };

  const stopRecording = async () => {
    try {
      const { blob } = await recorderRef.current.stop();
      console.log(blob.type); // Should be 'audio/wav'
      setIsRecording(false);

      // Stop all tracks to release the mic
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      toast({
        title: 'Processing',
        description: 'Analyzing your speech...',
      });

      setIsProcessing(true);
      const formData = new FormData();
      formData.append('audio', blob, 'recording.wav');

      const saveResponse = await axios.post(
        `${API_BASE_URL}/recordings/${recordingId}/save`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (onRecordingComplete) {
        onRecordingComplete(saveResponse.data);
      }

      toast({
        title: 'Success',
        description: 'Recording saved and analyzed successfully',
      });
    } catch (error) {
      console.error('Error saving recording:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to save recording',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="speech-recorder">
      <button
        onClick={isRecording ? stopRecording : startRecording}
        disabled={isProcessing}
        className={`recording-button ${isRecording ? 'recording' : ''} ${isProcessing ? 'processing' : ''}`}
      >
        {isProcessing ? 'Processing...' : isRecording ? 'Stop Recording' : 'Start Recording'}
      </button>
    </div>
  );
};

export default SpeechRecorder; 