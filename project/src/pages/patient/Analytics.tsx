import React, { useEffect, useState } from 'react';
import EmotionTrendsChart from '@/components/charts/EmotionTrendsChart';
import { getEmotionHistory } from '@/services/emotionService';
import { EmotionAnalysis } from '@/services/emotionService';

const Analytics = () => {
  const [emotionHistory, setEmotionHistory] = useState<EmotionAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getEmotionHistory();
        setEmotionHistory(data);
      } catch (err: any) {
        setError('Failed to load analytics.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Your Emotional Health Analytics</h1>
      {loading ? (
        <div>Loading analytics...</div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : (
        <>
          <div className="mb-8">
            <EmotionTrendsChart data={emotionHistory} />
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Summary</h2>
            {emotionHistory.length === 0 ? (
              <div>No analysis records found.</div>
            ) : (
              <ul className="list-disc pl-6">
                <li>Total Analyses: {emotionHistory.length}</li>
                <li>Most Recent Primary Emotion: {emotionHistory[0].primaryEmotion}</li>
                <li>Average Confidence: {(
                  emotionHistory.reduce((sum, e) => sum + (e.confidenceScore || 0), 0) / emotionHistory.length
                ).toFixed(2)}</li>
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Analytics; 