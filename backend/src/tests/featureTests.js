import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import FormData from 'form-data';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_BASE_URL = process.env.API_URL || 'http://localhost:50021/api';
const MAX_RETRIES = 5;
const RETRY_DELAY = 2000; // 2 seconds

// Test user credentials
const testUser = {
  email: 'test@example.com',
  password: 'test123',
  username: 'testuser',
  role: 'patient'
};

// Test doctor credentials
const testDoctor = {
  email: 'doctor@example.com',
  password: 'doctor123',
  username: 'testdoctor',
  role: 'doctor'
};

let authToken = null;
let doctorId = null;

// Wait for server to be ready
const waitForServer = async () => {
  console.log('Waiting for server to be ready...');
  for (let i = 0; i < MAX_RETRIES; i++) {
    try {
      const response = await axios.get(`${API_BASE_URL}/health`);
      if (response.data.status === 'ok') {
        console.log('Server is ready!');
        return true;
      }
    } catch (error) {
      if (i === MAX_RETRIES - 1) {
        console.error('Server not responding after maximum retries');
        throw error;
      }
      console.log(`Server not ready, retrying in ${RETRY_DELAY/1000} seconds...`);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
    }
  }
};

// Helper function to make authenticated requests
const makeAuthenticatedRequest = async (method, endpoint, data = null) => {
  const headers = {
    'Authorization': `Bearer ${authToken}`
  };
  // Only set Content-Type and data for non-GET requests
  const config = {
    method,
    url: `${API_BASE_URL}${endpoint}`,
    headers
  };
  if (method.toLowerCase() !== 'get') {
    headers['Content-Type'] = 'application/json';
    config.data = data;
  }
  try {
    const response = await axios(config);
    return response.data;
  } catch (error) {
    console.error(`Error in ${method} ${endpoint}:`, error.response?.data || error.message);
    throw error;
  }
};

// Register and login doctor, get doctorId
const setupDoctor = async () => {
  try {
    // Register doctor
    await axios.post(`${API_BASE_URL}/auth/register`, testDoctor);
  } catch (error) {
    if (!(error.response?.status === 400 && error.response?.data?.message === 'User already exists')) {
      throw error;
    }
  }
  // Login doctor
  const loginRes = await axios.post(`${API_BASE_URL}/auth/login`, {
    email: testDoctor.email,
    password: testDoctor.password
  });
  // Get doctor profile
  const doctorToken = loginRes.data.token;
  const profileRes = await axios.get(`${API_BASE_URL}/auth/profile`, {
    headers: { Authorization: `Bearer ${doctorToken}` }
  });
  console.log('Doctor profile response:', profileRes.data);
  doctorId = profileRes.data._id || (profileRes.data.user && profileRes.data.user._id);
  console.log('Doctor ID being used for appointment:', doctorId);
};

// Test 1: User Registration
const testRegistration = async () => {
  console.log('\n1. Testing User Registration...');
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/register`, testUser);
    console.log('✅ Registration successful');
    return response.data;
  } catch (error) {
    if (error.response?.status === 400 && error.response?.data?.message === 'User already exists') {
      console.log('ℹ️ User already exists, continuing with login...');
      return null;
    }
    console.error('❌ Registration failed:', error.response?.data || error.message);
    console.error('Full error:', error);
    throw error;
  }
};

// Test 2: User Login
const testLogin = async () => {
  console.log('\n2. Testing User Login...');
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: testUser.email,
      password: testUser.password
    });
    authToken = response.data.token;
    console.log('✅ Login successful');
    return response.data;
  } catch (error) {
    console.error('❌ Login failed:', error.response?.data || error.message);
    throw error;
  }
};

// Test 3: Speech Emotion Analysis
const testSpeechAnalysis = async () => {
  console.log('\n3. Testing Speech Emotion Analysis...');
  try {
    // Create a test audio file
    const testAudioPath = path.join(__dirname, 'test-audio.wav');
    createSilentWav(testAudioPath);
    
    // Create form data
    const formData = new FormData();
    formData.append('audio', fs.createReadStream(testAudioPath), {
      filename: 'test-audio.wav',
      contentType: 'audio/wav'
    });
    
    // Make request
    const response = await axios.post(`${API_BASE_URL}/emotion/analyze`, formData, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        ...formData.getHeaders()
      }
    });
    
    console.log('✅ Speech analysis successful');
    console.log('Analysis result:', response.data);
    
    // Clean up test file
    fs.unlinkSync(testAudioPath);
    
    return response.data;
  } catch (error) {
    console.error('❌ Speech analysis failed:', error.response?.data || error.message);
    throw error;
  }
};

// Test 4: Appointment Booking
const testAppointmentBooking = async () => {
  console.log('\n4. Testing Appointment Booking...');
  try {
    const now = new Date();
    const appointmentData = {
      doctorId: doctorId,
      date: now.toISOString().split('T')[0],
      time: now.toTimeString().slice(0, 5),
      type: 'regular',
      notes: 'Test appointment'
    };
    const response = await makeAuthenticatedRequest('POST', '/appointments', appointmentData);
    console.log('✅ Appointment booking successful');
    console.log('Appointment details:', response);
    return response;
  } catch (error) {
    console.error('❌ Appointment booking failed:', error.response?.data || error.message);
    throw error;
  }
};

// Test 5: Get User Profile
const testGetProfile = async () => {
  console.log('\n5. Testing Get User Profile...');
  try {
    const response = await makeAuthenticatedRequest('get', '/auth/profile');
    if (response.success && response.user) {
      console.log('✅ Get profile successful');
      console.log('Profile data:', response.user);
    } else {
      throw new Error('Invalid profile response');
    }
  } catch (error) {
    console.error('❌ Get profile failed:', error.response?.data || error.message);
    throw error;
  }
  console.log('Get profile test done\n');
};

function createSilentWav(filePath, durationSeconds = 1, sampleRate = 16000) {
  const numSamples = durationSeconds * sampleRate;
  const header = Buffer.alloc(44);
  // RIFF header
  header.write('RIFF', 0);
  header.writeUInt32LE(36 + numSamples * 2, 4); // file size - 8
  header.write('WAVE', 8);
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16); // PCM chunk size
  header.writeUInt16LE(1, 20); // PCM format
  header.writeUInt16LE(1, 22); // Mono
  header.writeUInt32LE(sampleRate, 24); // Sample rate
  header.writeUInt32LE(sampleRate * 2, 28); // Byte rate
  header.writeUInt16LE(2, 32); // Block align
  header.writeUInt16LE(16, 34); // Bits per sample
  header.write('data', 36);
  header.writeUInt32LE(numSamples * 2, 40); // Data chunk size

  const data = Buffer.alloc(numSamples * 2); // 16-bit PCM, silence
  const wav = Buffer.concat([header, data]);
  fs.writeFileSync(filePath, wav);
}

// Run all tests
const runAllTests = async () => {
  console.log('Starting feature tests...\n');
  
  try {
    // Wait for server to be ready
    await waitForServer();
    // Setup doctor
    await setupDoctor();
    // Run tests in sequence
    await testRegistration();
    console.log('Registration test done');
    await testLogin();
    console.log('Login test done');
    await testSpeechAnalysis();
    console.log('Speech analysis test done');
    await testAppointmentBooking();
    console.log('Appointment booking test done');
    await testGetProfile();
    console.log('Profile test done');
    
    console.log('\n✅ All tests completed successfully!');
  } catch (error) {
    console.error('\n❌ Some tests failed. See errors above.');
    console.error(error);
    process.exit(1);
  }
};

// Run the tests
runAllTests(); 