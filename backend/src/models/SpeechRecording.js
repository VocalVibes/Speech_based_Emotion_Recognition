import mongoose from 'mongoose';

const speechRecordingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  audioFile: { type: String, required: true },
  transcript: { type: String },
  emotions: [{
    timestamp: Number,
    emotion: String,
    confidence: Number
  }],
  createdAt: { type: Date, default: Date.now }
});

const SpeechRecording = mongoose.model('SpeechRecording', speechRecordingSchema);
export default SpeechRecording; 