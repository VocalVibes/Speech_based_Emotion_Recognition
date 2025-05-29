import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { getAllDoctors } from '../controllers/authController.js';
 
const router = express.Router();
router.use(authenticateToken);
router.get('/', getAllDoctors);
export default router; 