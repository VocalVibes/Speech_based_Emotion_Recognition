import SpeechRecording from '../models/SpeechRecording.js';
import MedicalReport from '../models/MedicalReport.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { analyzeEmotion as analyzeEmotionFromAudio } from '../services/emotionAnalysis.js';
import { generateReport } from '../services/reportGeneration.js';
import EmotionRecord from '../models/EmotionRecord.js';

// Configure multer for audio file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/recordings';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  }
});

const fileFilter = (req, file, cb) => {
  // Accept only audio files
  if (file.mimetype.startsWith('audio/')) {
    cb(null, true);
  } else {
    cb(new Error('Only audio files are allowed!'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  }
}).single('audio');

// Optimize file cleanup
const cleanupFile = async (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      await fs.promises.unlink(filePath);
    }
  } catch (error) {
    console.error('Error cleaning up file:', error);
  }
};

// Start recording session
export const startRecording = async (req, res) => {
  try {
    const { patientId } = req.body;
    const doctorId = req.user.id;

    const recording = new SpeechRecording({
      patientId,
      doctorId,
      recordingUrl: '',
      duration: 0,
      emotions: [],
      transcript: ''
    });

    await recording.save();

    res.status(201).json({
      success: true,
      recordingId: recording._id,
      message: 'Recording session started'
    });
  } catch (error) {
    console.error('Error starting recording:', error);
    res.status(500).json({
      success: false,
      message: 'Error starting recording session',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Save recording and analyze emotions
export const saveRecording = async (req, res) => {
  let uploadedFile = null;
  
  try {
    await new Promise((resolve, reject) => {
      upload(req, res, (err) => {
        if (err) {
          reject(err);
        } else {
          uploadedFile = req.file;
          resolve();
        }
      });
    });

    if (!uploadedFile) {
      return res.status(400).json({
        success: false,
        message: 'No audio file uploaded'
      });
    }

    const { recordingId } = req.params;
    const recording = await SpeechRecording.findById(recordingId);

    if (!recording) {
      await cleanupFile(uploadedFile.path);
      return res.status(404).json({
        success: false,
        message: 'Recording session not found'
      });
    }

    // Validate file type
    const allowedTypes = ['audio/wav', 'audio/mpeg', 'audio/webm'];
    if (!allowedTypes.includes(uploadedFile.mimetype)) {
      await cleanupFile(uploadedFile.path);
      return res.status(400).json({
        success: false,
        message: 'Invalid file type. Only WAV, MP3, and WebM audio files are allowed.'
      });
    }

    // Update recording with file information
    recording.recordingUrl = uploadedFile.path;
    recording.duration = req.body.duration || 0;

    // Analyze emotions from the recording
    const emotionAnalysis = await analyzeEmotionFromAudio(uploadedFile.path);
    
    if (!emotionAnalysis || !emotionAnalysis.emotions) {
      throw new Error('Emotion analysis failed');
    }

    recording.emotions = emotionAnalysis.emotions;
    recording.transcript = emotionAnalysis.transcript || '';

    await recording.save();

    // Generate medical report
    const report = await generateReport(recording);

    // Clean up the file after processing
    await cleanupFile(uploadedFile.path);

    res.status(200).json({
      success: true,
      message: 'Recording saved and analyzed successfully',
      recording: {
        ...recording.toObject(),
        recordingUrl: undefined // Don't send the file path to the client
      },
      report
    });
  } catch (error) {
    if (uploadedFile) {
      await cleanupFile(uploadedFile.path);
    }
    
    console.error('Error saving recording:', error);
    res.status(500).json({
      success: false,
      message: 'Error saving recording',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get recording details
export const getRecording = async (req, res) => {
  try {
    const { recordingId } = req.params;
    const recording = await SpeechRecording.findById(recordingId)
      .populate('patientId', 'name email')
      .populate('doctorId', 'name email');

    if (!recording) {
      return res.status(404).json({
        success: false,
        message: 'Recording not found'
      });
    }

    res.status(200).json({
      success: true,
      recording
    });
  } catch (error) {
    console.error('Error fetching recording:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching recording',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get all recordings for a patient
export const getPatientRecordings = async (req, res) => {
  try {
    const { patientId } = req.params;
    const recordings = await SpeechRecording.find({ patientId })
      .populate('doctorId', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      recordings
    });
  } catch (error) {
    console.error('Error fetching patient recordings:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching patient recordings',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Analyze emotion from speech
export const analyzeEmotion = async (req, res) => {
  try {
    const { audioData } = req.body;
    
    if (!audioData) {
      return res.status(400).json({
        success: false,
        message: 'No audio data provided'
      });
    }

    // Analyze emotion using the emotion analysis service
    const emotionAnalysis = await analyzeEmotionFromAudio(audioData);

    res.json({
      success: true,
      analysis: emotionAnalysis
    });
  } catch (error) {
    console.error('Error analyzing emotion:', error);
    res.status(500).json({
      success: false,
      message: 'Error analyzing emotion',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get emotion history for a patient
export const getEmotionHistory = async (req, res) => {
  try {
    const patientId = req.user.id;
    const records = await EmotionRecord.find({ patientId })
      .sort({ createdAt: -1 })
      .limit(30);

    res.json({
      success: true,
      records
    });
  } catch (error) {
    console.error('Error fetching emotion history:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching emotion history',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Save emotion record
export const saveEmotionRecord = async (req, res) => {
  try {
    const { emotion, intensity, notes } = req.body;
    const patientId = req.user.id;

    if (!emotion || !intensity) {
      return res.status(400).json({
        success: false,
        message: 'Emotion and intensity are required'
      });
    }

    const record = new EmotionRecord({
      patientId,
      emotion,
      intensity,
      notes
    });

    await record.save();

    res.status(201).json({
      success: true,
      record
    });
  } catch (error) {
    console.error('Error saving emotion record:', error);
    res.status(500).json({
      success: false,
      message: 'Error saving emotion record',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}; 