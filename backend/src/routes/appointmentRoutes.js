import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import {
  getDoctorAppointments,
  getPatientAppointments,
  createAppointment,
  updateAppointmentStatus,
  cancelAppointment,
  getAllAppointments,
  rescheduleAppointment
} from '../controllers/appointmentController.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Doctor routes
router.get('/doctor', getDoctorAppointments);
router.put('/:appointmentId/status', updateAppointmentStatus);

// Patient routes
router.get('/patient', getPatientAppointments);
router.post('/', createAppointment);
router.put('/:appointmentId/reschedule', rescheduleAppointment);
router.delete('/:appointmentId', cancelAppointment);

// Admin routes
router.get('/', getAllAppointments);

export default router; 