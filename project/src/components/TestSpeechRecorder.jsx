import React, { useState } from 'react';
import SpeechRecorder from './SpeechRecorder';
import './SpeechRecorder.css';

const TestSpeechRecorder = () => {
  const [recordingResult, setRecordingResult] = useState(null);
  const [error, setError] = useState(null);

  const handleRecordingComplete = (data) => {
    setRecordingResult(data);
    setError(null);
  };

  const handleError = (error) => {
    setError(error.message);
    setRecordingResult(null);
  };

  return (
    <div className="test-container">
      <h1>Speech Recording Test</h1>
      
      <SpeechRecorder 
        patientId="test-patient-123"
        onRecordingComplete={handleRecordingComplete}
        onError={handleError}
      />

      {error && (
        <div className="error-message">
          Error: {error}
        </div>
      )}

      {recordingResult && (
        <div className="result-container">
          <h2>Recording Results</h2>
          <div className="result-section">
            <h3>Emotional Analysis</h3>
            <pre>{JSON.stringify(recordingResult.emotionalAnalysis, null, 2)}</pre>
          </div>
          <div className="result-section">
            <h3>Transcript</h3>
            <p>{recordingResult.transcript}</p>
          </div>
          <div className="result-section">
            <h3>Recommendations</h3>
            <ul>
              {recordingResult.recommendations?.map((rec, index) => (
                <li key={index}>{rec}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestSpeechRecorder; 