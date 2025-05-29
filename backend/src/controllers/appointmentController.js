import Appointment from '../models/Appointment.js';
import User from '../models/User.js';
import mongoose from 'mongoose';

// Helper function to validate appointment time
const isValidAppointmentTime = (dateTime) => {
  const hours = dateTime.getHours();
  const minutes = dateTime.getMinutes();
  const day = dateTime.getDay();

  // Check if it's a weekday (0 = Sunday, 6 = Saturday)
  if (day === 0 || day === 6) {
    return false;
  }

  // Check if it's within business hours (9 AM to 5 PM)
  if (hours < 9 || hours >= 17) {
    return false;
  }

  // Check if it's on the hour or half hour
  if (minutes !== 0 && minutes !== 30) {
    return false;
  }

  return true;
};

// Get appointments for a doctor
export const getDoctorAppointments = async (req, res) => {
  try {
    const { filter = 'upcoming' } = req.query;
    const doctorId = req.user.id;
    const now = new Date();

    if (!mongoose.Types.ObjectId.isValid(doctorId)) {
      return res.status(400).json({ success: false, message: 'Invalid ID' });
    }

    const query = {
      doctorId,
      ...(filter === 'upcoming' ? { dateTime: { $gte: now } } : 
         filter === 'past' ? { dateTime: { $lt: now } } : {})
    };

    const appointments = await Appointment.find(query)
      .populate('patientId', 'username email profile')
      .sort({ dateTime: 1 })
      .lean();

    res.json({
      success: true,
      appointments: appointments.map(apt => ({
        ...apt,
        patientName: apt.patientId?.username || apt.patientId?.profile?.name || '',
        patientEmail: apt.patientId?.email,
        patientProfile: apt.patientId?.profile,
        patientId: apt.patientId?._id
      }))
    });
  } catch (error) {
    console.error('Error fetching doctor appointments:', error);
    res.status(500).json({ success: false, message: 'Error fetching appointments', error: error.message });
  }
};

// Get appointments for a patient
export const getPatientAppointments = async (req, res) => {
  try {
    const { filter = 'upcoming' } = req.query;
    const patientId = req.user.id;
    const now = new Date();

    if (!mongoose.Types.ObjectId.isValid(patientId)) {
      return res.status(400).json({ success: false, message: 'Invalid ID' });
    }

    const query = {
      patientId,
      ...(filter === 'upcoming' ? { dateTime: { $gte: now } } : 
         filter === 'past' ? { dateTime: { $lt: now } } : {})
    };

    const appointments = await Appointment.find(query)
      .populate('doctorId', 'username email profile')
      .sort({ dateTime: 1 })
      .lean();

    res.json({
      success: true,
      appointments: appointments.map(apt => ({
        ...apt,
        doctorName: apt.doctorId?.username || apt.doctorId?.profile?.name || '',
        doctorEmail: apt.doctorId?.email,
        doctorProfile: apt.doctorId?.profile,
        doctorId: apt.doctorId?._id
      }))
    });
  } catch (error) {
    console.error('Error fetching patient appointments:', error);
    res.status(500).json({ success: false, message: 'Error fetching appointments', error: error.message });
  }
};

// Create a new appointment
export const createAppointment = async (req, res) => {
  try {
    console.log('Received appointment:', req.body);
    const { doctorId, date, time, type, notes } = req.body;
    const patientId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(doctorId)) {
      return res.status(400).json({ success: false, message: 'Invalid doctor ID' });
    }
    if (!doctorId || !date || !time || !type) {
      return res.status(400).json({ success: false, message: 'Missing required fields: doctorId, date, time, and type are required' });
    }

    // Combine date and time into a single Date object
    const dateTime = new Date(`${date}T${time}`);
    if (!isValidAppointmentTime(dateTime)) {
      return res.status(400).json({ success: false, message: 'Invalid appointment time. Appointments must be during business hours (9 AM - 5 PM) on weekdays.' });
    }

    // Check for doctor and slot availability
    const [doctor, existingAppointment] = await Promise.all([
      User.findOne({ _id: doctorId, role: 'doctor' }).select('username email profile'),
      Appointment.findOne({ doctorId, dateTime, status: { $ne: 'cancelled' } })
    ]);
    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found' });
    if (existingAppointment) return res.status(400).json({ success: false, message: 'This time slot is already booked' });

    const validTypes = ['regular', 'follow-up', 'emergency', 'consultation'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ success: false, message: 'Invalid appointment type' });
    }

    const appointment = new Appointment({
      doctorId,
      patientId,
      dateTime,
      type,
      notes: notes || '',
      status: 'pending'
    });
    await appointment.save();

    res.status(201).json({
      success: true,
      message: 'Appointment created successfully',
      appointment: {
        ...appointment.toObject(),
        doctorName: doctor.username,
        doctorEmail: doctor.email,
        doctorProfile: doctor.profile
      }
    });
  } catch (error) {
    console.error('Error creating appointment:', error);
    res.status(500).json({ success: false, message: 'Error creating appointment', error: error.message });
  }
};

