import React, { useState, useEffect } from 'react';
import { analyzeAudio, getEmotionHistory, getStrengthsAndWeaknesses, EmotionAnalysis } from '@/services/emotionService';

const EmotionAnalysisPanel: React.FC = () => {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [analysis, setAnalysis] = useState<EmotionAnalysis | null>(null);
  const [history, setHistory] = useState<EmotionAnalysis[]>([]);
  const [sw, setSW] = useState<{ strengths: string[]; weaknesses: string[] }>({ strengths: [], weaknesses: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch strengths/weaknesses and history on mount
  useEffect(() => {
    getStrengthsAndWeaknesses().then(setSW).catch(() => {});
    getEmotionHistory().then(setHistory).catch(() => {});
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setAudioFile(e.target.files[0]);
    }
  };

  const handleAnalyze = async () => {
    if (!audioFile) return;
    setLoading(true);
    setError(null);
    setAnalysis(null);
    try {
      const result = await analyzeAudio(audioFile);
      setAnalysis(result);
      // Optionally refresh history and strengths/weaknesses
      getEmotionHistory().then(setHistory).catch(() => {});
      getStrengthsAndWeaknesses().then(setSW).catch(() => {});
    } catch (err: any) {
      setError(err.message || 'Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      <h2 className="text-2xl font-bold mb-2">Speech Emotion Analysis</h2>
      <input
        type="file"
        accept="audio/wav"
        onChange={handleFileChange}
        className="mb-2"
      />
      <button
        className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
        onClick={handleAnalyze}
        disabled={!audioFile || loading}
      >
        {loading ? 'Analyzing...' : 'Analyze'}
      </button>
      {error && <div className="text-red-500 mt-2">{error}</div>}

      {analysis && (
        <div className="mt-6 border rounded p-4 bg-gray-50">
          <h3 className="font-semibold mb-2">Analysis Result</h3>
          <div><b>Transcript:</b> {analysis.transcript}</div>
          <div><b>Primary Emotion:</b> {analysis.primaryEmotion} ({Math.round(analysis.confidenceScore * 100)}%)</div>
          <div><b>Strengths:</b>
            <ul className="list-disc ml-6">
              {analysis.strengths.map((s, i) => <li key={i}>{s}</li>)}
            </ul>
          </div>
          <div><b>Weaknesses:</b>
            <ul className="list-disc ml-6">
              {analysis.weaknesses.map((w, i) => <li key={i}>{w}</li>)}
            </ul>
          </div>
          <div>
            <b>Emotions Timeline:</b>
            <ul className="list-disc ml-6">
              {analysis.emotions.map((e, i) => (
                <li key={i}>
                  {e.timestamp.toFixed(2)}s: {e.emotion} ({Math.round(e.confidence * 100)}%)
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <div className="mt-8">
        <h3 className="font-semibold mb-2">Overall Strengths</h3>
        <ul className="list-disc ml-6">
          {sw.strengths.length === 0 ? <li>None detected yet.</li> : sw.strengths.map((s, i) => <li key={i}>{s}</li>)}
        </ul>
        <h3 className="font-semibold mt-4 mb-2">Overall Weaknesses</h3>
        <ul className="list-disc ml-6">
          {sw.weaknesses.length === 0 ? <li>None detected yet.</li> : sw.weaknesses.map((w, i) => <li key={i}>{w}</li>)}
        </ul>
      </div>

      <div className="mt-8">
        <h3 className="font-semibold mb-2">Recent Analyses</h3>
        <ul className="list-disc ml-6">
          {history.length === 0 ? (
            <li>No history yet.</li>
          ) : (
            history.slice(0, 5).map((h, i) => (
              <li key={i}>
                {h.primaryEmotion} ({Math.round(h.confidenceScore * 100)}%) - {h.transcript.slice(0, 40)}...
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
};

export default EmotionAnalysisPanel;
