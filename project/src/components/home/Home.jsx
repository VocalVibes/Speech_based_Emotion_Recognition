import React from 'react';
import { Link } from 'react-router-dom';
import HomeChatbot from './HomeChatbot';
import './Home.css';

const Home = () => {
  return (
    <div className="home">
      <div className="hero-section">
        <h1>Welcome to Health Portal</h1>
        <p>Your trusted platform for online medical consultations</p>
        <div className="cta-buttons">
          <Link to="/login" className="cta-button primary">Login</Link>
          <Link to="/register" className="cta-button secondary">Register</Link>
        </div>
      </div>

      <div className="features-section">
        <h2>Our Services</h2>
        <div className="features-grid">
          <div className="feature-card">
            <h3>Online Consultations</h3>
            <p>Connect with experienced doctors through video calls</p>
          </div>
          <div className="feature-card">
            <h3>Easy Appointments</h3>
            <p>Book and manage your appointments with ease</p>
          </div>
          <div className="feature-card">
            <h3>Digital Prescriptions</h3>
            <p>Receive and manage your prescriptions digitally</p>
          </div>
        </div>
      </div>

      <div className="how-it-works">
        <h2>How It Works</h2>
        <div className="steps">
          <div className="step">
            <div className="step-number">1</div>
            <h3>Create Account</h3>
            <p>Sign up and complete your profile</p>
          </div>
          <div className="step">
            <div className="step-number">2</div>
            <h3>Find a Doctor</h3>
            <p>Search and select from our network of doctors</p>
          </div>
          <div className="step">
            <div className="step-number">3</div>
            <h3>Book Appointment</h3>
            <p>Choose your preferred time slot</p>
          </div>
          <div className="step">
            <div className="step-number">4</div>
            <h3>Consult Online</h3>
            <p>Connect with your doctor through video call</p>
          </div>
        </div>
      </div>

      <HomeChatbot />
    </div>
  );
};

export default Home; 