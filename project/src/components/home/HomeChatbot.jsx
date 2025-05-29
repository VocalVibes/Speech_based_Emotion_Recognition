import React, { useState } from 'react';
import './HomeChatbot.css';

const faqData = {
  'what services do you offer': 'We offer online medical consultations, appointment booking, and health monitoring services.',
  'how do i book an appointment': 'To book an appointment: 1) Create an account or login 2) Go to "Find a Doctor" 3) Select your preferred doctor 4) Choose available date and time 5) Confirm your booking',
  'do you offer emergency services': 'We do not provide emergency services. In case of emergency, please visit your nearest hospital or call emergency services.',
  'what payment methods do you accept': 'We accept major credit cards, debit cards, and online payment methods.',
  'do you provide prescriptions': 'Yes, our doctors can provide digital prescriptions for medications.',
  'is my medical information secure': 'Yes, we use industry-standard encryption and security measures to protect your medical information.',
  'can i get a second opinion': 'Yes, you can request a second opinion from another doctor in our network.',
  'what are your operating hours': 'Our platform is available 24/7, but doctor availability may vary. Check individual doctor profiles for their consultation hours.',
  'how do i contact support': 'You can reach our support team through the contact form or email support@healthportal.com.',
  'do you offer video consultations': 'Yes, we offer video consultations for many of our services.'
};

const HomeChatbot = () => {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { from: 'bot', text: 'Hi! I am EmotiSense Assistant. Ask me anything about our platform.' }
  ]);

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg = { from: 'user', text: input };
    setMessages(msgs => [...msgs, userMsg]);
    const lowerInput = input.trim().toLowerCase();
    let answer = null;
    // Try exact match first
    if (faqData[lowerInput]) {
      answer = faqData[lowerInput];
    } else {
      // Try keyword match
      const found = Object.keys(faqData).find(key => lowerInput.includes(key) || key.includes(lowerInput) || key.split(' ').some(word => lowerInput.includes(word)));
      if (found) {
        answer = faqData[found];
      } else {
        answer = "Sorry, I don't know the answer to that. Try asking something else!";
      }
    }
    setMessages(msgs => [...msgs, { from: 'bot', text: answer }]);
    setInput('');
  };

  return (
    <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 1000 }}>
      {open ? (
        <div className="bg-white shadow-lg rounded-lg w-80 max-w-full flex flex-col" style={{ minHeight: 320 }}>
          <div className="flex items-center justify-between px-4 py-2 border-b">
            <span className="font-bold text-primary">EmotiSense Chatbot</span>
            <button onClick={() => setOpen(false)} className="text-gray-500 hover:text-primary">×</button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-2" style={{ maxHeight: 220 }}>
            {messages.map((msg, i) => (
              <div key={i} className={msg.from === 'bot' ? 'text-left' : 'text-right'}>
                <span className={msg.from === 'bot' ? 'bg-primary/10 text-primary px-2 py-1 rounded' : 'bg-secondary px-2 py-1 rounded'}>
                  {msg.text}
                </span>
              </div>
            ))}
          </div>
          <div className="flex border-t p-2">
            <input
              className="flex-1 border rounded px-2 py-1 text-sm"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              placeholder="Type your question..."
            />
            <button onClick={handleSend} className="ml-2 px-3 py-1 bg-primary text-white rounded text-sm">Send</button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="bg-primary text-white rounded-full shadow-lg p-4 hover:bg-primary/90 focus:outline-none"
          aria-label="Open chatbot"
        >
          💬
        </button>
      )}
    </div>
  );
};

export default HomeChatbot; 