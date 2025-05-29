import express from 'express';
import { register, login, profile, verifyToken, getAllPatients, getAllDoctors } from '../controllers/authController.js';
import { authenticateToken, checkRole } from '../middleware/auth.js';
import rateLimit from 'express-rate-limit';

const router = express.Router();

// Rate limiting for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: { 
    success: false, 
    message: 'Too many attempts, please try again later' 
  }
});

// Public routes
router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.get('/verify', authenticateToken, verifyToken);

// Protected routes
router.get('/profile', authenticateToken, profile);
router.get('/patients', authenticateToken, checkRole(['doctor', 'admin']), getAllPatients);
router.get('/doctors', authenticateToken, checkRole(['patient', 'admin']), getAllDoctors);

export default router; 