// Reschedule an appointment
export const rescheduleAppointment = async (req, res) => {
  try {
    console.log('Request body:', req.body);
    console.log('Request params:', req.params);
    const { appointmentId } = req.params;
    const { date, time } = req.body;
    const patientId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(appointmentId)) {
      return res.status(400).json({ success: false, message: 'Invalid ID' });
    }

    const appointment = await Appointment.findOne({
      _id: appointmentId,
      patientId,
      status: { $ne: 'cancelled' }
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Create new dateTime
    const newDateTime = new Date(`${date}T${time}`);

    // Validate new appointment time
    if (!isValidAppointmentTime(newDateTime)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid appointment time. Appointments must be during business hours (9 AM - 5 PM) on weekdays.'
      });
    }

    // Check if the new time slot is available
    const existingAppointment = await Appointment.findOne({
      doctorId: appointment.doctorId,
      dateTime: newDateTime,
      _id: { $ne: appointmentId },
      status: { $ne: 'cancelled' }
    });

    if (existingAppointment) {
      return res.status(400).json({
        success: false,
        message: 'This time slot is already booked'
      });
    }

    // Update appointment
    appointment.dateTime = newDateTime;
    appointment.status = 'rescheduled';
    await appointment.save();

    // TODO: Send notification to doctor

    res.json({
      success: true,
      message: 'Appointment rescheduled successfully',
      appointment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error rescheduling appointment',
      error: error.message
    });
  }
};

// Update appointment status
export const updateAppointmentStatus = async (req, res) => {
  try {
    console.log('Request body:', req.body);
    const { appointmentId } = req.params;
    const { status } = req.body;
    const doctorId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(appointmentId)) {
      return res.status(400).json({ success: false, message: 'Invalid ID' });
    }

    const appointment = await Appointment.findOne({
      _id: appointmentId,
      doctorId
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    appointment.status = status;
    await appointment.save();

    // TODO: Send notification to patient

    res.json({
      success: true,
      message: 'Appointment status updated successfully',
      appointment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating appointment status',
      error: error.message
    });
  }
};

// Cancel an appointment
export const cancelAppointment = async (req, res) => {
  try {
    console.log('Request body:', req.body);
    const { appointmentId } = req.params;
    const patientId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(appointmentId)) {
      return res.status(400).json({ success: false, message: 'Invalid ID' });
    }

    const appointment = await Appointment.findOne({
      _id: appointmentId,
      patientId
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    appointment.status = 'cancelled';
    await appointment.save();

    // TODO: Send notification to doctor

    res.json({
      success: true,
      message: 'Appointment cancelled successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error cancelling appointment',
      error: error.message
    });
  }
};

export const getAllAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .populate('doctorId', 'username profile')
      .populate('patientId', 'username email profile')
      .sort({ dateTime: 1 });

    res.json({
      success: true,
      appointments: appointments.map(apt => ({
        ...apt.toObject(),
        doctorName: apt.doctorId?.username || apt.doctorId?.profile?.name || '',
        patientName: apt.patientId?.username || apt.patientId?.profile?.name || ''
      }))
    });
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({ success: false, message: 'Error fetching appointments', error: error.message });
  }
}; 