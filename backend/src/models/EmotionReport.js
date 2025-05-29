import mongoose from 'mongoose';

const emotionReportSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  speechRecording: { type: mongoose.Schema.Types.ObjectId, ref: 'SpeechRecording', required: true },
  summary: { type: String },
  strengths: [String],
  weaknesses: [String],
  graphData: { type: Object }, // JSON for frontend graphing
  pdfFile: { type: String }, // Path to generated PDF
  createdAt: { type: Date, default: Date.now }
});

const EmotionReport = mongoose.model('EmotionReport', emotionReportSchema);
export default EmotionReport; 