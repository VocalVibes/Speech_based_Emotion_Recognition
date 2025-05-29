import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Ensure data directory exists
const dbPath = 'C:/data/db';
if (!fs.existsSync(dbPath)) {
  console.log('Creating MongoDB data directory...');
  fs.mkdirSync(dbPath, { recursive: true });
}

// Function to check if MongoDB is already running
const isMongoRunning = async () => {
  try {
    const response = await fetch('http://localhost:27017');
    return true;
  } catch (error) {
    return false;
  }
};

// Function to check if server is ready
const isServerReady = async () => {
  try {
    console.log('Checking server health...');
    const response = await fetch('http://localhost:50021/api/health');
    console.log('Health check response status:', response.status);
    const data = await response.json();
    console.log('Health check response data:', data);
    return data.status === 'ok';
  } catch (error) {
    console.error('Health check failed:', error.message);
    return false;
  }
};

// Start MongoDB if not already running
const startMongoDB = async () => {
  if (await isMongoRunning()) {
    console.log('MongoDB is already running');
    return;
  }

  console.log('Starting MongoDB...');
  const mongod = spawn('mongod', ['--dbpath', dbPath], {
    stdio: 'inherit',
    shell: true
  });

  mongod.on('error', (err) => {
    console.error('Failed to start MongoDB:', err);
    process.exit(1);
  });

  // Wait for MongoDB to be ready
  let retries = 0;
  while (retries < 5) {
    if (await isMongoRunning()) {
      console.log('MongoDB is ready');
      return;
    }
    await new Promise(resolve => setTimeout(resolve, 2000));
    retries++;
  }
  throw new Error('MongoDB failed to start');
};

// Start the server
const startServer = async () => {
  console.log('Starting server...');
  const server = spawn('node', ['src/index.js'], {
    stdio: 'inherit',
    cwd: __dirname,
    shell: true
  });

  server.on('error', (err) => {
    console.error('Failed to start server:', err);
    process.exit(1);
  });

  // Wait for server to be ready
  let retries = 0;
  while (retries < 5) {
    if (await isServerReady()) {
      console.log('Server is ready');
      return;
    }
    await new Promise(resolve => setTimeout(resolve, 2000));
    retries++;
  }
  throw new Error('Server failed to start');
};

// Main startup sequence
const start = async () => {
  try {
    await startMongoDB();
    await startServer();
    console.log('System is ready!');
  } catch (error) {
    console.error('Startup failed:', error);
    process.exit(1);
  }
};

// Handle process termination
process.on('SIGINT', () => {
  console.log('Shutting down...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('Shutting down...');
  process.exit(0);
});

// Start the system
start(); 