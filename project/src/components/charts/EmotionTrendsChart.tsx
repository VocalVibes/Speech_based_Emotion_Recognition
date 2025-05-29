import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { EmotionRecord } from '@/types';

interface EmotionTrendsChartProps {
  data: EmotionRecord[];
}

const EmotionTrendsChart: React.FC<EmotionTrendsChartProps> = ({ data }) => {
  // Prepare data for the chart
  const chartData = data.map(record => {
    const date = new Date(record.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    return {
      date,
      emotion: record.emotion,
      intensity: record.intensity * 100, // Convert to percentage
    };
  });

  // Color mapping for different emotions
  const emotionColors = {
    happy: 'hsl(var(--chart-1))',
    sad: 'hsl(var(--chart-2))',
    angry: 'hsl(var(--chart-3))',
    neutral: '#888888',
    calm: 'hsl(var(--chart-4))',
    fearful: 'hsl(var(--chart-5))',
    disgust: '#9370DB',
    surprised: '#FF69B4'
  };

  // A function to get color based on emotion
  const getEmotionColor = (emotion: string) => {
    return emotionColors[emotion as keyof typeof emotionColors] || '#CCCCCC';
  };

  // Custom tooltip for the chart
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border rounded-md p-2 shadow-md">
          <p className="font-medium">{label}</p>
          <div className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: payload[0].color }} 
            />
            <span className="capitalize">{payload[0].payload.emotion}</span>
            <span className="font-medium">{payload[0].value.toFixed(0)}%</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={chartData}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis label={{ value: 'Intensity (%)', angle: -90, position: 'insideLeft' }} />
        <Tooltip content={<CustomTooltip />} />
        <Bar
          dataKey="intensity"
          name="Emotion Intensity"
          stroke="#8884d8"
          fillOpacity={0.8}
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={getEmotionColor(entry.emotion)} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export default EmotionTrendsChart;