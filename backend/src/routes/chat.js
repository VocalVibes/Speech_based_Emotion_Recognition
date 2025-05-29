import express from 'express';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Mock responses for different types of queries
const responses = {
  greeting: [
    "Hello! I'm here to support you. How are you feeling today?",
    "Hi there! I'm your mental health assistant. What's on your mind?",
    "Welcome! I'm here to listen and help. How can I assist you today?"
  ],
  stress: [
    "I understand you're feeling stressed. Have you tried any relaxation techniques?",
    "Stress can be overwhelming. Would you like to talk about what's causing it?",
    "Remember to take deep breaths. Would you like some stress management tips?"
  ],
  anxiety: [
    "Anxiety can be challenging. Have you tried any grounding techniques?",
    "I hear you're feeling anxious. Would you like to explore some coping strategies?",
    "It's okay to feel anxious. Let's work through this together."
  ],
  depression: [
    "I'm here to support you through these feelings. Would you like to talk about what's on your mind?",
    "Depression can be difficult to manage alone. Have you considered speaking with a professional?",
    "You're not alone in this. Would you like some resources for support?"
  ],
  default: [
    "I'm here to listen. Can you tell me more about how you're feeling?",
    "That sounds challenging. Would you like to explore some coping strategies?",
    "I understand this is difficult. Let's work through it together."
  ]
};

// Get response based on message content
function getResponse(message) {
  if (!message || typeof message !== 'string') {
    return "I'm sorry, I didn't understand that. Could you please rephrase?";
  }

  const lowerMessage = message.toLowerCase();
  
  // Check for multiple conditions
  const conditions = [
    { keywords: ['hello', 'hi', 'hey'], category: 'greeting' },
    { keywords: ['stress', 'overwhelm', 'pressure', 'tension'], category: 'stress' },
    { keywords: ['anxiety', 'nervous', 'worried', 'panic'], category: 'anxiety' },
    { keywords: ['depress', 'sad', 'down', 'hopeless'], category: 'depression' }
  ];

  for (const condition of conditions) {
    if (condition.keywords.some(keyword => lowerMessage.includes(keyword))) {
      const categoryResponses = responses[condition.category];
      return categoryResponses[Math.floor(Math.random() * categoryResponses.length)];
    }
  }
  
  return responses.default[Math.floor(Math.random() * responses.default.length)];
}

// Get chat history
router.get('/history', async (req, res) => {
  try {
    // Mock chat history for now
    const mockHistory = [
      {
        id: 1,
        message: "Hello, how can I help you today?",
        sender: "bot",
        timestamp: new Date(Date.now() - 3600000) // 1 hour ago
      },
      {
        id: 2,
        message: "I'm feeling anxious about my upcoming appointment",
        sender: "user",
        timestamp: new Date(Date.now() - 3500000) // 58 minutes ago
      },
      {
        id: 3,
        message: "I understand that appointments can be stressful. Would you like to know more about what to expect during your visit?",
        sender: "bot",
        timestamp: new Date(Date.now() - 3400000) // 57 minutes ago
      }
    ];

    res.json({
      success: true,
      history: mockHistory
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching chat history',
      error: error.message
    });
  }
});

// Send message
router.post('/send', async (req, res) => {
  try {
    const { message } = req.body;
    
    // Mock response for now
    const response = {
      id: Date.now(),
      message: "I understand your concern. Let me help you with that.",
      sender: "bot",
      timestamp: new Date()
    };

    res.json({
      success: true,
      response
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error sending message',
      error: error.message
    });
  }
});

export default router; 