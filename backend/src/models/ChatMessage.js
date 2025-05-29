import mongoose from 'mongoose';

const chatMessageSchema = new mongoose.Schema({
  sender: { type: String, enum: ['user', 'bot'], required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  message: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

const ChatMessage = mongoose.model('ChatMessage', chatMessageSchema);
export default ChatMessage; 