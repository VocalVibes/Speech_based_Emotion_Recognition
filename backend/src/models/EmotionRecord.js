import mongoose from 'mongoose';

const emotionRecordSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  emotion: {
    type: String,
    enum: ['happy', 'sad', 'angry', 'neutral', 'calm', 'fearful', 'disgust', 'surprised'],
    required: true
  },
  intensity: {
    type: Number,
    min: 0,
    max: 1,
    required: true
  },
  notes: {
    type: String,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for efficient querying
emotionRecordSchema.index({ patientId: 1, createdAt: -1 });

const EmotionRecord = mongoose.model('EmotionRecord', emotionRecordSchema);

export default EmotionRecord; 