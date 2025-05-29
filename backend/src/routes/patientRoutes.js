import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { getAllPatients } from '../controllers/authController.js';
 
const router = express.Router();
router.use(authenticateToken);
router.get('/', getAllPatients);
export default router; 