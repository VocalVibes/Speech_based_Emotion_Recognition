import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  dateTime: { type: Date, required: true }, // Single field for appointment time
  status: { type: String, enum: ['pending', 'confirmed', 'completed', 'cancelled', 'rescheduled'], default: 'pending' },
  type: { type: String, enum: ['regular', 'follow-up', 'emergency', 'consultation'], default: 'regular' },
  notes: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Indexes for efficient querying
appointmentSchema.index({ doctorId: 1, dateTime: 1 });
appointmentSchema.index({ patientId: 1, dateTime: 1 });
appointmentSchema.index({ status: 1 });

const Appointment = mongoose.model('Appointment', appointmentSchema);

export default Appointment; 