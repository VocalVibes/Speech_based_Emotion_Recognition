import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { API_BASE_URL } from '@/config/api';
import { MapPin, Star, User as UserIcon } from 'lucide-react';
import './DoctorSearch.css';

const DoctorSearch = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [specialty, setSpecialty] = useState('');
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchDoctors();
  }, [specialty]);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required');
      }
      const response = await axios.get(`${API_BASE_URL}/doctors`, {
        params: { specialty },
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to fetch doctors');
      }
      setDoctors(response.data.doctors);
      setError(null);
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch doctors';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      console.error('Error fetching doctors:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSpecialtyChange = (e) => {
    setSpecialty(e.target.value);
  };

  const filteredDoctors = doctors.filter(doctor =>
    doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="doctor-search-container">
      <h1 className="text-4xl font-bold text-center mt-6 mb-2">Find a Doctor</h1>
      <p className="text-center text-gray-500 mb-8">Browse and connect with qualified psychologists</p>
      <div className="flex flex-col md:flex-row items-center justify-center gap-4 mb-8">
        <input
          type="text"
          placeholder="Search by name, specialty, or location..."
          value={searchTerm}
          onChange={handleSearch}
          className="search-input rounded-xl shadow px-4 py-3 w-full md:w-[400px]"
        />
        <select
          value={specialty}
          onChange={handleSpecialtyChange}
          className="specialty-select rounded-xl shadow px-4 py-3 w-full md:w-[250px]"
        >
          <option value="">All Specialties</option>
          <option value="psychiatrist">Psychiatrist</option>
          <option value="psychologist">Psychologist</option>
          <option value="therapist">Therapist</option>
        </select>
      </div>
      {loading ? (
        <div className="loading">Loading doctors...</div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : filteredDoctors.length === 0 ? (
        <div className="no-results">No doctors found matching your search criteria</div>
      ) : (
        <div className="doctors-grid">
          {filteredDoctors.map((doctor) => (
            <div key={doctor._id} className="doctor-card flex flex-col justify-between relative">
              {/* Card Header: Name and Status */}
              <div className="flex flex-col items-center pt-4 pb-2">
                <div className="absolute top-3 right-3 text-xs bg-gray-100 px-3 py-1 rounded-full text-gray-500 border font-semibold">
                  Unavailable
                </div>
                <img
                  src={doctor.avatar || 'https://randomuser.me/api/portraits/med/men/75.jpg'}
                  alt={doctor.name}
                  className="w-16 h-16 rounded-full object-cover mb-2 border"
                />
                <div className="font-semibold text-lg mb-1">{doctor.name}</div>
              </div>
              {/* Specialty */}
              <div className="text-center text-gray-500 text-sm mb-2">
                {doctor.specialty || 'Specialty not specified'}
              </div>
              {/* Location and Star */}
              <div className="flex items-center justify-center gap-2 mb-2">
                <MapPin className="h-4 w-4 text-gray-400" />
                <span className="text-xs text-gray-400">-</span>
                <Star className="h-4 w-4 text-yellow-400 ml-4" />
              </div>
              {/* About */}
              <div className="text-center font-semibold mt-2 mb-1">About</div>
              {/* Experience and Next Available */}
              <div className="flex items-center justify-between px-4 mb-2">
                <div className="text-xs text-gray-500 text-center">
                  Experience<br />
                  <span className="font-semibold text-black">{doctor.experience || 'Not Available'} years</span>
                </div>
                <div className="text-xs text-gray-500 text-center">
                  Next Available<br />
                  <span className="font-semibold text-black">-</span>
                </div>
              </div>
              {/* Buttons */}
              <div className="flex gap-2 px-4 pb-4 mt-auto">
                <button
                  className="flex-1 border rounded-lg py-2 flex items-center justify-center gap-2 bg-white hover:bg-gray-100 text-gray-700"
                  onClick={() => navigate(`/profile?doctorId=${doctor._id}`)}
                >
                  <UserIcon className="h-4 w-4" /> Profile
                </button>
                <button
                  className="flex-1 border rounded-lg py-2 flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700"
                  onClick={() => navigate(`/appointments?doctorId=${doctor._id}`)}
                >
                  <span role="img" aria-label="book">📅</span> Book
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DoctorSearch; 