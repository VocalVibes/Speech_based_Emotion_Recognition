import express from 'express';
import { authenticateToken, isPatient } from '../middleware/auth.js';
import {
  analyzeEmotion,
  getEmotionHistory,
  saveEmotionRecord
} from '../controllers/speechController.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Patient routes
router.post('/analyze', isPatient, analyzeEmotion);
router.get('/history', isPatient, getEmotionHistory);
router.post('/save', isPatient, saveEmotionRecord);

export default router; 