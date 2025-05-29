import express from 'express';
import { authenticateToken, isPatient, checkRole } from '../middleware/auth.js';
import { analyzeEmotion } from '../services/emotionAnalysis.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = express.Router();

// Configure multer for audio file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/audio';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('audio/')) {
      cb(null, true);
    } else {
      cb(new Error('Only audio files are allowed!'), false);
    }
  }
}).single('audio');

// All routes require authentication
router.use(authenticateToken);

// Allow all roles to access emotion endpoints
const allowedRoles = ['user', 'patient', 'doctor', 'therapist', 'admin'];

// Emotion analysis
router.post('/analyze', checkRole(allowedRoles), upload, async (req, res) => {
  const start = Date.now(); // Start timing
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No audio file uploaded'
      });
    }

    const filePath = req.file.path;
    const result = await analyzeEmotion(filePath);

    // Save analysis result to database
    const EmotionAnalysis = (await import('../models/EmotionAnalysis.js')).default;
    const saved = await EmotionAnalysis.create({
      userId: req.user.id,
      audioFile: req.file.filename,
      emotion: result.emotions[0]?.emotion || 'neutral',
      confidence: result.emotions[0]?.confidence || 0,
      timestamp: new Date(),
      metadata: {
        duration: result.duration,
        sampleRate: result.sampleRate,
        format: 'wav'
      }
    });
    
    // Clean up the uploaded file after analysis
    fs.unlinkSync(req.file.path);

    console.log('Emotion analysis took', Date.now() - start, 'ms'); // Log processing time
    
    res.json({
      success: true,
      analysis: result,
      saved
    });
  } catch (err) {
    console.error('Emotion analysis error:', err);
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    console.log('Emotion analysis failed after', Date.now() - start, 'ms'); // Log processing time on error
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
});

// Get emotion analysis history
router.get('/history', checkRole(allowedRoles), async (req, res) => {
  try {
    const EmotionAnalysis = (await import('../models/EmotionAnalysis.js')).default;
    const history = await EmotionAnalysis.find({ userId: req.user.id }).sort({ timestamp: -1 });
    res.json({ success: true, history });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching history', error: error.message });
  }
});

// Get strengths and weaknesses
router.get('/strengths-weaknesses', checkRole(allowedRoles), async (req, res) => {
  try {
    const EmotionAnalysis = (await import('../models/EmotionAnalysis.js')).default;
    const history = await EmotionAnalysis.find({ userId: req.user.id });
    if (!history.length) {
      return res.json({ success: true, strengths: [], weaknesses: [] });
    }
    // Count emotions
    const emotionCounts = {};
    history.forEach(record => {
      emotionCounts[record.emotion] = (emotionCounts[record.emotion] || 0) + 1;
    });
    // Define positive and negative emotions
    const positiveEmotions = ['happy', 'calm', 'surprised'];
    const negativeEmotions = ['sad', 'angry', 'fearful', 'disgust'];
    // Find strengths (most frequent positive emotions)
    const strengths = Object.entries(emotionCounts)
      .filter(([emotion]) => positiveEmotions.includes(emotion))
      .sort((a, b) => b[1] - a[1])
      .map(([emotion]) => emotion);
    // Find weaknesses (most frequent negative emotions)
    const weaknesses = Object.entries(emotionCounts)
      .filter(([emotion]) => negativeEmotions.includes(emotion))
      .sort((a, b) => b[1] - a[1])
      .map(([emotion]) => emotion);
    res.json({ success: true, strengths, weaknesses });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error analyzing strengths and weaknesses', error: error.message });
  }
});

// Fetch all speech analysis reports for a given patient
router.get('/reports/:patientId', authenticateToken, async (req, res) => {
  try {
    const { patientId } = req.params;
    const EmotionAnalysis = (await import('../models/EmotionAnalysis.js')).default;
    const reports = await EmotionAnalysis.find({ userId: patientId }).sort({ timestamp: -1 });
    res.json({ success: true, reports });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch reports', error: err.message });
  }
});

export default router; 