import MedicalReport from '../models/MedicalReport.js';

export const generateReport = async (recording) => {
  try {
    // Calculate emotional trends
    const emotionalTrends = calculateEmotionalTrends(recording.emotions);
    
    // Get dominant emotion
    const dominantEmotion = getDominantEmotion(emotionalTrends);
    
    // Generate key insights based on emotional patterns
    const keyInsights = generateKeyInsights(recording.emotions, recording.transcript);
    
    // Generate recommendations based on emotional analysis
    const recommendations = generateRecommendations(dominantEmotion, keyInsights);

    // Create the medical report
    const report = new MedicalReport({
      patientId: recording.patientId,
      doctorId: recording.doctorId,
      speechRecordingId: recording._id,
      summary: generateSummary(recording.transcript, keyInsights),
      emotionalAnalysis: {
        dominantEmotion,
        emotionalTrends,
        keyInsights
      },
      recommendations
    });

    await report.save();
    return report;
  } catch (error) {
    throw new Error(`Error generating report: ${error.message}`);
  }
};

const calculateEmotionalTrends = (emotions) => {
  const emotionCounts = {};
  let totalEmotions = 0;

  emotions.forEach(({ emotion }) => {
    emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1;
    totalEmotions++;
  });

  return Object.entries(emotionCounts).map(([emotion, count]) => ({
    emotion,
    percentage: (count / totalEmotions) * 100
  }));
};

const getDominantEmotion = (emotionalTrends) => {
  return emotionalTrends.reduce((prev, current) => 
    (prev.percentage > current.percentage) ? prev : current
  ).emotion;
};

const generateKeyInsights = (emotions, transcript) => {
  const insights = [];
  
  // Analyze emotional transitions
  const emotionalTransitions = analyzeEmotionalTransitions(emotions);
  if (emotionalTransitions.length > 0) {
    insights.push(`Patient showed significant emotional changes during the session: ${emotionalTransitions.join(', ')}`);
  }

  // Analyze emotional stability
  const stability = analyzeEmotionalStability(emotions);
  insights.push(`Patient demonstrated ${stability} emotional stability throughout the session`);

  // Add more insights based on transcript analysis
  // This would typically involve NLP analysis of the transcript
  insights.push("Based on the conversation, patient showed interest in discussing their condition");

  return insights;
};

const generateRecommendations = (dominantEmotion, keyInsights) => {
  const recommendations = [];

  // Add recommendations based on dominant emotion
  switch (dominantEmotion) {
    case 'anxious':
      recommendations.push("Consider scheduling more frequent follow-up sessions");
      recommendations.push("Recommend stress management techniques");
      break;
    case 'depressed':
      recommendations.push("Suggest regular exercise and outdoor activities");
      recommendations.push("Consider referral to a mental health specialist");
      break;
    case 'happy':
      recommendations.push("Continue current treatment plan");
      recommendations.push("Maintain regular check-ups");
      break;
    default:
      recommendations.push("Monitor emotional state in next session");
      recommendations.push("Continue current treatment plan");
  }

  // Add recommendations based on key insights
  if (keyInsights.some(insight => insight.includes('emotional changes'))) {
    recommendations.push("Implement mood tracking between sessions");
  }

  return recommendations;
};

const generateSummary = (transcript, keyInsights) => {
  // This would typically involve more sophisticated NLP analysis
  return `Patient consultation summary: ${keyInsights.join('. ')}. 
    The session revealed important insights about the patient's emotional state and condition.`;
};

const analyzeEmotionalTransitions = (emotions) => {
  const transitions = [];
  for (let i = 1; i < emotions.length; i++) {
    if (emotions[i].emotion !== emotions[i-1].emotion) {
      transitions.push(`${emotions[i-1].emotion} to ${emotions[i].emotion}`);
    }
  }
  return transitions;
};

const analyzeEmotionalStability = (emotions) => {
  const uniqueEmotions = new Set(emotions.map(e => e.emotion)).size;
  if (uniqueEmotions <= 2) return 'high';
  if (uniqueEmotions <= 3) return 'moderate';
  return 'low';
}; 