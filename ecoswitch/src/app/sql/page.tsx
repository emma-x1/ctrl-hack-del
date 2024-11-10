"use client";
import React, { useState } from 'react';
import SqliteQueryComponent from '@/components/SqliteQueryComponent';

const ParentComponent = () => {
  const [companyName, setCompanyName] = useState('');
  const [intensity, setIntensity] = useState<number | null>(null);
  const [grade, setGrade] = useState<string | null>(null);

  // Function to set the company name from any action (e.g., button click or input)
  const handleSetCompanyName = (name: string) => {
    setCompanyName(name);
    setIntensity(null);  // Reset intensity when the company name changes
    setGrade(null);      // Reset grade when the company name changes
  };

  // Update intensity and set grade to B if intensity is null
  const handleIntensityUpdate = (newIntensity: number | null) => {
    setIntensity(newIntensity);
    if (newIntensity === null) {
      setGrade('B'); // Default grade to "B" if intensity is not found
    }
  };

  // Update grade based on intensity (only called if intensity is found)
  const handleGradeUpdate = (newGrade: string) => {
    setGrade(newGrade);
  };

  return (
    <div>
      <h1>Environmental Intensity Lookup</h1>
      
      {/* Input field or button to set company name */}
      <input
        type="text"
        placeholder="Enter company name"
        onChange={(e) => handleSetCompanyName(e.target.value)}
      />
      
      {/* Child component to fetch data and update intensity and grade */}
      <SqliteQueryComponent
        companyName={companyName}
        onIntensityUpdate={handleIntensityUpdate}
        onGradeUpdate={handleGradeUpdate}
      />

      {/* Display results from parent */}
      {companyName && (
        <div>
          <h2>Results for {companyName}</h2>
          <p>Intensity: {intensity !== null ? intensity : 'No data found'}</p>
          <p>Grade: {grade}</p>
        </div>
      )}
    </div>
  );
};

export default ParentComponent;
