import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';

// Input validation middleware
const validateRegistration = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation Error',
      errors: errors.array()
    });
  }
  next();
};

export const register = async (req, res) => {
  try {
    const { username, email, password, role, specialty, age, gender, profile } = req.body;

    // Input validation
    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format'
      });
    }

    // Password strength validation
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters long'
      });
    }

    // Check for existing user
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists'
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    console.log('Registering user with password:', password);
    console.log('Registering user with hashed password:', hashedPassword);

    // Build profile object
    const userProfile = {};
    if (role === 'doctor' && specialty) userProfile.specialty = specialty;
    if (role === 'patient' && age) userProfile.age = age;
    if (role === 'patient' && gender) userProfile.gender = gender;
    if (profile) {
      userProfile.name = profile.name;
      userProfile.avatar = profile.avatar;
      userProfile.location = profile.location;
      userProfile.bio = profile.bio;
      userProfile.experience = profile.experience;
      userProfile.rating = profile.rating;
    }

    // Create user
    const user = new User({
      username,
      email,
      password: hashedPassword,
      role: role || 'user',
      profile: userProfile
    });

    await user.save();

    console.log('User saved:', user);

    // Generate token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        profile: user.profile
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const login = async (req, res) => {
  try {
    console.log('Login request body:', req.body);
    const { email, password } = req.body;

    // Input validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Find user
    const user = await User.findOne({ email });
    console.log('User found:', user);

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid credentials (user not found)'
      });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    console.log('Password match:', isMatch);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Invalid credentials (password mismatch)'
      });
    }

    // Generate token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        profile: user.profile
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const verifyToken = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        profile: user.profile
      }
    });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Token verification failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const profile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        profile: user.profile
      }
    });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const getAllPatients = async (req, res) => {
  try {
    const patients = await User.find({ role: 'patient' })
      .select('username email profile')
      .sort({ username: 1 })
      .lean();

    res.json({
      success: true,
      patients: patients.map(patient => ({
        id: patient._id,
        username: patient.username,
        email: patient.email,
        profile: patient.profile
      }))
    });
  } catch (error) {
    console.error('Error fetching patients:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching patients',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const getAllDoctors = async (req, res) => {
  try {
    const doctors = await User.find({ role: 'doctor' })
      .select('username email profile')
      .sort({ username: 1 })
      .lean();

    res.json({
      success: true,
      doctors: doctors.map(doctor => ({
        id: doctor._id,
        name: doctor.profile?.name || doctor.username,
        email: doctor.email,
        specialty: doctor.profile?.specialty || '',
        avatar: doctor.profile?.avatar || '',
        location: doctor.profile?.location || '',
        bio: doctor.profile?.bio || '',
        experience: doctor.profile?.experience || 0,
        rating: doctor.profile?.rating || 0,
        available: true,
        nextAvailable: '',
        profile: doctor.profile
      }))
    });
  } catch (error) {
    console.error('Error fetching doctors:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching doctors',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}; 