import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      if (!decoded.id) {
        return res.status(401).json({
          success: false,
          message: 'Invalid token format'
        });
      }

      // Verify user still exists
      const user = await User.findById(decoded.id).select('-password');
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'User no longer exists'
        });
      }

      req.user = {
        id: decoded.id,
        role: decoded.role
      };
      next();
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Token has expired'
        });
      }
      return res.status(403).json({
        success: false,
        message: 'Invalid token'
      });
    }
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({
      success: false,
      message: 'Authentication failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const checkRole = (roles) => async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Insufficient permissions.'
      });
    }

    next();
  } catch (error) {
    console.error('Role check error:', error);
    res.status(500).json({
      success: false,
      message: 'Role verification failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const isDoctor = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (req.user.role !== 'doctor') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Doctor role required.'
      });
    }

    next();
  } catch (error) {
    console.error('Doctor role check error:', error);
    res.status(500).json({
      success: false,
      message: 'Role verification failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const isPatient = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (req.user.role !== 'patient') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Patient role required.'
      });
    }

    next();
  } catch (error) {
    console.error('Patient role check error:', error);
    res.status(500).json({
      success: false,
      message: 'Role verification failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const isAdmin = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin role required.'
      });
    }

    next();
  } catch (error) {
    console.error('Admin role check error:', error);
    res.status(500).json({
      success: false,
      message: 'Role verification failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}; 