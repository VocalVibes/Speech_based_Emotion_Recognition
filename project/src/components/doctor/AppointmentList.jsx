import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AppointmentList.css';

const AppointmentList = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('upcoming'); // 'upcoming', 'past', 'all'

  useEffect(() => {
    fetchAppointments();
  }, [filter]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/appointments/doctor?filter=${filter}`);
      setAppointments(response.data.appointments);
      setError(null);
    } catch (err) {
      setError('Failed to fetch appointments');
      console.error('Error fetching appointments:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadgeClass = (status) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return 'status-confirmed';
      case 'pending':
        return 'status-pending';
      case 'cancelled':
        return 'status-cancelled';
      default:
        return '';
    }
  };

  return (
    <div className="appointment-list-container">
      <div className="appointment-header">
        <h2>My Appointments</h2>
        <div className="filter-controls">
          <button
            className={filter === 'upcoming' ? 'active' : ''}
            onClick={() => setFilter('upcoming')}
          >
            Upcoming
          </button>
          <button
            className={filter === 'past' ? 'active' : ''}
            onClick={() => setFilter('past')}
          >
            Past
          </button>
          <button
            className={filter === 'all' ? 'active' : ''}
            onClick={() => setFilter('all')}
          >
            All
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading">Loading appointments...</div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : appointments.length === 0 ? (
        <div className="no-appointments">No appointments found</div>
      ) : (
        <div className="appointments-grid">
          {appointments.map((appointment) => (
            <div key={appointment._id} className="appointment-card">
              <div className="appointment-info">
                <h3>{appointment.patientName}</h3>
                <p className="appointment-date">{formatDate(appointment.dateTime)}</p>
                <p className="appointment-type">{appointment.type}</p>
                <p className="appointment-notes">{appointment.notes}</p>
              </div>
              <div className="appointment-status">
                <span className={`status-badge ${getStatusBadgeClass(appointment.status)}`}>
                  {appointment.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AppointmentList; 