import mongoose from 'mongoose';

const emotionAnalysisSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  audioFile: {
    type: String,
    required: true
  },
  emotion: {
    type: String,
    required: true,
    enum: ['happy', 'sad', 'angry', 'fearful','calm', 'neutral', 'surprised', 'disgust']
  },
  confidence: {
    type: Number,
    required: true,
    min: 0,
    max: 1
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  metadata: {
    duration: Number,
    sampleRate: Number,
    format: String
  },
  therapistNotes: {
    type: String,
    default: ''
  }
});

const EmotionAnalysis = mongoose.model('EmotionAnalysis', emotionAnalysisSchema);

export default EmotionAnalysis; 