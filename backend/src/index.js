import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './routes/auth.js';
import emotionRoutes from './routes/emotion.js';
import fs from 'fs';
import chatRoutes from './routes/chat.js';
import speechRoutes from './routes/speechRoutes.js';
import appointmentRoutes from './routes/appointmentRoutes.js';
import patientRoutes from './routes/patientRoutes.js';
import doctorRoutes from './routes/doctorRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

// Ensure JWT_SECRET is set
if (!process.env.JWT_SECRET) {
  console.warn('Warning: JWT_SECRET not set. Using default secret. This is not recommended for production.');
  process.env.JWT_SECRET = 'default-secret-key-change-in-production';
}

const PORT = process.env.PORT || 50021;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/bolt_website';

const app = express();

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../../uploads/audio');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use('/uploads', express.static(path.join(__dirname, '../../uploads')));

// Add this error handler after body parser
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ success: false, message: 'Invalid JSON payload' });
  }
  next();
});

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', authRoutes);
app.use('/api/emotion', emotionRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api', speechRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/doctors', doctorRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
const startServer = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB successfully');
    
    let port = Number(process.env.PORT) || 50021;
    const server = app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
      console.log(`API available at http://localhost:${port}/api`);
    });

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        port = Number(port) + 1;
        if (port > 65535) {
          console.error('No available ports!');
          process.exit(1);
        }
        console.log(`Port ${port - 1} is busy, trying ${port}...`);
        server.close();
        app.listen(port, () => {
          console.log(`Server is running on port ${port}`);
          console.log(`API available at http://localhost:${port}/api`);
        });
      } else {
        console.error('Failed to start server:', err);
        process.exit(1);
      }
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer(); 
