import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['user', 'patient', 'doctor', 'therapist', 'admin'],
    default: 'user'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  profile: {
    name: String,
    age: Number,
    gender: String,
    bio: String,
    avatar: String
  },
  emotionHistory: [{
    date: Date,
    emotion: String,
    confidence: Number,
    audioFile: String
  }]
}, {
  timestamps: true
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Add indexes for frequently queried fields
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });
userSchema.index({ role: 1 });
userSchema.index({ 'profile.specialty': 1 });

const User = mongoose.model('User', userSchema);
export default User; 