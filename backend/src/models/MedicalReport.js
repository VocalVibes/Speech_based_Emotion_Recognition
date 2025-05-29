import mongoose from 'mongoose';

const medicalReportSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  speechRecordingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SpeechRecording',
    required: true
  },
  summary: {
    type: String,
    required: true
  },
  emotionalAnalysis: {
    dominantEmotion: String,
    emotionalTrends: [{
      emotion: String,
      percentage: Number
    }],
    keyInsights: [String]
  },
  recommendations: [String],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

const MedicalReport = mongoose.model('MedicalReport', medicalReportSchema);

export default MedicalReport; 