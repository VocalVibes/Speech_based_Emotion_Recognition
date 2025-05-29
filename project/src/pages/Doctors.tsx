import React from 'react';
import DoctorSearch from '@/components/patient/DoctorSearch';

const Doctors = () => {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Find a Doctor</h1>
      <DoctorSearch />
    </div>
  );
};

export default Doctors; 