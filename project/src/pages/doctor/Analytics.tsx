import React, { useEffect, useState } from 'react';
import EmotionTrendsChart from '@/components/charts/EmotionTrendsChart';
import { getEmotionHistory } from '@/services/emotionService';
import { EmotionAnalysis } from '@/services/emotionService';
import { BarChart2, Smile, Frown, Meh, TrendingUp } from 'lucide-react';

const DoctorAnalytics = () => {
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

  // Calculate stats
  const total = emotionHistory.length;
  const avgConfidence = total > 0 ? (emotionHistory.reduce((sum, e) => sum + (e.confidenceScore || 0), 0) / total).toFixed(2) : '0.00';
  const mostRecent = total > 0 ? emotionHistory[0].primaryEmotion : '-';
  const emotionCounts = emotionHistory.reduce((acc, e) => {
    acc[e.primaryEmotion] = (acc[e.primaryEmotion] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-4xl font-bold mb-2 text-center">Analytics Dashboard</h1>
      <p className="text-center text-gray-500 mb-8">Insights into your patients' emotional health trends</p>
      {loading ? (
        <div className="text-center">Loading analytics...</div>
      ) : error ? (
        <div className="text-center text-red-500">{error}</div>
      ) : (
        <>
          {/* Stat Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-blue-50 rounded-lg p-6 flex flex-col items-center shadow">
              <BarChart2 className="h-8 w-8 text-blue-500 mb-2" />
              <div className="text-2xl font-bold">{total}</div>
              <div className="text-gray-500">Total Analyses</div>
            </div>
            <div className="bg-green-50 rounded-lg p-6 flex flex-col items-center shadow">
              <Smile className="h-8 w-8 text-green-500 mb-2" />
              <div className="text-2xl font-bold">{mostRecent}</div>
              <div className="text-gray-500">Most Recent Emotion</div>
            </div>
            <div className="bg-yellow-50 rounded-lg p-6 flex flex-col items-center shadow">
              <TrendingUp className="h-8 w-8 text-yellow-500 mb-2" />
              <div className="text-2xl font-bold">{avgConfidence}</div>
              <div className="text-gray-500">Avg. Confidence</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-6 flex flex-col items-center shadow">
              <Meh className="h-8 w-8 text-purple-500 mb-2" />
              <div className="text-2xl font-bold">{Object.keys(emotionCounts).length}</div>
              <div className="text-gray-500">Emotions Detected</div>
            </div>
          </div>
          {/* Chart */}
          <div className="mb-10">
            <EmotionTrendsChart data={emotionHistory} />
          </div>
          {/* Emotion Breakdown */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Emotion Breakdown</h2>
            {total === 0 ? (
              <div>No analysis records found.</div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(emotionCounts).map(([emotion, count]) => (
                  <div key={emotion} className="flex flex-col items-center">
                    <span className="font-bold text-lg">{emotion}</span>
                    <span className="text-2xl">{count}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default DoctorAnalytics; 